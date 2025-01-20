import React, { useState } from "react";
import Tooltip from "./Tooltip";
import { abbreviateAmount, numberWithCommas } from "@/utils/utilFunc";

interface RangeSliderProps {
  value: number;
  onChange: (newValue: number) => void;
  image: string;
  min: number;
  max: number;
  step: number;
  displayTooltip?: (value: number) => string;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  value,
  onChange,
  image,
  min,
  max,
  step,
  displayTooltip = (value) => `${value}`,
}) => {
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
        <span className="text-sm font-medium">{abbreviateAmount(min, '', 2)}</span>
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
          className="absolute bg-no-repeat bg-center bg-cover pointer-events-none"
          style={{
            backgroundImage: `url(${image})`,
            left: `${((value - min) / (max - min)) * 100}%`,
            transform: "translate(-50%, -50%)",
            top: "50%",
            width: "24px",
            height: "24px",
          }}
        ></div>
      </div>
      <Tooltip message={`Maximum: ${numberWithCommas(max)}`}>
        <span className="text-sm font-medium">
          {abbreviateAmount(max, "", 2)}
        </span>
      </Tooltip>
    </div>
  );
};

export default RangeSlider;
