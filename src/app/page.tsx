"use client";

import Modal from "@/components/Modal";
import Navbar from "@/components/Navbar";
import useStore from "@/store/useStore";
import { Fragment } from "react";
import { Connector, useAccount, useConnect, useConnectors, useDisconnect } from "wagmi";

function App() {
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const { walletDialogOpen, setWalletDialogOpen } = useStore();

  const handleConnect = async (connector: Connector) => {
    console.log("connector:", connector);
    connect(
      { connector },
      {
        onError: (error) => {
          console.error("WAGMI error", error);
          disconnect();
        },
        onSuccess: () => {
          setWalletDialogOpen(false);
        },
      }
    );
  };

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
                onClick={() => handleConnect(connector)}
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
