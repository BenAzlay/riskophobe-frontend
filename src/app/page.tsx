"use client";

import useStore from "@/store/useStore";
import { Fragment, useMemo, useRef, useState } from "react";
import {
  useAsyncEffect,
  useVisibilityIntervalEffect,
} from "@/utils/customHooks";
import { Deposit, Offer as SubgraphOffer } from "@/utils/queries";
import { ethers } from "ethers";
import ERC20Token from "./types/ERC20Token";
import Decimal from "decimal.js";
import {
  abbreviateAmount,
  calculateCollateralPerOneSoldToken,
  compareEthereumAddresses,
} from "@/utils/utilFunc";
import TokenSymbolAndLogo from "@/components/TokenSymbolAndLogo";
import { getTokenDetails } from "@/utils/tokenMethods";
import Link from "next/link";
import { useAccount } from "wagmi";
import dynamic from "next/dynamic";
import Offer from "./types/Offer";
import FiltersDropdown from "@/components/FiltersDropdown";

interface SortingOption {
  id: keyof Offer;
  label: string;
  asc: boolean; // ascending or descending
}

const OfferItem = dynamic(() => import("@/components/OfferItem"), {
  loading: () => (
    <div className="offer-item min-h-64 items-center justify-center">
      <p>Loading offer...</p>
    </div>
  ),
});

function App() {
  const offersHaveLoaded = useRef(false);
  const { setOffers, offers, setDeposits, deposits } = useStore();
  const { address: connectedAddress } = useAccount();

  // Fetch offers every 60s from subgraph
  const fetchOffers = async () => {
    try {
      // Fetch offers from subgraph
      const response = await fetch("/api/fetchOffers");
      if (!response.ok) {
        throw new Error("Failed to fetch offers");
      }
      const { offers: subgraphOffers } = (await response.json()) as {
        offers: SubgraphOffer[];
      };
      // Isolate the offers tokens to convert them to ERC20Token type
      const tokenAddresses = subgraphOffers.flatMap((offer) => [
        offer.soldToken.id,
        offer.collateralToken.id,
      ]);
      const tokensWithDetails = await getTokenDetails(tokenAddresses);
      const offers = subgraphOffers
        .map((offer: SubgraphOffer) => {
          // Convert tokens into ERC20Token type
          const soldToken = tokensWithDetails.find((token) =>
            compareEthereumAddresses(token.address, offer.soldToken.id)
          )!;
          const collateralToken = tokensWithDetails.find((token) =>
            compareEthereumAddresses(token.address, offer.collateralToken.id)
          )!;
          // Collateral per sold token from exchange rate and decimals
          const collateralPerSoldToken = calculateCollateralPerOneSoldToken(
            offer.exchangeRate,
            soldToken.decimals,
            collateralToken.decimals
          );
          // Price per sold token from the offer (not market price)
          const pricePerSoldToken =
            collateralPerSoldToken * collateralToken.price;
          // Difference between offer price and market price
          const soldTokenMarketPriceDifference =
            pricePerSoldToken / soldToken.price;
          return {
            ...offer,
            creatorFeeBp: Number(offer.creatorFeeBp),
            soldToken,
            collateralToken,
            collateralPerSoldToken,
            pricePerSoldToken,
            soldTokenMarketPriceDifference,
          };
        })
        .filter(Boolean);
      setOffers(offers);
      offersHaveLoaded.current = true;
    } catch (e) {
      console.error("fetchOffers ERROR", e);
    }
  };
  useVisibilityIntervalEffect(fetchOffers, 60000, []); // Refetch offers every 60s

  const filterTypeOptions = [
    {
      id: "all",
      label: "All",
    },
    {
      id: "created",
      label: "Created",
    },
    {
      id: "bought",
      label: "Bought",
    },
  ];

  const sortingOptions: SortingOption[] = [
    {
      id: "soldTokenMarketPriceDifference",
      label: "Lowest Price Difference",
      asc: true,
    },
    {
      id: "soldTokenMarketPriceDifference",
      label: "Highest Price Difference",
      asc: false,
    },
    {
      id: "startTime",
      label: "Earliest Start Time",
      asc: true,
    },
    {
      id: "endTime",
      label: "Earliest End Time",
      asc: true,
    },
    {
      id: "endTime",
      label: "Latest End Time",
      asc: false,
    },
    {
      id: "creatorFeeBp",
      label: "Lowest User Fee",
      asc: true,
    },
  ];

  const [filterType, setFilterType] = useState<string>(filterTypeOptions[0].id); // all | created | bought
  const [tokenFilter, setTokenFilter] = useState<ERC20Token | null>(null);
  const [selectedSortingOption, setSelectedSortingOption] =
    useState<SortingOption>(sortingOptions[0]);

  // An array of all tokens (sold & collateral) used in the offers
  const offerTokens: ERC20Token[] = useMemo(() => {
    // Flatten the array of tokens and then create a Set to filter unique items
    const tokens: ERC20Token[] = offers.flatMap((offer) => [
      offer.soldToken,
      offer.collateralToken,
    ]);
    return Array.from(new Set(tokens));
  }, [offers]);

  const createrOffers = useMemo(
    () =>
      offers.filter((offer) =>
        compareEthereumAddresses(offer.creator, connectedAddress)
      ),
    [offers, connectedAddress]
  );

  const boughtOffers = useMemo(
    () =>
      offers.filter(
        (offer) =>
          !!deposits.some(
            (deposit) =>
              deposit.offerId === offer.id &&
              compareEthereumAddresses(deposit.participant, connectedAddress) &&
              new Decimal(deposit.netCollateralAmount).gt(0)
          )
      ),
    [offers, deposits, connectedAddress]
  );

  const filteredOffers = useMemo(
    () =>
      offers.filter((offer) => {
        let matchesType: boolean;
        if (filterType === "created") {
          matchesType = createrOffers.some(({ id }) => id === offer.id);
        } else if (filterType === "bought") {
          matchesType = boughtOffers.some(({ id }) => id === offer.id);
        } else matchesType = true;
        const matchesToken =
          tokenFilter === null ||
          offer.soldToken === tokenFilter ||
          offer.collateralToken === tokenFilter;
        return matchesType && matchesToken;
      }),
    [offers, boughtOffers, createrOffers, filterType, tokenFilter]
  );

  const sortedOffers = useMemo(() => {
    return [...filteredOffers].sort((a, b) => {
      const attributeA = a[selectedSortingOption.id];
      const attributeB = b[selectedSortingOption.id];

      if (attributeA < attributeB) return selectedSortingOption.asc ? -1 : 1;
      if (attributeA > attributeB) return selectedSortingOption.asc ? 1 : -1;
      return 0;
    });
  }, [filteredOffers, selectedSortingOption]);

  const depositsGetter = async (): Promise<Deposit[]> => {
    try {
      if (!ethers.isAddress(connectedAddress))
        throw new Error("No account connected");
      // Fetch user's deposits from subgraph
      const response = await fetch(
        `/api/fetchDeposits?participant=${connectedAddress}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch deposits for user");
      }
      const { deposits } = await response.json();
      return deposits;
    } catch (e) {
      return [];
    }
  };
  const depositsSetter = (_deposits: Deposit[]) => {
    setDeposits(_deposits);
  };
  useAsyncEffect(depositsGetter, depositsSetter, [connectedAddress]);

  const getOffersCount = (typeOption: string): number => {
    switch (typeOption) {
      case "created":
        return createrOffers.length;
      case "bought":
        return boughtOffers.length;
      default:
        return offers.length;
    }
  };

  const handleSelectSortingOption = (option: {
    id: string;
    label: string;
    asc: boolean;
  }) => {
    setSelectedSortingOption({
      ...option,
      id: option.id as keyof Offer,
    });
  };

  const filterButtons = () => (
    <Fragment>
      {/* Filter Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center w-full gap-4 mb-6 justify-start">
        {/* Sorting dropdown */}
        <FiltersDropdown
          options={sortingOptions}
          onSelectOption={handleSelectSortingOption}
          selectedOption={selectedSortingOption}
          prefix="Sort Offers by:"
        />
        <div className="join hidden sm:block">
          {filterTypeOptions.map(({ id, label }) => (
            <button
              key={id}
              className={`join-item btn btn-secondary btn-outline ${
                filterType === id ? "btn-active" : ""
              }`}
              onClick={() => setFilterType(id)}
            >
              {label} ({abbreviateAmount(getOffersCount(id))})
            </button>
          ))}
        </div>
        {/* Token Filters */}
        <div className="space-x-2 hidden lg:block">
          {offerTokens.map((token) => (
            <button
              key={token.address}
              className={`btn btn-outline btn-secondary ${
                tokenFilter === token ? "btn-active" : ""
              }`}
              onClick={() =>
                setTokenFilter(tokenFilter === token ? null : token)
              }
            >
              <TokenSymbolAndLogo symbol={token.symbol} />
            </button>
          ))}
        </div>
      </div>
    </Fragment>
  );

  const emptyMessageBox = () => {
    if (filteredOffers.length > 0) return null;
    if (!offersHaveLoaded.current) {
      return (
        <div className="justify-center text-center w-full py-8">
          <h6 className="font-semibold text-lg text-center inline-flex gap-2 justify-self-center">
            <span className="loading loading-spinner"></span>
            Loading Offers...
          </h6>
        </div>
      );
    }
    return (
      <div className="empty-box">
        <h6 className="text-lg font-semibold">🫥 No offers found</h6>
        <p>
          Try changing the filters above, or{" "}
          <Link
            href={"/sell"}
            className="text-primary font-bold cursor-pointer"
          >
            create one yourself
          </Link>
        </p>
      </div>
    );
  };

  return (
    <Fragment>
      <div className="hero glass-bg">
        <div className="hero-content text-center">
          <div className="space-y-6 justify-items-center">
            <h1 className="text-3xl sm:text-5xl font-bold font-nimbus text-primary">
              Invest Risk-Free. Get Money Back.
            </h1>
            <h2 className="text-lg sm:text-xl font-semibold text-left text-gray-100">
              🤩 Choose a token to invest in
              <br />
              😇 Return it if the price drops
              <br />
              🤑 Reclaim your investment safely
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full sm:w-fit">
              <Link
                href="/sell"
                className="btn btn-outline btn-primary font-semibold text-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                Create an Offer
              </Link>
              <Link
                href="/claim"
                className="btn btn-outline btn-primary font-semibold text-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3.75v16.5M2.25 12h19.5M6.375 17.25a4.875 4.875 0 0 0 4.875-4.875V12m6.375 5.25a4.875 4.875 0 0 1-4.875-4.875V12m-9 8.25h16.5a1.5 1.5 0 0 0 1.5-1.5V5.25a1.5 1.5 0 0 0-1.5-1.5H3.75a1.5 1.5 0 0 0-1.5 1.5v13.5a1.5 1.5 0 0 0 1.5 1.5Zm12.621-9.44c-1.409 1.41-4.242 1.061-4.242 1.061s-.349-2.833 1.06-4.242a2.25 2.25 0 0 1 3.182 3.182ZM10.773 7.63c1.409 1.409 1.06 4.242 1.06 4.242S9 12.22 7.592 10.811a2.25 2.25 0 1 1 3.182-3.182Z"
                  />
                </svg>
                Claim Rewards
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="page-container">
        {filterButtons()}
        <div
          id="offers-grid"
          className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {sortedOffers.map((offer, index) => (
            <OfferItem offer={offer} key={index} />
          ))}
        </div>
        {emptyMessageBox()}
      </div>
    </Fragment>
  );
}

export default App;
