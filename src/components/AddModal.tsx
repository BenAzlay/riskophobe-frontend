"use client";

import { FC, useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import Offer from "@/app/types/Offer";
import { convertQuantityFromWei, convertQuantityToWei } from "@/utils/utilFunc";
import CONSTANTS from "@/utils/constants";
import TransactionButton from "./TransactionButton";
import { abi as RiskophobeProtocolAbi } from "@/abi/RiskophobeProtocolAbi";
import SignInButton from "./SignInButton";
import useStore from "@/store/useStore";
import { base } from "viem/chains";
import SwitchChainButton from "./SwitchChainButton";
import TokenAmountField from "./TokenAmountField";
import TokenSymbolAndLogo from "./TokenSymbolAndLogo";
import Decimal from "decimal.js";
import { ethers } from "ethers";
import { useAsyncEffect } from "@/utils/customHooks";
import { getTokenAllowance, getTokenBalance } from "@/utils/tokenMethods";
import { erc20Abi, zeroAddress } from "viem";
import useContractTransaction from "@/utils/useContractTransaction";
import { useAccount } from "wagmi";

interface AddModalProps {
  visible: boolean;
  onClose: () => void;
  offer: Offer;
}

const AddModal: FC<AddModalProps> = ({ visible, onClose, offer }) => {
  const { id: offerId, soldToken, soldTokenAmount, collateralBalance } = offer;

  const { address: connectedAddress, chainId: connectedChainId } = useAccount();

  const { updateOffer } = useStore();

  const [soldTokenBalance, setSoldTokenBalance] = useState<string>("0");
  const [soldTokenAllowance, setSoldTokenAllowance] = useState<string>("0");
  const [amountToAdd, setAmountToAdd] = useState<string>("");
  const [txError, setTxError] = useState<string | null>(null);

  const amountToAddWei = useMemo(
    () => convertQuantityToWei(amountToAdd, soldToken?.decimals ?? 18),
    [amountToAdd, soldToken?.decimals]
  );

  const hasEnoughSoldTokenAllowance = useMemo(() => {
    if (new Decimal(amountToAddWei).lte(0))
      return new Decimal(soldTokenAllowance).gt(0);
    return new Decimal(soldTokenAllowance).gte(amountToAddWei);
  }, [amountToAddWei, soldTokenAllowance]);

  const formattedSoldTokenBalance = useMemo(
    () => convertQuantityFromWei(soldTokenBalance, soldToken?.decimals ?? 18),
    [soldTokenBalance, soldToken?.decimals]
  );

  const getSoldTokenBalance = async () =>
    await getTokenBalance(soldToken?.address, connectedAddress);
  const getSoldTokenAllowance = async () =>
    await getTokenAllowance(
      soldToken?.address,
      connectedAddress,
      CONSTANTS.RISKOPHOBE_CONTRACT
    );

  const soldTokenBalanceAndAllowanceGetter = async (): Promise<
    [string, string]
  > => {
    if (
      !ethers.isAddress(soldToken?.address) ||
      !ethers.isAddress(connectedAddress)
    )
      return ["0", "0"];
    return await Promise.all([getSoldTokenBalance(), getSoldTokenAllowance()]);
  };
  const soldTokenBalanceAndAllowanceSetter = ([newBalance, newAllowance]: [
    string,
    string,
  ]): void => {
    setSoldTokenBalance(newBalance);
    setSoldTokenAllowance(newAllowance);
  };
  useAsyncEffect(
    soldTokenBalanceAndAllowanceGetter,
    soldTokenBalanceAndAllowanceSetter,
    [connectedAddress, soldToken?.address]
  );

  // Reset txError after 10 seconds
  useEffect(() => {
    if (txError !== null) {
      const timer = setTimeout(() => {
        setTxError(null);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [txError]);

  // approval tx hook
  const {
    isPending: approveIsPending,
    executeTransaction: executeApproveTransaction,
  } = useContractTransaction({
    abi: erc20Abi,
    contractAddress: soldToken?.address ?? zeroAddress,
    functionName: "approve",
    args: [
      CONSTANTS.RISKOPHOBE_CONTRACT as `0x${string}`,
      BigInt(amountToAddWei),
    ],
    onSuccess: async () => {
      console.log("Approval successful");
      setTxError(null);
      const _allowance = await getSoldTokenAllowance();
      setSoldTokenAllowance(_allowance);
    },
    onError: (errorMessage) => {
      setTxError(errorMessage);
    },
  });

  // addSoldTokens tx hook
  const {
    isPending: addSoldTokensIsPending,
    executeTransaction: executeAddSoldTokensTransaction,
  } = useContractTransaction({
    abi: RiskophobeProtocolAbi,
    contractAddress: CONSTANTS.RISKOPHOBE_CONTRACT as `0x${string}`,
    functionName: "addSoldTokens",
    args: [BigInt(offerId), BigInt(amountToAddWei)],
    onSuccess: async () => {
      // Update offer by increasing its soldTokenAmount
      const newSoldTokenAmount =
            soldTokenAmount + Number(amountToAddWei);
      updateOffer(offerId, newSoldTokenAmount, collateralBalance);
      // Reset input
      setAmountToAdd("0");
      // Update balance & allowance
      const payload = await soldTokenBalanceAndAllowanceGetter();
      soldTokenBalanceAndAllowanceSetter(payload);
    },
    onError: (errorMessage) => {
      setTxError(errorMessage);
    },
  });

  const transactionButton = () => {
    if (!connectedAddress) return <SignInButton />;
    if (connectedChainId !== base.id) return <SwitchChainButton />;
    if (!hasEnoughSoldTokenAllowance)
      return (
        <TransactionButton
          disabled={
            approveIsPending ||
            !!hasEnoughSoldTokenAllowance ||
            new Decimal(amountToAddWei).lte(0)
          }
          loading={approveIsPending}
          onClickAction={executeApproveTransaction}
          errorMessage={txError}
        >
          APPROVE {soldToken?.symbol}
        </TransactionButton>
      );
    return (
      <TransactionButton
        onClickAction={executeAddSoldTokensTransaction}
        disabled={addSoldTokensIsPending}
        loading={addSoldTokensIsPending}
        errorMessage={txError}
      >
        ADD {soldToken.symbol}
      </TransactionButton>
    );
  };

  return (
    <Modal
      visible={visible}
      title={`Add ${soldToken.symbol} to this offer`}
      onClose={onClose}
    >
      <div className="flex flex-col gap-4 items-center">
        <TokenAmountField
          amount={amountToAdd}
          onChangeAmount={(amount) => setAmountToAdd(amount)}
          showTokenBalance={true}
          tokenBalance={formattedSoldTokenBalance}
          tokenComponent={<TokenSymbolAndLogo symbol={soldToken.symbol} />}
        />
        {transactionButton()}
      </div>
    </Modal>
  );
};

export default AddModal;
