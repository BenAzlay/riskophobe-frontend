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
import { FC, Fragment, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import useStore from "@/store/useStore";
import TransactionButton from "./TransactionButton";
import BuyModal from "./BuyModal";
import { Deposit } from "@/utils/queries";
import ReturnModal from "./ReturnModal";
import RemoveModal from "./RemoveModal";
import Tooltip from "./Tooltip";

interface OfferItemProps {
  offer: Offer;
}

const OfferItem: FC<OfferItemProps> = ({ offer }) => {
  const config = getConfig();
  const { offers, setOffers, deposits } = useStore();

  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

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
              <img src={soldToken.logo} width={14} height={14} alt="logo" /> ADD{" "}
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
          sold:
          <Tooltip message={`${formattedSoldTokenAmount} ${soldToken.symbol}`}>
            {abbreviateAmount(formattedSoldTokenAmount, "", 2)}
          </Tooltip>
        </p>
        <p>Fee: {feePercent}%</p>
        <p>Start: {startDate}</p>
        <p>End: {endDate}</p>
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
        <RemoveModal
          visible={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          offer={offer}
        />
      ) : null}
    </Fragment>
  );
};

export default OfferItem;
