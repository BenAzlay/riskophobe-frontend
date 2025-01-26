"use client";

import useStore from "@/store/useStore";
import { useAsyncEffect } from "@/utils/customHooks";
import { CreatorFee as SubgraphCreatorFee } from "@/utils/queries";
import CreatorFee from "../types/CreatorFee";
import { getTokenDetails } from "@/utils/tokenMethods";
import { ethers } from "ethers";
import { Fragment, useState } from "react";
import { compareEthereumAddresses } from "@/utils/utilFunc";
import { useAccount } from "wagmi";
import Link from "next/link";
import dynamic from "next/dynamic";
import SignInButton from "@/components/SignInButton";
import FeesTable from "@/components/FeesTable";

const ClaimModal = dynamic(() => import("@/components/ClaimModal"));

const Claim = () => {
  const { setCreatorFees, creatorFees } = useStore();
  const [feesLoading, setFeesLoading] = useState(true);
  const { address: connectedAddress } = useAccount();
  const [selectedFee, setSelectedFee] = useState<CreatorFee | null>(null);

  const creatorFeesGetter = async (): Promise<CreatorFee[]> => {
    try {
      if (!ethers.isAddress(connectedAddress))
        throw new Error("No account connected");
      setFeesLoading(true);
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
    setFeesLoading(false);
  };
  useAsyncEffect(creatorFeesGetter, creatorFeesSetter, [connectedAddress]);

  const emptyMessageBox = () => {
    if (!ethers.isAddress(connectedAddress)) {
      return (
        <div className="empty-box">
          <h6 className="mb-4 font-semibold text-lg">
            Sign in to see your rewards
          </h6>
          <SignInButton />
        </div>
      );
    }
    if (feesLoading) {
      return (
        <div className="justify-center text-center w-full py-8">
          <h6 className="font-semibold text-lg text-center inline-flex gap-2 justify-self-center">
            <span className="loading loading-spinner"></span>
            Loading Rewards...
          </h6>
        </div>
      );
    }
    return (
      <div className="empty-box">
        <h6 className="mb-4 font-semibold text-lg">
          🥲 You have no rewards (yet!)
        </h6>
        <p>
          <Link
            href={"/sell"}
            className="text-primary font-bold cursor-pointer"
          >
            Create an offer
          </Link>{" "}
          to earn rewards
        </p>
      </div>
    );
  };

  return (
    <Fragment>
      <div className="page-container">
        <h1 className="text-2xl font-bold mb-4 justify-self-center">
          Claim your rewards
        </h1>
        {creatorFees.length > 0 ? (
          <FeesTable
            creatorFees={creatorFees}
            onSelectFee={(fee: CreatorFee) => setSelectedFee(fee)}
          />
        ) : (
          emptyMessageBox()
        )}
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
