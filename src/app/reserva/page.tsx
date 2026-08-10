"use client";

import React, { useState } from "react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { motion } from "framer-motion";
import { ShieldCheck, Target, TrendingUp, ArrowUpRight, Info, Save, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReservaPage() {
  const { reserve, updateReserve, summary } = useFinanceStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    currentAmount: summary.reserveBalance,
    goalAmount: reserve.goalAmount,
    monthlyExpenses: reserve.monthlyExpenses
  });

  const currentAmount = summary.reserveBalance;
  const monthsCovered = reserve.monthlyExpenses > 0 ? currentAmount / reserve.monthlyExpenses : 0;
  
  const getStatusColor = () => {
    if (monthsCovered < 3) return "text-danger";
    if (monthsCovered < 6) return "text-yellow-400";
    return "text-primary";
  };

  const getStatusBg = () => {
    if (monthsCovered < 3) return "bg-danger/10 border-danger/20";
    if (monthsCovered < 6) return "bg-yellow-400/10 border-yellow-400/20";
    return "bg-primary/10 border-primary/20";
  };

  const formatCurrency = (val: number) => 
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleSave = () => {
    updateReserve(editValues);
    setIsEditing(false);
  };

  return (
    <div className="p-8 space-y-8 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-primary" size={24} />
          <h1 className="text-3xl font-display font-bold text-white tracking-tight uppercase">Reserva Financeira</h1>
        </div>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-sm font-bold text-xs hover:bg-white/10 transition-colors"
        >
          {isEditing ? <Save size={16} className="text-primary" /> : <Pencil size={16} />}
          {isEditing ? "Salvar Alteraes" : "Editar Valores"}
        </button>
      </div>

      <div className="p-4 bg-white/5 border border-white/10 rounded-sm">
        <p className="text-xs text-neutral-400">
          <strong className="text-primary">Instrução:</strong> A reserva deve cobrir entre 3 a 6 meses de seus gastos totais. O sistema calcula automaticamente o nível de segurança baseado nos gastos reais cadastrados.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Stats */}
        <div className="md:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-carbon-900 border border-white/5 p-8 rounded-sm space-y-4">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">O que temos hoje</p>
              {isEditing ? (
                <input 
                  type="number"
                  value={editValues.currentAmount}
                  onChange={(e) => setEditValues({ ...editValues, currentAmount: parseFloat(e.target.value) })}
                  className="bg-white/5 border border-primary/50 rounded-xs p-2 text-2xl font-display font-bold text-white w-full"
                />
              ) : (
                <h4 className="text-4xl font-display font-bold text-white">{formatCurrency(currentAmount)}</h4>
              )}
            </div>
            <div className="bg-carbon-900 border border-white/5 p-8 rounded-sm space-y-4">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Meta de Reserva</p>
              {isEditing ? (
                <input 
                  type="number"
                  value={editValues.goalAmount}
                  onChange={(e) => setEditValues({ ...editValues, goalAmount: parseFloat(e.target.value) })}
                  className="bg-white/5 border border-primary/50 rounded-xs p-2 text-2xl font-display font-bold text-white w-full"
                />
              ) : (
                <h4 className="text-4xl font-display font-bold text-primary">{formatCurrency(reserve.goalAmount)}</h4>
              )}
            </div>
          </div>

          <div className={cn("p-8 border rounded-sm flex items-center justify-between", getStatusBg())}>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Sua famlia tem {monthsCovered.toFixed(1)} meses de vida cobertos</h3>
              <p className="text-sm text-neutral-400">Com base no seu gasto mensal de {formatCurrency(reserve.monthlyExpenses)}</p>
            </div>
            <div className={cn("text-4xl font-display font-bold", getStatusColor())}>
              {monthsCovered < 3 ? "Ateno" : monthsCovered < 6 ? "Saudvel" : "tima"}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-sm flex items-start gap-4">
             <Info className="text-primary mt-1" size={18} />
             <div className="space-y-1">
                <p className="text-sm font-bold text-white">Sobre sua reserva</p>
                <p className="text-xs text-neutral-400 leading-relaxed">
                   A reserva de emergncia deve cobrir entre 6 a 12 meses do seu custo de vida. No momento, vocs esto com {((currentAmount / reserve.goalAmount) * 100).toFixed(1)}% da meta atingida.
                </p>
             </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <div className="bg-carbon-900 border border-white/5 p-6 rounded-sm space-y-6">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Gasto Mensal Médio</h4>
            {isEditing ? (
              <input 
                type="number"
                value={editValues.monthlyExpenses}
                onChange={(e) => setEditValues({ ...editValues, monthlyExpenses: parseFloat(e.target.value) })}
                className="bg-white/5 border border-primary/50 rounded-xs p-2 text-lg font-bold text-white w-full"
              />
            ) : (
              <p className="text-2xl font-display font-bold text-white">{formatCurrency(reserve.monthlyExpenses)}</p>
            )}
            <div className="pt-6 border-t border-white/5 space-y-4">
               <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Aporte Mensal</span>
                  <span className="text-white font-bold">{formatCurrency(reserve.monthlyContribution)}</span>
               </div>
               <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Progresso</span>
                  <span className="text-primary font-bold">{((currentAmount / reserve.goalAmount) * 100).toFixed(1)}%</span>
               </div>
               <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-1000" 
                    style={{ width: `${(currentAmount / reserve.goalAmount) * 100}%` }}
                  />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
