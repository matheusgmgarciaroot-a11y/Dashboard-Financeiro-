"use client";

import React, { useState } from "react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { motion } from "framer-motion";
import { Wallet, Plus, User, User2, Users, CreditCard, Banknote, Landmark, Save, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CaixaPage() {
  const { accounts, updateAccountBalance } = useFinanceStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const formatCurrency = (val: number) => 
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const getAccountIcon = (type: string) => {
    if (type === "checking") return <Landmark size={18} />;
    if (type === "cash") return <Banknote size={18} />;
    if (type === "credit") return <CreditCard size={18} />;
    return <Wallet size={18} />;
  };

  const getOwnerIcon = (owner: string) => {
    if (owner === "Matheus") return <User size={12} className="text-primary" />;
    if (owner === "Heloisa") return <User2 size={12} className="text-pink-400" />;
    return <Users size={12} className="text-blue-400" />;
  };

  const handleSave = (id: string) => {
    updateAccountBalance(id, parseFloat(editValue));
    setEditingId(null);
  };

  return (
    <div className="p-8 space-y-8 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wallet className="text-primary" size={24} />
          <h1 className="text-3xl font-display font-bold text-white tracking-tight uppercase">Valor em Caixa Hoje</h1>
        </div>
      </div>

      <div className="p-4 bg-white/5 border border-white/10 rounded-sm">
        <p className="text-xs text-neutral-400">
          <strong className="text-primary">Instrução:</strong> Mantenha os saldos das contas atualizados para que a "Visão do Mês" mostre quanto dinheiro real vocês têm disponível no momento.
        </p>
      </div>

      <div className="bg-primary/5 border border-primary/10 p-6 rounded-sm flex items-center justify-between">
        <div>
           <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Total em Caixa (Somado)</p>
           <h2 className="text-4xl font-display font-bold text-white">
             {formatCurrency(accounts.filter(a => a.type !== "savings").reduce((acc, a) => acc + a.balance, 0))}
           </h2>
        </div>
        <div className="flex gap-4">
           <div className="text-right">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Matheus</p>
              <p className="text-lg font-bold text-white">{formatCurrency(accounts.filter(a => a.owner === "Matheus" && a.type !== "savings").reduce((acc, a) => acc + a.balance, 0))}</p>
           </div>
           <div className="text-right border-l border-white/10 pl-4">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Heloisa</p>
              <p className="text-lg font-bold text-white">{formatCurrency(accounts.filter(a => a.owner === "Heloisa" && a.type !== "savings").reduce((acc, a) => acc + a.balance, 0))}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc) => (
          <div key={acc.id} className="bg-carbon-900 border border-white/5 p-6 rounded-sm space-y-4 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-sm text-neutral-400">
                  {getAccountIcon(acc.type)}
                </div>
                <div>
                   <h4 className="text-sm font-bold text-white">{acc.name}</h4>
                   <p className="text-[10px] text-neutral-500 uppercase tracking-widest">{acc.institution}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded-full">
                {getOwnerIcon(acc.owner)}
                <span className="text-[9px] font-bold text-neutral-400 uppercase">{acc.owner}</span>
              </div>
            </div>

            <div className="pt-2">
              {editingId === acc.id ? (
                <div className="flex items-center gap-2">
                   <input 
                      autoFocus
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="bg-white/5 border border-primary/50 rounded-xs p-2 text-xl font-display font-bold text-white w-full"
                   />
                   <button 
                      onClick={() => handleSave(acc.id)}
                      className="p-2 bg-primary text-carbon-black rounded-xs"
                   >
                      <Save size={18} />
                   </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                   <p className="text-2xl font-display font-bold text-white">{formatCurrency(acc.balance)}</p>
                   <button 
                      onClick={() => {
                        setEditingId(acc.id);
                        setEditValue(acc.balance.toString());
                      }}
                      className="p-2 text-neutral-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                   >
                      <Pencil size={16} />
                   </button>
                </div>
              )}
            </div>
          </div>
        ))}

        <button className="border border-dashed border-white/10 rounded-sm p-6 flex flex-col items-center justify-center gap-3 text-neutral-500 hover:text-primary hover:border-primary/50 transition-all group">
           <div className="p-2 bg-white/5 rounded-full group-hover:bg-primary/20">
              <Plus size={20} />
           </div>
           <span className="text-xs font-bold uppercase tracking-widest">Adicionar Conta</span>
        </button>
      </div>
    </div>
  );
}
