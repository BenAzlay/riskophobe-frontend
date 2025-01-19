"use client";

import { FC, useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import Offer from "@/app/types/Offer";
import { convertQuantityFromWei, convertQuantityToWei } from "@/utils/utilFunc";
import {
  useAccount,
  useConnect,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import CONSTANTS from "@/utils/constants";
import TransactionButton from "./TransactionButton";
import { simulateContract } from "wagmi/actions";
import { getConfig } from "@/wagmi";
import { abi as RiskophobeProtocolAbi } from "@/abi/RiskophobeProtocolAbi";
import SignInButton from "./SignInButton";
import useStore from "@/store/useStore";
import { base } from "viem/chains";
import SwitchChainButton from "./SwitchChainButton";
import TokenAmountField from "./TokenAmountField";
import TokenSymbolAndLogo from "./TokenSymbolAndLogo";
import Decimal from "decimal.js";
import { ethers } from "ethers";
import { useAsyncEffect } from "@/utils/customHooks";
import { getTokenAllowance, getTokenBalance } from "@/utils/tokenMethods";
import { erc20Abi } from "viem";

interface AddModalProps {
  visible: boolean;
  onClose: () => void;
  offer: Offer;
}

const AddModal: FC<AddModalProps> = ({ visible, onClose, offer }) => {
  const {
    id: offerId,
    soldToken,
    collateralToken,
    exchangeRate,
    creatorFeeBp,
    startTime,
    endTime,
    soldTokenAmount,
    creator,
    collateralBalance,
  } = offer;

  const config = getConfig();
  const { address: connectedAddress, chainId: connectedChainId } = useAccount();
  const { offers, setOffers } = useStore();

  const [soldTokenBalance, setSoldTokenBalance] = useState<string>("0");
  const [soldTokenAllowance, setSoldTokenAllowance] = useState<string>("0");
  const [amountToAdd, setAmountToAdd] = useState<string>("");

  const amountToAddWei = useMemo(
    () => convertQuantityToWei(amountToAdd, soldToken?.decimals ?? 18),
    [amountToAdd, soldToken?.decimals]
  );

  const hasEnoughSoldTokenAllowance = useMemo(() => {
    if (new Decimal(amountToAddWei).lte(0))
      return new Decimal(soldTokenAllowance).gt(0);
    return new Decimal(soldTokenAllowance).gte(amountToAddWei);
  }, [amountToAddWei, soldTokenAllowance]);

  const formattedSoldTokenBalance = useMemo(
    () => convertQuantityFromWei(soldTokenBalance, soldToken?.decimals ?? 18),
    [soldTokenBalance, soldToken?.decimals]
  );

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
    return await Promise.all([getSoldTokenBalance(), getSoldTokenAllowance()]);
  };
  const soldTokenBalanceAndAllowanceSetter = ([newBalance, newAllowance]: [
    string,
    string,
  ]): void => {
    setSoldTokenBalance(newBalance);
    setSoldTokenAllowance(newAllowance);
  };
  useAsyncEffect(
    soldTokenBalanceAndAllowanceGetter,
    soldTokenBalanceAndAllowanceSetter,
    [connectedAddress, soldToken?.address]
  );

  // approval tx hooks
  const {
    data: approveHash,
    isPending: approveIsPending,
    writeContract: writeApprove,
    error: approveError,
  } = useWriteContract();
  const { isLoading: approveIsConfirming, isSuccess: approveSuccess } =
    useWaitForTransactionReceipt({
      hash: approveHash,
    });

  // useEffect to handle approve transaction success
  useEffect(() => {
    const fetchAllowance = async () => {
      try {
        const _allowance = await getSoldTokenAllowance();
        setSoldTokenAllowance(_allowance);
      } catch (error) {
        console.error("Error fetching allowance", error);
      }
    };

    if (approveSuccess) {
      console.log("Transaction approved successfully!");
      fetchAllowance();
    }
  }, [approveSuccess]);

  const handleApprove = async () => {
    try {
      const { request } = await simulateContract(config, {
        abi: erc20Abi,
        address: soldToken.address as `0x${string}`,
        functionName: "approve",
        args: [
          CONSTANTS.RISKOPHOBE_CONTRACT as `0x${string}`,
          BigInt(amountToAddWei),
        ],
        connector: connectors[0],
      });
      console.log(`handleApprove request:`, request);
      writeApprove(request);
    } catch (e) {
      console.error("handleApprove ERROR", e);
    }
  };

  // addSoldTokens tx hooks
  const { connectors } = useConnect();
  const {
    data: addSoldTokensHash,
    isPending: addSoldTokensIsPending,
    writeContract: writeAddSoldTokens,
  } = useWriteContract();
  const {
    isLoading: addSoldTokensIsConfirming,
    isSuccess: addSoldTokensSuccess,
  } = useWaitForTransactionReceipt({
    hash: addSoldTokensHash,
  });

  // useEffect to handle addSoldTokens transaction success
  useEffect(() => {
    const handleTxSuccess = async () => {
      // Update offer by increasing its soldTokenAmount
      const newOffers = offers.map((offer) => {
        if (offer.id === offerId) {
          const newSoldTokenAmount =
            offer.soldTokenAmount + Number(amountToAddWei);
          return {
            ...offer,
            soldTokenAmount: newSoldTokenAmount,
          };
        }
        return offer;
      });
      setOffers(newOffers);
      setAmountToAdd("0");
      // Update balance & allowance
      const payload = await soldTokenBalanceAndAllowanceGetter();
      soldTokenBalanceAndAllowanceSetter(payload);
    };
    if (addSoldTokensSuccess) {
      handleTxSuccess();
    }
  }, [addSoldTokensSuccess]);

  const handleAddSoldTokens = async () => {
    try {
      const { request } = await simulateContract(config, {
        abi: RiskophobeProtocolAbi,
        address: CONSTANTS.RISKOPHOBE_CONTRACT as `0x${string}`,
        functionName: "addSoldTokens",
        args: [BigInt(offerId), BigInt(amountToAddWei)],
        connector: connectors[0],
      });
      writeAddSoldTokens(request);
    } catch (e) {
      console.error("handleAddSoldTokens ERROR", e);
    }
  };

  const transactionButton = () => {
    if (!connectedAddress) return <SignInButton />;
    if (connectedChainId !== base.id) return <SwitchChainButton />;
    if (!hasEnoughSoldTokenAllowance)
      return (
        <TransactionButton
          disabled={
            approveIsPending ||
            approveIsConfirming ||
            !!hasEnoughSoldTokenAllowance ||
            new Decimal(amountToAddWei).lte(0)
          }
          loading={approveIsPending || approveIsConfirming}
          onClickAction={handleApprove}
        >
          APPROVE {soldToken?.symbol}
        </TransactionButton>
      );
    return (
      <TransactionButton
        onClickAction={handleAddSoldTokens}
        disabled={addSoldTokensIsPending || addSoldTokensIsConfirming}
        loading={addSoldTokensIsPending || addSoldTokensIsConfirming}
      >
        ADD {soldToken.symbol}
      </TransactionButton>
    );
  };

  return (
    <Modal
      visible={visible}
      title={`Add ${soldToken.symbol} to this offer`}
      onClose={onClose}
    >
      <div className="flex flex-col gap-4 items-center">
        <TokenAmountField
          amount={amountToAdd}
          onChangeAmount={(amount) => setAmountToAdd(amount)}
          showTokenBalance={true}
          tokenBalance={formattedSoldTokenBalance}
          tokenComponent={
            <TokenSymbolAndLogo
              symbol={soldToken.symbol}
              logo={soldToken.logo}
            />
          }
        />
        {transactionButton()}
      </div>
    </Modal>
  );
};

export default AddModal;
