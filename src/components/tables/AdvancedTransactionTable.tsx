"use client";

import React, { useState } from "react";
import { Transaction } from "@/types/finance";
import { formatCurrency, cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Download,
  Trash2,
  Calendar
} from "lucide-react";
import { useFinanceStore } from "@/store/useFinanceStore";

interface Props {
  transactions: Transaction[];
}

export function AdvancedTransactionTable({ transactions }: Props) {
  const deleteTransaction = useFinanceStore(state => state.deleteTransaction);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [search, setSearch] = useState("");

  const filteredData = transactions.filter(tx => {
    const matchesFilter = filter === "all" || tx.type === filter;
    const matchesSearch = tx.description.toLowerCase().includes(search.toLowerCase()) || 
                         tx.category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-carbon-900 border border-white/5 rounded-sm overflow-hidden">
      {/* Table Controls */}
      <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-sm border border-white/5">
          {["all", "income", "expense"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t as any)}
              className={cn(
                "px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-all rounded-xs",
                filter === t ? "bg-primary text-carbon-black" : "text-neutral-500 hover:text-white"
              )}
            >
              {t === "all" ? "Todos" : t === "income" ? "Entradas" : "Sadas"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
            <input 
              type="text" 
              placeholder="Buscar transaes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border border-white/5 rounded-sm pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 w-64"
            />
          </div>
          <button className="p-2 bg-white/5 border border-white/5 rounded-sm text-neutral-500 hover:text-white transition-all">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5 text-left">
              <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Data</th>
              <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Transao</th>
              <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Categoria</th>
              <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Mtodo</th>
              <th className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-right">Valor</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredData.map((tx) => (
              <tr key={tx.id} className="group hover:bg-white/[0.01] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-sm text-white font-medium">
                      {format(new Date(tx.date), "dd/MM/yyyy")}
                    </span>
                    <span className="text-[10px] text-neutral-600 uppercase font-bold">
                      {format(new Date(tx.date), "HH:mm")}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-xs flex items-center justify-center shrink-0",
                      tx.type === "income" ? "bg-primary/10 text-primary" : "bg-danger/10 text-danger"
                    )}>
                      {tx.type === "income" ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                    </div>
                    <span className="text-sm text-neutral-300 font-medium group-hover:text-white transition-colors">{tx.description}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-white/5 border border-white/5 rounded-xs text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    {tx.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-neutral-500">{tx.paymentMethod}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={cn(
                    "text-sm font-bold font-mono",
                    tx.type === "income" ? "text-primary" : "text-white"
                  )}>
                    {tx.type === "expense" ? "-" : "+"} {formatCurrency(tx.amount)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => deleteTransaction(tx.id)}
                    className="p-2 text-neutral-600 hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <div className="p-20 text-center">
            <Search size={48} className="mx-auto text-neutral-800 mb-4" />
            <h4 className="text-lg font-bold text-neutral-600">Nenhuma transao encontrada</h4>
            <p className="text-sm text-neutral-700 mt-2">Tente ajustar seus filtros ou busca.</p>
          </div>
        )}
      </div>
    </div>
  );
}
