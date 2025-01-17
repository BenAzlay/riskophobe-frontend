import Offer from "@/app/types/Offer";
import { Deposit } from "@/utils/queries";
import { create } from "zustand";

interface StoreState {
  walletDialogOpen: boolean;
  setWalletDialogOpen: (bool: boolean) => void;
  offers: Offer[];
  setOffers: (arr: Offer[]) => void;
  deposits: Deposit[];
  setDeposits: (arr: Deposit[]) => void;
}

const useStore = create<StoreState>((set) => ({
  walletDialogOpen: false,
  setWalletDialogOpen: (bool) => set((state) => ({ walletDialogOpen: bool })),
  offers: [],
  setOffers: (array) => set((state) => ({ offers: array })),
  deposits: [],
  setDeposits: (array) => set((state) => ({ deposits: array })),
}));

export default useStore;
