import { FC, useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import Offer from "@/app/types/Offer";
import TokenAmountField from "./TokenAmountField";
import TokenSymbolAndLogo from "./TokenSymbolAndLogo";
import {
  calculateCollateralForSoldToken,
  calculateSoldTokenForCollateral,
  convertQuantityFromWei,
  convertQuantityToWei,
} from "@/utils/utilFunc";
import { ethers } from "ethers";
import {
  useAccount,
  useConnect,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { getTokenAllowance, getTokenBalance } from "@/utils/tokenMethods";
import CONSTANTS from "@/utils/constants";
import { useAsyncEffect } from "@/utils/customHooks";
import Decimal from "decimal.js";
import RangeSlider from "./RangeSlider";
import TransactionButton from "./TransactionButton";
import { simulateContract } from "wagmi/actions";
import { getConfig } from "@/wagmi";
import { abi as RiskophobeProtocolAbi } from "@/abi/RiskophobeProtocolAbi";

interface BuyModalProps {
  visible: boolean;
  onClose: () => void;
  offer: Offer;
}

const BuyModal: FC<BuyModalProps> = ({ visible, onClose, offer }) => {
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
  } = offer;

  const config = getConfig();
  const { address: connectedAddress } = useAccount();

  const [collateralIn, setCollateralIn] = useState<string>("");
  const [collateralBalance, setCollateralBalance] = useState<string>("0");
  const [collateralAllowance, setCollateralAllowance] = useState<string>("0");

  // Max collateral spendable for the amount of sold token left in the offer
  const maxCollateralInWei = useMemo(
    () => calculateCollateralForSoldToken(exchangeRate, soldTokenAmount),
    [exchangeRate, soldTokenAmount]
  );
  const maxCollateralIn = useMemo(
    () => convertQuantityFromWei(maxCollateralInWei, collateralToken.decimals),
    [maxCollateralInWei, collateralToken.decimals]
  );

  const formattedCollateralBalance = useMemo(
    () => convertQuantityFromWei(collateralBalance, collateralToken.decimals),
    [collateralBalance, collateralToken.decimals]
  );

  // The max collateral amount spendable by the user
  // IF maxCollateralIn > balance AND balance > 0 => use balance
  // ELSE use maxCollateralIn
  const userMaxCollateralIn = useMemo(() => {
    if (
      new Decimal(maxCollateralIn).gt(collateralBalance) &&
      new Decimal(formattedCollateralBalance).gt(0)
    )
      return formattedCollateralBalance;
    return maxCollateralIn;
  }, [maxCollateralIn, formattedCollateralBalance]);

  const collateralInWei = useMemo(
    () => convertQuantityToWei(collateralIn, collateralToken.decimals),
    [collateralIn, collateralToken.decimals]
  );

  const soldTokenOutWei = useMemo(
    () => calculateSoldTokenForCollateral(exchangeRate, collateralInWei),
    [exchangeRate, collateralInWei]
  );
  const soldTokenOut = useMemo(
    () => convertQuantityFromWei(soldTokenOutWei, soldToken.decimals),
    [soldTokenOutWei, soldToken.decimals]
  );

  const getCollateralBalance = async () =>
    await getTokenBalance(collateralToken?.address, connectedAddress);
  const getCollateralAllowance = async () =>
    await getTokenAllowance(
      collateralToken?.address,
      connectedAddress,
      CONSTANTS.RISKOPHOBE_CONTRACT
    );

  const collateralBalanceAndAllowanceGetter = async (): Promise<
    [string, string]
  > => {
    if (
      !ethers.isAddress(collateralToken?.address) ||
      !ethers.isAddress(connectedAddress)
    )
      return ["0", "0"];
    return await Promise.all([
      getCollateralBalance(),
      getCollateralAllowance(),
    ]);
  };
  const collateralBalanceAndAllowanceSetter = ([newBalance, newAllowance]: [
    string,
    string,
  ]): void => {
    setCollateralBalance(newBalance);
    setCollateralAllowance(newAllowance);
  };
  useAsyncEffect(
    collateralBalanceAndAllowanceGetter,
    collateralBalanceAndAllowanceSetter,
    [connectedAddress, collateralToken?.address]
  );

  const handleCollateralInChange = (newValue: number): void => {
    setCollateralIn(new Decimal(newValue).toString());
  };

  // TX hooks
  const { connectors } = useConnect();
  const {
    data: buyTokensHash,
    isPending: buyTokensIsPending,
    writeContract: writeBuyTokens,
  } = useWriteContract();
  const { isLoading: buyTokensIsConfirming, isSuccess: buyTokensSuccess } =
    useWaitForTransactionReceipt({
      hash: buyTokensHash,
    });

  // useEffect to handle buyTokens transaction success
  useEffect(() => {
    const updateBalanceAndAllowance = async () => {
      const payload = await collateralBalanceAndAllowanceGetter();
      collateralBalanceAndAllowanceSetter(payload);
    };
    if (buyTokensSuccess) {
      // Update collateral balance and allowance
      updateBalanceAndAllowance();
    }
  }, [buyTokensSuccess]);

  const handleBuyTokens = async () => {
    try {
      const { request } = await simulateContract(config, {
        abi: RiskophobeProtocolAbi,
        address: CONSTANTS.RISKOPHOBE_CONTRACT as `0x${string}`,
        functionName: "buyTokens",
        args: [
            BigInt(offerId),
            BigInt(collateralInWei),
            BigInt(soldTokenOutWei),
        ],
        connector: connectors[0],
      });
      console.log(`handleBuyTokens request:`, request);
      writeBuyTokens(request);
    } catch (e) {
      console.error("handleBuyTokens ERROR", e);
    }
  };

  return (
    <Modal
      visible={visible}
      title={`Buy ${soldToken.symbol} for ${collateralToken.symbol}`}
      onClose={onClose}
    >
      <div className="flex flex-col gap-4 items-center">
        <label className="block text-sm font-medium">Collateral to spend</label>
        <RangeSlider
          value={Number(collateralIn)}
          onChange={handleCollateralInChange}
          image={collateralToken.logo}
          min={0}
          max={Number(userMaxCollateralIn)}
          step={0.001}
          displayTooltip={(value) => `${value} USDC`}
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
          {soldTokenOut} {soldToken.symbol}
        </p>
        <TransactionButton
          disabled={
            new Decimal(collateralInWei).lte(0) ||
            buyTokensIsConfirming ||
            buyTokensIsPending
          }
          loading={buyTokensIsConfirming || buyTokensIsPending}
          onClickAction={() => {}}
        >
          BUY {soldToken.symbol}
        </TransactionButton>
      </div>
    </Modal>
  );
};

export default BuyModal;
