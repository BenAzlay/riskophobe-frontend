import { FC, ReactNode } from "react";

interface TokenAmountFieldProps {
  amount: string;
  onChangeAmount: (amount: string) => void;
  tokenComponent: ReactNode;
}

const TokenAmountField: FC<TokenAmountFieldProps> = ({
  amount,
  tokenComponent,
  onChangeAmount,
}) => {
  return (
    <div className="rounded-md border-2 border-neutral">
      <div className="flex gap-8 items-center">
        <input
          value={amount}
          onChange={(event) => onChangeAmount(event.target.value)}
          type="text"
          placeholder="Type here"
          className="input w-full max-w-xs border-none hover:border-none focus:outline-none"
        />
        {tokenComponent}
      </div>
    </div>
  );
};

export default TokenAmountField;
