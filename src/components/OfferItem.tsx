import Offer from "@/app/types/Offer";
import { useCurrentTimestamp } from "@/utils/customHooks";
import {
  abbreviateAmount,
  calculateCollateralPerOneSoldToken,
  compareEthereumAddresses,
  convertQuantityFromWei,
  getFormattedDateFromSecondsTimestamp,
} from "@/utils/utilFunc";
import { getConfig } from "@/wagmi";
import Decimal from "decimal.js";
import { FC, Fragment, useEffect, useMemo } from "react";
import {
  useAccount,
  useConnect,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { abi as RiskophobeProtocolAbi } from "@/abi/RiskophobeProtocolAbi";
import CONSTANTS from "@/utils/constants";
import { simulateContract } from "wagmi/actions";
import useStore from "@/store/useStore";
import TransactionButton from "./TransactionButton";

interface OfferItemProps {
  offer: Offer;
}

const OfferItem: FC<OfferItemProps> = ({ offer }) => {
  const config = getConfig();
  const { offers, setOffers } = useStore();

  const { connectors } = useConnect();
  const {
    data: removeOfferHash,
    isPending: removeOfferIsPending,
    writeContract: writeRemoveOffer,
  } = useWriteContract();
  const { isLoading: removeOfferIsConfirming, isSuccess: removeOfferSuccess } =
    useWaitForTransactionReceipt({
      hash: removeOfferHash,
    });
  const { address: connectedAddress } = useAccount();
  const currentTs = useCurrentTimestamp();

  const {
    id: offerId,
    soldToken,
    collateralToken,
    exchangeRate,
    creatorFeeBp,
    startTime,
    endTime,
    soldTokenAmount,
    creator,
  } = offer;

  const collateralPerSoldToken = useMemo(
    () =>
      calculateCollateralPerOneSoldToken(
        exchangeRate,
        soldToken.decimals,
        collateralToken.decimals
      ),
    [soldToken.decimals, collateralToken.decimals, exchangeRate]
  );

  const feePercent = useMemo(
    () => new Decimal(creatorFeeBp).div(100).toFixed(2),
    [creatorFeeBp]
  );

  const startDate = useMemo(
    () => getFormattedDateFromSecondsTimestamp(startTime, true),
    [startTime]
  );
  const endDate = useMemo(
    () => getFormattedDateFromSecondsTimestamp(endTime, true),
    [endTime]
  );
  const offerIsEnded = useMemo(
    () => new Decimal(currentTs).gte(endTime),
    [endTime, currentTs]
  );
  const offerNotStartedYet = useMemo(
    () => new Decimal(startTime).gte(currentTs),
    [startTime, currentTs]
  );

  const formattedSoldTokenAmount = useMemo(
    () => convertQuantityFromWei(soldTokenAmount, soldToken.decimals),
    [soldTokenAmount, soldToken.decimals]
  );

  const userIsCreator = useMemo(
    () => compareEthereumAddresses(connectedAddress as string, creator),
    [connectedAddress, creator]
  );

  // useEffect to handle removeOffer transaction success
  useEffect(() => {
    if (removeOfferSuccess) {
      // Remove the removed offer from offers
      const newOffers = offers.filter((offer) => offer.id !== offerId);
      console.log(`newOffers:`, newOffers);
      setOffers(newOffers);
    }
  }, [removeOfferSuccess]);

  const handleRemoveOffer = async () => {
    try {
      const { request } = await simulateContract(config, {
        abi: RiskophobeProtocolAbi,
        address: CONSTANTS.RISKOPHOBE_CONTRACT as `0x${string}`,
        functionName: "removeOffer",
        args: [BigInt(offerId)],
        connector: connectors[0],
      });
      console.log(`handleRemoveOffer request:`, request);
      writeRemoveOffer(request);
    } catch (e) {
      console.error("handleRemoveOffer ERROR", e);
    }
  };

  const removeOfferButton = () => {
    return (
      <TransactionButton
        onClickAction={handleRemoveOffer}
        disabled={removeOfferIsPending || removeOfferIsConfirming}
        loading={removeOfferIsPending || removeOfferIsConfirming}
      >
        REMOVE OFFER
      </TransactionButton>
    );
  };

  const transactionButtons = () => {
    if (offerNotStartedYet || offerIsEnded) {
      if (userIsCreator) return removeOfferButton();
      return (
        <button className="btn btn-primary w-full" disabled={true}>
          {offerNotStartedYet ? "NOT STARTED" : "EXPIRED"}
        </button>
      );
    }
    return (
      <div className="grid grid-cols-2 gap-2">
        <TransactionButton
          onClickAction={handleRemoveOffer}
          disabled={removeOfferIsPending || removeOfferIsConfirming}
          loading={removeOfferIsPending || removeOfferIsConfirming}
        >
          BUY
        </TransactionButton>
        <TransactionButton
          onClickAction={handleRemoveOffer}
          disabled={removeOfferIsPending || removeOfferIsConfirming}
          loading={removeOfferIsPending || removeOfferIsConfirming}
        >
          RETURN
        </TransactionButton>
      </div>
    );
  };

  return (
    <Fragment>
      <div className="flex flex-col gap-2 transition rounded-md p-4 border-2 border-primary hover:border-secondary">
        <h6 className="text-primary text-lg font-bold text-center">
          Buy {soldToken.symbol} for {collateralToken.symbol}
        </h6>
        <p className="flex items-center gap-2">
          1{" "}
          <span className="inline-flex items-center gap-1">
            <img
              src={soldToken.logo}
              alt="logo"
              height={18}
              width={18}
              className="rounded-full"
            />
            <span>{soldToken.symbol}</span>
          </span>{" "}
          = {abbreviateAmount(collateralPerSoldToken, "", 2)}{" "}
          <span className="inline-flex items-center gap-1">
            <img
              src={collateralToken.logo}
              alt="logo"
              height={18}
              width={18}
              className="rounded-full"
            />
            <span>{collateralToken.symbol}</span>
          </span>
        </p>
        <p className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <img
              src={soldToken.logo}
              alt="logo"
              height={18}
              width={18}
              className="rounded-full"
            />
            <span>{soldToken.symbol}</span>
          </span>{" "}
          sold: {abbreviateAmount(formattedSoldTokenAmount, "", 2)}
        </p>
        <p>Fee: {feePercent}%</p>
        <p>Start: {startDate}</p>
        <p>End: {endDate}</p>
        {transactionButtons()}
      </div>
    </Fragment>
  );
};

export default OfferItem;
