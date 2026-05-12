"use client";

import React, { useState } from "react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { formatCurrency, cn } from "@/lib/utils";
import { 
  Wallet, 
  Banknote, 
  CreditCard, 
  Plus, 
  RefreshCw,
  Save,
  Pencil
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CashManager() {
  const { accounts, updateAccountBalance } = useFinanceStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleStartEdit = (id: string, currentBalance: number) => {
    setEditingId(id);
    setEditValue(currentBalance.toString());
  };

  const handleSave = (id: string) => {
    const value = parseFloat(editValue);
    if (!isNaN(value)) {
      updateAccountBalance(id, value);
    }
    setEditingId(null);
  };

  return (
    <div className="bg-carbon-900 border border-white/5 p-8 rounded-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center">
            <Wallet className="text-primary" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-white tracking-tight">Valor em Caixa</h3>
            <p className="text-sm text-neutral-500">Saldo atualizado em suas contas e carteiras</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-sm text-xs font-bold text-neutral-400 hover:text-white transition-all uppercase tracking-widest">
          <RefreshCw size={14} /> Sincronizar Open Finance
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc) => (
          <div 
            key={acc.id} 
            className="p-6 bg-white/[0.02] border border-white/5 rounded-sm hover:border-white/10 transition-all group relative"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xs flex items-center justify-center bg-white/5 text-neutral-400 group-hover:text-primary transition-colors">
                {acc.type === "checking" && <RefreshCw size={20} />}
                {acc.type === "savings" && <Banknote size={20} />}
                {acc.type === "investment" && <CreditCard size={20} />}
                {acc.type === "cash" && <Wallet size={20} />}
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">{acc.institution}</p>
                <p className="text-xs font-bold text-neutral-400">{acc.name}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <AnimatePresence mode="wait">
                {editingId === acc.id ? (
                  <motion.div 
                    key="edit"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 w-full"
                  >
                    <input 
                      autoFocus
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="bg-white/10 border border-primary/50 rounded-xs px-2 py-1 text-lg font-display font-bold text-white w-full focus:outline-none"
                    />
                    <button 
                      onClick={() => handleSave(acc.id)}
                      className="p-2 bg-primary text-carbon-black rounded-xs"
                    >
                      <Save size={16} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="display"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between w-full"
                  >
                    <h4 className="text-2xl font-display font-bold text-white">
                      {formatCurrency(acc.balance, acc.currency)}
                    </h4>
                    <button 
                      onClick={() => handleStartEdit(acc.id, acc.balance)}
                      className="p-2 text-neutral-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Pencil size={16} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Real-time sync indicator */}
            <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}

        <button className="p-6 border border-dashed border-white/10 rounded-sm flex flex-col items-center justify-center gap-2 text-neutral-600 hover:text-primary hover:border-primary/50 transition-all group">
          <Plus size={24} className="group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Adicionar Conta</span>
        </button>
      </div>
    </div>
  );
}
