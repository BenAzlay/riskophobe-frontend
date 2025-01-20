import ERC20Token from "@/app/types/ERC20Token";
import { FC, useState, useEffect, useRef } from "react";
import TokenSymbolAndLogo from "./TokenSymbolAndLogo";

interface TokensDropdownProps {
  tokens: ERC20Token[];
  selectedToken: ERC20Token | null;
  onSelectToken: (token: ERC20Token) => void;
}

const TokensDropdown: FC<TokensDropdownProps> = ({
  tokens,
  selectedToken,
  onSelectToken,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block w-full max-w-xs">
      <button
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-white bg-[#1e1e1e] border border-[#333333] rounded-lg shadow-md hover:bg-[#2a2a2a]"
        onClick={(event) => {
          event.preventDefault();
          toggleDropdown();
        }}
        aria-expanded={isOpen}
        aria-controls="tokens-dropdown"
      >
        <div className="flex items-center gap-2">
          <TokenSymbolAndLogo
            symbol={selectedToken?.symbol}
            logo={selectedToken?.logo}
          />
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`w-5 h-5 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>
      {isOpen && (
        <ul
          id="tokens-dropdown"
          className="absolute z-10 w-full mt-2 bg-[#1e1e1e] border border-[#333333] rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {tokens.map((token, index) => (
            <li
              key={index}
              onClick={() => {
                onSelectToken(token);
                setIsOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white cursor-pointer hover:bg-[#2a2a2a]"
            >
              <TokenSymbolAndLogo
                symbol={token?.symbol}
                logo={token?.logo}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TokensDropdown;
