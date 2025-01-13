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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={`dropdown ${isOpen ? "dropdown-open" : ""}`}
    >
      <button
        className="m-1"
        onClick={(event) => {
          event.preventDefault(); // Prevent page refresh
          toggleDropdown();
        }}
      >
        <TokenSymbolAndLogo
          symbol={selectedToken?.symbol}
          logo={selectedToken?.logo}
        />
      </button>
      {isOpen && (
        <ul className="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
          {tokens.map((token, index) => (
            <li
              key={index}
              onClick={() => {
                onSelectToken(token); // Call the callback
                setIsOpen(false); // Close the dropdown
              }}
              className="cursor-pointer" // Ensure it looks clickable
            >
              <TokenSymbolAndLogo symbol={token?.symbol} logo={token?.logo} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TokensDropdown;
