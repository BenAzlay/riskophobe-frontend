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
import {
  useWaitForTransactionReceipt,
  useWriteContract
} from "wagmi";
import { getTokenAllowance, getTokenBalance } from "@/utils/tokenMethods";
import CONSTANTS from "@/utils/constants";
import { useAsyncEffect } from "@/utils/customHooks";
import Decimal from "decimal.js";
import RangeSlider from "./RangeSlider";
import TransactionButton from "./TransactionButton";
import { getAccount, simulateContract } from "wagmi/actions";
import { abi as RiskophobeProtocolAbi } from "@/abi/RiskophobeProtocolAbi";
import SignInButton from "./SignInButton";
import { erc20Abi } from "viem";
import { Deposit } from "@/utils/queries";
import useStore from "@/store/useStore";
import SwitchChainButton from "./SwitchChainButton";
import { base } from "viem/chains";
import { config } from "@/wagmiConfig";

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

  const {
    connector,
    address: connectedAddress,
    chainId: connectedChainId,
  } = getAccount(config);

  const { offers, setOffers } = useStore();

  const [soldTokenIn, setSoldTokenIn] = useState<string>("0");
  const [soldTokenBalance, setSoldTokenBalance] = useState<string>("0");
  const [soldTokenAllowance, setSoldTokenAllowance] = useState<string>("0");

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
      new Decimal(soldTokenBought).gt(soldTokenBalance) &&
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
    [userMaxSoldTokenIn]
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

  // Approve TX hooks
  const {
    data: approveHash,
    isPending: approveIsPending,
    writeContract: writeApprove,
    error: approveError,
  } = useWriteContract();
  const { isLoading: approveIsConfirming, isSuccess: approveSuccess } =
    useWaitForTransactionReceipt({
      hash: approveHash,
    });

  // useEffect to handle approve transaction success
  useEffect(() => {
    const fetchAllowance = async () => {
      try {
        const _allowance = await getSoldTokenAllowance();
        setSoldTokenAllowance(_allowance);
      } catch (error) {
        console.error("Error fetching allowance", error);
      }
    };

    if (approveSuccess) {
      console.log("Transaction approved successfully!");
      fetchAllowance();
    }
  }, [approveSuccess]);

  const handleApprove = async () => {
    try {
      const { request } = await simulateContract(config, {
        abi: erc20Abi,
        address: soldToken.address as `0x${string}`,
        functionName: "approve",
        args: [
          CONSTANTS.RISKOPHOBE_CONTRACT as `0x${string}`,
          BigInt(soldTokenInWei),
        ],
        connector: connector,
      });
      writeApprove(request);
    } catch (e) {
      console.error("handleApprove ERROR", e);
    }
  };

  // returnTokens TX hooks
  const {
    data: returnTokensHash,
    isPending: returnTokensIsPending,
    writeContract: writeReturnTokens,
  } = useWriteContract();
  const {
    isLoading: returnTokensIsConfirming,
    isSuccess: returnTokensSuccess,
  } = useWaitForTransactionReceipt({
    hash: returnTokensHash,
  });

  // useEffect to handle returnTokens transaction success
  useEffect(() => {
    const handleSuccess = async () => {
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
    };
    if (returnTokensSuccess) {
      handleSuccess();
    }
  }, [returnTokensSuccess]);

  const handleReturnTokens = async () => {
    try {
      console.log(`handleReturnTokens collateralOutWei:`, collateralOutWei);
      console.log(`handleReturnTokens collateralBalance:`, collateralBalance);

      const { request } = await simulateContract(config, {
        abi: RiskophobeProtocolAbi,
        address: CONSTANTS.RISKOPHOBE_CONTRACT as `0x${string}`,
        functionName: "returnTokens",
        args: [BigInt(offerId), BigInt(collateralOutWei)],
        connector: connector,
      });
      console.log(`handleReturnTokens request:`, request);
      writeReturnTokens(request);
    } catch (e) {
      console.error("handleReturnTokens ERROR", e);
    }
  };

  const transactionButton = () => {
    if (!connectedAddress) return <SignInButton />;
    if (connectedChainId !== base.id) return <SwitchChainButton />;
    if (!hasEnoughSoldTokenAllowance)
      return (
        <TransactionButton
          disabled={
            approveIsPending ||
            approveIsConfirming ||
            !!hasEnoughSoldTokenAllowance ||
            new Decimal(soldTokenInWei).lte(0)
          }
          loading={approveIsPending || approveIsConfirming}
          onClickAction={handleApprove}
        >
          APPROVE {soldToken?.symbol}
        </TransactionButton>
      );
    return (
      <TransactionButton
        disabled={
          new Decimal(soldTokenInWei).lte(0) ||
          returnTokensIsConfirming ||
          returnTokensIsPending
        }
        loading={returnTokensIsConfirming || returnTokensIsPending}
        onClickAction={handleReturnTokens}
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
