import { FC } from "react";

interface TokenSymbolAndLogoProps {
  symbol: string | undefined;
  logo: string | undefined;
}

const TokenSymbolAndLogo: FC<TokenSymbolAndLogoProps> = ({ symbol, logo }) => {
  return (
    <div className="flex gap-2 items-center">
      <img src={logo} alt={symbol} className="rounded-full w-5 h-5" onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.onerror = null; // Prevent infinite loop in case the fallback image fails
        target.src = `/tokenLogos/NOTFOUND.png`;
      }} />
      <p className="p-0 font-bold">{symbol ?? "TOKEN"}</p>
    </div>
  );
};

export default TokenSymbolAndLogo;
