"use client";

import useStore from "@/store/useStore";
import { useAsyncEffect } from "@/utils/customHooks";
import { CreatorFee as SubgraphCreatorFee } from "@/utils/queries";
import CreatorFee from "../types/CreatorFee";
import { convertSubgraphToken } from "@/utils/tokenMethods";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import FeesTable from "@/components/FeesTable";
import { Fragment, useState } from "react";
import ClaimModal from "@/components/ClaimModal";

const Claim = () => {
  const { setCreatorFees, creatorFees } = useStore();
  const { address: connectedAddress } = useAccount();

  const [selectedFee, setSelectedFee] = useState<CreatorFee | null>(null);

  const creatorFeesGetter = async (): Promise<CreatorFee[]> => {
    try {
      if (!ethers.isAddress(connectedAddress))
        throw new Error("No account connected");
      // Fetch user's creatorFees from subgraph
      const response = await fetch(
        `/api/fetchCreatorFees?creator=${connectedAddress}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch creator fees for user");
      }
      const { creatorFees: subgraphCreatorFees } = await response.json();
      // Add token logos to convert them into ERC20Token type
      const creatorFees = subgraphCreatorFees.map((fee: SubgraphCreatorFee) => {
        const token = convertSubgraphToken(fee.token);
        return {
          ...fee,
          token,
        };
      });
      console.log(`creatorFees:`, creatorFees);
      return creatorFees;
    } catch (e) {
      return [];
    }
  };
  const creatorFeesSetter = (_creatorFees: CreatorFee[]) => {
    setCreatorFees(_creatorFees);
  };
  useAsyncEffect(creatorFeesGetter, creatorFeesSetter, [connectedAddress]);

  return (
    <Fragment>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Claim your rewards</h1>
        <FeesTable
          creatorFees={creatorFees}
          onSelectFee={(fee: CreatorFee) => setSelectedFee(fee)}
        />
      </div>
      {selectedFee !== null ? (
        <ClaimModal
          visible={selectedFee !== null}
          creatorFee={selectedFee}
          onClose={() => setSelectedFee(null)}
        />
      ) : null}
    </Fragment>
  );
};

export default Claim;
