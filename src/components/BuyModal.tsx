import { FC, useMemo, useState } from "react";
import Modal from "./Modal";
import Offer from "@/app/types/Offer";
import TokenAmountField from "./TokenAmountField";
import TokenSymbolAndLogo from "./TokenSymbolAndLogo";
import { calculateCollateralForSoldToken, calculateSoldTokenForCollateral, convertQuantityFromWei, convertQuantityToWei } from "@/utils/utilFunc";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { getTokenAllowance, getTokenBalance } from "@/utils/tokenMethods";
import CONSTANTS from "@/utils/constants";
import { useAsyncEffect } from "@/utils/customHooks";
import Decimal from "decimal.js";

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

  const { address: connectedAddress } = useAccount();

  const [collateralIn, setCollateralIn] = useState<string>("");
  const [collateralBalance, setCollateralBalance] = useState<string>("0");
  const [collateralAllowance, setCollateralAllowance] = useState<string>("0");

  // Max collateral spendable for the amount of sold token left in the offer
  const maxCollateralInWei = useMemo(() => calculateCollateralForSoldToken(exchangeRate, soldTokenAmount), [exchangeRate, soldTokenAmount]);
  const maxCollateralIn = useMemo(() => convertQuantityFromWei(maxCollateralInWei, collateralToken.decimals), [maxCollateralInWei, collateralToken.decimals]);

  const formattedCollateralBalance = useMemo(
    () => convertQuantityFromWei(collateralBalance, collateralToken.decimals),
    [collateralBalance, collateralToken.decimals]
  );

  // The max collateral amount spendable by the user
  // IF maxCollateralIn > balance AND balance > 0 => use balance
  // ELSE use maxCollateralIn
  const userMaxCollateralIn = useMemo(() => {
    if (new Decimal(maxCollateralIn).gt(collateralBalance) && new Decimal(formattedCollateralBalance).gt(0)) return formattedCollateralBalance;
    return maxCollateralIn;
  }, [maxCollateralIn, formattedCollateralBalance]);

  const collateralInWei = useMemo(
    () => convertQuantityToWei(collateralIn, collateralToken.decimals),
    [collateralIn, collateralToken.decimals]
  );

  const soldTokenOutWei = useMemo(() => calculateSoldTokenForCollateral(exchangeRate, collateralInWei), [exchangeRate, collateralInWei]);
  const soldTokenOut = useMemo(() => convertQuantityFromWei(soldTokenOutWei, soldToken.decimals), [soldTokenOutWei, soldToken.decimals]);


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

  return (
    <Modal
      visible={visible}
      title={`Buy ${soldToken.symbol} for ${collateralToken.symbol}`}
      onClose={onClose}
    >
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Sold Token Amount</label>
          <TokenAmountField
            amount={collateralIn}
            onChangeAmount={(amount) => setCollateralIn(amount)}
            showTokenBalance={true}
            tokenBalance={userMaxCollateralIn}
            balanceLabel="Max"
            tokenComponent={
              <TokenSymbolAndLogo
                symbol={collateralToken.symbol}
                logo={collateralToken.logo}
              />
            }
          />
        </div>
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
        <p>{soldTokenOut}{" "}{soldToken.symbol}</p>
      </form>
    </Modal>
  );
};

export default BuyModal;
