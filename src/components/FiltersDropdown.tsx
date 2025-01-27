import { FC, useState, useEffect, useRef } from "react";

interface FilterOption {
  id: string;
  label: string;
  asc: boolean;
}

interface FiltersDropdownProps {
  options: FilterOption[];
  selectedOption: FilterOption;
  onSelectOption: (id: FilterOption) => void;
  prefix: string;
}

const FiltersDropdown: FC<FiltersDropdownProps> = ({
  options,
  selectedOption,
  onSelectOption,
  prefix = "Sort by",
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
    <div ref={dropdownRef} className="relative inline-block w-full sm:w-fit">
      <button
        className="btn btn-outline btn-secondary w-full sm:w-fit text-start justify-between"
        onClick={(event) => {
          event.preventDefault();
          toggleDropdown();
        }}
        aria-expanded={isOpen}
        aria-controls="tokens-dropdown"
      >
        <p>
          {prefix}{" "}
          <span className="h-auto text-gray-100">{selectedOption.label}</span>
        </p>
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
          className="absolute z-10 min-w-max w-full mt-2 bg-[#1e1e1e] border border-[#333333] rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {options.map((option, index) => (
            <li
              key={index}
              onClick={() => {
                onSelectOption(option);
                setIsOpen(false);
              }}
              className={`flex items-center gap-2 px-4 py-2 text-sm text-gray-100 font-semibold cursor-pointer hover:bg-[#2a2a2a] ${
                selectedOption.id === option.id &&
                selectedOption.asc === option.asc
                  ? "bg-[#2a2a2a]"
                  : ""
              }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FiltersDropdown;
