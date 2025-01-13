"use client";

import { useState, useEffect, useMemo } from "react";
import {
  calculateExchangeRate,
  convertQuantityFromWei,
  convertQuantityToWei,
  getCollateralForOneSoldToken,
  getTokenDetails,
} from "@/utils/utilFunc";
import CONSTANTS from "@/utils/constants";
import ERC20Token from "../types/ERC20Token";
import TokensDropdown from "@/components/TokensDropdown";
import TokenAmountField from "@/components/TokenAmountField";
import Decimal from "decimal.js";

const Sell = () => {
  const [tokensList, setTokensList] = useState<ERC20Token[]>([]);
  const [soldToken, setSoldToken] = useState<ERC20Token | null>(null);
  const [collateralToken, setCollateralToken] = useState<ERC20Token | null>(
    null
  );
  const [soldTokenAmount, setSoldTokenAmount] = useState("");
  const [collateralAmount, setCollateralAmount] = useState("");
  const [userFee, setUserFee] = useState(0); // fee in basis points
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { WETH, WBTC, USDC } = CONSTANTS.TOKEN_ADDRESSES[11155111];

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
    return new Decimal(formattedCollateralAmount).div(formattedSoldTokenAmount).toString();
  }, [formattedCollateralAmount, formattedSoldTokenAmount]);

  useEffect(() => {
    const getAndSetTokensList = async () => {
      const tokenDetails = await getTokenDetails([WETH, WBTC, USDC], 11155111);
      console.log(`tokenDetails:`, tokenDetails);
      setTokensList(tokenDetails);
      setSoldToken(tokenDetails[0]);
      setCollateralToken(tokenDetails[1]);
    };
    getAndSetTokensList();
  }, []);

  const handleCreateOffer = async () => {};

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create an Offer</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Sold Token Amount</label>
          <TokenAmountField
            amount={soldTokenAmount}
            onChangeAmount={(amount) => setSoldTokenAmount(amount)}
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
            value={userFee}
            onChange={(e) => setUserFee(Number(e.target.value))}
            className="range"
          />
          <div className="text-sm text-gray-500">{userFee / 100}%</div>
        </div>

        {/* Dates */}
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input input-bordered w-full"
          />
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
