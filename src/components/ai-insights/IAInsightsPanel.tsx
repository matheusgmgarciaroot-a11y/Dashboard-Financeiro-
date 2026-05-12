"use client";

import React from "react";
import { Sparkles, ArrowRight, AlertCircle, CheckCircle2, Info, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useFinanceStore } from "@/store/useFinanceStore";
import { cn, formatCurrency } from "@/lib/utils";
import { getAIInsights } from "@/lib/ai-assistant";

export function IAInsightsPanel() {
  const { summary, reserve, transactions } = useFinanceStore();
  
  const insights = getAIInsights(summary, transactions, reserve);

  const getIcon = (type: string) => {
    switch (type) {
      case "danger": return <AlertCircle className="text-danger" size={24} />;
      case "warning": return <Zap className="text-yellow-500" size={24} />;
      case "success": return <CheckCircle2 className="text-primary" size={24} />;
      default: return <Info className="text-blue-400" size={24} />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case "danger": return "border-danger/20 hover:border-danger/40";
      case "warning": return "border-yellow-500/20 hover:border-yellow-500/40";
      case "success": return "border-primary/20 hover:border-primary/40";
      default: return "border-blue-400/20 hover:border-blue-400/40";
    }
  };

  return (
    <div className="bg-carbon-900 border border-white/5 p-8 rounded-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Sparkles className="text-primary" size={24} />
          <h3 className="text-xl font-display font-bold text-white tracking-tight uppercase">Analista de Inteligência Carbon</h3>
        </div>
        <div className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest animate-pulse">IA Ativa</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insights.map((insight, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className={cn(
              "p-6 bg-white/[0.02] border rounded-sm relative group transition-all",
              getBorderColor(insight.type)
            )}
          >
            <div className="mb-4">
              {getIcon(insight.type)}
            </div>
            <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">{insight.title}</h4>
            <p className="text-xs text-white/60 leading-relaxed">{insight.message}</p>
            {insight.actionLabel && (
              <button className="mt-4 flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest hover:gap-3 transition-all">
                {insight.actionLabel} <ArrowRight size={12} />
              </button>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-primary/5 border border-primary/10 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
            <span className="text-xl font-display font-bold text-white">{summary.healthScore}</span>
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle 
                cx="32" cy="32" r="28" 
                fill="transparent" 
                stroke="#DFFF00" 
                strokeWidth="4" 
                strokeDasharray={`${(summary.healthScore / 100) * 176} 176`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest">Score de Saúde Atual</h4>
            <p className="text-xs text-white/40 mt-1">Sua famlia est na zona de {summary.healthStatus === 'healthy' ? 'segurana' : summary.healthStatus === 'warning' ? 'ateno' : 'risco'}.</p>
          </div>
        </div>
        
        <div className="flex gap-8">
          <div className="text-right">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Comprometimento</p>
            <p className="text-2xl font-display font-bold text-white">{summary.commitmentPercent.toFixed(1)}%</p>
          </div>
          <div className="text-right border-l border-white/10 pl-8">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Sobra Livre</p>
            <p className="text-2xl font-display font-bold text-primary">{formatCurrency(summary.projectedEndBalance)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
