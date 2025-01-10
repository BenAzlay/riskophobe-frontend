"use client";

import "../styles/globals.css";
import { Inter } from "next/font/google";
import { Fragment, type ReactNode } from "react";

import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import Head from "next/head";
import ConnectWalletModal from "@/components/ConnectWalletModal";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout(props: { children: ReactNode }) {  
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
