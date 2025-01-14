import { abbreviateAmount } from "@/utils/utilFunc";
import { FC, ReactNode } from "react";

interface TokenAmountFieldProps {
  amount: string;
  onChangeAmount: (amount: string) => void;
  tokenComponent: ReactNode;
  showTokenBalance: boolean;
  tokenBalance?: string;
}

const TokenAmountField: FC<TokenAmountFieldProps> = ({
  amount,
  tokenComponent,
  onChangeAmount,
  showTokenBalance = true,
  tokenBalance = "0",
}) => {
  return (
    <div className="rounded-md border-2 border-neutral px-4 py-2">
      <div className="flex gap-8 items-center">
        <input
          value={amount}
          onChange={(event) => onChangeAmount(event.target.value)}
          type="text"
          placeholder="Type here"
          className="input w-full p-0 border-none hover:border-none focus:outline-none"
        />
        {tokenComponent}
      </div>
      {showTokenBalance ? (
        <div className="flex justify-end">
          <p>Balance: {abbreviateAmount(tokenBalance)}</p>
        </div>
      ) : null}
    </div>
  );
};

export default TokenAmountField;
