import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { 
  Transaction, 
  Account, 
  Investment, 
  FinancialReserve, 
  FinancialSummary,
  SimulationRequest,
  SimulationResult
} from "@/types/finance";
import { MOCK_TRANSACTIONS, MOCK_ACCOUNTS } from "@/data/mock";
import { calculateSummary, calculateProjections } from "@/lib/calculations";
import { getSimulationRecommendation } from "@/lib/recommendations";

interface FinanceState {
  transactions: Transaction[];
  accounts: Account[];
  investments: Investment[];
  reserve: FinancialReserve;
  summary: FinancialSummary;
  projections: any[];
  
  // Actions
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  updateAccountBalance: (id: string, amount: number) => void;
  updateReserve: (reserve: Partial<FinancialReserve>) => void;
  runSimulation: (request: SimulationRequest) => SimulationResult;
  refreshSummary: () => void;
}

// Initial Mock Data from Spreadsheet
const INITIAL_RESERVE: FinancialReserve = {
  currentAmount: 3520, // Conforme informado pelo usuário
  goalAmount: 27504.40, // Conforme planilha
  monthlyContribution: 519.03, // Reserva financeira 5% da planilha
  monthlyExpenses: 9931.05, // Total geral de despesas da planilha
};

const INITIAL_INVESTMENTS: Investment[] = [
  {
    id: "1",
    name: "Ações Brasil",
    type: "Renda Variável",
    amountInvested: 25000,
    monthlyAport: 1000,
    expectedReturn: 12,
    goal: "Aposentadoria",
    currentValue: 28000,
    responsible: "Ambos",
  }
];

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: MOCK_TRANSACTIONS,
      accounts: MOCK_ACCOUNTS,
      investments: INITIAL_INVESTMENTS,
      reserve: INITIAL_RESERVE,
      summary: calculateSummary(MOCK_TRANSACTIONS, MOCK_ACCOUNTS, INITIAL_RESERVE, INITIAL_INVESTMENTS),
      projections: calculateProjections(MOCK_TRANSACTIONS, MOCK_ACCOUNTS, INITIAL_RESERVE),

      addTransaction: (txData) => {
        const newTx: Transaction = {
          ...txData,
          id: Math.random().toString(36).substring(2, 9),
          date: txData.date || new Date().toISOString(),
        };
        const newTransactions = [newTx, ...get().transactions];
        set({ transactions: newTransactions });
        get().refreshSummary();
      },

      deleteTransaction: (id) => {
        const newTransactions = get().transactions.filter(tx => tx.id !== id);
        set({ transactions: newTransactions });
        get().refreshSummary();
      },

      updateAccountBalance: (id, amount) => {
        const newAccounts = get().accounts.map(acc => 
          acc.id === id ? { ...acc, balance: amount } : acc
        );
        set({ accounts: newAccounts });
        get().refreshSummary();
      },

      updateReserve: (newReserve) => {
        set({ reserve: { ...get().reserve, ...newReserve } });
        get().refreshSummary();
      },

      runSimulation: (request) => {
        return getSimulationRecommendation(request, get().summary, get().reserve);
      },

      refreshSummary: () => {
        const { transactions, accounts, reserve, investments } = get();
        set({ 
          summary: calculateSummary(transactions, accounts, reserve, investments),
          projections: calculateProjections(transactions, accounts, reserve)
        });
      }
    }),
    {
      name: "carbon-finance-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
