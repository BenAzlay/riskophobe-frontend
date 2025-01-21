"use client";

import useStore from "@/store/useStore";
import { Fragment, useMemo, useState } from "react";
import OfferItem from "@/components/OfferItem";
import { useAsyncEffect } from "@/utils/customHooks";
import { useAccount } from "wagmi";
import { Deposit } from "@/utils/queries";
import { ethers } from "ethers";
import ERC20Token from "./types/ERC20Token";
import Decimal from "decimal.js";
import { abbreviateAmount, compareEthereumAddresses } from "@/utils/utilFunc";
import TokenSymbolAndLogo from "@/components/TokenSymbolAndLogo";

function App() {
  const { offers, setDeposits, deposits } = useStore();
  const { address: connectedAddress } = useAccount() as { address: string };

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

  const [filterType, setFilterType] = useState<string>("all"); // all | created | bought
  const [tokenFilter, setTokenFilter] = useState<ERC20Token | null>(null);

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
    [
      offers,
      boughtOffers,
      createrOffers,
      filterType,
      tokenFilter,
    ]
  );

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

  const filterButtons = () => (
    <Fragment>
      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <div className="join">
          {filterTypeOptions.map(({ id, label }) => (
            <button
              key={id}
              className={`join-item btn ${
                filterType === id ? "bg-indigo-500" : "bg-gray-700"
              } hover:bg-indigo-600 text-white`}
              onClick={() => setFilterType(id)}
            >
              {label} ({abbreviateAmount(getOffersCount(id))})
            </button>
          ))}
        </div>
        {/* Token Filters */}
        {offerTokens.map((token) => (
          <button
            key={token.address}
            className={`btn ${
              tokenFilter === token ? "bg-indigo-500" : "bg-gray-700"
            } hover:bg-indigo-600 text-white`}
            onClick={() => setTokenFilter(tokenFilter === token ? null : token)}
          >
            <TokenSymbolAndLogo symbol={token.symbol} logo={token.logo} />
          </button>
        ))}
      </div>
    </Fragment>
  );

  return (
    <Fragment>
      <div className="hero bg-base-200">
        <div className="hero-content text-center">
          <div className="space-y-6 justify-items-center">
            <h1 className="text-5xl font-bold font-nimbus text-primary">
              Invest Risk-Free. Get Money Back.
            </h1>
            <h2 className="text-2xl font-semibold text-left">
              🤩 Choose a token to invest in
              <br />
              😇 Return it if the price drops
              <br />
              🤑 Reclaim your investment safely
            </h2>
          </div>
        </div>
      </div>
      <div className="page-container">
        {filterButtons()}
        <div
          id="offers-grid"
          className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredOffers.map((offer, index) => (
            <OfferItem offer={offer} key={index} />
          ))}
        </div>
      </div>
    </Fragment>
  );
}

export default App;
