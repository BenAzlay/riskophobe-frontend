import { FC } from "react";

interface TokenSymbolAndLogoProps {
  symbol: string | undefined;
  logo: string | undefined;
}

const TokenSymbolAndLogo: FC<TokenSymbolAndLogoProps> = ({ symbol, logo }) => {
  return (
    <div className="flex gap-2 items-center">
      <img src={logo} alt="logo" height={24} width={24} className="rounded-full" />
      <p className="p-0 font-bold">{symbol ?? "TOKEN"}</p>
    </div>
  );
};

export default TokenSymbolAndLogo;
