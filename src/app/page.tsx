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
      if (!ethers.isAddress(connectedAddress)) throw new Error("No account connected");
      // Fetch user's deposits from subgraph
      const response = await fetch(`/api/fetchDeposits?participant=${connectedAddress}`);
      if (!response.ok) {
        throw new Error("Failed to fetch deposits for user");
      }
      const { deposits } = await response.json();
      console.log(`deposits:`, deposits)
      return deposits;
    } catch (e) {
      return [];
    }
  };
  const depositsSetter = (_deposits: Deposit[]) => {
    setDeposits(_deposits);
  }
  useAsyncEffect(depositsGetter, depositsSetter, [connectedAddress]);

  return (
    <Fragment>
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
