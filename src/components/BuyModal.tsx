"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import Offer from "@/app/types/Offer";
import {
  calculateCollateralForSoldToken,
  calculateSoldTokenForCollateral,
  convertQuantityFromWei,
  convertQuantityToWei,
} from "@/utils/utilFunc";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { getTokenAllowance, getTokenBalance } from "@/utils/tokenMethods";
import CONSTANTS from "@/utils/constants";
import { useAsyncEffect } from "@/utils/customHooks";
import Decimal from "decimal.js";
import RangeSlider from "./RangeSlider";
import TransactionButton from "./TransactionButton";
import { abi as RiskophobeProtocolAbi } from "@/abi/RiskophobeProtocolAbi";
import SignInButton from "./SignInButton";
import { erc20Abi, zeroAddress } from "viem";
import useStore from "@/store/useStore";
import { base } from "viem/chains";
import SwitchChainButton from "./SwitchChainButton";
import useContractTransaction from "@/utils/useContractTransaction";
import { Deposit } from "@/utils/queries";

interface BuyModalProps {
  visible: boolean;
  onClose: () => void;
  offer: Offer;
  deposit: Deposit | null;
}

const BuyModal = ({ visible, onClose, offer, deposit }: BuyModalProps) => {
  const {
    id: offerId,
    soldToken,
    collateralToken,
    exchangeRate,
    creatorFeeBp,
    startTime,
    endTime,
    soldTokenAmount,
    collateralBalance: offerCollateralBalance,
    creator,
  } = offer;

  const { address: connectedAddress, chainId: connectedChainId } = useAccount();

  const { updateOffer, addDeposit, updateDeposit } = useStore();

  const [collateralIn, setCollateralIn] = useState<string>("0");
  const [collateralBalance, setCollateralBalance] = useState<string>("0");
  const [collateralAllowance, setCollateralAllowance] = useState<string>("0");
  const [txError, setTxError] = useState<string | null>(null);

  // Max collateral spendable for the amount of sold token left in the offer
  const maxCollateralInWei = useMemo(
    () => calculateCollateralForSoldToken(exchangeRate, soldTokenAmount),
    [exchangeRate, soldTokenAmount]
  );
  const maxCollateralIn = useMemo(
    () => convertQuantityFromWei(maxCollateralInWei, collateralToken.decimals),
    [maxCollateralInWei, collateralToken.decimals]
  );

  const formattedCollateralBalance = useMemo(
    () => convertQuantityFromWei(collateralBalance, collateralToken.decimals),
    [collateralBalance, collateralToken.decimals]
  );

  // The max collateral amount spendable by the user
  // IF maxCollateralIn > balance AND balance > 0 => use balance
  // ELSE use maxCollateralIn
  const userMaxCollateralIn = useMemo(() => {
    if (
      new Decimal(maxCollateralIn).gt(formattedCollateralBalance) &&
      new Decimal(formattedCollateralBalance).gt(0)
    )
      return formattedCollateralBalance;
    return maxCollateralIn;
  }, [maxCollateralIn, formattedCollateralBalance]);

  // Calculate step from one 1000th of the max
  const step: number = useMemo(
    () =>
      parseFloat(
        (Number(userMaxCollateralIn) / 100).toFixed(collateralToken.decimals)
      ),
    [userMaxCollateralIn, collateralToken.decimals]
  );

  const collateralInWei = useMemo(
    () => convertQuantityToWei(collateralIn, collateralToken.decimals),
    [collateralIn, collateralToken.decimals]
  );

  const soldTokenOutWei = useMemo(
    () => calculateSoldTokenForCollateral(exchangeRate, collateralInWei),
    [exchangeRate, collateralInWei]
  );
  const soldTokenOut = useMemo(
    () => convertQuantityFromWei(soldTokenOutWei, soldToken.decimals),
    [soldTokenOutWei, soldToken.decimals]
  );

  const hasEnoughCollateralAllowance = useMemo(() => {
    if (new Decimal(collateralInWei).lte(0))
      return new Decimal(collateralAllowance).gt(0);
    return new Decimal(collateralAllowance).gte(collateralInWei);
  }, [collateralInWei, collateralAllowance]);

  const getCollateralBalance = async () =>
    await getTokenBalance(collateralToken?.address, connectedAddress);
  const getCollateralAllowance = async () =>
    await getTokenAllowance(
      collateralToken?.address,
      connectedAddress,
      CONSTANTS.RISKOPHOBE_CONTRACT
    );

  const collateralBalanceAndAllowanceGetter = async (): Promise<
    [string, string]
  > => {
    if (
      !ethers.isAddress(collateralToken?.address) ||
      !ethers.isAddress(connectedAddress)
    )
      return ["0", "0"];
    return await Promise.all([
      getCollateralBalance(),
      getCollateralAllowance(),
    ]);
  };
  const collateralBalanceAndAllowanceSetter = ([newBalance, newAllowance]: [
    string,
    string
  ]): void => {
    setCollateralBalance(newBalance);
    setCollateralAllowance(newAllowance);
  };
  useAsyncEffect(
    collateralBalanceAndAllowanceGetter,
    collateralBalanceAndAllowanceSetter,
    [connectedAddress, collateralToken?.address]
  );

  const handleCollateralInChange = (newValue: number): void => {
    setCollateralIn(new Decimal(newValue).toString());
  };

  // Reset txError after 10 seconds
  useEffect(() => {
    if (txError !== null) {
      const timer = setTimeout(() => {
        setTxError(null);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [txError]);

  // Approve TX hooks
  const {
    isPending: approveIsPending,
    executeTransaction: executeApproveTransaction,
  } = useContractTransaction({
    abi: erc20Abi,
    contractAddress: collateralToken?.address ?? zeroAddress,
    functionName: "approve",
    args: [
      CONSTANTS.RISKOPHOBE_CONTRACT as `0x${string}`,
      BigInt(collateralInWei),
    ],
    onSuccess: async () => {
      console.log("Approval successful");
      setTxError(null);
      const _allowance = await getCollateralAllowance();
      setCollateralAllowance(_allowance);
    },
    onError: (errorMessage) => {
      setTxError(errorMessage);
    },
  });

  // buyTokens TX hooks
  const {
    isPending: buyTokensIsPending,
    executeTransaction: executeBuyTokensTransaction,
  } = useContractTransaction({
    abi: RiskophobeProtocolAbi,
    contractAddress: CONSTANTS.RISKOPHOBE_CONTRACT as `0x${string}`,
    functionName: "buyTokens",
    args: [BigInt(offerId), BigInt(collateralInWei), BigInt(0)],
    onSuccess: async () => {
      // Update offer collateralBalance and soldTokenAmount
      const newSoldTokenAmount: number =
        Number(soldTokenAmount) - Number(soldTokenOutWei);
      const newCollateralBalance =
        Number(offerCollateralBalance) + Number(collateralInWei);
      updateOffer(offerId, newSoldTokenAmount, newCollateralBalance);
      if (deposit === null) {
        // IF deposit does not exist, add deposit to store
        const newDepositId = `${offerId}-${connectedAddress?.toLowerCase()}`;
        const newDeposit: Deposit = {
          id: newDepositId,
          offerId,
          participant: connectedAddress as string,
          netCollateralAmount: Number(collateralInWei),
        };
        addDeposit(newDeposit);
      } else {
        // ELSE update existing deposit
        const newNetCollateralBalance =
          Number(deposit.netCollateralAmount) + Number(collateralInWei);
        updateDeposit(deposit.id, newNetCollateralBalance);
      }
      // Reset input
      setCollateralIn("0");
      // Update balance and allowance
      const payload = await collateralBalanceAndAllowanceGetter();
      collateralBalanceAndAllowanceSetter(payload);
    },
    onError: (errorMessage) => {
      setTxError(errorMessage);
    },
  });

  const transactionButton = () => {
    if (!connectedAddress) return <SignInButton />;
    if (connectedChainId !== base.id) return <SwitchChainButton />;
    if (!hasEnoughCollateralAllowance)
      return (
        <TransactionButton
          disabled={
            approveIsPending ||
            !!hasEnoughCollateralAllowance ||
            new Decimal(collateralInWei).lte(0)
          }
          loading={approveIsPending}
          onClickAction={executeApproveTransaction}
          errorMessage={txError}
        >
          APPROVE {collateralToken?.symbol}
        </TransactionButton>
      );
    return (
      <TransactionButton
        disabled={new Decimal(collateralInWei).lte(0) || buyTokensIsPending}
        loading={buyTokensIsPending}
        onClickAction={executeBuyTokensTransaction}
        errorMessage={txError}
      >
        BUY {soldToken.symbol}
      </TransactionButton>
    );
  };

  return (
    <Modal
      visible={visible}
      title={`Buy ${soldToken.symbol} for ${collateralToken.symbol}`}
      onClose={onClose}
    >
      <div className="flex flex-col gap-4 items-center">
        <label className="block text-sm font-medium">
          Select collateral {collateralToken.symbol} to deposit
        </label>
        <RangeSlider
          value={Number(collateralIn)}
          onChange={handleCollateralInChange}
          tokenSymbol={collateralToken.symbol}
          min={0}
          max={Number(userMaxCollateralIn)}
          step={step}
          displayTooltip={(value) => `${value} ${collateralToken.symbol}`}
          disabled={buyTokensIsPending}
        />
        <div className="space-y-2 center justify-items-center">
          <div className="text-center">
            <p className="text-sm text-gray-500">Deposit:</p>
            <p className="text-gray-100 font-bold">
              {collateralIn} {collateralToken.symbol}
            </p>
          </div>
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
              d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
            />
          </svg>
          <div className="text-center">
            <p className="text-sm text-gray-500">Receive:</p>
            <p className="text-gray-100 font-bold">
              {soldTokenOut} {soldToken.symbol}
            </p>
          </div>
        </div>
        {transactionButton()}
      </div>
    </Modal>
  );
};

export default BuyModal;
