"use client";

import { Connector, useConnect, useDisconnect } from "wagmi";
import useStore from "@/store/useStore";
import Modal from "@/components/Modal";
import { FC } from "react";

const ConnectWalletModal: FC = () => {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { walletDialogOpen, setWalletDialogOpen } = useStore();

  const handleConnect = async (connector: Connector) => {
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
    <Modal
      visible={walletDialogOpen}
      title={"Select a Wallet"}
      onClose={() => setWalletDialogOpen(false)}
    >
      <ul>
        {connectors.map((connector) => (
          <li key={connector.id} className="mb-2">
            <button
              className="btn btn-secondary btn-outline w-full text-start"
              onClick={() => handleConnect(connector)}
            >
              {!!connector?.icon ? (
                <img
                  src={connector.icon}
                  width={18}
                  height={18}
                  className="rounded-md"
                />
              ) : null}
              {connector.name}
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
};

export default ConnectWalletModal;
