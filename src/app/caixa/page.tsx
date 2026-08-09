"use client";

import React, { useState } from "react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { motion } from "framer-motion";
import { Wallet, Plus, User, User2, Users, CreditCard, Banknote, Landmark, Save, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CaixaPage() {
  const { accounts, updateAccountBalance, addAccount } = useFinanceStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [newAcc, setNewAcc] = useState({
    name: "",
    institution: "",
    type: "checking" as any,
    owner: "Matheus" as any,
  });

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAcc.name || !newAcc.institution) return;
    
    await addAccount({
      name: newAcc.name,
      institution: newAcc.institution,
      type: newAcc.type,
      owner: newAcc.owner,
      currency: "BRL",
    });
    
    setShowModal(false);
    setNewAcc({ name: "", institution: "", type: "checking", owner: "Matheus" });
  };

  return (
    <div className="p-8 space-y-8 max-w-[1200px] mx-auto relative">
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
             {formatCurrency(accounts.reduce((acc, a) => acc + a.balance, 0))}
           </h2>
        </div>
        <div className="flex gap-4">
           <div className="text-right">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Matheus</p>
              <p className="text-lg font-bold text-white">{formatCurrency(accounts.filter(a => a.owner === "Matheus").reduce((acc, a) => acc + a.balance, 0))}</p>
           </div>
           <div className="text-right border-l border-white/10 pl-4">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Heloisa</p>
              <p className="text-lg font-bold text-white">{formatCurrency(accounts.filter(a => a.owner === "Heloisa").reduce((acc, a) => acc + a.balance, 0))}</p>
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
                      className="bg-white/5 border border-primary/50 rounded-xs p-2 text-xl font-display font-bold text-white w-full outline-none"
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

        <button 
          onClick={() => setShowModal(true)}
          className="border border-dashed border-white/10 rounded-sm p-6 flex flex-col items-center justify-center gap-3 text-neutral-500 hover:text-primary hover:border-primary/50 transition-all group min-h-[160px]"
        >
           <div className="p-2 bg-white/5 rounded-full group-hover:bg-primary/20">
              <Plus size={20} />
           </div>
           <span className="text-xs font-bold uppercase tracking-widest">Adicionar Conta</span>
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-carbon-900 border border-carbon-700 p-6 rounded-lg w-full max-w-md shadow-2xl relative"
          >
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-white mb-6">Nova Conta</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Nome da Conta</label>
                <input 
                  required
                  value={newAcc.name}
                  onChange={e => setNewAcc({...newAcc, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-white outline-none focus:border-primary"
                  placeholder="Ex: Conta Corrente Itaú"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Instituição</label>
                <input 
                  required
                  value={newAcc.institution}
                  onChange={e => setNewAcc({...newAcc, institution: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-white outline-none focus:border-primary"
                  placeholder="Ex: Itaú, Nubank, Bradesco"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Tipo</label>
                  <select 
                    value={newAcc.type}
                    onChange={e => setNewAcc({...newAcc, type: e.target.value as any})}
                    className="w-full bg-carbon-800 border border-white/10 rounded-md p-3 text-white outline-none focus:border-primary"
                  >
                    <option value="checking">Corrente</option>
                    <option value="savings">Poupança</option>
                    <option value="investment">Investimento</option>
                    <option value="cash">Dinheiro Físico</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Dono</label>
                  <select 
                    value={newAcc.owner}
                    onChange={e => setNewAcc({...newAcc, owner: e.target.value as any})}
                    className="w-full bg-carbon-800 border border-white/10 rounded-md p-3 text-white outline-none focus:border-primary"
                  >
                    <option value="Matheus">Matheus</option>
                    <option value="Heloisa">Heloisa</option>
                    <option value="Ambos">Ambos</option>
                  </select>
                </div>
              </div>
              <button 
                type="submit"
                className="w-full mt-4 bg-primary text-carbon-black font-bold py-3 rounded-md hover:bg-primary/90 transition-colors"
              >
                Criar Conta
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
