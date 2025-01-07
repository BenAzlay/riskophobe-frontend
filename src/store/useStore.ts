import { create } from "zustand";

interface StoreState {
  walletDialogOpen: boolean;
  setWalletDialogOpen: (bool: boolean) => void;
}

const useStore = create<StoreState>((set) => ({
  walletDialogOpen: false,
  setWalletDialogOpen: (bool) => set((state) => ({ walletDialogOpen: bool })),
}));

export default useStore;
