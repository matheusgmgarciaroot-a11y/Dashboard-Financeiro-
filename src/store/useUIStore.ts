import { create } from "zustand";

interface UIState {
  isTransactionModalOpen: boolean;
  openTransactionModal: () => void;
  closeTransactionModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isTransactionModalOpen: false,
  openTransactionModal: () => set({ isTransactionModalOpen: true }),
  closeTransactionModal: () => set({ isTransactionModalOpen: false }),
}));
