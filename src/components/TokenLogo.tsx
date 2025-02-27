interface TokenSymbolAndLogoProps {
  symbol: string | undefined;
  size?: number;
  className?: string;
}

const TokenLogo = ({
  symbol,
  size = 20,
  className = "",
}: TokenSymbolAndLogoProps) => {
  const logo: string = `/tokenLogos/${symbol ?? "NOTFOUND"}.png`;

  return (
    <img
      src={logo}
      alt={`${symbol ?? "Token"} logo`}
      className={`rounded-full ${className}`}
      style={{
        width: size,
        height: size,
      }}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.onerror = null; // Prevent infinite loop in case the fallback image fails
        target.src = `/tokenLogos/NOTFOUND.png`;
      }}
    />
  );
};

export default TokenLogo;
