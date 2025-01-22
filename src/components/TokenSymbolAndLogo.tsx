import { FC } from "react";
import TokenLogo from "./TokenLogo";

interface TokenSymbolAndLogoProps {
  symbol: string | undefined;
}

const TokenSymbolAndLogo: FC<TokenSymbolAndLogoProps> = ({ symbol }) => {
  return (
    <div className="flex gap-2 items-center">
      <TokenLogo symbol={symbol} size={20} />
      <p className="p-0 font-bold">{symbol ?? "TOKEN"}</p>
    </div>
  );
};

export default TokenSymbolAndLogo;
