import { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import {
  abbreviateAmount,
  convertQuantityFromWei,
  convertQuantityToWei,
  numberWithCommas,
} from "@/utils/utilFunc";
import CONSTANTS from "@/utils/constants";
import Decimal from "decimal.js";
import RangeSlider from "./RangeSlider";
import TransactionButton from "./TransactionButton";
import { abi as RiskophobeProtocolAbi } from "@/abi/RiskophobeProtocolAbi";
import SignInButton from "./SignInButton";
import useStore from "@/store/useStore";
import SwitchChainButton from "./SwitchChainButton";
import { base } from "viem/chains";
import CreatorFee from "@/app/types/CreatorFee";
import Tooltip from "./Tooltip";
import useContractTransaction from "@/utils/useContractTransaction";
import { useAccount } from "wagmi";

interface ClaimModalProps {
  visible: boolean;
  onClose: () => void;
  creatorFee: CreatorFee;
}

const ClaimModal = ({ visible, onClose, creatorFee }: ClaimModalProps) => {
  const { id: feeId, token, amount: maxClaimAmountWei } = creatorFee;

  const { address: connectedAddress, chainId: connectedChainId } = useAccount();

  const { creatorFees, setCreatorFees } = useStore();

  const maxClaimAmount = useMemo(
    () => convertQuantityFromWei(maxClaimAmountWei, token.decimals),
    [maxClaimAmountWei, token.decimals]
  );

  const [claimAmount, setClaimAmount] = useState<string>(maxClaimAmount);
  const [txError, setTxError] = useState<string | null>(null);

  // Reset txError after 10 seconds
  useEffect(() => {
    if (txError !== null) {
      const timer = setTimeout(() => {
        setTxError(null);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [txError]);

  // Calculate step from one 1000th of the max
  const step: number = useMemo(
    () => parseFloat((Number(maxClaimAmount) / 100).toFixed(token.decimals)),
    [maxClaimAmount, token.decimals]
  );

  const claimAmountWei = useMemo(
    () => convertQuantityToWei(claimAmount, token.decimals),
    [claimAmount, token.decimals]
  );

  const handleClaimAmountChange = (newValue: number): void => {
    setClaimAmount(new Decimal(newValue).toString());
  };

  // claimFees TX hooks
  const {
    isPending: claimFeesIsPending,
    executeTransaction: executeClaimFeesTransaction,
  } = useContractTransaction({
    abi: RiskophobeProtocolAbi,
    contractAddress: CONSTANTS.RISKOPHOBE_CONTRACT as `0x${string}`,
    functionName: "claimFees",
    args: [token.address as `0x${string}`, BigInt(claimAmountWei)],
    onSuccess: () => {
      // Update creator fee by decreasing the amount
      const newAmountWei = maxClaimAmountWei - Number(claimAmountWei);
      const newCreatorFees = creatorFees.map((creatorFee) => {
        if (creatorFee.id === feeId) {
          return {
            ...creatorFee,
            amount: newAmountWei,
          };
        }
        return creatorFee;
      });
      // Set new claim amount to new max
      setCreatorFees(newCreatorFees);
      // TODO => success modal
      return onClose();
    },
    onError: (errorMessage) => {
      setTxError(errorMessage);
    },
  });

  const transactionButton = () => {
    if (!connectedAddress) return <SignInButton />;
    if (connectedChainId !== base.id) return <SwitchChainButton />;
    return (
      <TransactionButton
        disabled={new Decimal(claimAmountWei).lte(0) || claimFeesIsPending}
        loading={claimFeesIsPending}
        onClickAction={executeClaimFeesTransaction}
        errorMessage={txError}
      >
        CLAIM {token.symbol}
      </TransactionButton>
    );
  };

  return (
    <Modal
      visible={visible}
      title={`Claim your ${token.symbol} rewards`}
      onClose={onClose}
    >
      <div className="flex flex-col gap-4 items-center">
        <label className="block text-sm font-medium">
          {token.symbol} to return
        </label>
        <RangeSlider
          value={Number(claimAmount)}
          onChange={handleClaimAmountChange}
          tokenSymbol={token.symbol}
          min={0}
          max={Number(maxClaimAmount)}
          step={step}
          displayTooltip={(value) => `${value} ${token.symbol}`}
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
          />
        </svg>
        <p>
          You will receive{" "}
          <Tooltip message={`${numberWithCommas(claimAmount)} ${token.symbol}`}>
            {abbreviateAmount(claimAmount, "", 3)} {token.symbol}
          </Tooltip>
        </p>
        {transactionButton()}
      </div>
    </Modal>
  );
};

export default ClaimModal;
