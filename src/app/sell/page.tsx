"use client";

import { useState, useEffect, useMemo } from "react";
import {
  calculateExchangeRate,
  convertQuantityFromWei,
  convertQuantityToWei,
  getCurrentTimestampSeconds,
  getTimestampSecondsFromDate,
} from "@/utils/utilFunc";
import CONSTANTS from "@/utils/constants";
import ERC20Token from "../types/ERC20Token";
import TokensDropdown from "@/components/TokensDropdown";
import TokenAmountField from "@/components/TokenAmountField";
import Decimal from "decimal.js";
import DateField from "@/components/DateField";
import { getAccount, simulateContract } from "wagmi/actions";
import { abi as RiskophobeProtocolAbi } from "@/abi/RiskophobeProtocolAbi";
import { zeroAddress } from "viem";
import { getConfig } from "@/wagmi";
import { useAccount, useConnect, useWriteContract } from "wagmi";
import { getTokenBalance, getTokenDetails } from "@/utils/tokenMethods";
import {
  useAsyncEffect,
  useVisibilityIntervalEffect,
} from "@/utils/customHooks";

const currentDate = new Date();
const oneMonthFromNow: Date = new Date(
  new Date().setMonth(new Date().getMonth() + 3)
);

const Sell = () => {
  const { connectors } = useConnect();
  const { data: hash, isPending, writeContract } = useWriteContract();
  const { address: connectedAddress } = useAccount();

  const [soldTokenBalance, setSoldTokenBalance] = useState<string>("0");

  const [tokensList, setTokensList] = useState<ERC20Token[]>([]);
  const [soldToken, setSoldToken] = useState<ERC20Token | null>(null);
  const [collateralToken, setCollateralToken] = useState<ERC20Token | null>(
    null
  );
  const [soldTokenAmount, setSoldTokenAmount] = useState("");
  const [collateralAmount, setCollateralAmount] = useState("");
  const [creatorFee, setCreatorFee] = useState(0); // fee in basis points
  const [startDate, setStartDate] = useState<Date | null>(currentDate);
  const [endDate, setEndDate] = useState<Date | null>(oneMonthFromNow);

  const { WETH, WBTC, USDC } = CONSTANTS.TOKEN_ADDRESSES;

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

  const collateralPerSoldToken = useMemo(() => {
    return new Decimal(formattedCollateralAmount)
      .div(formattedSoldTokenAmount)
      .toFixed(collateralToken?.decimals ?? 18);
  }, [
    formattedCollateralAmount,
    formattedSoldTokenAmount,
    collateralToken?.decimals,
  ]);

  const formattedSoldTokenBalance = useMemo(() => convertQuantityFromWei(soldTokenBalance, soldToken?.decimals ?? 18), [soldTokenBalance, soldToken?.decimals]);

  useEffect(() => {
    const getAndSetTokensList = async () => {
      const tokenDetails = await getTokenDetails([WETH, USDC, WBTC]);
      console.log(`tokenDetails:`, tokenDetails);
      setTokensList(tokenDetails);
      setSoldToken(tokenDetails[0]);
      setCollateralToken(tokenDetails[1]);
    };
    getAndSetTokensList();
  }, []);

  const soldTokenBalanceGetter = async () => {
    return await getTokenBalance(soldToken?.address, connectedAddress);
  };
  const soldTokenBalanceSetter = (newBalance: string) => {
    setSoldTokenBalance(newBalance);
  }
  useAsyncEffect(soldTokenBalanceGetter, soldTokenBalanceSetter, [connectedAddress, soldToken?.address]);

  const onChangeStartDate = (_startDate: Date | null) => {
    setStartDate(_startDate);
  };

  const onChangeEndDate = (_endDate: Date | null) => {
    setEndDate(_endDate);
  };

  const handleCreateOffer = async () => {
    try {
      const collateralTokenAddress: string =
        collateralToken?.address ?? zeroAddress;
      const soldTokenAddress: string = soldToken?.address ?? zeroAddress;

      let startDateTs: number = getTimestampSecondsFromDate(startDate);
      // Make sure start date is at least 5 minutes in the future to account for tx time
      const currentTs = getCurrentTimestampSeconds();
      if (currentTs >= startDateTs - 300) startDateTs += 300;
      const endDateTs: number = getTimestampSecondsFromDate(endDate);
      console.log(`handleCreateOffer creatorFee:`, creatorFee);
      const config = getConfig();
      const { connector } = getAccount(config);
      console.log(`handleCreateOffer connector:`, connector);
      console.log(`handleCreateOffer connectors:`, connectors);

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
      writeContract(request);
    } catch (e) {
      console.error("handleCreateOffer ERROR", e);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create an Offer</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Sold Token Amount</label>
          <TokenAmountField
            amount={soldTokenAmount}
            onChangeAmount={(amount) => setSoldTokenAmount(amount)}
            showTokenBalance={true}
            tokenBalance={formattedSoldTokenBalance}
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
          />
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <DateField selectedDate={endDate} onSelectDate={onChangeEndDate} />
        </div>

        {/* Submit */}
        <div>
          <button
            type="button"
            onClick={handleCreateOffer}
            className="btn btn-primary w-full"
          >
            Create Offer
          </button>
        </div>
      </form>
    </div>
  );
};

export default Sell;
