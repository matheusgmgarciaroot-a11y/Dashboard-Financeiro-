import { SimulationRequest, SimulationResult, FinancialSummary, FinancialReserve } from "@/types/finance";

export const getSimulationRecommendation = (
  request: SimulationRequest,
  summary: FinancialSummary,
  reserve: FinancialReserve
): SimulationResult => {
  const { totalValue, isInstallment, installmentsCount, isEssential, priority } = request;
  
  const monthlyImpact = isInstallment ? totalValue / installmentsCount : totalValue;
  const newTotalExpenses = summary.totalExpenses + monthlyImpact;
  const newCommitmentPercent = (newTotalExpenses / summary.totalIncome) * 100;
  const newProjectedBalance = summary.projectedEndBalance - monthlyImpact;
  
  const monthsCovered = reserve.monthlyExpenses > 0 ? reserve.currentAmount / reserve.monthlyExpenses : 0;
  
  let canAssume: SimulationResult["canAssume"] = "safe";
  let reason = "";
  let explanation = "";
  let riskLevel: SimulationResult["riskLevel"] = "low";

  // Decision Logic
  if (newProjectedBalance < 0) {
    canAssume = "not-recommended";
    riskLevel = "high";
    reason = "Saldo mensal ficaria negativo.";
    explanation = `Assumir este gasto de ${totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} fará com que o caixa da família termine o mês no vermelho. Não recomendamos este compromisso agora.`;
  } else if (newCommitmentPercent > 80) {
    canAssume = "not-recommended";
    riskLevel = "high";
    reason = "Comprometimento de renda muito alto (>80%).";
    explanation = "Mais de 80% da renda da família estaria comprometida com gastos. Isso deixa pouca margem para imprevistos e emergências.";
  } else if (newCommitmentPercent > 60 || monthsCovered < 3) {
    canAssume = "caution";
    riskLevel = "medium";
    reason = monthsCovered < 3 ? "Reserva de emergência abaixo do ideal." : "Comprometimento de renda em nível de alerta.";
    explanation = monthsCovered < 3 
      ? "Sua reserva cobre menos de 3 meses de gastos. O ideal seria fortalecer a reserva antes de assumir novos gastos não essenciais."
      : "Este gasto elevará o comprometimento da renda para um nível que exige atenção constante no orçamento.";
  } else {
    canAssume = "safe";
    riskLevel = "low";
    reason = "Impacto financeiro dentro da margem de segurança.";
    explanation = "O gasto cabe no orçamento mensal e a família mantém uma reserva saudável. Pode seguir com segurança.";
  }

  // Savings Suggestion
  let savingsSuggestion = "";
  if (canAssume !== "safe" && !isEssential) {
    savingsSuggestion = `Sugerimos poupar o valor total durante ${Math.ceil(totalValue / (summary.totalIncome * 0.1))} meses antes de realizar a compra à vista.`;
  }

  return {
    canAssume,
    reason,
    explanation,
    impactCurrentMonth: monthlyImpact,
    impactFutureMonths: isInstallment ? monthlyImpact : 0,
    newProjectedBalance,
    incomeCommitmentPercent: newCommitmentPercent,
    riskLevel,
    affectedMonths: isInstallment 
      ? Array.from({ length: installmentsCount }, (_, i) => `Mês ${i + 1}`)
      : ["Mês Atual"],
    savingsSuggestion
  };
};
