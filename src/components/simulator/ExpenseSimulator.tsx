"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useFinanceStore } from "@/store/useFinanceStore";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, AlertCircle, CheckCircle2, Info, ArrowRight, Wallet, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const simulationSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  totalValue: z.number().min(1, "Valor deve ser maior que zero"),
  isInstallment: z.boolean(),
  installmentsCount: z.number().min(1),
  firstPaymentDate: z.string(),
  category: z.string(),
  priority: z.enum(["essential", "important", "optional"]),
  responsible: z.enum(["Matheus", "Heloisa", "Ambos"]),
  isEssential: z.boolean(),
});

type SimulationForm = z.infer<typeof simulationSchema>;

export function ExpenseSimulator() {
  const { runSimulation } = useFinanceStore();
  const [result, setResult] = useState<any>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SimulationForm>({
    resolver: zodResolver(simulationSchema),
    defaultValues: {
      isInstallment: false,
      installmentsCount: 1,
      firstPaymentDate: new Date().toISOString().split("T")[0],
      priority: "optional",
      responsible: "Ambos",
      isEssential: false,
      category: "outros"
    }
  });

  const isInstallment = watch("isInstallment");

  const onSubmit = (data: SimulationForm) => {
    console.log("Submitting simulation:", data);
    const res = runSimulation(data);
    setResult(res);
  };

  const formatCurrency = (val: number) => 
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Form Column */}
      <div className="bg-carbon-900 border border-white/5 p-8 rounded-sm space-y-8">
         <div className="p-4 bg-carbon-black border border-primary/30 rounded-sm mb-6">
            <p className="text-sm text-white/90 leading-relaxed">
               <strong className="text-primary uppercase tracking-widest block mb-1">Instrução</strong> 
               Preencha os detalhes da possível compra. O consultor analisará sua renda, gastos fixos e reserva para dar um veredito seguro.
            </p>
         </div>

         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">O que você pretende comprar?</label>
               <input 
                  {...register("name")}
                  placeholder="Ex: Novo Sofá, Viagem..."
                  className="w-full bg-carbon-black border border-white/10 rounded-sm p-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-primary/50"
               />
               {errors.name && <p className="text-[10px] text-danger">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Valor Total (R$)</label>
                  <input 
                     type="number"
                     {...register("totalValue", { valueAsNumber: true })}
                     placeholder="0,00"
                     className="w-full bg-carbon-black border border-white/10 rounded-sm p-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Responsável</label>
                  <select 
                     {...register("responsible")}
                     className="w-full bg-carbon-black border border-white/10 rounded-sm p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 [&>option]:bg-carbon-black"
                  >
                     <option value="Ambos">Ambos</option>
                     <option value="Matheus">Matheus</option>
                     <option value="Heloisa">Heloisa</option>
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Categoria</label>
                  <select 
                     {...register("category")}
                     className="w-full bg-carbon-black border border-white/10 rounded-sm p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 [&>option]:bg-carbon-black"
                  >
                     <option value="outros">Outros</option>
                     <option value="lazer">Lazer</option>
                     <option value="casa">Casa / Moradia</option>
                     <option value="eletronicos">Eletrônicos</option>
                     <option value="viagem">Viagem</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Prioridade</label>
                  <select 
                     {...register("priority")}
                     className="w-full bg-carbon-black border border-white/10 rounded-sm p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 [&>option]:bg-carbon-black"
                  >
                     <option value="optional">Opcional (Desejo)</option>
                     <option value="important">Importante</option>
                     <option value="essential">Essencial</option>
                  </select>
               </div>
            </div>

            <div className="flex items-center gap-6 p-4 bg-carbon-black border border-white/10 rounded-sm">
               <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" {...register("isInstallment")} className="w-4 h-4 rounded-xs border-white/10 bg-white/5 text-primary focus:ring-0" />
                  <span className="text-xs font-bold text-white uppercase tracking-widest">Parcelar?</span>
               </label>
               
               {isInstallment && (
                 <div className="flex items-center gap-3 flex-1">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase">Em</span>
                    <input 
                       type="number"
                       {...register("installmentsCount", { valueAsNumber: true })}
                       className="w-16 bg-white/5 border border-white/10 rounded-sm p-1 text-center text-sm text-white"
                    />
                    <span className="text-[10px] font-bold text-neutral-400 uppercase">Vezes</span>
                 </div>
               )}
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Data do 1º Pagamento</label>
               <input 
                  type="date"
                  {...register("firstPaymentDate")}
                  className="w-full bg-carbon-black border border-white/10 rounded-sm p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
               />
            </div>

            <button 
               type="submit"
               className="w-full bg-primary text-carbon-black font-display font-bold py-4 rounded-sm shadow-[0_0_20px_rgba(223,255,0,0.2)] hover:shadow-[0_0_30px_rgba(223,255,0,0.4)] transition-all flex items-center justify-center gap-2"
            >
               Analisar Impacto <ArrowRight size={18} />
            </button>
         </form>
      </div>

      {/* Results Column */}
      <div className="space-y-6">
         <AnimatePresence mode="wait">
            {result ? (
              <motion.div 
                 key="result"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className={cn(
                    "p-8 rounded-sm border-2 space-y-8 bg-carbon-black shadow-2xl",
                    result.canAssume === "safe" ? "border-primary" : 
                    result.canAssume === "caution" ? "border-yellow-400" : "border-danger"
                 )}
              >
                 <div className="flex items-start justify-between">
                    <div className="space-y-1">
                       <div className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block mb-2",
                          result.canAssume === "safe" ? "bg-primary text-carbon-black" : 
                          result.canAssume === "caution" ? "bg-yellow-400 text-carbon-black" : "bg-danger text-white"
                       )}>
                          {result.canAssume === "safe" ? "Seguro" : result.canAssume === "caution" ? "Cuidado" : "Não Recomendado"}
                       </div>
                       <h2 className={cn(
                          "text-4xl font-display font-bold leading-tight",
                          result.canAssume === "safe" ? "text-primary" : 
                          result.canAssume === "caution" ? "text-yellow-400" : "text-danger"
                       )}>
                          {result.canAssume === "safe" ? "Pode assumir com segurança!" : 
                           result.canAssume === "caution" ? "Pode assumir, mas exige atenção." : "Não recomendado neste momento."}
                       </h2>
                    </div>
                    <div className={cn(
                       "p-4 rounded-full bg-white/5",
                       result.canAssume === "safe" ? "text-primary border border-primary/30" : 
                       result.canAssume === "caution" ? "text-yellow-400 border border-yellow-400/30" : "text-danger border border-danger/30"
                    )}>
                       {result.canAssume === "safe" ? <CheckCircle2 size={40} /> : <AlertCircle size={40} />}
                    </div>
                 </div>

                 <div className="bg-white/5 p-6 rounded-sm border-l-4 border-white/20">
                    <p className="text-base text-white font-medium leading-relaxed italic">
                       "{result.explanation}"
                    </p>
                 </div>

                 <div className="pt-8 border-t border-white/10 grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Impacto Mensal</p>
                       <p className="text-4xl font-display font-bold text-white">{formatCurrency(result.impactCurrentMonth)}</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Comprometimento</p>
                       <p className="text-4xl font-display font-bold text-white">{result.incomeCommitmentPercent.toFixed(1)}%</p>
                    </div>
                 </div>

                 {result.savingsSuggestion && (
                   <div className="p-5 bg-primary/5 border border-primary/20 rounded-sm flex items-start gap-4">
                      <Info size={20} className="text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-white/80 leading-relaxed font-medium">{result.savingsSuggestion}</p>
                   </div>
                 )}
              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] border border-dashed border-white/10 rounded-sm flex flex-col items-center justify-center p-12 text-center space-y-4">
                 <div className="p-4 bg-white/5 rounded-full">
                    <Zap size={32} className="text-neutral-700" />
                   </div>
                   <h3 className="text-lg font-bold text-neutral-500 uppercase tracking-widest">Consultor IA Familiar</h3>
                   <p className="text-xs text-neutral-600 leading-relaxed">
                      Preencha os dados do gasto ao lado para que eu possa analisar o impacto financeiro no seu mês e nos próximos.
                   </p>
                </div>
              )}
           </AnimatePresence>

           {result && (
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-carbon-black border border-white/10 p-6 rounded-sm shadow-xl">
                    <div className="flex items-center gap-2 mb-3">
                       <Wallet size={14} className="text-primary" />
                       <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Novo Saldo Final</span>
                    </div>
                    <p className="text-3xl font-display font-bold text-white">{formatCurrency(result.newProjectedBalance)}</p>
                 </div>
                 <div className="bg-carbon-black border border-white/10 p-6 rounded-sm shadow-xl">
                    <div className="flex items-center gap-2 mb-3">
                       <ShieldCheck size={14} className="text-primary" />
                       <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Risco de Reserva</span>
                    </div>
                    <p className={cn(
                       "text-3xl font-display font-bold",
                       result.riskLevel === "low" ? "text-primary" : result.riskLevel === "medium" ? "text-yellow-400" : "text-danger"
                    )}>
                       {result.riskLevel === "low" ? "Baixo" : result.riskLevel === "medium" ? "Médio" : "Alto"}
                    </p>
                 </div>
              </div>
           )}
        </div>
    </div>
  );
}
