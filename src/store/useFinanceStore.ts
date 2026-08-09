import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { 
  Transaction, 
  Account, 
  Investment, 
  FinancialReserve, 
  FinancialSummary,
  SimulationRequest,
  SimulationResult,
  TransactionStatus
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
  selectedDate: string; // ISO string do primeiro dia do mês
  
  // Actions
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  toggleTransactionStatus: (id: string) => void;
  updateAccountBalance: (id: string, amount: number) => void;
  updateReserve: (reserve: Partial<FinancialReserve>) => void;
  runSimulation: (request: SimulationRequest) => SimulationResult;
  setSelectedDate: (date: string) => void;
  replicateFixedExpenses: () => void;
  refreshSummary: () => void;
}

// Initial Mock Data from Spreadsheet
const INITIAL_RESERVE: FinancialReserve = {
  currentAmount: 0,
  goalAmount: 0,
  monthlyContribution: 0,
  monthlyExpenses: 0,
};

const INITIAL_INVESTMENTS: Investment[] = [];

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      selectedDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      transactions: MOCK_TRANSACTIONS,
      accounts: MOCK_ACCOUNTS,
      investments: INITIAL_INVESTMENTS,
      reserve: INITIAL_RESERVE,
      summary: calculateSummary(MOCK_TRANSACTIONS, MOCK_ACCOUNTS, INITIAL_RESERVE),
      projections: calculateProjections(MOCK_TRANSACTIONS, MOCK_ACCOUNTS, INITIAL_RESERVE),

      addTransaction: (txData) => {
        const { transactions, accounts, reserve } = get();
        const generatedTransactions: Transaction[] = [];
        
        if (txData.expenseType === "parcelado" && txData.installments) {
          const { current, total } = txData.installments;
          const remaining = total - current;
          const baseDate = new Date(txData.date || new Date().toISOString());

          const currentTx: Transaction = {
            ...txData,
            id: Math.random().toString(36).substring(2, 9),
            description: `${txData.description} (${current}/${total})`,
            date: baseDate.toISOString(),
          };
          generatedTransactions.push(currentTx);

          for (let i = 1; i <= remaining; i++) {
            const futureDate = new Date(baseDate);
            futureDate.setMonth(futureDate.getMonth() + i);
            
            generatedTransactions.push({
              ...txData,
              id: Math.random().toString(36).substring(2, 9),
              description: `${txData.description} (${current + i}/${total})`,
              date: futureDate.toISOString(),
              status: "pending",
              installments: {
                current: current + i,
                total: total
              }
            });
          }
        } else {
          generatedTransactions.push({
            ...txData,
            id: Math.random().toString(36).substring(2, 9),
            date: txData.date || new Date().toISOString(),
          });
        }
        
        const newTransactions = [...generatedTransactions, ...transactions];
        
        const newAccounts = accounts.map(acc => {
          if (acc.name === txData.account) {
            const amount = txData.type === "income" ? txData.amount : -txData.amount;
            return { ...acc, balance: acc.balance + amount };
          }
          return acc;
        });

        const newReserve = { ...reserve };
        if (txData.category === "reserva_financeira") {
          newReserve.currentAmount += txData.amount;
        }

        set({ 
          transactions: newTransactions,
          accounts: newAccounts,
          reserve: newReserve
        });
        
        get().refreshSummary();
      },

      updateTransaction: (id, txData) => {
        const { transactions } = get();
        const newTransactions = transactions.map(t => 
          t.id === id ? { ...t, ...txData } : t
        );
        set({ transactions: newTransactions });
        get().refreshSummary();
      },

      deleteTransaction: (id) => {
        const newTransactions = get().transactions.filter(tx => tx.id !== id);
        set({ transactions: newTransactions });
        get().refreshSummary();
      },

      toggleTransactionStatus: (id) => {
        const { transactions } = get();
        const newTransactions = transactions.map(t => 
          t.id === id ? { ...t, status: (t.status === "completed" ? "pending" : "completed") as TransactionStatus } : t
        );
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

      setSelectedDate: (date) => {
        set({ selectedDate: date });
        get().refreshSummary();
      },

      replicateFixedExpenses: () => {
        const { transactions, selectedDate } = get();
        const targetDate = new Date(selectedDate);
        const prevMonthDate = new Date(targetDate);
        prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);

        const prevMonthTransactions = transactions.filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === prevMonthDate.getMonth() && d.getFullYear() === prevMonthDate.getFullYear();
        });

        const fixedExpenses = prevMonthTransactions.filter(t => t.expenseType === "fixo");
        
        const currentMonthTransactions = transactions.filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === targetDate.getMonth() && d.getFullYear() === targetDate.getFullYear();
        });

        const newTxs: Transaction[] = [];

        fixedExpenses.forEach(fixed => {
          const alreadyExists = currentMonthTransactions.some(t => t.description === fixed.description);
          if (!alreadyExists) {
            newTxs.push({
              ...fixed,
              id: Math.random().toString(36).substring(2, 9),
              date: targetDate.toISOString(),
              status: "pending"
            });
          }
        });

        if (newTxs.length > 0) {
          set({ transactions: [...newTxs, ...transactions] });
          get().refreshSummary();
        }
      },

      refreshSummary: () => {
        const { transactions, accounts, reserve, selectedDate } = get();
        const targetDate = new Date(selectedDate);
        set({ 
          summary: calculateSummary(transactions, accounts, reserve, targetDate),
          projections: calculateProjections(transactions, accounts, reserve)
        });
      }
    }),
    {
      name: "carbon-finance-storage",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
