import ERC20Token from "@/app/types/ERC20Token";
import { getConfig } from "@/wagmi";
import Decimal from "decimal.js";
import { ethers } from "ethers";
import { erc20Abi } from "viem";
import { readContracts } from "wagmi/actions";

/**
 * Converts a Date object to a Unix timestamp in seconds.
 *
 * @param date - The Date object to convert.
 * @returns The Unix timestamp in seconds.
 */
export const getTimestampSecondsFromDate = (date: Date | null): number => {
  if (date === null) {
    return 0;
  }
  return Math.floor(date.getTime() / 1000);
};

/**
 * Retrieves the current Unix timestamp in seconds.
 *
 * @returns The current timestamp in seconds.
 */
export const getCurrentTimestampSeconds = (): number => {
  return getTimestampSecondsFromDate(new Date());
};

/**
 * Shortens an Ethereum address for display purposes.
 *
 * @param address - The Ethereum address to shorten.
 * @returns The shortened address or an empty string if invalid.
 */
export const addressShorten = (address: string): string => {
  if (!ethers.isAddress(address)) return "";
  return `${address.slice(0, 6)}...${address.slice(address.length - 4)}`;
};

/**
 * Converts a quantity string to its equivalent in wei, based on the specified decimals.
 *
 * @param quantity - The input quantity as a string. Defaults to "0".
 * @param decimals - The number of decimals for conversion. Defaults to 18.
 * @returns The quantity converted to wei as a string.
 */
export const convertQuantityToWei = (
  quantity: string | number = "0",
  decimals: number = 18
): string => {
  try {
    if (!quantity || (typeof quantity === "string" && quantity.trim() === ""))
      return "0";

    const usedQuantity = new Decimal(quantity).toFixed(decimals);
    if (new Decimal(usedQuantity).lte(0)) return "0";

    return ethers.parseUnits(usedQuantity, decimals).toString();
  } catch (error) {
    console.error("convertQuantityToWei ERROR:", error);
    return "0";
  }
};

/**
 * Converts a quantity string from wei to its equivalent value, based on the specified decimals.
 *
 * @param quantity - The input quantity in wei as a string. Defaults to "0".
 * @param decimals - The number of decimals for conversion. Defaults to 18.
 * @returns The quantity converted from wei as a string.
 */
export const convertQuantityFromWei = (
  quantity: string | number = "0",
  decimals: number = 18
): string => {
  try {
    const usedQuantity = new Decimal(quantity).toFixed(0);
    if (new Decimal(usedQuantity).lt(1)) return "0";

    return ethers.formatUnits(usedQuantity, decimals);
  } catch (error) {
    console.error("convertQuantityFromWei ERROR:", error);
    return "0";
  }
};

/**
 * Calculates the exchange rate for the Riskophobe Protocol.
 * @param soldTokenAmount - The amount of sold tokens.
 * @param collateralTokenAmount - The amount of collateral tokens.
 * @returns The calculated exchange rate.
 */
export const calculateExchangeRate = (
  soldTokenAmount: number | string,
  collateralTokenAmount: number | string
): string => {
  try {
    const exchangeRate = new Decimal(soldTokenAmount)
      .mul(10 ** 18)
      .div(collateralTokenAmount);
    return exchangeRate.toFixed(0);
  } catch (e) {
    return "0";
  }
};

/**
 * Calculates the amount of collateral required for one unit of the sold token, considering token decimals.
 *
 * @param exchangeRate - The exchange rate as a string.
 * @param soldTokenDecimals - The decimals for the sold token.
 * @param collateralTokenDecimals - The decimals for the collateral token.
 * @returns The calculated collateral per one sold token as a string.
 */
export const calculateCollateralPerOneSoldToken = (
  exchangeRate: number,
  soldTokenDecimals: number,
  collateralTokenDecimals: number
): string => {
  try {
    // Ensure the exchange rate is valid and greater than zero
    const exchangeRateDecimal = new Decimal(exchangeRate);
    if (exchangeRateDecimal.lte(0)) {
      throw new Error("Exchange rate must be greater than zero.");
    }

    const result = new Decimal(10)
      .pow(soldTokenDecimals)
      .mul(new Decimal(10).pow(18))
      .div(exchangeRateDecimal)
      .div(new Decimal(10).pow(collateralTokenDecimals));

    return result.toString();
  } catch (error) {
    console.error("calculateCollateralPerOneSoldToken ERROR:", error);
    return "0";
  }
};

/**
 * Calculates the amount of sold tokens needed for a given collateral amount based on the exchange rate
 *
 * @param exchangeRate - The exchange rate as a number.
 * @param collateralAmount - The collateral amount as a number or string in wei.
 * @returns The calculated amount of sold tokens as a string in wei.
 */
export const calculateSoldTokenForCollateral = (
  exchangeRate: number,
  collateralAmount: number | string
): string => {
  try {
    // Validate exchange rate
    const exchangeRateDecimal = new Decimal(exchangeRate);
    if (exchangeRateDecimal.lte(0)) {
      throw new Error("Exchange rate must be greater than zero.");
    }

    // Perform the calculation
    const result = exchangeRateDecimal
      .mul(collateralAmount)
      .div(new Decimal(10).pow(18));
    return result.toFixed(0);
  } catch (error) {
    console.error("calculateSoldTokenForCollateral ERROR:", error);
    return "0";
  }
};

/**
 * Calculates the collateral amount required for a given sold token amount based on the exchange rate.
 *
 * @param exchangeRate - The exchange rate as a number.
 * @param soldTokenAmount - The sold token amount as a number or string in wei.
 * @returns The calculated collateral amount as a string in wei.
 */
export const calculateCollateralForSoldToken = (
  exchangeRate: number,
  soldTokenAmount: number | string
): string => {
  try {
    // Validate exchange rate
    const exchangeRateDecimal = new Decimal(exchangeRate);
    if (exchangeRateDecimal.lte(0)) {
      throw new Error("Exchange rate must be greater than zero.");
    }

    // Parse sold token amount
    const soldTokenAmountDecimal = new Decimal(soldTokenAmount);

    // Perform the calculation
    const result = soldTokenAmountDecimal
      .div(exchangeRateDecimal)
      .mul(new Decimal(10).pow(18));

    return result.toFixed(0);
  } catch (error) {
    console.error("calculateCollateralForSoldToken ERROR:", error);
    return "0";
  }
};

/**
 * Abbreviates a numeric amount with a prefix, suffix, and optional decimals.
 *
 * @param amount - The numeric amount to abbreviate.
 * @param prefix - An optional prefix to prepend to the result. Defaults to an empty string.
 * @param decimals - The number of decimal places to round to. Defaults to 0.
 * @returns A formatted and abbreviated amount as a string.
 */
export const abbreviateAmount = (
  amount: string | number,
  prefix: string = "",
  decimals: number = 0
): string => {
  const bnAmount = new Decimal(amount ?? 0);

  if (bnAmount.eq(0)) return `${prefix}0`; // Equal to 0

  const smallerThanLimit = new Decimal(1).div(10 ** decimals).toString();
  const isNegative = bnAmount.lt(0);

  // Handle cases where the value is smaller than the limit
  if (bnAmount.lt(smallerThanLimit) && !isNegative) {
    return `<${prefix}${smallerThanLimit}`;
  }
  if (bnAmount.abs().lt(smallerThanLimit) && isNegative) {
    return `-${prefix}${smallerThanLimit}`;
  }

  const bnAmountAbs = bnAmount.abs();
  let exponent = 0;
  let suffix = "";

  // Determine the appropriate abbreviation suffix and exponent
  if (bnAmountAbs.gte(10 ** 15)) {
    exponent = 15;
    suffix = "Q"; // Quadrillion
  } else if (bnAmountAbs.gte(10 ** 12)) {
    exponent = 12;
    suffix = "T"; // Trillion
  } else if (bnAmountAbs.gte(10 ** 9)) {
    exponent = 9;
    suffix = "B"; // Billion
  } else if (bnAmountAbs.gte(10 ** 6)) {
    exponent = 6;
    suffix = "M"; // Million
  } else if (bnAmountAbs.gte(10 ** 3)) {
    exponent = 3;
    suffix = "k"; // Thousand
  }

  // Calculate the value and round it to the specified number of decimals
  const value = bnAmountAbs.div(10 ** exponent).toFixed(decimals);

  return `${isNegative ? "-" : ""}${prefix}${value}${suffix}`;
};

/**
 * Formats a date into a human-readable string with optional time display.
 *
 * @param date - The date object to format.
 * @param showTime - Whether to include the time in the formatted string. Defaults to true.
 * @returns A formatted date string.
 */
export const getFormattedDate = (
  date: Date,
  showTime: boolean = true
): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  };

  const dateString = date.toLocaleDateString(undefined, options);
  const timeString = showTime
    ? `, ${date.toLocaleTimeString(undefined, { hour12: false })}`
    : "";

  return `${dateString}${timeString}`;
};

/**
 * Formats a date from a Unix timestamp (in seconds) into a human-readable string with optional time display.
 *
 * @param ts - The Unix timestamp in seconds.
 * @param showTime - Whether to include the time in the formatted string. Defaults to false.
 * @returns A formatted date string.
 */
export const getFormattedDateFromSecondsTimestamp = (
  ts: number,
  showTime: boolean = false
): string => {
  const date = new Date(ts * 1000);
  return getFormattedDate(date, showTime);
};

/**
 * Compares two Ethereum addresses for equality after validating and normalizing them.
 *
 * @param address1 - The first Ethereum address to compare.
 * @param address2 - The second Ethereum address to compare.
 * @returns A boolean indicating whether the two addresses are equivalent.
 */
export const compareEthereumAddresses = (
  address1: string,
  address2: string
): boolean => {
  try {
    // Validate and normalize the addresses
    const normalizedAddress1 = ethers.isAddress(address1)
      ? ethers.getAddress(address1)
      : null;
    const normalizedAddress2 = ethers.isAddress(address2)
      ? ethers.getAddress(address2)
      : null;

    // Return false if either address is invalid
    if (!normalizedAddress1 || !normalizedAddress2) {
      return false;
    }

    // Compare the normalized addresses
    return normalizedAddress1 === normalizedAddress2;
  } catch (error) {
    console.error("compareEthereumAddresses ERROR:", error);
    return false;
  }
};
