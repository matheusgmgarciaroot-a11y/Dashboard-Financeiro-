"use client";

import React from "react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { formatCurrency, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  TrendingUp, 
  Target, 
  ArrowUpRight,
  Info,
  ChevronRight,
  Pencil,
  Save
} from "lucide-react";

export function InvestmentReserve() {
  const { reserve, investments, updateReserve } = useFinanceStore();
  const [isEditingReserve, setIsEditingReserve] = React.useState(false);
  const [reserveInput, setReserveInput] = React.useState("");
  
  const totalInvested = investments.reduce((acc, inv) => acc + inv.currentValue, 0);
  const monthlyAport = investments.reduce((acc, inv) => acc + inv.monthlyAport, 0);
  const reserveProgress = (reserve.currentAmount / reserve.goalAmount) * 100;
  const monthsCovered = reserve.monthlyExpenses > 0 ? reserve.currentAmount / reserve.monthlyExpenses : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Financial Reserve Card */}
      <div className="bg-carbon-900 border border-white/5 p-8 rounded-sm overflow-hidden relative">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center">
              <ShieldCheck className="text-primary" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-white tracking-tight">Reserva Financeira</h3>
              <p className="text-sm text-neutral-500">Sua rede de segurana</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Cobre</p>
            <p className="text-xl font-display font-bold text-primary">{monthsCovered.toFixed(1)} meses</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-neutral-400 mb-1">Montante Atual</p>
              {isEditingReserve ? (
                <div className="flex items-center gap-2">
                  <input 
                    autoFocus
                    type="number"
                    value={reserveInput}
                    onChange={(e) => setReserveInput(e.target.value)}
                    className="bg-white/10 border border-primary/50 rounded-xs px-2 py-1 text-2xl font-display font-bold text-white w-40 focus:outline-none"
                  />
                  <button 
                    onClick={() => {
                      updateReserve({ currentAmount: parseFloat(reserveInput) });
                      setIsEditingReserve(false);
                    }}
                    className="p-2 bg-primary text-carbon-black rounded-xs"
                  >
                    <Save size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 group/edit">
                  <h4 className="text-3xl font-display font-bold text-white">{formatCurrency(reserve.currentAmount)}</h4>
                  <button 
                    onClick={() => {
                      setReserveInput(reserve.currentAmount.toString());
                      setIsEditingReserve(true);
                    }}
                    className="p-1 text-neutral-600 hover:text-white transition-colors opacity-0 group-hover/edit:opacity-100"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-500 mb-1">Meta: {formatCurrency(reserve.goalAmount)}</p>
              <div className="px-2 py-0.5 bg-white/5 rounded-xs text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                {reserveProgress.toFixed(0)}% da meta
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, reserveProgress)}%` }}
              className="h-full bg-primary shadow-[0_0_10px_rgba(223,255,0,0.5)]"
            />
          </div>

          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm flex items-center gap-4">
            <Info size={18} className="text-neutral-500 shrink-0" />
            <p className="text-xs text-neutral-400 leading-relaxed">
              Recomendamos um aporte mensal de <span className="text-white font-bold">{formatCurrency(reserve.monthlyContribution)}</span> para atingir sua meta em 18 meses.
            </p>
          </div>
        </div>
      </div>

      {/* Investments Card */}
      <div className="bg-carbon-900 border border-white/5 p-8 rounded-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-info/10 rounded-sm flex items-center justify-center">
              <TrendingUp className="text-info" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-white tracking-tight">Investimentos</h3>
              <p className="text-sm text-neutral-500">Construo de patrimnio</p>
            </div>
          </div>
          <button className="flex items-center gap-1 text-[10px] font-bold text-info uppercase tracking-widest hover:text-white transition-colors">
            Gerenciar <ChevronRight size={12} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-sm border border-white/5">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Patrimnio Total</p>
              <p className="text-xl font-display font-bold text-white">{formatCurrency(totalInvested)}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-sm border border-white/5">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Aporte Mensal</p>
              <p className="text-xl font-display font-bold text-info">{formatCurrency(monthlyAport)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Principais Ativos</p>
            {investments.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-sm group hover:bg-white/[0.04] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xs bg-info/10 flex items-center justify-center text-info">
                    <ArrowUpRight size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{inv.name}</p>
                    <p className="text-[10px] text-neutral-600 uppercase font-bold">{inv.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{formatCurrency(inv.currentValue)}</p>
                  <p className="text-[10px] text-info font-bold">+{inv.expectedReturn}% a.a</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
