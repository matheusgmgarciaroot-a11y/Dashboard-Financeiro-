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

export function PredictabilityCharts() {
  const { summary, projections } = useFinanceStore();

  const chartData = projections.map(p => ({
    name: format(new Date(p.month), "MMM", { locale: ptBR }),
    saldo: p.projectedBalance,
    sobra: p.sobra
  }));

  const formatCurrency = (val: number) => 
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Projection Chart */}
      <div className="bg-carbon-900 border border-white/5 p-8 rounded-sm">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8">Evoluo do Saldo (6 Meses)</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
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
          </ResponsiveContainer>
        </div>
      </div>

      {/* Composition Chart */}
      <div className="bg-carbon-900 border border-white/5 p-8 rounded-sm">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8">Composio Mensal Atual</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={[
                { name: "Essenciais", valor: summary.essentialExpenses },
                { name: "Opcionais", valor: summary.optionalExpenses },
                { name: "Sobra Livre", valor: summary.projectedEndBalance > 0 ? summary.projectedEndBalance : 0 },
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
        <div className="mt-4 flex justify-between text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
           <span>Gastos Fixos: {((summary.essentialExpenses / summary.totalIncome) * 100).toFixed(0)}%</span>
           <span>Sobra: {((summary.projectedEndBalance / summary.totalIncome) * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}
