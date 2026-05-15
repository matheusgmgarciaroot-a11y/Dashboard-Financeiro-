"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpCircle, ArrowDownCircle, Info, User, User2, Users } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useFinanceStore } from "@/store/useFinanceStore";
import { cn } from "@/lib/utils";
import { Responsibility, Priority, ExpenseCategory, TransactionStatus } from "@/types/finance";

const transactionSchema = z.object({
  description: z.string().min(3, "Descrio muito curta"),
  amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Selecione uma categoria"),
  date: z.string(),
  paymentMethod: z.string().min(1, "Selecione o mtodo"),
  account: z.string().min(1, "Selecione a conta"),
  responsible: z.enum(["Matheus", "Heloisa", "Ambos"]),
  priority: z.enum(["essential", "important", "optional"]),
  expenseType: z.enum(["fixo", "variavel", "parcelado", "eventual"]),
  installmentCurrent: z.number().optional(),
  installmentTotal: z.number().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export function TransactionModal() {
  const { isTransactionModalOpen, closeTransactionModal, editingTransaction } = useUIStore();
  const { addTransaction, updateTransaction, accounts } = useFinanceStore();

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      date: new Date().toISOString().split("T")[0],
      responsible: "Ambos",
      priority: "important",
      expenseType: "variavel",
    }
  });

  // Effect to populate form when editing
  React.useEffect(() => {
    if (editingTransaction) {
      reset({
        description: editingTransaction.description.split(" (")[0], // Remove a info da parcela se houver
        amount: editingTransaction.amount,
        type: editingTransaction.type as "income" | "expense",
        category: editingTransaction.category,
        date: new Date(editingTransaction.date).toISOString().split("T")[0],
        paymentMethod: editingTransaction.paymentMethod,
        account: editingTransaction.account,
        responsible: editingTransaction.responsible,
        priority: editingTransaction.priority,
        expenseType: editingTransaction.expenseType,
        installmentCurrent: editingTransaction.installments?.current,
        installmentTotal: editingTransaction.installments?.total,
      });
    } else {
      reset({
        type: "expense",
        date: new Date().toISOString().split("T")[0],
        responsible: "Ambos",
        priority: "important",
        expenseType: "variavel",
      });
    }
  }, [editingTransaction, reset]);

  const transactionType = watch("type");

  const onSubmit = (data: TransactionFormData) => {
    const { installmentCurrent, installmentTotal, ...rest } = data;
    
    const txPayload = { 
      ...rest, 
      status: (editingTransaction?.status || "completed") as TransactionStatus,
      installments: data.expenseType === "parcelado" ? {
        current: installmentCurrent || 1,
        total: installmentTotal || 1
      } : undefined
    };

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, txPayload);
    } else {
      addTransaction(txPayload);
    }

    reset();
    closeTransactionModal();
  };

  return (
    <AnimatePresence>
      {isTransactionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeTransactionModal}
            className="absolute inset-0 bg-carbon-black/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-carbon-900 border border-white/5 rounded-sm shadow-premium overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-display font-bold text-white tracking-tight">
                {editingTransaction ? "Editar Transação" : "Nova Transação"}
              </h3>
              <button onClick={closeTransactionModal} className="p-2 hover:bg-white/5 rounded-sm transition-colors text-neutral-500">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {/* Type Toggle */}
              <div className="flex gap-2 p-1 bg-white/5 rounded-sm border border-white/5">
                <button
                  type="button"
                  onClick={() => reset({ ...watch(), type: "income" })}
                  className={cn(
                    "flex-1 py-3 flex items-center justify-center gap-2 rounded-xs text-xs font-bold uppercase tracking-widest transition-all",
                    transactionType === "income" ? "bg-primary text-carbon-black" : "text-neutral-500 hover:text-white"
                  )}
                >
                  <ArrowUpCircle size={16} /> Entrada
                </button>
                <button
                  type="button"
                  onClick={() => reset({ ...watch(), type: "expense" })}
                  className={cn(
                    "flex-1 py-3 flex items-center justify-center gap-2 rounded-xs text-xs font-bold uppercase tracking-widest transition-all",
                    transactionType === "expense" ? "bg-danger text-white" : "text-neutral-500 hover:text-white"
                  )}
                >
                  <ArrowDownCircle size={16} /> Saída
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Descrição</label>
                  <input 
                    {...register("description")}
                    className="w-full bg-white/5 border border-white/5 rounded-sm p-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="Ex: Salário, Supermercado..."
                  />
                  {errors.description && <p className="text-[10px] text-danger">{errors.description.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Valor (R$)</label>
                  <input 
                    type="number"
                    step="0.01"
                    {...register("amount", { valueAsNumber: true })}
                    className="w-full bg-white/5 border border-white/5 rounded-sm p-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="0,00"
                  />
                  {errors.amount && <p className="text-[10px] text-danger">{errors.amount.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Responsável</label>
                  <select 
                    {...register("responsible")}
                    className="w-full bg-white/5 border border-white/5 rounded-sm p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 [&>option]:bg-carbon-black"
                  >
                    <option value="Ambos">Ambos</option>
                    <option value="Matheus">Matheus</option>
                    <option value="Heloisa">Heloisa</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Prioridade</label>
                  <select 
                    {...register("priority")}
                    className="w-full bg-white/5 border border-white/5 rounded-sm p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 [&>option]:bg-carbon-black"
                  >
                    <option value="essential">Essencial</option>
                    <option value="important">Importante</option>
                    <option value="optional">Opcional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Categoria</label>
                  <select 
                    {...register("category")}
                    className="w-full bg-white/5 border border-white/5 rounded-sm p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 [&>option]:bg-carbon-black"
                  >
                    <option value="outros">Outros</option>
                    <option value="moradia">Moradia</option>
                    <option value="mercado">Mercado</option>
                    <option value="alimentacao">Alimentação</option>
                    <option value="transporte">Transporte</option>
                    <option value="saude">Saúde</option>
                    <option value="lazer">Lazer</option>
                    <option value="assinaturas">Assinaturas</option>
                    <option value="investimentos">Investimentos</option>
                    <option value="reserva_financeira">Reserva Financeira</option>
                    <option value="pets">Pets</option>
                    <option value="compras">Compras</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Tipo de Gasto</label>
                  <select 
                    {...register("expenseType")}
                    className="w-full bg-white/5 border border-white/5 rounded-sm p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 [&>option]:bg-carbon-black"
                  >
                    <option value="fixo">Fixo</option>
                    <option value="variavel">Variável</option>
                    <option value="parcelado">Parcelado</option>
                    <option value="eventual">Eventual</option>
                  </select>
                </div>
              </div>

              {watch("expenseType") === "parcelado" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="grid grid-cols-2 gap-4 p-4 bg-primary/5 border border-primary/10 rounded-sm"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-primary uppercase tracking-widest">Parcela Atual</label>
                    <input 
                      type="number"
                      {...register("installmentCurrent", { valueAsNumber: true })}
                      className="w-full bg-carbon-black border border-primary/20 rounded-sm p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-primary uppercase tracking-widest">Total de Parcelas</label>
                    <input 
                      type="number"
                      {...register("installmentTotal", { valueAsNumber: true })}
                      className="w-full bg-carbon-black border border-primary/20 rounded-sm p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                      placeholder="12"
                    />
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Método de Pagamento</label>
                  <select 
                    {...register("paymentMethod")}
                    className="w-full bg-white/5 border border-white/5 rounded-sm p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 [&>option]:bg-carbon-black"
                  >
                    <option value="pix">PIX</option>
                    <option value="credito">Cartão de Crédito</option>
                    <option value="debito">Cartão de Débito</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="boleto">Boleto</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Conta</label>
                  <select 
                    {...register("account")}
                    className="w-full bg-white/5 border border-white/5 rounded-sm p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 [&>option]:bg-carbon-black"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.name}>{acc.name} ({acc.owner})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Data</label>
                <input 
                  type="date"
                  {...register("date")}
                  className="w-full bg-white/5 border border-white/5 rounded-sm p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-primary text-carbon-black font-display font-bold py-4 rounded-sm shadow-[0_0_20px_rgba(223,255,0,0.2)] hover:shadow-[0_0_30px_rgba(223,255,0,0.4)] transition-all"
              >
                Registrar na Planilha
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
