import { create } from "zustand";
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
import { calculateSummary, calculateProjections } from "@/lib/calculations";
import { getSimulationRecommendation } from "@/lib/recommendations";
import { supabase } from "@/lib/supabase";

interface FinanceState {
  transactions: Transaction[];
  accounts: Account[];
  investments: Investment[];
  reserve: FinancialReserve;
  summary: FinancialSummary;
  projections: any[];
  selectedDate: string;
  isLoadingData: boolean;
  
  // Actions
  fetchInitialData: () => Promise<void>;
  addAccount: (acc: Omit<Account, "id" | "balance">) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (id: string, tx: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  toggleTransactionStatus: (id: string) => Promise<void>;
  updateAccountBalance: (id: string, amount: number) => Promise<void>;
  updateReserve: (reserve: Partial<FinancialReserve>) => void;
  runSimulation: (request: SimulationRequest) => SimulationResult;
  setSelectedDate: (date: string) => void;
  replicateFixedExpenses: () => Promise<void>;
  refreshSummary: () => void;
}

const INITIAL_RESERVE: FinancialReserve = {
  currentAmount: 0,
  goalAmount: 0,
  monthlyContribution: 0,
  monthlyExpenses: 0,
};

export const useFinanceStore = create<FinanceState>((set, get) => ({
  selectedDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
  transactions: [],
  accounts: [],
  investments: [],
  reserve: INITIAL_RESERVE,
  isLoadingData: false,
  summary: calculateSummary([], [], INITIAL_RESERVE),
  projections: calculateProjections([], [], INITIAL_RESERVE),

  fetchInitialData: async () => {
    set({ isLoadingData: true });
    
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    
    if (!user) {
      set({ isLoadingData: false });
      return;
    }

    try {
      const [accountsRes, transactionsRes, investmentsRes] = await Promise.all([
        supabase.from('accounts').select('*').order('created_at', { ascending: true }),
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('investments').select('*').order('created_at', { ascending: true })
      ]);

      if (accountsRes.error) throw accountsRes.error;
      if (transactionsRes.error) throw transactionsRes.error;
      if (investmentsRes.error) throw investmentsRes.error;

      // Converter camelCase para banco e vice-versa se precisar, mas aqui assumimos que os nomes são os mesmos
      // No schema SQL usamos snake_case. Precisamos mapear para as interfaces do ts (camelCase)
      const mappedAccounts: Account[] = accountsRes.data.map(acc => ({
        id: acc.id,
        name: acc.name,
        balance: Number(acc.balance),
        type: acc.type,
        owner: acc.owner,
        institution: acc.institution,
        currency: acc.currency,
        color: acc.color
      }));

      const mappedTransactions: Transaction[] = transactionsRes.data.map(tx => ({
        id: tx.id,
        date: tx.date,
        description: tx.description,
        amount: Number(tx.amount),
        category: tx.category,
        expenseType: tx.expense_type,
        type: tx.type,
        status: tx.status,
        account: tx.account_name || "", // Usamos o nome da conta para compatibilidade
        responsible: tx.responsible,
        priority: tx.priority,
        paymentMethod: tx.payment_method,
        observations: tx.observations,
        installments: tx.installments_total ? { current: tx.installments_current, total: tx.installments_total } : undefined
      }));

      const mappedInvestments: Investment[] = investmentsRes.data.map(inv => ({
        id: inv.id,
        name: inv.name,
        type: inv.type,
        amountInvested: Number(inv.amount_invested),
        monthlyAport: Number(inv.monthly_aport),
        expectedReturn: Number(inv.expected_return),
        goal: inv.goal,
        currentValue: Number(inv.current_value),
        responsible: inv.responsible
      }));

      set({ 
        accounts: mappedAccounts, 
        transactions: mappedTransactions,
        investments: mappedInvestments
      });
      
      get().refreshSummary();
    } catch (error) {
      console.error("Erro ao carregar dados do Supabase:", error);
    } finally {
      set({ isLoadingData: false });
    }
  },

  addAccount: async (accData) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return;

    const { data, error } = await supabase.from('accounts').insert({
      user_id: user.id,
      name: accData.name,
      type: accData.type,
      owner: accData.owner,
      institution: accData.institution,
      currency: accData.currency || 'BRL',
      color: accData.color,
      balance: 0
    }).select().single();

    if (error) {
      console.error("Erro ao adicionar conta:", error);
      return;
    }

    const newAccount: Account = {
      id: data.id,
      name: data.name,
      balance: Number(data.balance),
      type: data.type,
      owner: data.owner,
      institution: data.institution,
      currency: data.currency,
      color: data.color
    };

    set({ accounts: [...get().accounts, newAccount] });
    get().refreshSummary();
  },

  addTransaction: async (txData) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return;

    // Achar a conta pelo nome para salvar o ID
    const accountInfo = get().accounts.find(a => a.name === txData.account);

    if (txData.expenseType === "parcelado" && txData.installments) {
      const { current, total } = txData.installments;
      const remaining = total - current;
      const baseDate = new Date(txData.date || new Date().toISOString());

      const inserts = [];
      for (let i = 0; i <= remaining; i++) {
        const futureDate = new Date(baseDate);
        futureDate.setMonth(futureDate.getMonth() + i);
        
        inserts.push({
          user_id: user.id,
          date: futureDate.toISOString(),
          description: i === 0 ? `${txData.description} (${current}/${total})` : `${txData.description} (${current + i}/${total})`,
          amount: txData.amount,
          category: txData.category,
          expense_type: txData.expenseType,
          type: txData.type,
          status: i === 0 ? txData.status : "pending",
          account_id: accountInfo?.id || null,
          account_name: txData.account,
          responsible: txData.responsible,
          priority: txData.priority,
          payment_method: txData.paymentMethod,
          observations: txData.observations,
          installments_current: current + i,
          installments_total: total
        });
      }

      await supabase.from('transactions').insert(inserts);
    } else {
      await supabase.from('transactions').insert({
        user_id: user.id,
        date: txData.date || new Date().toISOString(),
        description: txData.description,
        amount: txData.amount,
        category: txData.category,
        expense_type: txData.expenseType,
        type: txData.type,
        status: txData.status,
        account_id: accountInfo?.id || null,
        account_name: txData.account,
        responsible: txData.responsible,
        priority: txData.priority,
        payment_method: txData.paymentMethod,
        observations: txData.observations
      });
    }

    // Após adicionar, buscar tudo de novo (ou apenas atualizar local, aqui buscamos de novo para garantir)
    await get().fetchInitialData();
  },

  updateTransaction: async (id, txData) => {
    // Montar objeto de update mapeando snake_case
    const updatePayload: any = {};
    if (txData.description) updatePayload.description = txData.description;
    if (txData.amount) updatePayload.amount = txData.amount;
    if (txData.status) updatePayload.status = txData.status;
    if (txData.date) updatePayload.date = txData.date;
    // (Poderíamos adicionar os outros campos conforme a necessidade)

    const { error } = await supabase.from('transactions').update(updatePayload).eq('id', id);
    if (!error) {
      await get().fetchInitialData();
    }
  },

  deleteTransaction: async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) {
      const newTransactions = get().transactions.filter(tx => tx.id !== id);
      set({ transactions: newTransactions });
      get().refreshSummary();
    }
  },

  toggleTransactionStatus: async (id) => {
    const tx = get().transactions.find(t => t.id === id);
    if (!tx) return;
    
    const newStatus = tx.status === "completed" ? "pending" : "completed";
    const { error } = await supabase.from('transactions').update({ status: newStatus }).eq('id', id);
    
    if (!error) {
      const newTransactions = get().transactions.map(t => 
        t.id === id ? { ...t, status: newStatus as TransactionStatus } : t
      );
      set({ transactions: newTransactions });
      get().refreshSummary();
    }
  },

  updateAccountBalance: async (id, amount) => {
    const { error } = await supabase.from('accounts').update({ balance: amount }).eq('id', id);
    if (!error) {
      const newAccounts = get().accounts.map(acc => 
        acc.id === id ? { ...acc, balance: amount } : acc
      );
      set({ accounts: newAccounts });
      get().refreshSummary();
    }
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

  replicateFixedExpenses: async () => {
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

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return;

    const inserts: any[] = [];

    fixedExpenses.forEach(fixed => {
      const alreadyExists = currentMonthTransactions.some(t => t.description === fixed.description);
      if (!alreadyExists) {
        inserts.push({
          user_id: user.id,
          date: targetDate.toISOString(),
          description: fixed.description,
          amount: fixed.amount,
          category: fixed.category,
          expense_type: fixed.expenseType,
          type: fixed.type,
          status: "pending",
          account_name: fixed.account,
          responsible: fixed.responsible,
          priority: fixed.priority,
          payment_method: fixed.paymentMethod
        });
      }
    });

    if (inserts.length > 0) {
      await supabase.from('transactions').insert(inserts);
      await get().fetchInitialData();
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
}));
