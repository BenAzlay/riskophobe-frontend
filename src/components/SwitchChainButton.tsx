"use client";

import { base } from "viem/chains";
import { useSwitchChain } from "wagmi";

const SwitchChainButton = () => {
  const { switchChain } = useSwitchChain();

  return (
    <button
      className="btn btn-primary w-full"
      onClick={() => switchChain({ chainId: base.id })}
    >
      SWITCH TO BASE
    </button>
  );
};

export default SwitchChainButton;
