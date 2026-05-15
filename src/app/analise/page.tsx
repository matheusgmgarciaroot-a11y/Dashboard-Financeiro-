"use client";

import React from "react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { formatCurrency, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  PieChart as PieChartIcon, 
  TrendingDown, 
  Lightbulb, 
  Target, 
  ArrowRight,
  TrendingUp,
  Wallet
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

const COLORS = ["#DFFF00", "#ffffff20", "#ffffff40", "#ffffff60", "#ffffff80", "#ffffff10"];

export default function AnalisePage() {
  const { transactions, summary, reserve } = useFinanceStore();

  // Agrupar gastos por categoria
  const expenseTransactions = transactions.filter(t => t.type === "expense");
  const categoryTotals = expenseTransactions.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryTotals)
    .map(([name, value]) => ({ 
      name: name.replace("_", " ").toUpperCase(), 
      value 
    }))
    .sort((a, b) => b.value - a.value);

  const totalLiquid = summary.currentCash;
  const totalWithReserve = summary.currentCash + summary.reserveBalance;

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-center gap-3">
        <PieChartIcon className="text-primary" size={24} />
        <h1 className="text-3xl font-display font-bold text-white tracking-tight uppercase">Análise de Fluxo</h1>
      </div>

      {/* Liquidity Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-carbon-900 border border-white/5 p-8 rounded-sm relative overflow-hidden group"
        >
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Disponibilidade Imediata</p>
            <h3 className="text-4xl font-display font-bold text-white mb-2">{formatCurrency(totalLiquid)}</h3>
            <p className="text-xs text-neutral-400">Total líquido sem considerar a reserva de emergência.</p>
          </div>
          <Wallet className="absolute -bottom-4 -right-4 text-white/5 w-32 h-32 rotate-12 group-hover:text-primary/5 transition-colors" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-carbon-900 border border-primary/20 p-8 rounded-sm relative overflow-hidden group"
        >
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Patrimônio Total Bruto</p>
            <h3 className="text-4xl font-display font-bold text-white mb-2">{formatCurrency(totalWithReserve)}</h3>
            <p className="text-xs text-primary/60">Soma total de contas + reserva de emergência ativa.</p>
          </div>
          <TrendingUp className="absolute -bottom-4 -right-4 text-primary/5 w-32 h-32 rotate-12 group-hover:text-primary/10 transition-colors" />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Breakdown Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-carbon-900 border border-white/5 p-8 rounded-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Distribuição por Categoria</h3>
            <TrendingDown className="text-danger" size={18} />
          </div>

          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={140}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0A0A0A", border: "1px solid #ffffff10", borderRadius: "4px" }}
                  itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                  formatter={(val: any) => formatCurrency(Number(val))}
                />
                <Legend 
                  layout="vertical" 
                  align="right" 
                  verticalAlign="middle"
                  formatter={(value) => <span className="text-[10px] font-bold uppercase text-neutral-400">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Tips & Insights */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-carbon-900 border border-white/5 p-8 rounded-sm space-y-8"
        >
          <div className="flex items-center gap-3">
            <Lightbulb className="text-primary" size={20} />
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Dicas do Guardião</h3>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-white/5 rounded-sm border-l-2 border-primary">
              <h4 className="text-[10px] font-bold text-primary uppercase mb-2">Oportunidade Detectada</h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                A categoria <strong className="text-white">{chartData[0]?.name}</strong> representa {((chartData[0]?.value / summary.totalExpenses) * 100).toFixed(0)}% dos seus gastos. Reduzir 10% aqui liberaria {formatCurrency(chartData[0]?.value * 0.1)} mensais para sua reserva.
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-sm border-l-2 border-yellow-500">
              <h4 className="text-[10px] font-bold text-yellow-500 uppercase mb-2">Meta de Proteção</h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Com base no seu custo de vida atual, sua reserva deveria ser de {formatCurrency(summary.totalExpenses * 6)}. Você está em {((summary.reserveBalance / (summary.totalExpenses * 6)) * 100).toFixed(0)}% do caminho.
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-sm border-l-2 border-danger">
              <h4 className="text-[10px] font-bold text-danger uppercase mb-2">Atenção Crítica</h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Você tem {formatCurrency(summary.pendingExpenses)} em contas vencendo nos próximos dias. Garanta a liquidez antes de qualquer gasto supérfluo.
              </p>
            </div>
          </div>

          <button className="w-full py-4 bg-primary text-carbon-black text-xs font-bold uppercase tracking-widest rounded-sm hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
            Ver Plano de Redução <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>

      {/* Category List Ranking */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-carbon-900 border border-white/5 p-8 rounded-sm"
      >
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8">Ranking de Consumo por Categoria</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {chartData.map((cat, idx) => (
            <div key={cat.name} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-sm">
              <div className="flex items-center gap-4">
                <span className="text-xl font-display font-bold text-white/20">0{idx + 1}</span>
                <div>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{cat.name}</p>
                  <p className="text-lg font-display font-bold text-white">{formatCurrency(cat.value)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-primary">{((cat.value / summary.totalExpenses) * 100).toFixed(1)}%</p>
                <div className="w-16 h-1 bg-white/5 mt-1 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${(cat.value / summary.totalExpenses) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
