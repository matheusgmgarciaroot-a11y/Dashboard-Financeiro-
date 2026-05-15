"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Calendar, RefreshCcw } from "lucide-react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

export function MonthNavigator() {
  const { selectedDate, setSelectedDate, replicateFixedExpenses } = useFinanceStore();
  const date = new Date(selectedDate);

  const handlePrev = () => {
    setSelectedDate(subMonths(date, 1).toISOString());
  };

  const handleNext = () => {
    setSelectedDate(addMonths(date, 1).toISOString());
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(new Date(today.getFullYear(), today.getMonth(), 1).toISOString());
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-carbon-900 border border-white/5 p-4 rounded-sm">
      <div className="flex items-center gap-2">
        <button 
          onClick={handlePrev}
          className="p-2 hover:bg-white/5 rounded-sm transition-colors text-neutral-500 hover:text-white"
        >
          <ChevronLeft size={20} />
        </button>
        
        <motion.div 
          key={selectedDate}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-6 py-2 bg-white/5 rounded-sm border border-white/5 min-w-[200px] justify-center"
        >
          <Calendar size={16} className="text-primary" />
          <span className="text-sm font-display font-bold text-white uppercase tracking-widest">
            {format(date, "MMMM 'de' yyyy", { locale: ptBR })}
          </span>
        </motion.div>

        <button 
          onClick={handleNext}
          className="p-2 hover:bg-white/5 rounded-sm transition-colors text-neutral-500 hover:text-white"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button 
          onClick={handleToday}
          className="px-4 py-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest hover:text-white transition-colors"
        >
          Mês Atual
        </button>
        
        <button 
          onClick={replicateFixedExpenses}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-sm text-[10px] font-bold text-primary uppercase tracking-widest hover:bg-primary hover:text-carbon-black transition-all"
        >
          <RefreshCcw size={14} /> Iniciar Controle Mensal
        </button>
      </div>
    </div>
  );
}
