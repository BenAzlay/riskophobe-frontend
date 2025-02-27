import { ReactNode } from "react";

interface TooltipProps {
  message: string;
  children: ReactNode;
}

const Tooltip = ({ message, children }: TooltipProps) => {
  return (
    <span className="relative inline-block">
      <span className="group inline-block">
        {children}
        <span className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 ease-in-out">
          <span className="bg-gray-800 text-white text-sm rounded px-2 py-1 shadow-lg whitespace-nowrap">
            {message}
          </span>
          <span className="absolute left-1/2 transform -translate-x-1/2 top-full border-[6px] border-transparent border-t-gray-800"></span>
        </span>
      </span>
    </span>
  );
};

export default Tooltip;
