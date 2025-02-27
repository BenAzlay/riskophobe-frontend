import Offer from "@/app/types/Offer";
import { useCurrentTimestamp } from "@/utils/customHooks";
import {
  abbreviateAmount,
  calculateSoldTokenForCollateral,
  compareEthereumAddresses,
  convertQuantityFromWei,
  convertQuantityToWei,
  formatDuration,
  numberWithCommas,
} from "@/utils/utilFunc";
import Decimal from "decimal.js";
import { Fragment, memo, useMemo, useState } from "react";
import useStore from "@/store/useStore";
import TransactionButton from "./TransactionButton";
import { Deposit } from "@/utils/queries";
import Tooltip from "./Tooltip";
import TokenLogo from "./TokenLogo";
import { useAccount } from "wagmi";
import dynamic from "next/dynamic";

const BuyModal = dynamic(() => import("./BuyModal"));
const ReturnModal = dynamic(() => import("./ReturnModal"));
const AddModal = dynamic(() => import("./AddModal"));
const RemoveModal = dynamic(() => import("./RemoveModal"));
const InfoModal = dynamic(() => import("./InfoModal"));

interface OfferItemProps {
  offer: Offer;
}

const OfferItem = ({ offer }: OfferItemProps) => {
  const { deposits } = useStore();

  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [perSoldTokenMode, setPerSoldTokenMode] = useState(true);

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
    collateralBalance,
    collateralPerSoldToken,
    pricePerSoldToken,
    soldTokenMarketPriceDifference,
  } = offer;

  const soldTokenPerCollateral = useMemo(
    () =>
      convertQuantityFromWei(
        calculateSoldTokenForCollateral(
          exchangeRate,
          convertQuantityToWei(1, collateralToken.decimals)
        ),
        soldToken.decimals
      ),
    [exchangeRate, soldToken.decimals, collateralToken.decimals]
  );

  const feePercent = useMemo(
    () => new Decimal(creatorFeeBp).div(100).toFixed(2),
    [creatorFeeBp]
  );

  const moneyBackPercent = useMemo(
    () => new Decimal(10000).minus(creatorFeeBp).div(100).toFixed(2),
    [creatorFeeBp]
  );

  const startDuration = currentTs - startTime;
  const endDuration = endTime - currentTs;

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

  // Value in USD of all sold tokens remaining in offer (from market price)
  const soldTokenAmountInUsdc = useMemo(
    () => new Decimal(formattedSoldTokenAmount).mul(soldToken.price).toString(),
    [formattedSoldTokenAmount, soldToken.price]
  );

  // Percentage difference between USD sold token price in offer, and in market
  const priceDifferencePercentage = useMemo(
    () => new Decimal(soldTokenMarketPriceDifference).mul(100).toString(),
    [soldTokenMarketPriceDifference]
  );

  const userIsCreator = useMemo(
    () => compareEthereumAddresses(connectedAddress as string, creator),
    [connectedAddress, creator]
  );

  // The deposit connected user made to this offer
  // null if no deposit was made to this offer by the user
  const ownDeposit: Deposit | null = useMemo(() => {
    const _deposit =
      deposits.find((deposit) => deposit.offerId === offerId) ?? null;
    // If no collateral left in deposit, do as if there is no deposit
    if (_deposit === null || _deposit.netCollateralAmount <= 0) return null;
    return _deposit;
  }, [offerId, deposits]);

  const transactionButtons = () => {
    return (
      <div className="grid grid-cols-2 gap-2">
        {offerNotStartedYet || offerIsEnded ? (
          <button className="btn btn-primary w-full col-span-2" disabled={true}>
            {offerNotStartedYet ? "NOT STARTED" : "EXPIRED"}
          </button>
        ) : (
          <Fragment>
            <TransactionButton onClickAction={() => setBuyModalOpen(true)}>
              🤑 BUY
            </TransactionButton>
            <TransactionButton
              onClickAction={() => setReturnModalOpen(true)}
              disabled={
                ownDeposit === null // enable only if user has deposited collateral into this offer
              }
            >
              😭 RETURN
            </TransactionButton>
          </Fragment>
        )}
        {userIsCreator ? (
          <Fragment>
            <TransactionButton
              onClickAction={() => setAddModalOpen(true)}
              disabled={!userIsCreator || offerIsEnded}
            >
              <TokenLogo symbol={soldToken.symbol} size={14} /> ADD{" "}
              {soldToken.symbol}
            </TransactionButton>
            <TransactionButton
              onClickAction={() => setRemoveModalOpen(true)}
              disabled={
                !userIsCreator || (collateralBalance > 0 && !offerIsEnded)
              }
            >
              🫥 REMOVE
            </TransactionButton>
          </Fragment>
        ) : null}
      </div>
    );
  };

  return (
    <Fragment>
      <div className="offer-item glass-bg">
        <p className="text-secondary text-lg font-bold text-center">
          <span>{soldToken.symbol}</span> for{" "}
          <span>{collateralToken.symbol}</span>
        </p>
        <p className="inline-flex gap-1">
          💱{" "}
          <span>
            1 {perSoldTokenMode ? soldToken.symbol : collateralToken.symbol}
          </span>
          ={" "}
          <Tooltip
            message={
              perSoldTokenMode
                ? new Decimal(collateralPerSoldToken).toString()
                : soldTokenPerCollateral
            }
          >
            {abbreviateAmount(
              perSoldTokenMode
                ? collateralPerSoldToken
                : soldTokenPerCollateral,
              "",
              3
            )}{" "}
            {perSoldTokenMode ? collateralToken.symbol : soldToken.symbol}
          </Tooltip>
          <span
            onClick={() => setPerSoldTokenMode((oldMode) => !oldMode)}
            className="text-gray-500 hover:text-gray-700 inline-block cursor-pointer"
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
                d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
              />
            </svg>
          </span>
        </p>
        <p className="flex items-center gap-2">
          <TokenLogo symbol={soldToken.symbol} size={18} />
          {soldToken.symbol} remaining:
          <Tooltip message={`${formattedSoldTokenAmount} ${soldToken.symbol}`}>
            {abbreviateAmount(formattedSoldTokenAmount, "", 2)}
          </Tooltip>
          <Tooltip message={`$${numberWithCommas(soldTokenAmountInUsdc)}`}>
            ({abbreviateAmount(soldTokenAmountInUsdc, "$", 2)})
          </Tooltip>
        </p>
        <div className="inline-flex gap-1">
          <span>
            📈 {soldToken.symbol} price:{" "}
            <Tooltip
              message={`$${numberWithCommas(pricePerSoldToken)}/${
                soldToken.symbol
              }`}
            >
              <b className="font-semibold">
                {abbreviateAmount(pricePerSoldToken, "$", 2)}
              </b>
            </Tooltip>{" "}
            (
            <Tooltip
              message={`${numberWithCommas(priceDifferencePercentage)}% of ${
                soldToken.symbol
              } market price`}
            >
              <b
                className={`font-semibold ${
                  new Decimal(priceDifferencePercentage).gt(100)
                    ? "text-error"
                    : "text-success"
                }`}
              >
                {abbreviateAmount(priceDifferencePercentage, "", 2)}%
              </b>
            </Tooltip>
            )
          </span>
          <InfoModal title="Offer vs Market Price Difference">
            <p>
              In an offer, a token is being sold at a potentially different
              price from its market value. As the market price flucuates over
              the lifetime of the offer, it can go lower or higher than the
              price in the offer.
            </p>
            <p>
              The {soldToken.symbol} price for this offer is currently $
              {numberWithCommas(pricePerSoldToken)}, which is{" "}
              {numberWithCommas(priceDifferencePercentage)}% of its market price
              of ${numberWithCommas(soldToken.price)}.
            </p>
            <p>
              💡 Tip: As a buyer, it might be worth buying {soldToken.symbol}{" "}
              even if it is sold above its market price, diminishing your
              potential upside in return for the diminishing your risk.
            </p>
          </InfoModal>
        </div>
        <div className="inline-flex gap-1">
          🛡️ Money back: {moneyBackPercent}%
          <InfoModal title="User Fees">
            <p>
              On buying {soldToken.symbol}, you will pay a {feePercent}% fee on
              your {collateralToken.symbol}.
            </p>
            <p>
              Therefore, if you decide to return the {soldToken.symbol} you
              bought, you will get back {moneyBackPercent}% of your invested{" "}
              {collateralToken.symbol}.
            </p>
          </InfoModal>
        </div>
        <p>
          🏁 {startDuration > 0 ? "Started" : "Starts in"}{" "}
          {formatDuration(Math.abs(startDuration))}{" "}
          {startDuration > 0 ? "ago" : ""}
        </p>
        <p>
          ⌛ {endDuration > 0 ? "Ends in" : "Ended"}{" "}
          {formatDuration(Math.abs(endDuration))} {endDuration > 0 ? "" : "ago"}
        </p>
        {transactionButtons()}
      </div>
      <BuyModal
        visible={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
        offer={offer}
        deposit={ownDeposit}
      />
      {ownDeposit !== null ? (
        <ReturnModal
          visible={returnModalOpen}
          onClose={() => setReturnModalOpen(false)}
          offer={offer}
          deposit={ownDeposit}
        />
      ) : null}
      {userIsCreator ? (
        <Fragment>
          <RemoveModal
            visible={removeModalOpen}
            onClose={() => setRemoveModalOpen(false)}
            offer={offer}
          />
          <AddModal
            visible={addModalOpen}
            onClose={() => setAddModalOpen(false)}
            offer={offer}
          />
        </Fragment>
      ) : null}
    </Fragment>
  );
};

export default memo(OfferItem);
