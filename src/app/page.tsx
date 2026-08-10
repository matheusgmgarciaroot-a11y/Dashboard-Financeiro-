"use client";

import React from "react";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { useFinanceStore } from "@/store/useFinanceStore";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ShieldCheck, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MonthNavigator } from "@/components/finance/MonthNavigator";
import { parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { TransactionTable } from "@/components/dashboard/TransactionTable";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function VisaoDoMesPage() {
  const { summary, selectedDate, transactions, accounts, refreshSummary } = useFinanceStore();
  const date = parseISO(selectedDate);

  React.useEffect(() => {
    refreshSummary();
  }, []);

  const formatCurrency = (val?: number) => 
    (val ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const transactionsForMonth = transactions.filter(t => {
    const d = parseISO(t.date);
    return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
  });

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-8 space-y-10 max-w-[1400px] mx-auto"
    >
      {/* Header Context */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
         <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
               <Calendar size={18} />
               <span className="text-xs font-bold uppercase tracking-[0.2em]">
                  {format(date, "MMMM 'de' yyyy", { locale: ptBR })}
               </span>
            </div>
            <h1 className="text-4xl font-display font-bold text-white tracking-tight">
               Visão do <span className="text-primary">Mês</span>
            </h1>
         </div>
         <MonthNavigator />
      </motion.div>

      {/* ... (rest of the stats cards and health status) */}
      <motion.div variants={itemVariants} className="p-4 bg-white/5 border border-white/10 rounded-sm">
        <p className="text-xs text-neutral-400">
          <strong className="text-primary">Bem-vindos à Gestão Familiar Carbon:</strong> Esta é a sua central de comando. O score de saúde reflete o equilíbrio entre o que vocês ganham e o que gastam. Mantenha os lançamentos em dia para uma precisão total.
        </p>
      </motion.div>

      {/* Main Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Receitas do Mês" 
          value={summary.totalIncome} 
          icon={TrendingUp}
          variant="primary"
        />
        <SummaryCard 
          title="Gastos do Mês" 
          value={summary.totalExpenses} 
          icon={TrendingDown}
          variant="danger"
        />
        <SummaryCard 
          title="Saldo Pós-Gastos" 
          value={summary.totalIncome - summary.totalExpenses} 
          icon={CheckCircle2}
          variant="success"
        />
        <SummaryCard 
          title="Reserva de Emergência" 
          value={summary.reserveBalance} 
          icon={ShieldCheck}
          variant="primary"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Financial Health Status */}
         <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <div className="bg-carbon-900 border border-white/5 rounded-sm p-8 flex flex-col md:flex-row items-center gap-8">
               <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                     <circle 
                        cx="64" cy="64" r="58" 
                        stroke="currentColor" strokeWidth="8" fill="transparent" 
                        className="text-white/5"
                     />
                     <circle 
                        cx="64" cy="64" r="58" 
                        stroke="currentColor" strokeWidth="8" fill="transparent" 
                        strokeDasharray={364.4}
                        strokeDashoffset={364.4 - (364.4 * summary.healthScore) / 100}
                        className={cn(
                           "transition-all duration-1000",
                           summary.healthStatus === "healthy" ? "text-primary" : 
                           summary.healthStatus === "warning" ? "text-yellow-400" : "text-danger"
                        )}
                     />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-3xl font-display font-bold text-white">{summary.healthScore}</span>
                     <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Score</span>
                  </div>
               </div>
               
               <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                     <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        summary.healthStatus === "healthy" ? "bg-primary/20 text-primary" : 
                        summary.healthStatus === "warning" ? "bg-yellow-400/20 text-yellow-400" : "bg-danger/20 text-danger"
                     )}>
                        Saúde {summary.healthStatus === "healthy" ? "Saudável" : summary.healthStatus === "warning" ? "em Alerta" : "Crítica"}
                     </div>
                     <span className="text-xs text-neutral-500 font-medium">Sua família está gastando {summary.commitmentPercent.toFixed(1)}% da renda</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                     {summary.healthStatus === "healthy" 
                        ? "O mês está correndo muito bem!" 
                        : "Atenção redobrada com os gastos este mês."}
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed max-w-lg">
                     {summary.healthStatus === "healthy" 
                        ? "Vocês mantêm uma margem de segurança excelente. Aproveitem para reforçar a reserva ou planejar um investimento extra."
                        : "O comprometimento da renda está elevado. Evitem novos gastos não-essenciais até o fim do mês para garantir o fechamento positivo."}
                  </p>
               </div>
            </div>

            {/* Quick Balance Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div className="bg-white/5 border border-white/5 rounded-sm p-6">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                     <CheckCircle2 size={12} className="text-primary" /> Total Pago
                  </p>
                  <p className="text-2xl font-display font-bold text-white">{formatCurrency(summary.paidExpenses)}</p>
               </div>
               <div className="bg-white/5 border border-white/5 rounded-sm p-6">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                     <Clock size={12} className="text-yellow-400" /> Total Pendente
                  </p>
                  <p className="text-2xl font-display font-bold text-white">{formatCurrency(summary.pendingExpenses)}</p>
               </div>
               <div className="bg-white/5 border border-white/5 rounded-sm p-6 border-primary/20">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                     <AlertCircle size={12} className="text-primary" /> Saldo Projetado
                  </p>
                  <p className="text-2xl font-display font-bold text-white">{formatCurrency(summary.balance)}</p>
               </div>
            </div>
         </motion.div>

         {/* Family Insights Sidebar */}
         <motion.div variants={itemVariants} className="space-y-6">
            <div className="bg-white/5 border border-white/5 rounded-sm p-6">
               <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Controle por Responsável</h4>
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">M</div>
                        <div>
                           <p className="text-xs font-bold text-white">Matheus</p>
                           <p className="text-[10px] text-neutral-500">Saldo individual em caixa</p>
                        </div>
                     </div>
                     <span className="text-sm font-bold text-white">{formatCurrency(accounts.filter(a => a.owner === "Matheus").reduce((acc, a) => acc + a.balance, 0))}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500 font-bold text-xs">H</div>
                        <div>
                           <p className="text-xs font-bold text-white">Heloisa</p>
                           <p className="text-[10px] text-neutral-500">Saldo individual em caixa</p>
                        </div>
                     </div>
                     <span className="text-sm font-bold text-white">{formatCurrency(accounts.filter(a => a.owner === "Heloisa").reduce((acc, a) => acc + a.balance, 0))}</span>
                  </div>
               </div>
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-sm p-6">
               <div className="flex items-center gap-2 text-primary mb-2">
                  <AlertCircle size={16} />
                  <p className="text-xs font-bold uppercase tracking-widest">Dica da IA</p>
               </div>
               <p className="text-xs text-neutral-400 leading-relaxed">
                  "Sua sobra real este mês é de {formatCurrency(summary.balance)}. Com os {formatCurrency(summary.pendingExpenses)} pendentes, seu saldo projetado é seguro."
               </p>
            </div>
         </motion.div>
      </div>

      {/* Monthly Control Table */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-display font-bold text-white uppercase tracking-tight">Controle de Pagamentos do Mês</h3>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
            {transactionsForMonth.length} transações encontradas
          </p>
        </div>
        <TransactionTable transactions={transactionsForMonth} />
      </motion.div>
    </motion.div>
  );
}
