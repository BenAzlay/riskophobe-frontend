import { FC } from "react";
import TokenLogo from "./TokenLogo";
import LoadingText from "./LoadingText";

interface TokenSymbolAndLogoProps {
  symbol: string | undefined;
}

const TokenSymbolAndLogo: FC<TokenSymbolAndLogoProps> = ({ symbol }) => {
  return (
    <div className="contents space-x-2 gap-2 items-center">
      <TokenLogo symbol={symbol} size={20} />
      <p className="p-0 font-bold">{symbol ?? <LoadingText length={3} initialLength={3} />}</p>
    </div>
  );
};

export default TokenSymbolAndLogo;
