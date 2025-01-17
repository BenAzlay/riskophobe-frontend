import React, { useState } from 'react';

interface RangeSliderProps {
  image: string;
  min: number;
  max: number;
  step: number;
}

const RangeSlider: React.FC<RangeSliderProps> = ({ image, min, max, step }) => {
  const [value, setValue] = useState((min + max) / 2);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Number(event.target.value));
  };

  return (
    <div className="flex items-center justify-center w-full bg-none">
      <div className="flex items-center space-x-4 w-full relative">
        <span className="text-sm font-medium">{min}</span>
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
              WebkitAppearance: 'none',
              appearance: 'none',
            }}
          />
          <div
            className="absolute flex flex-col items-center pointer-events-none"
            style={{
              left: `${((value - min) / (max - min)) * 100}%`,
              transform: 'translateX(-50%)',
              top: '-2rem',
            }}
          >
            <div className="bg-gray-700 text-white text-xs font-medium px-2 py-1 rounded relative">
              {value}
              <div className="absolute w-2 h-2 bg-gray-700 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
            </div>
          </div>
          <div
            className="absolute bg-no-repeat bg-center bg-cover pointer-events-none"
            style={{
              backgroundImage: `url(${image})`,
              left: `${((value - min) / (max - min)) * 100}%`,
              transform: 'translate(-50%, -50%)',
              top: '50%',
              width: '24px',
              height: '24px',
            }}
          ></div>
        </div>
        <span className="text-sm font-medium">{max}</span>
      </div>
    </div>
  );
};

export default RangeSlider;
