"use client";

import "../styles/globals.css";
import { Inter } from "next/font/google";
import { Fragment, type ReactNode } from "react";

import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import Head from "next/head";
import ConnectWalletModal from "@/components/ConnectWalletModal";
import useStore from "@/store/useStore";
import { useAsyncEffect, useVisibilityIntervalEffect } from "@/utils/customHooks";
import { convertSubgraphToken } from "@/utils/tokenMethods";
import { Offer } from "@/utils/queries";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout(props: { children: ReactNode }) {
  const { setOffers } = useStore();

  const fetchOffers = async () => {
    try {
      // Fetch offers from subgraph
      const response = await fetch("/api/fetchOffers");
      if (!response.ok) {
        throw new Error("Failed to fetch offers");
      }
      const { offers: subgraphOffers } = await response.json();
      // Add token logos to convert them into ERC20Token type
      const offers = subgraphOffers.map((offer: Offer) => {
        const soldToken = convertSubgraphToken(offer.soldToken);
        const collateralToken = convertSubgraphToken(offer.collateralToken);
        return {
          ...offer,
          soldToken,
          collateralToken,
        };
      });
      setOffers(offers);
    } catch (e) {
      console.error("fetchOffers ERROR", e);
    }
  };
  useVisibilityIntervalEffect(fetchOffers, 60000, []); // Refetch offers every 60s

  return (
    <Fragment>
      <Head>
        <title>Riskophobe</title>
        <meta name="description" content="Options for crypto" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <html lang="en" data-theme="riskophobe">
        <body className={inter.className}>
          <Providers>
            <Navbar />
            {props.children}
            <ConnectWalletModal />
          </Providers>
        </body>
      </html>
    </Fragment>
  );
}
