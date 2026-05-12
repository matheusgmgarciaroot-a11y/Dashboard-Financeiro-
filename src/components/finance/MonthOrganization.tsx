"use client";

import React from "react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { formatCurrency, cn } from "@/lib/utils";
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  CalendarDays
} from "lucide-react";
import { motion } from "framer-motion";

export function MonthOrganization() {
  const { summary, transactions } = useFinanceStore();
  
  const pendingExpenses = transactions
    .filter(tx => tx.type === "expense" && tx.status === "pending")
    .reduce((acc, tx) => acc + tx.amount, 0);
    
  const paidExpenses = transactions
    .filter(tx => tx.type === "expense" && tx.status === "completed")
    .reduce((acc, tx) => acc + tx.amount, 0);

  return (
    <div className="space-y-8">
      {/* Monthly Pulse */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-sm">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <ArrowUpCircle size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">Entradas do Ms</span>
          </div>
          <p className="text-2xl font-display font-bold text-white">{formatCurrency(summary.totalIncome)}</p>
        </div>

        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-sm">
          <div className="flex items-center gap-3 mb-4 text-neutral-500">
            <CheckCircle2 size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">J Pagas</span>
          </div>
          <p className="text-2xl font-display font-bold text-white">{formatCurrency(paidExpenses)}</p>
        </div>

        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-sm">
          <div className="flex items-center gap-3 mb-4 text-yellow-500">
            <Clock size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">Pendentes</span>
          </div>
          <p className="text-2xl font-display font-bold text-white">{formatCurrency(pendingExpenses)}</p>
        </div>

        <div className="p-6 bg-primary/10 border border-primary/20 rounded-sm">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <CalendarDays size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">Saldo Projetado</span>
          </div>
          <p className="text-2xl font-display font-bold text-white">{formatCurrency(summary.projectedEndBalance)}</p>
          <p className="text-[10px] text-primary/70 font-bold uppercase mt-1">Ao fim de 30 dias</p>
        </div>
      </div>

      {/* Calendar Timeline (Simplified Visualization) */}
      <div className="bg-carbon-900 border border-white/5 p-8 rounded-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-display font-bold text-white tracking-tight">Timeline Financeira</h3>
            <p className="text-sm text-neutral-500">Vencimentos e recebimentos do ms atual</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Receita</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-danger" />
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Despesa</span>
             </div>
          </div>
        </div>

        <div className="relative pt-8 pb-4">
          <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 -translate-y-1/2" />
          <div className="flex justify-between items-center relative">
            {[1, 5, 10, 15, 20, 25, 30].map((day) => (
              <div key={day} className="flex flex-col items-center gap-4 relative">
                <div className="text-[10px] font-bold text-neutral-600 uppercase">Dia {day}</div>
                <div className="w-3 h-3 rounded-full bg-carbon-800 border-2 border-neutral-700 z-10" />
                
                {/* Mock Event Indicators */}
                {day === 5 && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute -top-12 flex flex-col items-center"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-carbon-black shadow-[0_0_15px_rgba(223,255,0,0.4)]">
                      <ArrowUpCircle size={14} />
                    </div>
                  </motion.div>
                )}
                
                {(day === 10 || day === 20) && (
                  <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute -bottom-12 flex flex-col items-center"
                  >
                    <div className="w-6 h-6 rounded-full bg-danger flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,59,48,0.3)]">
                      <AlertCircle size={14} />
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
