import { Transaction, Account, FinancialSummary } from "@/types/finance";

export const MOCK_SUMMARY: FinancialSummary = {
  totalIncome: 0,
  totalExpenses: 0,
  essentialExpenses: 0,
  optionalExpenses: 0,
  paidExpenses: 0,
  pendingExpenses: 0,
  projectedEndBalance: 0,
  realBalance: 0,
  currentCash: 0,
  reserveBalance: 0,
  commitmentPercent: 0,
  healthScore: 100,
  healthStatus: "healthy",
};

export const MOCK_ACCOUNTS: Account[] = [];

export const MOCK_TRANSACTIONS: Transaction[] = [];

export const MOCK_CHART_DATA = [
  { name: "Mês Atual", receita: 0, despesa: 0 }
];
