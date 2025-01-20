"use client";

import useStore from "@/store/useStore";
import { Fragment } from "react";
import OfferItem from "@/components/OfferItem";
import { useAsyncEffect } from "@/utils/customHooks";
import { useAccount } from "wagmi";
import { Deposit } from "@/utils/queries";
import { ethers } from "ethers";

function App() {
  const { offers, setDeposits } = useStore();
  const { address: connectedAddress } = useAccount();

  const depositsGetter = async (): Promise<Deposit[]> => {
    try {
      if (!ethers.isAddress(connectedAddress))
        throw new Error("No account connected");
      // Fetch user's deposits from subgraph
      const response = await fetch(
        `/api/fetchDeposits?participant=${connectedAddress}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch deposits for user");
      }
      const { deposits } = await response.json();
      return deposits;
    } catch (e) {
      return [];
    }
  };
  const depositsSetter = (_deposits: Deposit[]) => {
    setDeposits(_deposits);
  };
  useAsyncEffect(depositsGetter, depositsSetter, [connectedAddress]);

  return (
    <Fragment>
      <div className="hero bg-base-200">
        <div className="hero-content text-center">
          <div className="space-y-6 justify-items-center">
            <h1 className="text-5xl font-bold font-nimbus text-primary">
              Invest Risk-Free. Get Money Back.
            </h1>
            <h2 className="text-2xl font-semibold text-left">
              🤩 Choose a token to invest in
              <br />
              😇 Return it if the price drops
              <br />
              🤑 Reclaim your investment safely
            </h2>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div
          id="offers-grid"
          className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {offers.map((offer, index) => (
            <OfferItem offer={offer} key={index} />
          ))}
        </div>
      </div>
    </Fragment>
  );
}

export default App;
