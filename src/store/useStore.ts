import Offer from "@/app/types/Offer";
import { CreatorFee, Deposit } from "@/utils/queries";
import { create } from "zustand";

interface StoreState {
  walletDialogOpen: boolean;
  setWalletDialogOpen: (bool: boolean) => void;
  offers: Offer[];
  setOffers: (arr: Offer[]) => void;
  deposits: Deposit[];
  setDeposits: (arr: Deposit[]) => void;
  creatorFees: CreatorFee[];
  setCreatorFees: (arr: CreatorFee[]) => void;
}

const useStore = create<StoreState>((set) => ({
  walletDialogOpen: false,
  setWalletDialogOpen: (bool) => set((state) => ({ walletDialogOpen: bool })),
  offers: [],
  setOffers: (array) => set((state) => ({ offers: array })),
  deposits: [],
  setDeposits: (array) => set((state) => ({ deposits: array })),
  creatorFees: [],
  setCreatorFees: (array) => set((state) => ({ creatorFees: array })),
}));

export default useStore;
