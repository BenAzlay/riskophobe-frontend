import CreatorFee from "@/app/types/CreatorFee";
import Offer from "@/app/types/Offer";
import { Deposit } from "@/utils/queries";
import { create } from "zustand";

interface StoreState {
  walletDialogOpen: boolean;
  setWalletDialogOpen: (bool: boolean) => void;
  offers: Offer[];
  setOffers: (arr: Offer[]) => void;
  updateOffer: (
    offerId: string,
    newSoldTokenAmount: number,
    newCollateralBalance: number
  ) => void;
  deleteOffer: (offerId: string) => void;
  deposits: Deposit[];
  setDeposits: (arr: Deposit[]) => void;
  addDeposit: (deposit: Deposit) => void;
  updateDeposit: (depositId: string, newNetCollateralAmount: number) => void;
  creatorFees: CreatorFee[];
  setCreatorFees: (arr: CreatorFee[]) => void;
}

const useStore = create<StoreState>((set) => ({
  walletDialogOpen: false,
  setWalletDialogOpen: (bool) => set((state) => ({ walletDialogOpen: bool })),
  offers: [],
  setOffers: (array) => set((state) => ({ offers: array })),
  updateOffer: (offerId, newSoldTokenAmount, newCollateralBalance) =>
    set((state) => {
      const updatedOffers = state.offers.map((offer) =>
        offer.id === offerId
          ? {
              ...offer,
              soldTokenAmount: newSoldTokenAmount,
              collateralBalance: newCollateralBalance,
            }
          : offer
      );
      return { offers: updatedOffers };
    }),
  deleteOffer: (offerId) =>
    set((state) => {
      const updatedOffers = state.offers.filter(
        (offer) => offer.id !== offerId
      );
      return { offers: updatedOffers };
    }),
  deposits: [],
  setDeposits: (array) => set((state) => ({ deposits: array })),
  addDeposit: (deposit) =>
    set((state) => {
      return { deposits: [...state.deposits, deposit] };
    }),
  updateDeposit: (depositId, newNetCollateralAmount) =>
    set((state) => {
      const updatedDeposits = state.deposits.map((deposit) =>
        deposit.id === depositId
          ? {
              ...deposit,
              netCollateralAmount: newNetCollateralAmount,
            }
          : deposit
      );
      return { deposits: updatedDeposits };
    }),
  creatorFees: [],
  setCreatorFees: (array) => set((state) => ({ creatorFees: array })),
}));

export default useStore;
