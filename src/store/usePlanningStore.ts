import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface PlannedExpense {
  id: string;
  name: string;
  amount: number;
  isEssential: boolean;
  isPaid: boolean;
}

interface PlanningState {
  expenses: PlannedExpense[];
  
  // Actions
  addExpense: (expense: Omit<PlannedExpense, "id" | "isPaid">) => void;
  updateExpense: (id: string, expense: Partial<PlannedExpense>) => void;
  removeExpense: (id: string) => void;
  togglePaid: (id: string) => void;
  resetMonth: () => void; // Unchecks all as paid
}

export const usePlanningStore = create<PlanningState>()(
  persist(
    (set) => ({
      expenses: [
        { id: "1", name: "Aluguel", amount: 1500, isEssential: true, isPaid: false },
        { id: "2", name: "Luz", amount: 200, isEssential: true, isPaid: false },
        { id: "3", name: "Internet", amount: 100, isEssential: true, isPaid: false },
        { id: "4", name: "Netflix", amount: 50, isEssential: false, isPaid: false },
      ],
      
      addExpense: (expense) => set((state) => ({
        expenses: [
          ...state.expenses,
          { ...expense, id: crypto.randomUUID(), isPaid: false }
        ]
      })),
      
      updateExpense: (id, updatedExpense) => set((state) => ({
        expenses: state.expenses.map(e => e.id === id ? { ...e, ...updatedExpense } : e)
      })),
      
      removeExpense: (id) => set((state) => ({
        expenses: state.expenses.filter(e => e.id !== id)
      })),
      
      togglePaid: (id) => set((state) => ({
        expenses: state.expenses.map(e => e.id === id ? { ...e, isPaid: !e.isPaid } : e)
      })),
      
      resetMonth: () => set((state) => ({
        expenses: state.expenses.map(e => ({ ...e, isPaid: false }))
      })),
    }),
    {
      name: "carbon-planning-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
