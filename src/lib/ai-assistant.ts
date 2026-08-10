import { FinancialSummary, Transaction, FinancialReserve } from "@/types/finance";
import { formatCurrency } from "./utils";

export interface AIInsight {
  title: string;
  message: string;
  type: "success" | "warning" | "danger" | "info";
  actionLabel?: string;
}

export const getAIInsights = (
  summary: FinancialSummary,
  transactions: Transaction[],
  reserve: FinancialReserve
): AIInsight[] => {
  const insights: AIInsight[] = [];
  
  // 1. Anlise de Reserva
  const monthsCovered = reserve.monthlyExpenses > 0 ? reserve.currentAmount / reserve.monthlyExpenses : 0;
  if (monthsCovered < 3) {
    insights.push({
      title: "Reserva em Alerta",
      message: `Sua reserva cobre apenas ${monthsCovered.toFixed(1)} meses. Foque em reduzir gastos opcionais este ms para acelerar o aporte de emergncia.`,
      type: "danger",
      actionLabel: "Ver Planejamento de Reserva"
    });
  } else if (monthsCovered >= 6) {
    insights.push({
      title: "Reserva Saudvel",
      message: "Excelente! Voc j tem mais de 6 meses de segurana. Pode considerar investir a sobra em ativos de maior rentabilidade.",
      type: "success"
    });
  }

  // 2. Anlise de Gastos Opcionais
  const optionalPercent = (summary.optionalExpenses / summary.totalIncome) * 100;
  if (optionalPercent > 30) {
    insights.push({
      title: "Gastos Opcionais Elevados",
      message: `Os gastos com lazer e extras j consomem ${optionalPercent.toFixed(0)}% da sua renda. Tente manter abaixo de 20% para garantir o futuro.`,
      type: "warning"
    });
  }

  // 3. Previsibilidade
  const projectedBalance = summary.balance;
  if (projectedBalance < 0) {
    insights.push({
      title: "Risco de Fechamento Negativo",
      message: `Cuidado! Seus gastos previstos excedem sua renda em ${formatCurrency(Math.abs(projectedBalance))}. Revise seus parcelamentos pendentes.`,
      type: "danger"
    });
  } else if (projectedBalance > summary.totalIncome * 0.1) {
    insights.push({
      title: "Sobra de Caixa Identificada",
      message: `Vocs vo terminar o ms com uma sobra de ${formatCurrency(projectedBalance)}. Que tal aportar ${formatCurrency(projectedBalance * 0.5)} na reserva hoje?`,
      type: "success"
    });
  }

  // 4. Insight Familiar
  const matheusSpending = transactions.filter(t => t.responsible === "Matheus" && t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
  const heloisaSpending = transactions.filter(t => t.responsible === "Heloisa" && t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
  
  if (Math.abs(matheusSpending - heloisaSpending) > summary.totalIncome * 0.2) {
    insights.push({
      title: "Equilbrio de Gastos",
      message: "Notamos uma disparidade nos gastos individuais este ms. Uma conversa sobre o oramento conjunto pode ajudar no equilbrio.",
      type: "info"
    });
  }

  return insights;
};
