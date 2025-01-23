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
}

interface useContractTransactionReturn {
  isPending: boolean;
  isSuccess: boolean;
  error: string | null;
  executeTransaction: () => Promise<void>;
}

const useContractTransaction = ({
  abi,
  contractAddress,
  functionName,
  args,
  onSuccess,
}: useContractTransactionProps): useContractTransactionReturn => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { connector } = getAccount(config); // Get the connector directly inside the hook

  const { writeContract, data: transactionHash, isError } = useWriteContract();
  const {
    isLoading,
    isSuccess,
  } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  const executeTransaction = useCallback(async () => {
    if (!connector) {
      setError("No connector found. Please connect a wallet.");
      return;
    }

    setIsPending(true);
    setError(null);

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
      setError(e.message || "Simulation failed");
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
    if (isError) {
      setIsPending(false)
    };
  }, [isError]);

  return {
    isPending: isPending || isLoading,
    isSuccess,
    error,
    executeTransaction,
  };
};

export default useContractTransaction;
