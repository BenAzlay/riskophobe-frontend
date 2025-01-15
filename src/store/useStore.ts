import Offer from "@/app/types/Offer";
import { create } from "zustand";

interface StoreState {
  walletDialogOpen: boolean;
  setWalletDialogOpen: (bool: boolean) => void;
  offers: Offer[];
  setOffers: (array: Offer[]) => void;
}

const useStore = create<StoreState>((set) => ({
  walletDialogOpen: false,
  setWalletDialogOpen: (bool) => set((state) => ({ walletDialogOpen: bool })),
  offers: [],
  setOffers: (array) => set((state) => ({ offers: array })),
}));

export default useStore;
