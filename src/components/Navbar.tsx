import useStore from "@/store/useStore";
import React, { useState } from "react";
import { useConnect } from "wagmi";

const Navbar: React.FC = () => {
  const { setWalletDialogOpen } = useStore();

  return (
    <div className="navbar bg-neutral text-neutral-content px-4 shadow-md">
      {/* Left side (Desktop: Full logo and navlinks | Mobile: Icon only) */}
      <div className="flex-1">
        <div className="flex items-center">
          <div className="text-secondary font-nimbus text-2xl font-bold">
            <span className="hidden md:inline">Riskophobe</span>
            <span className="md:hidden">R</span>
          </div>
          <div className="hidden md:flex ml-8 space-x-4">
            <a href="/offers" className="btn btn-ghost normal-case text-lg">
              Offers
            </a>
            <a href="/dashboard" className="btn btn-ghost normal-case text-lg">
              Dashboard
            </a>
          </div>
        </div>
      </div>

      {/* Right side: Connect Wallet Button */}
      <div className="flex-none">
        <button
          className="btn btn-primary"
          onClick={() => setWalletDialogOpen(true)}
        >
          Connect Wallet
        </button>
      </div>
    </div>
  );
};

export default Navbar;
