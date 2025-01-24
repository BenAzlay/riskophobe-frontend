import { FC, useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import Offer from "@/app/types/Offer";
import {
  calculateCollateralForSoldToken,
  calculateSoldTokenForCollateral,
  convertQuantityFromWei,
  convertQuantityToWei,
} from "@/utils/utilFunc";
import { ethers } from "ethers";
import { getTokenAllowance, getTokenBalance } from "@/utils/tokenMethods";
import CONSTANTS from "@/utils/constants";
import { useAsyncEffect } from "@/utils/customHooks";
import Decimal from "decimal.js";
import RangeSlider from "./RangeSlider";
import TransactionButton from "./TransactionButton";
import { abi as RiskophobeProtocolAbi } from "@/abi/RiskophobeProtocolAbi";
import SignInButton from "./SignInButton";
import { erc20Abi, zeroAddress } from "viem";
import { Deposit } from "@/utils/queries";
import useStore from "@/store/useStore";
import SwitchChainButton from "./SwitchChainButton";
import { base } from "viem/chains";
import useContractTransaction from "@/utils/useContractTransaction";
import { useAccount } from "wagmi";

interface ReturnModalProps {
  visible: boolean;
  onClose: () => void;
  offer: Offer;
  deposit: Deposit;
}

const ReturnModal: FC<ReturnModalProps> = ({
  visible,
  onClose,
  offer,
  deposit,
}) => {
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

  const { netCollateralAmount: collateralDepositedWei } = deposit;

  const { address: connectedAddress, chainId: connectedChainId } = useAccount();

  const { offers, setOffers } = useStore();

  const [soldTokenIn, setSoldTokenIn] = useState<string>("0");
  const [soldTokenBalance, setSoldTokenBalance] = useState<string>("0");
  const [soldTokenAllowance, setSoldTokenAllowance] = useState<string>("0");
  const [txError, setTxError] = useState<string | null>(null);

  const formattedSoldTokenBalance = useMemo(
    () => convertQuantityFromWei(soldTokenBalance, soldToken.decimals),
    [soldTokenBalance, soldToken.decimals]
  );

  const soldTokenBoughtWei = useMemo(
    () => calculateSoldTokenForCollateral(exchangeRate, collateralDepositedWei),
    [exchangeRate, collateralDepositedWei]
  );

  const soldTokenBought = useMemo(
    () => convertQuantityFromWei(soldTokenBoughtWei, soldToken.decimals),
    [soldTokenBoughtWei, soldToken.decimals]
  );

  // The max sold token amount returnable by the user
  // IF soldTokenBought > balance AND balance > 0 => use balance
  // ELSE use soldTokenBought
  const userMaxSoldTokenIn = useMemo(() => {
    if (
      new Decimal(soldTokenBought).gt(formattedSoldTokenBalance) &&
      new Decimal(formattedSoldTokenBalance).gt(0)
    )
      return formattedSoldTokenBalance;
    return soldTokenBought;
  }, [soldTokenBought, formattedSoldTokenBalance]);

  // Calculate step from one 1000th of the max
  const step: number = useMemo(
    () =>
      parseFloat(
        (Number(userMaxSoldTokenIn) / 100).toFixed(soldToken.decimals)
      ),
    [userMaxSoldTokenIn, soldToken.decimals]
  );

  const soldTokenInWei = useMemo(
    () => convertQuantityToWei(soldTokenIn, soldToken.decimals),
    [soldTokenIn, soldToken.decimals]
  );

  const collateralOutWei = useMemo(
    () => calculateCollateralForSoldToken(exchangeRate, soldTokenInWei),
    [exchangeRate, soldTokenInWei]
  );
  const collateralOut = useMemo(
    () => convertQuantityFromWei(collateralOutWei, collateralToken.decimals),
    [collateralOutWei, collateralToken.decimals]
  );

  const hasEnoughSoldTokenAllowance = useMemo(() => {
    if (new Decimal(soldTokenInWei).lte(0))
      return new Decimal(soldTokenAllowance).gt(0);
    return new Decimal(soldTokenAllowance).gte(soldTokenInWei);
  }, [soldTokenInWei, soldTokenAllowance]);

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
    console.log(`newAllowance:`, newAllowance);
    setSoldTokenBalance(newBalance);
    setSoldTokenAllowance(newAllowance);
  };
  useAsyncEffect(
    soldTokenBalanceAndAllowanceGetter,
    soldTokenBalanceAndAllowanceSetter,
    [connectedAddress, collateralToken?.address]
  );

  const handleSoldTokenInChange = (newValue: number): void => {
    setSoldTokenIn(new Decimal(newValue).toString());
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
    contractAddress: soldToken?.address ?? zeroAddress,
    functionName: "approve",
    args: [
      CONSTANTS.RISKOPHOBE_CONTRACT as `0x${string}`,
      BigInt(soldTokenInWei),
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

  // returnTokens TX hooks
  const {
    isPending: returnTokensIsPending,
    executeTransaction: executeReturnTokensTransaction,
  } = useContractTransaction({
    abi: RiskophobeProtocolAbi,
    contractAddress: CONSTANTS.RISKOPHOBE_CONTRACT as `0x${string}`,
    functionName: "returnTokens",
    args: [BigInt(offerId), BigInt(collateralOutWei)],
    onSuccess: async () => {
      // Update offer collateralBalance and soldTokenAmount
      const newOffers = offers.map((offer) => {
        if (offer.id === offerId) {
          const newCollateralBalance =
            offer.collateralBalance - Number(collateralOutWei);
          const newSoldTokenAmount =
            offer.soldTokenAmount + Number(soldTokenInWei);
          return {
            ...offer,
            collateralBalance: newCollateralBalance,
            soldTokenAmount: newSoldTokenAmount,
          };
        }
        return offer;
      });
      setOffers(newOffers);
      setSoldTokenIn("0");
      // Update sold token balance and allowance
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
            new Decimal(soldTokenInWei).lte(0)
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
        disabled={new Decimal(soldTokenInWei).lte(0) || returnTokensIsPending}
        loading={returnTokensIsPending}
        onClickAction={executeReturnTokensTransaction}
        errorMessage={txError}
      >
        RETURN {soldToken.symbol}
      </TransactionButton>
    );
  };

  return (
    <Modal
      visible={visible}
      title={`Get back ${collateralToken.symbol} by returning ${soldToken.symbol}`}
      onClose={onClose}
    >
      <div className="flex flex-col gap-4 items-center">
        <label className="block text-sm font-medium">
          {soldToken.symbol} to return
        </label>
        <RangeSlider
          value={Number(soldTokenIn)}
          onChange={handleSoldTokenInChange}
          tokenSymbol={soldToken.symbol}
          min={0}
          max={Number(userMaxSoldTokenIn)}
          step={step}
          displayTooltip={(value) => `${value} ${soldToken.symbol}`}
        />
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
        <p>
          {collateralOut} {collateralToken.symbol}
        </p>
        {transactionButton()}
      </div>
    </Modal>
  );
};

export default ReturnModal;
