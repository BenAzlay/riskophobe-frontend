"use client";

import React, { Fragment } from "react";
import { usePathname } from "next/navigation"; // For detecting active route
import Link from "next/link"; // For client-side navigation

const BottomNav: React.FC = () => {
  const pathname = usePathname(); // Detect the current route

  const navLinks = [
    { href: "/", label: "🏦 Buy" },
    { href: "/sell", label: "💸 Sell" },
    { href: "/claim", label: "🎁 Claim" },
  ];

  return (
    <Fragment>
      <div className="btm-nav bg-neutral text-neutral-content px-4 shadow-md fixed bottom-0 left-0 right-0 z-50 visible sm:hidden">
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
    </Fragment>
  );
};

export default BottomNav;
