"use client";

import useStore from "@/store/useStore";
import React, { Fragment, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { usePathname, useRouter } from "next/navigation"; // For detecting active route
import Link from "next/link"; // For client-side navigation
import Modal from "./Modal";
import { addressShorten } from "@/utils/utilFunc";
import TransactionButton from "./TransactionButton";
import useIsMobile from "@/utils/useIsMobile";

const Navbar = () => {
  const { setWalletDialogOpen } = useStore();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { address: connectedAddress } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const pathname = usePathname(); // Detect the current route
  const isMobile = useIsMobile();
  const router = useRouter();

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
      <div className="space-y-2">
        <p>You are connected to:</p>
        <div
          onClick={() =>
            window.open(
              `https://basescan.org/address/${connectedAddress}`,
              "_blank"
            )
          }
          className="cursor-pointer p-2 border-2 border-solid border-neutral inline-flex gap-2 font-semibold w-full"
        >
          <span>
            {isMobile
              ? addressShorten(connectedAddress as string)
              : connectedAddress}
          </span>
        </div>
        <TransactionButton onClickAction={() => handleDisconnect()}>
          SIGN OUT
        </TransactionButton>
      </div>
    </Modal>
  );

  const navLinks = [
    { href: "/", label: "Buy" },
    { href: "/sell", label: "Sell" },
    { href: "/claim", label: "Claim" },
  ];

  return (
    <Fragment>
      <div className="navbar bg-neutral text-neutral-content px-4 shadow-md">
        {/* Left side: Logo and Navlinks */}
        <div className="flex-1">
          <div className="flex items-center">
            {/* Logo */}
            <div onClick={() => router.push('/')} className="text-primary font-nimbus  text-4xl sm:text-3xl font-bold cursor-pointer">
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
