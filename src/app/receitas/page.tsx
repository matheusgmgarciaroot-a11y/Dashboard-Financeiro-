"use client";

import React from "react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { motion } from "framer-motion";
import { TrendingUp, Plus, User, User2, Users } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ReceitasPage() {
  const { transactions, selectedDate } = useFinanceStore();
  const { openTransactionModal } = useUIStore();
  
  const targetDate = new Date(selectedDate);
  const targetMonth = targetDate.getMonth();
  const targetYear = targetDate.getFullYear();

  const incomes = transactions.filter(t => {
    if (t.type !== "income") return false;
    const d = new Date(t.date);
    return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
  });

  const formatCurrency = (val: number) => 
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const getResponsibleIcon = (resp: string) => {
    if (resp === "Matheus") return <User size={14} className="text-primary" />;
    if (resp === "Heloisa") return <User2 size={14} className="text-pink-400" />;
    return <Users size={14} className="text-blue-400" />;
  };

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-primary" size={24} />
          <h1 className="text-3xl font-display font-bold text-white tracking-tight uppercase">Receitas / Salários</h1>
        </div>
        <button 
          onClick={() => openTransactionModal()}
          className="flex items-center gap-2 bg-primary text-carbon-black px-4 py-2 rounded-sm font-bold text-sm transition-transform hover:scale-105 active:scale-95"
        >
          <Plus size={18} /> Adicionar Receita
        </button>
      </div>

      <div className="p-4 bg-white/5 border border-white/10 rounded-sm">
        <p className="text-xs text-neutral-400">
          <strong className="text-primary">Instrução:</strong> Cadastre aqui todas as entradas mensais da família. Lembre-se de marcar como <span className="text-white">"Evento"</span> se for uma renda extra ou <span className="text-white">"Fixo"</span> se for salário recorrente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/5 p-6 rounded-sm">
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Total Matheus</p>
          <p className="text-2xl font-display font-bold text-white">
            {formatCurrency(incomes.filter(i => i.responsible === "Matheus").reduce((acc, i) => acc + i.amount, 0))}
          </p>
        </div>
        <div className="bg-white/5 border border-white/5 p-6 rounded-sm">
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Total Heloisa</p>
          <p className="text-2xl font-display font-bold text-white">
            {formatCurrency(incomes.filter(i => i.responsible === "Heloisa").reduce((acc, i) => acc + i.amount, 0))}
          </p>
        </div>
        <div className="bg-white/5 border border-white/5 p-6 rounded-sm">
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Total Famlia</p>
          <p className="text-2xl font-display font-bold text-primary">
            {formatCurrency(incomes.reduce((acc, i) => acc + i.amount, 0))}
          </p>
        </div>
      </div>

      <div className="bg-carbon-900 border border-white/5 rounded-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/5">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Descrio</th>
              <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Valor</th>
              <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Data</th>
              <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Responsvel</th>
              <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Recorrente</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {incomes.map((income) => (
              <tr key={income.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4 text-sm font-medium text-white">{income.description}</td>
                <td className="px-6 py-4 text-sm font-bold text-primary">{formatCurrency(income.amount)}</td>
                <td className="px-6 py-4 text-sm text-neutral-400">
                  {format(new Date(income.date), "dd 'de' MMMM", { locale: ptBR })}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getResponsibleIcon(income.responsible)}
                    <span className="text-xs text-white">{income.responsible}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <span className="px-2 py-1 bg-white/5 rounded-full text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Sim</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
