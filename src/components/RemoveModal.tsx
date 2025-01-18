"use client";

import { FC, useEffect, useMemo } from "react";
import Modal from "./Modal";
import Offer from "@/app/types/Offer";
import {
  convertQuantityFromWei
} from "@/utils/utilFunc";
import {
  useAccount,
  useConnect, useWaitForTransactionReceipt,
  useWriteContract
} from "wagmi";
import CONSTANTS from "@/utils/constants";
import TransactionButton from "./TransactionButton";
import { simulateContract } from "wagmi/actions";
import { getConfig } from "@/wagmi";
import { abi as RiskophobeProtocolAbi } from "@/abi/RiskophobeProtocolAbi";
import SignInButton from "./SignInButton";
import useStore from "@/store/useStore";
import { base } from "viem/chains";
import SwitchChainButton from "./SwitchChainButton";

interface RemoveModalProps {
  visible: boolean;
  onClose: () => void;
  offer: Offer;
}

const RemoveModal: FC<RemoveModalProps> = ({ visible, onClose, offer }) => {
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

  const config = getConfig();
  const { address: connectedAddress, chainId: connectedChainId } = useAccount();
  const { offers, setOffers } = useStore();

  const formattedSoldTokenAmount = useMemo(
    () => convertQuantityFromWei(soldTokenAmount, soldToken.decimals),
    [soldTokenAmount, soldToken.decimals]
  );
  const formattedCollateralBalance = useMemo(
    () => convertQuantityFromWei(collateralBalance, collateralToken.decimals),
    [collateralBalance, collateralToken.decimals]
  );

  // removeOffer tx hooks
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

  // useEffect to handle removeOffer transaction success
  useEffect(() => {
    if (removeOfferSuccess) {
      // Remove the removed offer from offers
      const newOffers = offers.filter((offer) => offer.id !== offerId);
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
      writeRemoveOffer(request);
    } catch (e) {
      console.error("handleRemoveOffer ERROR", e);
    }
  };

  const transactionButton = () => {
    if (!connectedAddress) return <SignInButton />;
    if (connectedChainId !== base.id) return <SwitchChainButton />;
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

  return (
    <Modal visible={visible} title={`Remove this offer`} onClose={onClose}>
      <div className="flex flex-col gap-4 items-center">
        <p>
          You will receive <img src={soldToken.logo} width={14} height={14} />{" "}
          {formattedSoldTokenAmount} {soldToken.symbol} and{" "}
          <img src={collateralToken.logo} width={14} height={14} />{" "}
          {formattedCollateralBalance} {collateralToken.symbol}
        </p>
        {transactionButton()}
      </div>
    </Modal>
  );
};

export default RemoveModal;
