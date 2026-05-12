"use client";

import React from "react";
import { Sparkles, TrendingDown, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const INSIGHTS = [
  {
    icon: TrendingDown,
    title: "Economia em Alimentação",
    description: "Você gastou 18% menos com delivery comparado ao mês anterior. Continue assim!",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: AlertCircle,
    title: "Fluxo de Caixa",
    description: "Previsão de saldo negativo em 12 dias se os gastos atuais persistirem.",
    color: "text-danger",
    bgColor: "bg-danger/10",
  },
  {
    icon: Sparkles,
    title: "Oportunidade de Investimento",
    description: "Seu saldo em conta corrente está 40% acima do necessário para sua reserva.",
    color: "text-info",
    bgColor: "bg-info/10",
  },
];

export function AIInsights() {
  return (
    <div className="bg-carbon-900 border border-white/5 p-6 rounded-sm h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="text-primary" size={20} />
        <h3 className="text-lg font-display font-bold text-white tracking-tight">Insights IA</h3>
      </div>

      <div className="flex-1 space-y-4">
        {INSIGHTS.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-sm border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer group"
          >
            <div className="flex items-start gap-4">
              <div className={cn("p-2 rounded-xs shrink-0", insight.bgColor, insight.color)}>
                <insight.icon size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-white">{insight.title}</h4>
                  <ArrowRight size={14} className="text-neutral-600 group-hover:text-primary transition-colors group-hover:translate-x-1 duration-300" />
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {insight.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-white/5">
        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-sm border border-primary/20">
          <div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Score Financeiro</p>
            <p className="text-2xl font-display font-bold text-white">842</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Status</p>
            <p className="text-sm font-bold text-primary">Excelente</p>
          </div>
        </div>
      </div>
    </div>
  );
}
