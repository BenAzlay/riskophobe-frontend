import ERC20Token from "@/app/types/ERC20Token";
import { getConfig } from "@/wagmi";
import { ethers } from "ethers";
import { erc20Abi, zeroAddress } from "viem";
import { readContract, readContracts } from "wagmi/actions";
import { Token } from "./queries";
import { abi as priceFeedAbi } from "@/abi/aggregatorV3InterfaceAbi";
import CONSTANTS from "./constants";
import { compareEthereumAddresses } from "./utilFunc";

const calculatePriceFromFeedResult = (
  priceFeedResult: number | null,
  priceFeedDecimals: number | null
): number => {
  return priceFeedResult && priceFeedDecimals
    ? Number(priceFeedResult) / 10 ** priceFeedDecimals
    : 0;
};

/**
 * Fetches token details (symbol, decimals, and logo) for the provided token addresses.
 *
 * @param tokenAddresses - Array of tokens ERC20 addresses.
 * @returns A promise resolving to an array of ERC20Token objects.
 */
export const getTokenDetails = async (
  tokenAddresses: string[]
): Promise<ERC20Token[]> => {
  try {
    // Filter out invalid addresses and remove doubles
    const uniqueAddresses = Array.from(new Set(tokenAddresses)).filter(
      (address) => !!ethers.isAddress(address)
    );

    const contracts = uniqueAddresses.flatMap((address) => {
      // If address of Chainlink price feed is in constant, use it
      const priceFeedAddress =
        CONSTANTS.TOKENS.find((token) =>
          compareEthereumAddresses(token.address, address)
        )?.priceFeedAddress ?? zeroAddress;
      return [
        {
          address: address as `0x${string}`,
          abi: erc20Abi,
          chainId: 8453,
          functionName: "symbol",
        },
        {
          address: address as `0x${string}`,
          abi: erc20Abi,
          chainId: 8453,
          functionName: "decimals",
        },
        {
          address: priceFeedAddress as `0x${string}`,
          abi: priceFeedAbi,
          chainId: 8453,
          functionName: "latestAnswer",
        },
        {
          address: priceFeedAddress as `0x${string}`,
          abi: priceFeedAbi,
          chainId: 8453,
          functionName: "decimals",
        },
      ];
    });

    const config = getConfig();

    const rawResults = await readContracts(config, { contracts });

    const results = rawResults.map(({ result }) => result);

    return uniqueAddresses.map((address, index) => {
      const baseIndex = index * 4; // Each token has 4 calls: symbol, decimals, latestAnswer, feed decimals

      const symbol: string = results[baseIndex] as string;
      const decimals: number = results[baseIndex + 1] as number;
      const priceFeedResult = results[baseIndex + 2] as number | null;
      const priceFeedDecimals = results[baseIndex + 3] as number | null;

      const price = calculatePriceFromFeedResult(
        priceFeedResult,
        priceFeedDecimals
      );

      const logo: string = `/tokenLogos/${symbol}.png`;

      return {
        address,
        symbol,
        decimals,
        logo,
        price,
      };
    });
  } catch (error) {
    console.error("getTokenDetails ERROR:", error);
    throw new Error("getTokenDetails FAILED");
  }
};

export const getTokenBalance = async (
  tokenAddress: string | undefined,
  userAddress: string | undefined
): Promise<string> => {
  try {
    if (!ethers.isAddress(userAddress)) {
      throw new Error("Invalid user address");
    }

    if (!ethers.isAddress(tokenAddress)) {
      throw new Error("Invalid ERC20 token address");
    }

    const config = getConfig();

    const result = await readContract(config, {
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      chainId: 8453,
      functionName: "balanceOf",
      args: [userAddress as `0x${string}`],
    });

    return String(result);
  } catch (error) {
    console.error("getTokenDetails ERROR:", error);
    return "0";
  }
};

export const getTokenAllowance = async (
  tokenAddress: string | undefined,
  userAddress: string | undefined,
  contractAddress: string | undefined
): Promise<string> => {
  try {
    if (!ethers.isAddress(userAddress)) {
      throw new Error("Invalid user address");
    }

    if (!ethers.isAddress(tokenAddress)) {
      throw new Error("Invalid ERC20 token address");
    }

    if (!ethers.isAddress(contractAddress)) {
      throw new Error("Invalid contract address");
    }

    const config = getConfig();

    const result = await readContract(config, {
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      chainId: 8453,
      functionName: "allowance",
      args: [userAddress as `0x${string}`, contractAddress as `0x${string}`],
    });

    return String(result);
  } catch (error) {
    console.error("getTokenAllowance ERROR:", error);
    return "0";
  }
};

export const convertSubgraphToken = (token: Token): ERC20Token => {
  const logo: string = `/tokenLogos/${token.symbol}.png`;
  return {
    ...token,
    address: token.id,
    logo,
  };
};
