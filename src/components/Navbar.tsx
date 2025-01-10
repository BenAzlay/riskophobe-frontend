"use client";

import useStore from "@/store/useStore";
import React, { Fragment, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { usePathname } from "next/navigation"; // For detecting active route
import Link from "next/link"; // For client-side navigation
import Modal from "./Modal";
import { addressShorten } from "@/utils/utilFunc";

const Navbar: React.FC = () => {
  const { setWalletDialogOpen } = useStore();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { address: connectedAddress } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const pathname = usePathname(); // Detect the current route

  const handleDisconnect = async () => {
    try {
      await disconnectAsync();
      console.log("Disconnected successfully");
      setLogoutDialogOpen(false); // Close the dialog only on successful disconnect
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  const logoutDialog = () => (
    <Modal
      visible={logoutDialogOpen}
      onClose={() => setLogoutDialogOpen(false)}
    >
      <button className="btn btn-primary" onClick={() => handleDisconnect()}>
        SIGN OUT
      </button>
    </Modal>
  );

  const navLinks = [
    { href: "/", label: "Buy" },
    { href: "/sell", label: "Sell" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <Fragment>
      <div className="navbar bg-neutral text-neutral-content px-4 shadow-md">
        {/* Left side: Logo and Navlinks */}
        <div className="flex-1">
          <div className="flex items-center">
            {/* Logo */}
            <div className="text-secondary font-nimbus text-2xl font-bold">
              <span className="hidden md:inline">Riskophobe</span>
              <span className="md:hidden">R</span>
            </div>

            {/* Navlinks */}
            <div className="hidden md:flex ml-8 space-x-4">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span
                    className={`navlink ${
                      pathname === link.href ? "navlink-active" : ""
                    }`}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right side: Connect Wallet Button */}
        <div className="flex-none">
          <button
            className="btn btn-primary"
            onClick={() =>
              !!connectedAddress
                ? setLogoutDialogOpen(true)
                : setWalletDialogOpen(true)
            }
          >
            {!!connectedAddress ? addressShorten(connectedAddress) : "Sign in"}
          </button>
        </div>
      </div>
      {logoutDialog()}
    </Fragment>
  );
};

export default Navbar;
