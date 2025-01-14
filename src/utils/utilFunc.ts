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
    if (!quantity || (typeof quantity === "string" && quantity.trim() === "")) return "0";

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
 * Fetches token details (symbol, decimals, and logo) for the provided token addresses.
 *
 * @param tokenAddresses - Array of token contract addresses.
 * @param networkId - The network ID (1 for Ethereum mainnet, 11155111 for Sepolia).
 * @returns A promise resolving to an array of ERC20Token objects.
 */
export const getTokenDetails = async (
  tokenAddresses: string[],
  networkId: 1 | 11155111 | undefined
): Promise<ERC20Token[]> => {
  if (!networkId) {
    throw new Error("Network ID must be specified.");
  }

  const wagmiContracts = tokenAddresses.map((address) => ({
    address: address as `0x${string}`,
    abi: erc20Abi,
    chainId: networkId,
  }));

  const symbolCalls = wagmiContracts.map((contract) => ({
    ...contract,
    functionName: "symbol",
  }));

  const decimalsCalls = wagmiContracts.map((contract) => ({
    ...contract,
    functionName: "decimals",
  }));

  const config = getConfig();

  try {
    const rawResults = await readContracts(config, {
      contracts: [...symbolCalls, ...decimalsCalls],
    });

    const results = rawResults.map(({ result }) => result);

    return tokenAddresses.map((address, index, self) => {
      const symbol: string = results[index] as string;
      const decimals: number = results[index + self.length] as number;

      const logo: string = `/tokenLogos/${symbol}.png`;

      return {
        address,
        symbol,
        decimals,
        logo,
      };
    });
  } catch (error) {
    console.error("getTokenDetails ERROR:", error);
    throw new Error("Failed to fetch token details.");
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
  collateralTokenAmount: number | string,
): string => {
  try {
    const exchangeRate = new Decimal(soldTokenAmount).mul(10**18).div(collateralTokenAmount);
    return exchangeRate.toFixed(0);  
  } catch(e) {
    return "0";
  }
};
