import TokenLogo from "./TokenLogo";
import LoadingText from "./LoadingText";

interface TokenSymbolAndLogoProps {
  symbol: string | undefined;
}

const TokenSymbolAndLogo = ({ symbol }: TokenSymbolAndLogoProps) => {
  return (
    <div className="inline-flex gap-2 items-center shrink-0">
      <TokenLogo symbol={symbol} size={20} />
      <span className="p-0 font-bold">{symbol ?? <LoadingText length={3} initialLength={3} />}</span>
    </div>
  );
};

export default TokenSymbolAndLogo;
