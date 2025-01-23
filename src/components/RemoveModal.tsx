"use client";

import { FC, useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import Offer from "@/app/types/Offer";
import { convertQuantityFromWei } from "@/utils/utilFunc";
import CONSTANTS from "@/utils/constants";
import TransactionButton from "./TransactionButton";
import { getAccount } from "wagmi/actions";
import { abi as RiskophobeProtocolAbi } from "@/abi/RiskophobeProtocolAbi";
import SignInButton from "./SignInButton";
import useStore from "@/store/useStore";
import { base } from "viem/chains";
import SwitchChainButton from "./SwitchChainButton";
import TokenLogo from "./TokenLogo";
import { config } from "@/wagmiConfig";
import useContractTransaction from "@/utils/useContractTransaction";

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
    soldTokenAmount,
    collateralBalance,
  } = offer;

  const { address: connectedAddress, chainId: connectedChainId } =
    getAccount(config);

  const { offers, setOffers } = useStore();

  const [txError, setTxError] = useState<string | null>(null);

  // Reset txError after 10 seconds
  useEffect(() => {
    if (txError !== null) {
      const timer = setTimeout(() => {
        setTxError(null);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [txError]);

  const formattedSoldTokenAmount = useMemo(
    () => convertQuantityFromWei(soldTokenAmount, soldToken.decimals),
    [soldTokenAmount, soldToken.decimals]
  );
  const formattedCollateralBalance = useMemo(
    () => convertQuantityFromWei(collateralBalance, collateralToken.decimals),
    [collateralBalance, collateralToken.decimals]
  );

  // removeOffer tx hook
  const {
    isPending: removeOfferIsPending,
    executeTransaction: executeRemoveOfferTransaction,
  } = useContractTransaction({
    abi: RiskophobeProtocolAbi,
    contractAddress: CONSTANTS.RISKOPHOBE_CONTRACT as `0x${string}`,
    functionName: "removeOffer",
    args: [BigInt(offerId)],
    onSuccess: () => {
      // Remove the removed offer from offers
      const newOffers = offers.filter((offer) => offer.id !== offerId);
      setOffers(newOffers);
    },
    onError: (errorMessage) => {
      setTxError(errorMessage);
    },
  });

  const transactionButton = () => {
    if (!connectedAddress) return <SignInButton />;
    if (connectedChainId !== base.id) return <SwitchChainButton />;
    return (
      <TransactionButton
        onClickAction={executeRemoveOfferTransaction}
        disabled={removeOfferIsPending}
        loading={removeOfferIsPending}
        errorMessage={txError}
      >
        REMOVE OFFER
      </TransactionButton>
    );
  };

  return (
    <Modal visible={visible} title={`Remove this offer`} onClose={onClose}>
      <div className="flex flex-col gap-4 items-center">
        <p className="flex items-center flex-wrap">
          You will receive
          <TokenLogo symbol={soldToken.symbol} size={18} className="mx-1" />
          {formattedSoldTokenAmount} {soldToken.symbol} and
          <TokenLogo
            symbol={collateralToken.symbol}
            size={18}
            className="mx-1"
          />
          {formattedCollateralBalance} {collateralToken.symbol}
        </p>

        {transactionButton()}
      </div>
    </Modal>
  );
};

export default RemoveModal;
