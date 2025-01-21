import ERC20Token from "@/app/types/ERC20Token";
import { getConfig } from "@/wagmi";
import { ethers } from "ethers";
import { erc20Abi } from "viem";
import {
  readContract,
  readContracts
} from "wagmi/actions";
import { Token } from "./queries";
import { abi as priceFeedAbi } from "@/abi/aggregatorV3InterfaceAbi";

interface ListedToken {
  symbol: string;
  address: string;
  priceFeedAddress: string;
}

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
 * @param tokens - Array of tokens from constants.
 * @returns A promise resolving to an array of ERC20Token objects.
 */
export const getTokenDetails = async (
  tokens: ListedToken[]
): Promise<ERC20Token[]> => {
  try {
    if (!tokens.every(({ address }) => ethers.isAddress(address)))
      throw new Error("Invalid addresses");

    const contracts = tokens.flatMap(({ address, priceFeedAddress }) => [
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
    ]);

    const config = getConfig();

    const rawResults = await readContracts(config, { contracts });

    const results = rawResults.map(({ result }) => result);
    console.log(`results:`, results);

    return tokens.map(({ address, symbol }, index) => {
      const baseIndex = index * 3; // Each token has 3 calls: token decimals, latestAnswer, feed decimals

      const decimals: number = results[baseIndex] as number;
      const priceFeedResult = results[baseIndex + 1] as number | null;
      const priceFeedDecimals = results[baseIndex + 2] as number | null;

      const price = calculatePriceFromFeedResult(priceFeedResult, priceFeedDecimals);

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
    return [];
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
