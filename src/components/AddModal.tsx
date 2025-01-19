"use client";

import { FC, useEffect, useMemo } from "react";
import Modal from "./Modal";
import Offer from "@/app/types/Offer";
import { convertQuantityFromWei } from "@/utils/utilFunc";
import {
  useAccount,
  useConnect,
  useWaitForTransactionReceipt,
  useWriteContract,
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

interface AddModalProps {
  visible: boolean;
  onClose: () => void;
  offer: Offer;
}

const AddModal: FC<AddModalProps> = ({ visible, onClose, offer }) => {
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

  // addSoldTokens tx hooks
  const { connectors } = useConnect();
  const {
    data: addSoldTokensHash,
    isPending: addSoldTokensIsPending,
    writeContract: writeAddSoldTokens,
  } = useWriteContract();
  const { isLoading: addSoldTokensIsConfirming, isSuccess: addSoldTokensSuccess } =
    useWaitForTransactionReceipt({
      hash: addSoldTokensHash,
    });

  // useEffect to handle addSoldTokens transaction success
  useEffect(() => {
    if (addSoldTokensSuccess) {
      // TODO
    }
  }, [addSoldTokensSuccess]);

  const handleAddSoldTokens = async () => {
    try {
      const { request } = await simulateContract(config, {
        abi: RiskophobeProtocolAbi,
        address: CONSTANTS.RISKOPHOBE_CONTRACT as `0x${string}`,
        functionName: "addSoldTokens",
        args: [BigInt(offerId), BigInt(soldTokenAmount)],
        connector: connectors[0],
      });
      writeAddSoldTokens(request);
    } catch (e) {
      console.error("handleAddSoldTokens ERROR", e);
    }
  };

  const transactionButton = () => {
    if (!connectedAddress) return <SignInButton />;
    if (connectedChainId !== base.id) return <SwitchChainButton />;
    return (
      <TransactionButton
        onClickAction={handleAddSoldTokens}
        disabled={addSoldTokensIsPending || addSoldTokensIsConfirming}
        loading={addSoldTokensIsPending || addSoldTokensIsConfirming}
      >
        ADD {soldToken.symbol}
      </TransactionButton>
    );
  };

  return (
    <Modal visible={visible} title={`Add ${soldToken.symbol} to this offer`} onClose={onClose}>
      <div className="flex flex-col gap-4 items-center">
        {transactionButton()}
      </div>
    </Modal>
  );
};

export default AddModal;
