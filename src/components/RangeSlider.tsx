import React, { useState } from "react";
import Tooltip from "./Tooltip";
import { abbreviateAmount, numberWithCommas } from "@/utils/utilFunc";
import TokenLogo from "./TokenLogo";

interface RangeSliderProps {
  value: number;
  onChange: (newValue: number) => void;
  min: number;
  max: number;
  step: number;
  tokenSymbol?: string;
  displayTooltip?: (value: number) => string;
  disabled?: boolean;
}

const RangeSlider = ({
  value,
  onChange,
  min,
  max,
  step,
  displayTooltip = (value) => `${value}`,
  tokenSymbol,
  disabled = false,
}: RangeSliderProps) => {
  const [isHovering, setIsHovering] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value));
  };

  const handleMouseEvents = (hovering: boolean) => {
    setIsHovering(hovering);
  };

  return (
    <div className="flex items-center gap-4 w-full relative">
      <Tooltip message={`Minimum: ${numberWithCommas(min)}`}>
        <span className="slider-label">{abbreviateAmount(min, "", 2)}</span>
      </Tooltip>
      <div className="relative w-full">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleInputChange}
          className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          style={{
            WebkitAppearance: "none",
            appearance: "none",
          }}
          onMouseEnter={() => handleMouseEvents(true)}
          onMouseLeave={() => handleMouseEvents(false)}
          disabled={disabled}
        />
        <div
          className="absolute flex flex-col items-center pointer-events-none transition-opacity duration-300 ease-in-out opacity-0 hover:opacity-100"
          style={{
            left: `${((value - min) / (max - min)) * 100}%`,
            transform: "translateX(-50%)",
            top: "-2rem",
            opacity: isHovering ? 1 : 0,
          }}
        >
          <div className="bg-gray-700 text-white text-xs font-medium px-2 py-1 rounded relative whitespace-nowrap">
            {displayTooltip(value)}
            <div className="absolute w-2 h-2 bg-gray-700 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
          </div>
        </div>
        <div
          id="thumb"
          className="absolute pointer-events-none w-6 h-6"
          style={{
            left: `${((value - min) / (max - min)) * 100}%`,
            transform: "translate(-50%, -50%)",
            top: "50%",
            zIndex: 1,
          }}
        >
          {tokenSymbol ? (
            <TokenLogo symbol={tokenSymbol} size={24} />
          ) : (
            <div className="rounded-full w-6 h-6 bg-primary" />
          )}
        </div>
      </div>
      <Tooltip message={`Maximum: ${numberWithCommas(max)}`}>
        <span className="slider-label">{abbreviateAmount(max, "", 2)}</span>
      </Tooltip>
    </div>
  );
};

export default RangeSlider;
