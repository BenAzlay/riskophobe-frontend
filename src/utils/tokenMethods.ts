import ERC20Token from "@/app/types/ERC20Token";
import { getConfig } from "@/wagmi";
import { ethers } from "ethers";
import { erc20Abi } from "viem";
import { readContract, readContracts } from "wagmi/actions";

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

export const getTokenBalance = async (
  tokenAddress: string | undefined,
  userAddress: string | undefined,
  networkId: 1 | 11155111 | undefined
): Promise<string> => {
  try {
    if (!networkId) {
      throw new Error("Network ID must be specified.");
    }

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
      chainId: networkId,
      functionName: "balanceOf",
      args: [userAddress as `0x${string}`],
    });

    return String(result);
  } catch (error) {
    console.error("getTokenDetails ERROR:", error);
    return "0";
  }
};
