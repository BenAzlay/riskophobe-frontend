"use client";

import { useState, useEffect, useMemo, Fragment, useRef } from "react";
import {
  abbreviateAmount,
  calculateCollateralPerOneSoldToken,
  calculateExchangeRate,
  convertQuantityFromWei,
  convertQuantityToWei,
  getTimestampSecondsFromDate,
  numberWithCommas,
} from "@/utils/utilFunc";
import CONSTANTS from "@/utils/constants";
import ERC20Token from "../types/ERC20Token";
import TokensDropdown from "@/components/TokensDropdown";
import TokenAmountField from "@/components/TokenAmountField";
import Decimal from "decimal.js";
import { abi as RiskophobeProtocolAbi } from "@/abi/RiskophobeProtocolAbi";
import { erc20Abi, zeroAddress } from "viem";
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
import RangeSlider from "@/components/RangeSlider";
import dynamic from "next/dynamic";
import DateRangePicker from "@/components/DateRangePicker";
import Tooltip from "@/components/Tooltip";
import useContractTransaction from "@/utils/useContractTransaction";
import { useAccount } from "wagmi";

const ClientOnlyDate = dynamic(() => import("@/components/ClientOnlyDate"), {
  ssr: false,
});

const currentDate = new Date();
const oneMonthFromNow: Date = new Date(
  new Date().setMonth(new Date().getMonth() + 3)
);

const Sell = () => {
  const { address: connectedAddress, chainId: connectedChainId } = useAccount();

  const currentTs = useCurrentTimestamp();

  const soldTokenBalanceIsLoaded = useRef(false);

  const [soldTokenBalance, setSoldTokenBalance] = useState<string>("0");
  const [soldTokenAllowance, setSoldTokenAllowance] = useState<string>("0");

  const [tokensList, setTokensList] = useState<ERC20Token[]>([]);
  const [soldToken, setSoldToken] = useState<ERC20Token | null>(null);
  const [collateralToken, setCollateralToken] = useState<ERC20Token | null>(
    null
  );
  const [soldTokenAmount, setSoldTokenAmount] = useState<string>("");
  const [collateralAmount, setCollateralAmount] = useState<string>("");
  const [creatorFee, setCreatorFee] = useState<number>(2.5);
  const [startDate, setStartDate] = useState<Date>(currentDate);
  const [endDate, setEndDate] = useState<Date>(oneMonthFromNow);
  const [txError, setTxError] = useState<string | null>(null);

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

  const formErrors = useMemo((): string[] => {
    const _errors: string[] = [];
    // Sold token amount exceeds balance
    if (
      ethers.isAddress(connectedAddress) &&
      new Decimal(soldTokenAmountWei).gt(soldTokenBalance)
    ) {
      _errors.push(
        `⚖️ ${soldToken?.symbol ?? "Sold token"} amount exceeds balance.`
      );
    }
    // Start date is after end date
    if (startDate.getTime() > endDate.getTime()) {
      _errors.push(`⏳ Start date cannot be after end date.`);
    }
    return _errors;
  }, [
    soldToken?.symbol,
    startDate,
    endDate,
    soldTokenAmountWei,
    soldTokenBalance,
    connectedAddress,
  ]);

  // Reset txError after 10 seconds
  useEffect(() => {
    if (txError !== null) {
      const timer = setTimeout(() => {
        setTxError(null);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [txError]);

  // APROVE TX HOOK
  const {
    isPending: approveIsPending,
    executeTransaction: executeApproveTransaction,
  } = useContractTransaction({
    abi: erc20Abi,
    contractAddress: soldToken?.address ?? zeroAddress,
    functionName: "approve",
    args: [
      CONSTANTS.RISKOPHOBE_CONTRACT as `0x${string}`,
      BigInt(soldTokenAmountWei),
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

  // CREATE OFFER TX HOOK
  const getCreateOfferArgs = () => {
    const collateralTokenAddress = (collateralToken?.address ??
      zeroAddress) as `0x${string}`;
    const soldTokenAddress = (soldToken?.address ??
      zeroAddress) as `0x${string}`;

    let startDateTs: number = getTimestampSecondsFromDate(startDate);
    // Make sure start date is at least 5 minutes in the future to account for tx time
    if (currentTs >= startDateTs - 300) startDateTs += 300;
    const endDateTs: number = getTimestampSecondsFromDate(endDate);

    const creatorFeeBp = Math.floor(creatorFee * 100);

    return [
      collateralTokenAddress,
      soldTokenAddress,
      BigInt(soldTokenAmountWei),
      BigInt(exchangeRate),
      creatorFeeBp,
      startDateTs,
      endDateTs,
    ];
  };
  const {
    isPending: createOfferIsPending,
    executeTransaction: executeCreateOfferTransaction,
  } = useContractTransaction({
    abi: RiskophobeProtocolAbi,
    contractAddress: CONSTANTS.RISKOPHOBE_CONTRACT,
    functionName: "createOffer",
    args: getCreateOfferArgs(),
    onSuccess: async () => {
      console.log("Create offer successful");
      setTxError(null);
      try {
        setSoldTokenAmount("");
        setCollateralAmount("");
        const payload = await soldTokenBalanceAndAllowanceGetter();
        soldTokenBalanceAndAllowanceSetter(payload);
      } catch (error) {
        console.error("Error fetching balance", error);
      }
    },
    onError: (errorMessage) => {
      setTxError(errorMessage);
    },
  });

  useEffect(() => {
    const getAndSetTokensList = async () => {
      const tokenDetails = await getTokenDetails(
        CONSTANTS.TOKENS.map(({ address }) => address)
      );
      setTokensList(tokenDetails);
      setSoldToken(tokenDetails[0]);
      setCollateralToken(tokenDetails[1]);
    };
    getAndSetTokensList();
  }, []);

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
    soldTokenBalanceIsLoaded.current = false;
    return await Promise.all([getSoldTokenBalance(), getSoldTokenAllowance()]);
  };
  const soldTokenBalanceAndAllowanceSetter = ([newBalance, newAllowance]: [
    string,
    string,
  ]): void => {
    setSoldTokenBalance(newBalance);
    setSoldTokenAllowance(newAllowance);
    soldTokenBalanceIsLoaded.current = true;
  };
  useAsyncEffect(
    soldTokenBalanceAndAllowanceGetter,
    soldTokenBalanceAndAllowanceSetter,
    [connectedAddress, soldToken?.address]
  );

  const onChangeStartDate = (_startDate: Date | null) => {
    if (!_startDate) return;
    setStartDate(_startDate);
  };

  const onChangeEndDate = (_endDate: Date | null) => {
    if (!_endDate) return;
    setEndDate(_endDate);
  };

  const handleDateChange = (start: Date | null, end: Date | null) => {
    onChangeStartDate(start);
    onChangeEndDate(end);
  };

  const offerSummaryContent = () => (
    <Fragment>
      <p>
        💱 Exchange rate:{" "}
        <Tooltip message={numberWithCommas(collateralPerSoldToken)}>
          {abbreviateAmount(collateralPerSoldToken, "", 3)}
        </Tooltip>{" "}
        {collateralToken?.symbol} per 1 {soldToken?.symbol}
      </p>
      <p>🤑 User fee: {creatorFee}%</p>
      <p>
        🏁 Starts on: <ClientOnlyDate date={startDate} />
      </p>
      <p>
        ⌛ Ends on: <ClientOnlyDate date={endDate} />
      </p>
    </Fragment>
  );

  const offerSummary = () => (
    <div className="collapse  collapse-arrow border-2 border-primary rounded-md bg-[#6B46C120]">
      <input type="checkbox" />
      <div className="collapse-title text-xl font-medium">Offer summary</div>
      <div className="collapse-content">{offerSummaryContent()}</div>
    </div>
  );

  const errorsBox = () => (
    <div className="border-2 border-error rounded-md bg-[#E53E3E20] text-red-300 font-semibold px-2 py-2">
      {formErrors.map((formError, index) => (
        <p key={index}>{formError}</p>
      ))}
    </div>
  );

  const transactionButton = () => {
    if (!connectedAddress) return <SignInButton />;
    if (connectedChainId !== base.id) return <SwitchChainButton />;
    if (!hasEnoughSoldTokenAllowance)
      return (
        <TransactionButton
          disabled={approveIsPending || new Decimal(soldTokenAmountWei).lte(0)}
          loading={approveIsPending}
          onClickAction={executeApproveTransaction}
          errorMessage={txError}
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
          createOfferIsPending ||
          formErrors.length > 0
        }
        onClickAction={executeCreateOfferTransaction}
        loading={createOfferIsPending}
        errorMessage={txError}
      >
        CREATE OFFER
      </TransactionButton>
    );
  };

  return (
    <div className="flex flex-col gap-2 items-center py-6 w-full overflow-hidden">
      <h1 className="text-2xl font-bold mb-4 text-center w-full">
        Create an Offer
      </h1>
      <div
        id="form"
        className="space-y-4 max-w-lg border-2 rounded-md border-primary p-2 sm:p-4 w-full overflow-hidden bg-[#1E1E1EA0]"
      >
        <div className="space-y-2">
          <label className="field-title">What do you want to sell?</label>
          <TokenAmountField
            amount={soldTokenAmount}
            onChangeAmount={(amount) => setSoldTokenAmount(amount)}
            showTokenBalance={true}
            tokenBalance={formattedSoldTokenBalance}
            placeholder="Sold amount"
            tokenPrice={soldToken?.price ?? 0}
            balanceIsLoading={!soldTokenBalanceIsLoaded.current}
            tokenComponent={
              <TokensDropdown
                tokens={tokensList}
                selectedToken={soldToken}
                onSelectToken={(token) => setSoldToken(token)}
              />
            }
          />
        </div>
        <div className="space-y-2">
          <label className="field-title">What should it be sold for?</label>
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

        {/* User Fee */}
        <div className="space-y-2">
          <div>
            <label className="field-title">User Fee (%)</label>
            <div className="field-subtitle">
              You will earn this fee (in collateral token) each time a user buys
              from your offer
            </div>
          </div>
          <RangeSlider
            min={0}
            max={10}
            step={0.01}
            value={creatorFee}
            onChange={(newValue) => setCreatorFee(newValue)}
            displayTooltip={(value) => `${value}%`}
          />
        </div>
        {/* Dates */}
        <div className="space-y-2">
          <label className="field-title">Start/end dates</label>
          <DateRangePicker
            onChange={handleDateChange}
            defaultStartDate={currentDate}
            defaultEndDate={oneMonthFromNow}
          />
        </div>
        {formErrors.length > 0 ? errorsBox() : offerSummary()}
        {/* Submit */}
        {transactionButton()}
      </div>
    </div>
  );
};

export default Sell;
