"use client";

import React, { useState } from "react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRightLeft, 
  Filter, 
  Plus, 
  Search, 
  User, 
  User2, 
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2
} from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function GastosPage() {
  const { transactions, deleteTransaction, toggleTransactionStatus } = useFinanceStore();
  const { openTransactionModal } = useUIStore();
  const [search, setSearch] = useState("");
  const [respFilter, setRespFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const expenses = transactions.filter(t => t.type === "expense");

  const filteredExpenses = expenses.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase());
    const matchesResp = respFilter === "Todos" || t.responsible === respFilter;
    const matchesStatus = statusFilter === "Todos" || (statusFilter === "Pago" ? t.status === "completed" : t.status === "pending");
    return matchesSearch && matchesResp && matchesStatus;
  });

  const formatCurrency = (val: number) => 
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const getStatusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle2 size={14} className="text-primary" />;
    if (status === "pending") return <Clock size={14} className="text-yellow-400" />;
    return <AlertCircle size={14} className="text-danger" />;
  };

  const getResponsibleIcon = (resp: string) => {
    if (resp === "Matheus") return <User size={14} className="text-primary" />;
    if (resp === "Heloisa") return <User2 size={14} className="text-pink-400" />;
    return <Users size={14} className="text-blue-400" />;
  };

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ArrowRightLeft className="text-primary" size={24} />
          <h1 className="text-3xl font-display font-bold text-white tracking-tight uppercase">Gastos do Mês</h1>
        </div>
        <button 
          onClick={() => openTransactionModal()}
          className="flex items-center gap-2 bg-primary text-carbon-black px-4 py-2 rounded-sm font-bold text-sm transition-transform hover:scale-105 active:scale-95"
        >
          <Plus size={18} /> Novo Gasto
        </button>
      </div>

      <div className="p-4 bg-white/5 border border-white/10 rounded-sm">
        <p className="text-xs text-neutral-400">
          <strong className="text-primary">Instrução:</strong> Organize seus gastos por prioridade. Use <span className="text-danger">"Essencial"</span> para contas vitais e <span className="text-white">"Opcional"</span> para lazer e desejos.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white/5 border border-white/5 p-4 rounded-sm flex flex-wrap items-center gap-6">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar gasto..."
            className="w-full bg-white/5 border border-white/10 rounded-sm py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User size={14} className="text-neutral-500" />
            <select 
              value={respFilter}
              onChange={(e) => setRespFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-white uppercase focus:outline-none"
            >
              <option value="Todos">Todos Responsveis</option>
              <option value="Matheus">Matheus</option>
              <option value="Heloisa">Heloisa</option>
              <option value="Ambos">Ambos</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-neutral-500" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-white uppercase focus:outline-none"
            >
              <option value="Todos">Todos Status</option>
              <option value="Pago">Pago</option>
              <option value="Pendente">Pendente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-carbon-900 border border-white/5 rounded-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/5">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Gasto</th>
              <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Categoria</th>
              <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Valor</th>
              <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Vencimento</th>
              <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Responsvel</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <AnimatePresence mode="popLayout">
              {filteredExpenses.map((expense) => (
                <motion.tr 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key={expense.id} 
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-4">
                     <p className="text-sm font-medium text-white">{expense.description}</p>
                     <p className="text-[10px] text-neutral-500 uppercase tracking-tighter">{expense.expenseType}</p>
                  </td>
                  <td className="px-6 py-4">
                     <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-2 py-1 bg-white/5 rounded-xs">
                        {expense.category}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-white">{formatCurrency(expense.amount)}</td>
                  <td className="px-6 py-4 text-xs text-neutral-400">
                    {format(new Date(expense.date), "dd/MM", { locale: ptBR })}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleTransactionStatus(expense.id)}
                      className="flex items-center gap-2 hover:bg-white/5 p-2 rounded-sm transition-all"
                    >
                      {getStatusIcon(expense.status)}
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        expense.status === "completed" ? "text-primary" : "text-yellow-400"
                      )}>
                        {expense.status === "completed" ? "Pago" : "Pendente"}
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getResponsibleIcon(incomeResponsible(expense))}
                      <span className="text-xs text-white">{incomeResponsible(expense)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openTransactionModal(expense)}
                        className="p-2 text-neutral-500 hover:text-white transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteTransaction(expense.id)}
                        className="p-2 text-neutral-600 hover:text-danger transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Temporary helper to get responsibility from mixed types if needed, 
// but my new Transaction type already has 'responsible'.
function incomeResponsible(tx: any): string {
  return tx.responsible || "Ambos";
}
