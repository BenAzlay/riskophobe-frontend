"use client";

import Modal from "@/components/Modal";
import Navbar from "@/components/Navbar";
import useStore from "@/store/useStore";
import { Fragment, useEffect } from "react";
import { Connector, useConnect, useDisconnect } from "wagmi";

function App() {
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const { walletDialogOpen, setWalletDialogOpen, setOffers } = useStore();

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch('/api/fetchOffers');
        if (!response.ok) {
          throw new Error('Failed to fetch offers');
        }
        const data = await response.json();
        console.log(`data:`, data)
        setOffers(data.offers);
      } catch (e) {
        console.error("fetchOffers ERROR", e);
      }
    };

    fetchOffers();
  }, []);

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
