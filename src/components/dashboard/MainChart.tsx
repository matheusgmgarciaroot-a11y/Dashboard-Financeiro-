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
  Legend
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface MainChartProps {
  data: any[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-carbon-black border border-white/10 p-4 rounded-sm shadow-premium backdrop-blur-md">
        <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-8">
              <span className="text-xs text-neutral-400 capitalize">{entry.name}:</span>
              <span className="text-sm font-bold font-mono" style={{ color: entry.color }}>
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function MainChart({ data }: MainChartProps) {
  return (
    <div className="bg-carbon-900 border border-white/5 p-6 rounded-sm h-[400px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-display font-bold text-white">Fluxo de Caixa</h3>
          <p className="text-sm text-neutral-500">Comparativo entre receitas e despesas mensais</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs text-neutral-400">Receitas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neutral-600" />
            <span className="text-xs text-neutral-400">Despesas</span>
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DFFF00" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#DFFF00" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#666", fontSize: 10 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#666", fontSize: 10 }}
              tickFormatter={(value) => `R$${value/1000}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#ffffff20", strokeWidth: 1 }} />
            <Area 
              type="monotone" 
              dataKey="receita" 
              name="receita"
              stroke="#DFFF00" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorReceita)" 
              animationDuration={2000}
            />
            <Area 
              type="monotone" 
              dataKey="despesa" 
              name="despesa"
              stroke="#555" 
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="transparent"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
