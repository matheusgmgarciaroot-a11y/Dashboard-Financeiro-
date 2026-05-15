import { create } from "zustand";
import { Transaction } from "@/types/finance";

interface UIState {
  isTransactionModalOpen: boolean;
  editingTransaction: Transaction | null;
  openTransactionModal: (tx?: Transaction) => void;
  closeTransactionModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isTransactionModalOpen: false,
  editingTransaction: null,
  openTransactionModal: (tx) => set({ 
    isTransactionModalOpen: true, 
    editingTransaction: tx || null 
  }),
  closeTransactionModal: () => set({ 
    isTransactionModalOpen: false, 
    editingTransaction: null 
  }),
}));
