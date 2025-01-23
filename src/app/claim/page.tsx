"use client";

import useStore from "@/store/useStore";
import { useAsyncEffect } from "@/utils/customHooks";
import { CreatorFee as SubgraphCreatorFee } from "@/utils/queries";
import CreatorFee from "../types/CreatorFee";
import { getTokenDetails } from "@/utils/tokenMethods";
import { ethers } from "ethers";
import FeesTable from "@/components/FeesTable";
import { Fragment, useState } from "react";
import ClaimModal from "@/components/ClaimModal";
import { compareEthereumAddresses } from "@/utils/utilFunc";
import { getAccount } from "wagmi/actions";
import { config } from "@/wagmiConfig";

const Claim = () => {
  const { setCreatorFees, creatorFees } = useStore();
  const { address: connectedAddress } = getAccount(config);
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
      const { creatorFees: subgraphCreatorFees } = (await response.json()) as {
        creatorFees: SubgraphCreatorFee[];
      };
      const tokenAddresses = subgraphCreatorFees.map((fee) => fee.token.id);
      const tokensWithDetails = await getTokenDetails(tokenAddresses);
      // Add token logos to convert them into ERC20Token type
      const creatorFees = subgraphCreatorFees.map((fee) => {
        const token = tokensWithDetails.find((token) =>
          compareEthereumAddresses(token.address, fee.token.id)
        )!;
        return {
          ...fee,
          token,
        };
      });
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
