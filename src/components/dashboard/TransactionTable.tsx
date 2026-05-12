"use client";

import React from "react";
import { Transaction } from "@/types/finance";
import { formatCurrency, cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MoreHorizontal, ArrowUpRight, ArrowDownLeft, FileDown, Edit2 } from "lucide-react";

interface TransactionTableProps {
  transactions: Transaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  return (
    <div className="bg-carbon-900 border border-white/5 rounded-sm overflow-hidden">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-display font-bold text-white">Transações Recentes</h3>
          <p className="text-sm text-neutral-500">Últimas atividades financeiras processadas</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-sm text-sm text-neutral-400 hover:text-white transition-all">
          <FileDown size={16} /> Exportar
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/[0.02] text-neutral-500 text-[10px] uppercase tracking-widest font-bold border-b border-white/5">
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Descrição</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Valor</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {transactions.map((tx) => (
              <tr key={tx.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-neutral-400">
                    {format(new Date(tx.date), "dd MMM, yyyy", { locale: ptBR })}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-xs flex items-center justify-center shrink-0",
                      tx.type === "income" ? "bg-primary/10 text-primary" : "bg-danger/10 text-danger"
                    )}>
                      {tx.type === "income" ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">{tx.description}</p>
                      <p className="text-[10px] text-neutral-600 uppercase tracking-wider">{tx.account}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-white/5 border border-white/5 rounded-xs text-[10px] text-neutral-400 font-medium uppercase">
                    {tx.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      tx.status === "completed" ? "bg-primary" : "bg-yellow-500"
                    )} />
                    <span className="text-xs text-neutral-400 capitalize">{tx.status === "completed" ? "Concluído" : "Pendente"}</span>
                  </div>
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
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-neutral-500 hover:text-white transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button className="p-1.5 text-neutral-500 hover:text-white transition-colors">
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-white/[0.01] border-t border-white/5 flex items-center justify-center">
        <button className="text-xs text-neutral-500 hover:text-white transition-colors uppercase tracking-widest font-bold">
          Ver todas as transações
        </button>
      </div>
    </div>
  );
}
