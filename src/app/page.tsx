"use client";

import Modal from "@/components/Modal";
import Navbar from "@/components/Navbar";
import useStore from "@/store/useStore";
import { Fragment } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

function App() {
  const account = useAccount();
  const { connect, connectors, isPending } = useConnect();

  const { walletDialogOpen, setWalletDialogOpen } = useStore();

  return (
    <Fragment>
      <Navbar />
      <button className="btn btn-primary">HELLO</button>
      {/* Wallet Connect Dialog */}
      <Modal
        visible={walletDialogOpen}
        title={"Select a Wallet"}
        onClose={() => setWalletDialogOpen(false)}
      >
        <ul>
          {connectors.map((connector) => (
            <li key={connector.id} className="mb-2">
              <button
                className="btn btn-secondary w-full"
                disabled={!isPending}
                onClick={() => connect({ connector })}
              >
                {connector.name}
                {isPending && "..."}
              </button>
            </li>
          ))}
        </ul>
      </Modal>
    </Fragment>
  );
}

export default App;
