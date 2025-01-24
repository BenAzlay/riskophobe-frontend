import Offer from "@/app/types/Offer";
import { useCurrentTimestamp } from "@/utils/customHooks";
import {
  abbreviateAmount,
  calculateCollateralPerOneSoldToken,
  calculateSoldTokenForCollateral,
  compareEthereumAddresses,
  convertQuantityFromWei,
  convertQuantityToWei,
  formatDuration,
} from "@/utils/utilFunc";
import Decimal from "decimal.js";
import { FC, Fragment, useMemo, useState } from "react";
import useStore from "@/store/useStore";
import TransactionButton from "./TransactionButton";
import BuyModal from "./BuyModal";
import { Deposit } from "@/utils/queries";
import ReturnModal from "./ReturnModal";
import Tooltip from "./Tooltip";
import AddModal from "./AddModal";
import RemoveModal from "./RemoveModal";
import TokenLogo from "./TokenLogo";
import InfoModal from "./InfoModal";
import { config } from "@/wagmiConfig";
import { getAccount } from "wagmi/actions";
import { useAccount } from "wagmi";

interface OfferItemProps {
  offer: Offer;
}

const OfferItem: FC<OfferItemProps> = ({ offer }) => {
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
      <div className="flex flex-col gap-2 transition rounded-md p-4 border-2 border-primary hover:border-secondary bg-[#6B46C110]">
        <h6 className="text-primary text-lg font-bold text-center">
          Buy {soldToken.symbol} for {collateralToken.symbol}
        </h6>
        <p className="inline-flex gap-1">
          💱{" "}
          <span>
            1 {perSoldTokenMode ? soldToken.symbol : collateralToken.symbol}
          </span>
          ={" "}
          <Tooltip
            message={
              perSoldTokenMode ? collateralPerSoldToken : soldTokenPerCollateral
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
        </p>
        <div className="inline-flex gap-1">
          🛡️ Money back: {moneyBackPercent}%
          <InfoModal title="User fees">
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
        <RemoveModal
          visible={removeModalOpen}
          onClose={() => setRemoveModalOpen(false)}
          offer={offer}
        />
      ) : null}
      {userIsCreator ? (
        <AddModal
          visible={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          offer={offer}
        />
      ) : null}
    </Fragment>
  );
};

export default OfferItem;
