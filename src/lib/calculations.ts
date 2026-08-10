import { Transaction, FinancialSummary, FinancialReserve, Account } from "@/types/finance";
import { startOfMonth, endOfMonth, isWithinInterval, parseISO, addMonths } from "date-fns";

export const calculateSummary = (
  transactions: Transaction[],
  accounts: Account[],
  reserve: FinancialReserve,
  targetDate: Date = new Date()
): FinancialSummary => {
  const monthInterval = {
    start: startOfMonth(targetDate),
    end: endOfMonth(targetDate),
  };

  const currentMonthTransactions = transactions.filter((tx) =>
    isWithinInterval(parseISO(tx.date), monthInterval)
  );

  const totalIncome = currentMonthTransactions
    .filter((tx) => tx.type === "income")
    .reduce((acc, tx) => acc + tx.amount, 0);

  const paidIncome = currentMonthTransactions
    .filter((tx) => tx.type === "income" && tx.status === "completed")
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalExpenses = currentMonthTransactions
    .filter((tx) => tx.type === "expense")
    .reduce((acc, tx) => acc + tx.amount, 0);

  const paidExpenses = currentMonthTransactions
    .filter((tx) => tx.type === "expense" && tx.status === "completed")
    .reduce((acc, tx) => acc + tx.amount, 0);

  const essentialExpenses = currentMonthTransactions
    .filter((tx) => tx.type === "expense" && (tx.priority === "essential" || tx.priority === "important"))
    .reduce((acc, tx) => acc + tx.amount, 0);

  const optionalExpenses = currentMonthTransactions
    .filter((tx) => tx.type === "expense" && tx.priority === "optional")
    .reduce((acc, tx) => acc + tx.amount, 0);

  const pendingExpenses = currentMonthTransactions
    .filter((tx) => tx.type === "expense" && tx.status === "pending")
    .reduce((acc, tx) => acc + tx.amount, 0);

  // FILTRO: Saldo das contas (sempre atual)
  const currentCash = accounts
    .filter(acc => acc.name !== "Reserva Emergência" && acc.type !== "savings")
    .reduce((acc, accnt) => acc + accnt.balance, 0);
  
  const pendingIncome = totalIncome - paidIncome;
  
  // Saldo Real = O que você tem na conta AGORA (excluindo a reserva)
  const realBalance = currentCash;
  
  // Saldo Projetado = O que você tem AGORA + o que vai entrar - o que vai sair (pendente)
  const projectedEndBalance = currentCash + pendingIncome - pendingExpenses;
  
  const commitmentPercent = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  // Health Score Logic
  let healthScore = 100;
  if (commitmentPercent > 80) healthScore -= 30;
  else if (commitmentPercent > 60) healthScore -= 15;
  
  const monthsCovered = reserve.monthlyExpenses > 0 ? reserve.currentAmount / reserve.monthlyExpenses : 0;
  if (monthsCovered < 3) healthScore -= 20;
  else if (monthsCovered < 6) healthScore -= 10;

  let healthStatus: FinancialSummary["healthStatus"] = "healthy";
  if (healthScore < 50) healthStatus = "critical";
  else if (healthScore < 75) healthStatus = "warning";

  const reserveAccount = accounts.find(a => a.name.includes("Reserva"));
  const actualReserveBalance = reserveAccount ? reserveAccount.balance : reserve.currentAmount;

  return {
    totalIncome,
    totalExpenses,
    essentialExpenses,
    optionalExpenses,
    paidExpenses,
    pendingExpenses,
    balance: totalIncome - totalExpenses,
    reserveBalance: actualReserveBalance,
    commitmentPercent,
    healthScore: Math.max(0, healthScore),
    healthStatus,
  };
};

export const calculateProjections = (
  transactions: Transaction[],
  accounts: Account[],
  reserve: FinancialReserve,
  months: number = 12 // Aumentado para 12 conforme pedido
) => {
  const projections = [];
  let runningCash = accounts
    .filter(acc => acc.id !== "4" && acc.type !== "savings")
    .reduce((acc, a) => acc + a.balance, 0);
  
  // Entradas recorrentes (Base para projeção)
  const recurringIncome = transactions
    .filter(t => t.type === "income" && t.expenseType === "fixo") // Salários/Entradas Fixas
    .reduce((acc, t) => acc + t.amount, 0);
    
  // Despesas Fixas Base
  const fixedExpenses = transactions
    .filter(t => t.type === "expense" && t.expenseType === "fixo")
    .reduce((acc, t) => acc + t.amount, 0);

  for (let i = 1; i <= months; i++) {
    const monthDate = addMonths(new Date(), i);
    const monthInterval = {
      start: startOfMonth(monthDate),
      end: endOfMonth(monthDate),
    };
    
    // Busca transações já agendadas para este mês específico (ex: parcelas geradas)
    const scheduledForMonth = transactions.filter(t => 
      isWithinInterval(parseISO(t.date), monthInterval)
    );

    const monthlyIncome = recurringIncome + scheduledForMonth
      .filter(t => t.type === "income" && t.expenseType !== "fixo")
      .reduce((acc, t) => acc + t.amount, 0);

    const monthlyExpenses = fixedExpenses + scheduledForMonth
      .filter(t => t.type === "expense" && t.expenseType !== "fixo")
      .reduce((acc, t) => acc + t.amount, 0);

    const monthlySobra = monthlyIncome - monthlyExpenses;
    runningCash += monthlySobra;
    
    projections.push({
      month: monthDate.toISOString(),
      projectedBalance: runningCash,
      sobra: monthlySobra,
      income: monthlyIncome,
      expenses: monthlyExpenses
    });
  }
  
  return projections;
};
