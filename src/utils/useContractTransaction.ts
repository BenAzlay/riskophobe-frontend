"use client";

import { config } from "@/wagmiConfig";
import { useState, useEffect, useCallback } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { getAccount, simulateContract } from "wagmi/actions";

interface useContractTransactionProps {
  abi: any;
  contractAddress: string;
  functionName: string;
  args: any[];
  onSuccess?: () => Promise<void> | void;
  onError?: (errorMessage: string) => Promise<void> | void;
}

interface useContractTransactionReturn {
  isPending: boolean;
  isSuccess: boolean;
  executeTransaction: () => Promise<void>;
}

const useContractTransaction = ({
  abi,
  contractAddress,
  functionName,
  args,
  onSuccess,
  onError,
}: useContractTransactionProps): useContractTransactionReturn => {
  const [isPending, setIsPending] = useState(false);

  const { connector } = getAccount(config); // Get the connector directly inside the hook

  const { writeContract, data: transactionHash, error } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  const executeTransaction = useCallback(async () => {
    if (!connector) {
      throw new Error("No connector found.");
    }

    setIsPending(true);

    try {
      // Simulate transaction
      const { request } = await simulateContract(config, {
        abi,
        address: contractAddress as `0x${string}`,
        functionName,
        args,
        connector,
      });

      console.log("Simulated transaction request:", request);

      // Execute transaction
      writeContract(request);
    } catch (e: any) {
      console.error("Transaction simulation or execution failed:", e);
      setIsPending(false);
    }
  }, [abi, contractAddress, functionName, args, connector, writeContract]);

  // Handle success
  useEffect(() => {
    if (isSuccess) {
      onSuccess?.();
      setIsPending(false);
    }
  }, [isSuccess]);

  // Handle error
  useEffect(() => {
    if (!!error) {
      onError?.(error?.message.split(`\n`)[0] ?? "Transaction failed");
      setIsPending(false);
    }
  }, [error]);

  return {
    isPending: isPending || isLoading,
    isSuccess,
    executeTransaction,
  };
};

export default useContractTransaction;
