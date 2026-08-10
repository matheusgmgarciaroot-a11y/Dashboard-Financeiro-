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
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";

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
  fetchInitialData: () => Promise<void>;
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
      selectedDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      transactions: MOCK_TRANSACTIONS,
      accounts: MOCK_ACCOUNTS,
      investments: INITIAL_INVESTMENTS,
      reserve: INITIAL_RESERVE,
      summary: calculateSummary(MOCK_TRANSACTIONS, MOCK_ACCOUNTS, INITIAL_RESERVE),
      projections: calculateProjections(MOCK_TRANSACTIONS, MOCK_ACCOUNTS, INITIAL_RESERVE),

      fetchInitialData: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        // Fetch Accounts
        const { data: accountsData } = await supabase
          .from("accounts")
          .select("*")
          .eq("user_id", user.id);

        let finalAccounts = accountsData || [];

        // Auto-seed contas iniciais se o usuário for novo (array vazio)
        if (finalAccounts.length === 0) {
          const defaultAccounts = [
            { name: "Conta Matheus", balance: 0, type: "checking", owner: "Matheus", institution: "Itaú", currency: "BRL", color: "#DFFF00", user_id: user.id },
            { name: "Conta Heloisa", balance: 0, type: "checking", owner: "Heloisa", institution: "Nubank", currency: "BRL", color: "#FF69B4", user_id: user.id },
            { name: "Dinheiro Físico", balance: 0, type: "cash", owner: "Ambos", institution: "Carteira", currency: "BRL", color: "#4ADE80", user_id: user.id },
            { name: "Reserva Emergência", balance: 0, type: "savings", owner: "Ambos", institution: "Nubank", currency: "BRL", color: "#0066FF", user_id: user.id }
          ];
          
          const { data: insertedAccounts } = await supabase
            .from("accounts")
            .insert(defaultAccounts)
            .select();
            
          if (insertedAccounts) {
            finalAccounts = insertedAccounts;
          }
        }

        // Fetch Transactions
        const { data: txData } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id);

        // Fetch Investments
        const { data: invData } = await supabase
          .from("investments")
          .select("*")
          .eq("user_id", user.id);

        if (finalAccounts) set({ accounts: finalAccounts as any });
        if (txData) set({ transactions: txData as any });
        if (invData) set({ investments: invData as any });
        
        get().refreshSummary();
      },

      addTransaction: async (txData) => {
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

        const user = useAuthStore.getState().user;
        if (user) {
          // Salvar no Supabase
          const payload = generatedTransactions.map(tx => ({
            ...tx,
            user_id: user.id,
            installments_current: tx.installments?.current,
            installments_total: tx.installments?.total,
            expense_type: tx.expenseType,
            payment_method: tx.paymentMethod,
            account_name: tx.account,
            date: new Date(tx.date).toISOString().split('T')[0] // Garante formato de data
          }));
          
          // Remove campos que não vão pro DB
          payload.forEach((p: any) => {
            delete p.expenseType;
            delete p.paymentMethod;
            delete p.account;
            delete p.installments;
          });

          await supabase.from("transactions").insert(payload);
        }

        set({ 
          transactions: newTransactions,
          accounts: newAccounts,
          reserve: newReserve
        });
        
        get().refreshSummary();
      },

      updateTransaction: async (id, txData) => {
        const { transactions } = get();
        const newTransactions = transactions.map(t => 
          t.id === id ? { ...t, ...txData } : t
        );
        
        const user = useAuthStore.getState().user;
        if (user) {
          const payload: any = { ...txData };
          if (payload.expenseType !== undefined) { payload.expense_type = payload.expenseType; delete payload.expenseType; }
          if (payload.paymentMethod !== undefined) { payload.payment_method = payload.paymentMethod; delete payload.paymentMethod; }
          if (payload.account !== undefined) { payload.account_name = payload.account; delete payload.account; }
          if (payload.installments !== undefined) { 
            payload.installments_current = payload.installments.current;
            payload.installments_total = payload.installments.total;
            delete payload.installments;
          }
          if (payload.date !== undefined) { payload.date = new Date(payload.date).toISOString().split('T')[0]; }

          await supabase.from("transactions").update(payload).eq("id", id).eq("user_id", user.id);
        }

        set({ transactions: newTransactions });
        get().refreshSummary();
      },

      deleteTransaction: async (id) => {
        const newTransactions = get().transactions.filter(tx => tx.id !== id);
        
        const user = useAuthStore.getState().user;
        if (user) {
          await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id);
        }

        set({ transactions: newTransactions });
        get().refreshSummary();
      },

      toggleTransactionStatus: async (id) => {
        const { transactions } = get();
        const tx = transactions.find(t => t.id === id);
        if (!tx) return;
        
        const newStatus = tx.status === "completed" ? "pending" : "completed";
        const newTransactions = transactions.map(t => 
          t.id === id ? { ...t, status: newStatus as TransactionStatus } : t
        );
        
        const user = useAuthStore.getState().user;
        if (user) {
          await supabase.from("transactions").update({ status: newStatus }).eq("id", id).eq("user_id", user.id);
        }

        set({ transactions: newTransactions });
        get().refreshSummary();
      },

      updateAccountBalance: async (id, amount) => {
        const newAccounts = get().accounts.map(acc => 
          acc.id === id ? { ...acc, balance: amount } : acc
        );
        
        const user = useAuthStore.getState().user;
        if (user) {
          await supabase.from("accounts").update({ balance: amount }).eq("id", id).eq("user_id", user.id);
        }

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
    }
  )
);
