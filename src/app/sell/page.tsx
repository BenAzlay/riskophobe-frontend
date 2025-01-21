"use client";

import { useState, useEffect, useMemo } from "react";
import {
  calculateCollateralPerOneSoldToken,
  calculateExchangeRate,
  convertQuantityFromWei,
  convertQuantityToWei,
  getTimestampSecondsFromDate,
} from "@/utils/utilFunc";
import CONSTANTS from "@/utils/constants";
import ERC20Token from "../types/ERC20Token";
import TokensDropdown from "@/components/TokensDropdown";
import TokenAmountField from "@/components/TokenAmountField";
import Decimal from "decimal.js";
import DateField from "@/components/DateField";
import { simulateContract } from "wagmi/actions";
import { abi as RiskophobeProtocolAbi } from "@/abi/RiskophobeProtocolAbi";
import { erc20Abi, zeroAddress } from "viem";
import { getConfig } from "@/wagmi";
import {
  useAccount,
  useConnect,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import {
  getTokenAllowance,
  getTokenBalance,
  getTokenDetails,
} from "@/utils/tokenMethods";
import { useAsyncEffect, useCurrentTimestamp } from "@/utils/customHooks";
import { ethers } from "ethers";
import SignInButton from "@/components/SignInButton";
import TransactionButton from "@/components/TransactionButton";
import { base } from "viem/chains";
import SwitchChainButton from "@/components/SwitchChainButton";

const currentDate = new Date();
const oneMonthFromNow: Date = new Date(
  new Date().setMonth(new Date().getMonth() + 3)
);

const Sell = () => {
  const config = getConfig();

  const { connectors } = useConnect();
  const {
    data: createOfferHash,
    isPending: createOfferIsPending,
    writeContract: writeCreateOffer,
  } = useWriteContract();
  const { isLoading: createOfferIsConfirming, isSuccess: createOfferSuccess } =
    useWaitForTransactionReceipt({
      hash: createOfferHash,
    });
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

  const { address: connectedAddress, chainId: connectedChainId } = useAccount();

  const currentTs = useCurrentTimestamp();

  const [soldTokenBalance, setSoldTokenBalance] = useState<string>("0");
  const [soldTokenAllowance, setSoldTokenAllowance] = useState<string>("0");

  const [tokensList, setTokensList] = useState<ERC20Token[]>([]);
  const [soldToken, setSoldToken] = useState<ERC20Token | null>(null);
  const [collateralToken, setCollateralToken] = useState<ERC20Token | null>(
    null
  );
  const [soldTokenAmount, setSoldTokenAmount] = useState<string>("");
  const [collateralAmount, setCollateralAmount] = useState<string>("");
  const [creatorFee, setCreatorFee] = useState<number>(0); // fee in basis points
  const [startDate, setStartDate] = useState<Date | null>(currentDate);
  const [endDate, setEndDate] = useState<Date | null>(oneMonthFromNow);

  const soldTokenAmountWei = useMemo(
    () => convertQuantityToWei(soldTokenAmount, soldToken?.decimals ?? 18),
    [soldTokenAmount, soldToken?.decimals]
  );
  const collateralAmountWei = useMemo(
    () =>
      convertQuantityToWei(collateralAmount, collateralToken?.decimals ?? 18),
    [collateralAmount, collateralToken?.decimals]
  );

  const formattedSoldTokenAmount = useMemo(
    () => convertQuantityFromWei(soldTokenAmountWei, soldToken?.decimals ?? 18),
    [soldTokenAmountWei, soldToken?.decimals]
  );
  const formattedCollateralAmount = useMemo(
    () =>
      convertQuantityFromWei(
        collateralAmountWei,
        collateralToken?.decimals ?? 18
      ),
    [collateralAmountWei, collateralToken?.decimals]
  );

  const exchangeRate = useMemo(
    () => calculateExchangeRate(soldTokenAmountWei, collateralAmountWei),
    [soldTokenAmountWei, collateralAmountWei]
  );

  const collateralPerSoldToken = useMemo(
    () =>
      calculateCollateralPerOneSoldToken(
        Number(exchangeRate),
        soldToken?.decimals ?? 18,
        collateralToken?.decimals ?? 18
      ),
    [exchangeRate, soldToken?.decimals, collateralToken?.decimals]
  );

  const hasEnoughSoldTokenAllowance = useMemo(() => {
    if (new Decimal(soldTokenAmountWei).lte(0))
      return new Decimal(soldTokenAllowance).gt(0);
    return new Decimal(soldTokenAllowance).gte(soldTokenAmountWei);
  }, [soldTokenAmountWei, soldTokenAllowance]);

  const hasEnoughSoldTokenBalance = useMemo(() => {
    if (new Decimal(soldTokenAmountWei).lte(0))
      return new Decimal(soldTokenBalance).gt(0);
    return new Decimal(soldTokenBalance).gte(soldTokenAmountWei);
  }, [soldTokenAmountWei, soldTokenBalance]);

  const formattedSoldTokenBalance = useMemo(
    () => convertQuantityFromWei(soldTokenBalance, soldToken?.decimals ?? 18),
    [soldTokenBalance, soldToken?.decimals]
  );

  useEffect(() => {
    const getAndSetTokensList = async () => {
      const tokenDetails = await getTokenDetails(CONSTANTS.TOKENS);
      console.log(`tokenDetails:`, tokenDetails)
      setTokensList(tokenDetails);
      setSoldToken(tokenDetails[0]);
      setCollateralToken(tokenDetails[1]);
    };
    getAndSetTokensList();
  }, [CONSTANTS.TOKENS]);

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

  const onChangeStartDate = (_startDate: Date | null) => {
    setStartDate(_startDate);
  };

  const onChangeEndDate = (_endDate: Date | null) => {
    setEndDate(_endDate);
  };

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
      const soldTokenAddress: string = soldToken?.address ?? zeroAddress;

      const { request } = await simulateContract(config, {
        abi: erc20Abi,
        address: soldTokenAddress as `0x${string}`,
        functionName: "approve",
        args: [
          CONSTANTS.RISKOPHOBE_CONTRACT as `0x${string}`,
          BigInt(soldTokenAmountWei),
        ],
        connector: connectors[0],
      });
      console.log(`handleCreateOffer request:`, request);
      writeApprove(request);
    } catch (e) {
      console.error("handleApprove ERROR", e);
    }
  };

  // useEffect to handle createOffer transaction success
  useEffect(() => {
    const fetchBalanceAndAllowance = async () => {
      try {
        const payload = await soldTokenBalanceAndAllowanceGetter();
        soldTokenBalanceAndAllowanceSetter(payload);
      } catch (error) {
        console.error("Error fetching balance", error);
      }
    };

    if (createOfferSuccess) {
      console.log("createOffer successful!");
      fetchBalanceAndAllowance();
      setSoldTokenAmount("");
      setCollateralAmount("");
    }
  }, [createOfferSuccess]);

  const handleCreateOffer = async () => {
    try {
      const collateralTokenAddress: string =
        collateralToken?.address ?? zeroAddress;
      const soldTokenAddress: string = soldToken?.address ?? zeroAddress;

      let startDateTs: number = getTimestampSecondsFromDate(startDate);
      // Make sure start date is at least 5 minutes in the future to account for tx time
      if (currentTs >= startDateTs - 300) startDateTs += 300;
      const endDateTs: number = getTimestampSecondsFromDate(endDate);

      const { request } = await simulateContract(config, {
        abi: RiskophobeProtocolAbi,
        address: CONSTANTS.RISKOPHOBE_CONTRACT as `0x${string}`,
        functionName: "createOffer",
        args: [
          collateralTokenAddress as `0x${string}`,
          soldTokenAddress as `0x${string}`,
          BigInt(soldTokenAmountWei),
          BigInt(exchangeRate),
          creatorFee,
          startDateTs,
          endDateTs,
        ],
        connector: connectors[0],
      });
      console.log(`handleCreateOffer request:`, request);
      writeCreateOffer(request);
    } catch (e) {
      console.error("handleCreateOffer ERROR", e);
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
            !hasEnoughSoldTokenAllowance ||
            new Decimal(soldTokenAmountWei).lte(0)
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
          new Decimal(soldTokenAmountWei).lte(0) ||
          new Decimal(collateralAmountWei).lte(0) ||
          !hasEnoughSoldTokenAllowance ||
          !hasEnoughSoldTokenBalance ||
          createOfferIsConfirming ||
          createOfferIsPending
        }
        onClickAction={handleCreateOffer}
        loading={createOfferIsConfirming || createOfferIsPending}
      >
        CREATE OFFER
      </TransactionButton>
    );
  };

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold mb-4">Create an Offer</h1>
      <form className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium">Sold Token Amount</label>
          <TokenAmountField
            amount={soldTokenAmount}
            onChangeAmount={(amount) => setSoldTokenAmount(amount)}
            showTokenBalance={true}
            tokenBalance={formattedSoldTokenBalance}
            placeholder="Amount to sell"
            tokenPrice={soldToken?.price ?? 0}
            tokenComponent={
              <TokensDropdown
                tokens={tokensList}
                selectedToken={soldToken}
                onSelectToken={(token) => setSoldToken(token)}
              />
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Collateral Amount</label>
          <TokenAmountField
            amount={collateralAmount}
            onChangeAmount={(amount) => setCollateralAmount(amount)}
            showTokenBalance={false}
            placeholder="Collateral amount"
            tokenPrice={collateralToken?.price ?? 0}
            tokenComponent={
              <TokensDropdown
                tokens={tokensList}
                selectedToken={collateralToken}
                onSelectToken={(token) => setCollateralToken(token)}
              />
            }
          />
        </div>

        <p>Exchange rate: {exchangeRate}</p>
        <p>
          {collateralToken?.symbol} per 1 {soldToken?.symbol}:{" "}
          {collateralPerSoldToken}
        </p>

        {/* User Fee */}
        <div>
          <label className="block text-sm font-medium">
            User Fee (Basis Points)
          </label>
          <input
            type="range"
            min={0}
            max={1000}
            value={creatorFee}
            onChange={(e) => setCreatorFee(Number(e.target.value))}
            className="range"
          />
          <div className="text-sm text-gray-500">{creatorFee / 100}%</div>
        </div>
        {/* Dates */}
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <DateField
            selectedDate={startDate}
            onSelectDate={onChangeStartDate}
            minDate={new Date()}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <DateField
            selectedDate={endDate}
            onSelectDate={onChangeEndDate}
            minDate={startDate ?? new Date()}
          />
        </div>

        {/* Submit */}
        {transactionButton()}
      </form>
    </div>
  );
};

export default Sell;
