export type TransactionType = "income" | "expense" | "transfer";
export type TransactionStatus = "completed" | "pending" | "cancelled" | "late";
export type Responsibility = "Matheus" | "Heloisa" | "Ambos";
export type Priority = "essential" | "important" | "optional";

export type ExpenseCategory = 
  | "moradia" | "mercado" | "alimentacao" | "transporte" | "saude" 
  | "lazer" | "assinaturas" | "cartao_credito" | "investimentos" 
  | "pets" | "compras" | "outros";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: ExpenseCategory | string;
  expenseType: "fixo" | "variavel" | "parcelado" | "eventual";
  type: TransactionType;
  status: TransactionStatus;
  account: string;
  responsible: Responsibility;
  priority: Priority;
  paymentMethod: string;
  observations?: string;
  installments?: {
    current: number;
    total: number;
  };
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  type: "checking" | "savings" | "investment" | "credit" | "cash";
  owner: Responsibility;
  institution: string;
  currency: string;
  color?: string;
}

export interface Investment {
  id: string;
  name: string;
  type: string;
  amountInvested: number;
  monthlyAport: number;
  expectedReturn: number;
  goal: string;
  currentValue: number;
  responsible: Responsibility;
}

export interface FinancialReserve {
  currentAmount: number;
  goalAmount: number;
  monthlyContribution: number;
  monthlyExpenses: number;
}

export interface SimulationRequest {
  name: string;
  totalValue: number;
  isInstallment: boolean;
  installmentsCount: number;
  firstPaymentDate: string;
  category: string;
  priority: Priority;
  responsible: Responsibility;
  isEssential: boolean;
}

export interface SimulationResult {
  canAssume: "safe" | "caution" | "not-recommended";
  reason: string;
  explanation: string;
  impactCurrentMonth: number;
  impactFutureMonths: number;
  newProjectedBalance: number;
  incomeCommitmentPercent: number;
  riskLevel: "low" | "medium" | "high";
  affectedMonths: string[];
  savingsSuggestion?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  essentialExpenses: number;
  optionalExpenses: number;
  paidExpenses: number;
  pendingExpenses: number;
  projectedEndBalance: number;
  currentCash: number;
  reserveBalance: number;
  commitmentPercent: number;
  healthScore: number;
  healthStatus: "healthy" | "warning" | "critical";
}
