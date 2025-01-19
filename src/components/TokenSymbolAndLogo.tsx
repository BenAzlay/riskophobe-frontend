import { FC } from "react";

interface TokenSymbolAndLogoProps {
  symbol: string | undefined;
  logo: string | undefined;
}

const TokenSymbolAndLogo: FC<TokenSymbolAndLogoProps> = ({ symbol, logo }) => {
  return (
    <div className="flex gap-2 items-center">
      <img src={logo} alt={symbol} className="rounded-full w-6 h-6" />
      <p className="p-0 font-bold">{symbol ?? "TOKEN"}</p>
    </div>
  );
};

export default TokenSymbolAndLogo;
