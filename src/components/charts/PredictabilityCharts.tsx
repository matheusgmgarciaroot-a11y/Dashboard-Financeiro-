"use client";

import React from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { useFinanceStore } from "@/store/useFinanceStore";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function PredictabilityCharts() {
  const { summary, projections } = useFinanceStore();
  const [view, setView] = React.useState<"balance" | "comparison">("balance");

  const chartData = projections.map(p => ({
    name: format(new Date(p.month), "MMM", { locale: ptBR }),
    saldo: p.projectedBalance,
    receita: p.income,
    despesa: p.expenses,
    sobra: p.sobra
  }));

  const formatCurrency = (val: number) => 
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-8">
      {/* Projection Chart */}
      <div className="bg-carbon-900 border border-white/5 p-8 rounded-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">
            {view === "balance" ? "Evolução do Saldo (12 Meses)" : "Receitas vs Despesas (12 Meses)"}
          </h3>
          <div className="flex gap-2 p-1 bg-white/5 rounded-sm border border-white/5">
            <button 
              onClick={() => setView("balance")}
              className={cn(
                "px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xs",
                view === "balance" ? "bg-primary text-carbon-black" : "text-neutral-500 hover:text-white"
              )}
            >
              Saldo
            </button>
            <button 
              onClick={() => setView("comparison")}
              className={cn(
                "px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xs",
                view === "comparison" ? "bg-primary text-carbon-black" : "text-neutral-500 hover:text-white"
              )}
            >
              Comparativo
            </button>
          </div>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            {view === "balance" ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DFFF00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#DFFF00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "500" }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "500" }}
                  tickFormatter={(val) => `R$ ${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0A0A0A", border: "1px solid #ffffff10", borderRadius: "4px" }}
                  itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                  formatter={(val: any) => formatCurrency(Number(val))}
                />
                <Area 
                  type="monotone" 
                  dataKey="saldo" 
                  stroke="#DFFF00" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSaldo)" 
                />
              </AreaChart>
            ) : (
              <BarChart data={chartData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "500" }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "500" }}
                  tickFormatter={(val) => `R$ ${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0A0A0A", border: "1px solid #ffffff10", borderRadius: "4px" }}
                  itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                  formatter={(val: any) => formatCurrency(Number(val))}
                />
                <Bar dataKey="receita" fill="#DFFF00" radius={[2, 2, 0, 0]} name="Receitas" />
                <Bar dataKey="despesa" fill="#ffffff20" radius={[2, 2, 0, 0]} name="Despesas" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-carbon-900 border border-white/5 p-8 rounded-sm">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8">Composição Mensal Atual</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={[
                { name: "Essenciais", valor: summary.essentialExpenses },
                { name: "Opcionais", valor: summary.optionalExpenses },
                { name: "Sobra Livre", valor: summary.balance > 0 ? summary.balance : 0 },
              ]}
              layout="vertical"
              margin={{ left: 40, right: 40 }}
            >
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#fff", fontSize: 10, fontWeight: "bold" }}
                width={80}
              />
              <Tooltip 
                cursor={{ fill: "transparent" }}
                contentStyle={{ backgroundColor: "#0A0A0A", border: "1px solid #ffffff10", borderRadius: "4px" }}
                formatter={(val: any) => formatCurrency(Number(val))}
              />
              <Bar dataKey="valor" radius={[0, 4, 4, 0]} barSize={32}>
                <Cell fill="#DFFF00" />
                <Cell fill="#ffffff20" />
                <Cell fill="#DFFF00" fillOpacity={0.5} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
