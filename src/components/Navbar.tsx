import useStore from "@/store/useStore";
import React, { Fragment, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import Modal from "./Modal";
import { addressShorten } from "@/utils/utilFunc";

const Navbar: React.FC = () => {
  const { setWalletDialogOpen } = useStore();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { address: connectedAddress } = useAccount();
  const { disconnectAsync } = useDisconnect();

  const handleDisconnect = async () => {
    try {
      await disconnectAsync();
      console.log('Disconnected successfully');
      setLogoutDialogOpen(false); // Close the dialog only on successful disconnect
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const logoutDialog = () => {
    return (
      <Modal
        visible={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
      >
        <button className="btn btn-primary" onClick={() => handleDisconnect()}>
          SIGN OUT
        </button>
      </Modal>
    );
  };

  return (
    <Fragment>
      <div className="navbar bg-neutral text-neutral-content px-4 shadow-md">
        {/* Left side (Desktop: Full logo and navlinks | Mobile: Icon only) */}
        <div className="flex-1">
          <div className="flex items-center">
            <div className="text-secondary font-nimbus text-2xl font-bold">
              <span className="hidden md:inline">Riskophobe</span>
              <span className="md:hidden">R</span>
            </div>
            <div className="hidden md:flex ml-8 space-x-4">
              <a href="/offers" className="btn btn-ghost normal-case text-lg">
                Offers
              </a>
              <a
                href="/dashboard"
                className="btn btn-ghost normal-case text-lg"
              >
                Dashboard
              </a>
            </div>
          </div>
        </div>

        {/* Right side: Connect Wallet Button */}
        <div className="flex-none">
          <button
            className="btn btn-primary"
            onClick={() =>
              !!connectedAddress
                ? setLogoutDialogOpen(true)
                : setWalletDialogOpen(true)
            }
          >
            {!!connectedAddress ? addressShorten(connectedAddress) : "Sign in"}
          </button>
        </div>
      </div>
      {logoutDialog()}
    </Fragment>
  );
};

export default Navbar;
