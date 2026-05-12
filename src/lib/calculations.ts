import { Transaction, FinancialSummary, FinancialReserve, Investment, Account } from "@/types/finance";
import { startOfMonth, endOfMonth, isWithinInterval, parseISO, addMonths } from "date-fns";

export const calculateSummary = (
  transactions: Transaction[],
  accounts: Account[],
  reserve: FinancialReserve,
  investments: Investment[]
): FinancialSummary => {
  const now = new Date();
  const monthInterval = {
    start: startOfMonth(now),
    end: endOfMonth(now),
  };

  const currentMonthTransactions = transactions.filter((tx) =>
    isWithinInterval(parseISO(tx.date), monthInterval)
  );

  const totalIncome = currentMonthTransactions
    .filter((tx) => tx.type === "income")
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalExpenses = currentMonthTransactions
    .filter((tx) => tx.type === "expense")
    .reduce((acc, tx) => acc + tx.amount, 0);

  const essentialExpenses = currentMonthTransactions
    .filter((tx) => tx.type === "expense" && (tx.priority === "essential" || tx.priority === "important"))
    .reduce((acc, tx) => acc + tx.amount, 0);

  const optionalExpenses = currentMonthTransactions
    .filter((tx) => tx.type === "expense" && tx.priority === "optional")
    .reduce((acc, tx) => acc + tx.amount, 0);

  const paidExpenses = currentMonthTransactions
    .filter((tx) => tx.type === "expense" && tx.status === "completed")
    .reduce((acc, tx) => acc + tx.amount, 0);

  const pendingExpenses = currentMonthTransactions
    .filter((tx) => tx.type === "expense" && tx.status === "pending")
    .reduce((acc, tx) => acc + tx.amount, 0);

  const currentCash = accounts.reduce((acc, accnt) => acc + accnt.balance, 0);
  
  const projectedEndBalance = (currentCash + totalIncome) - totalExpenses;
  
  const commitmentPercent = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  // Health Score Logic
  let healthScore = 100;
  if (commitmentPercent > 80) healthScore -= 30;
  else if (commitmentPercent > 60) healthScore -= 15;
  
  const monthsCovered = reserve.monthlyExpenses > 0 ? reserve.currentAmount / reserve.monthlyExpenses : 0;
  if (monthsCovered < 3) healthScore -= 20;
  else if (monthsCovered < 6) healthScore -= 10;

  if (projectedEndBalance < 0) healthScore -= 40;

  let healthStatus: FinancialSummary["healthStatus"] = "healthy";
  if (healthScore < 50) healthStatus = "critical";
  else if (healthScore < 75) healthStatus = "warning";

  return {
    totalIncome,
    totalExpenses,
    essentialExpenses,
    optionalExpenses,
    paidExpenses,
    pendingExpenses,
    projectedEndBalance,
    currentCash,
    reserveBalance: reserve.currentAmount,
    commitmentPercent,
    healthScore: Math.max(0, healthScore),
    healthStatus,
  };
};

export const calculateProjections = (
  transactions: Transaction[],
  accounts: Account[],
  reserve: FinancialReserve,
  months: number = 6
) => {
  const projections = [];
  let currentCash = accounts.reduce((acc, a) => acc + a.balance, 0);
  
  // Get recurring income and fixed expenses
  const recurringIncome = transactions
    .filter(t => t.type === "income" && t.expenseType === "eventual") // Assuming eventual/income means recurring for now
    .reduce((acc, t) => acc + t.amount, 0);
    
  const fixedExpenses = transactions
    .filter(t => t.type === "expense" && (t.expenseType === "fixo" || t.expenseType === "parcelado"))
    .reduce((acc, t) => acc + t.amount, 0);

  for (let i = 1; i <= months; i++) {
    const monthDate = addMonths(new Date(), i);
    // Add logic for installments that might end
    // For simplicity, we'll use fixedExpenses
    const monthlySobra = recurringIncome - fixedExpenses;
    currentCash += monthlySobra;
    
    projections.push({
      month: monthDate.toISOString(),
      projectedBalance: currentCash,
      sobra: monthlySobra,
      income: recurringIncome,
      expenses: fixedExpenses
    });
  }
  
  return projections;
};
