"use client";

import React, { useState } from "react";
import { usePlanningStore, PlannedExpense } from "@/store/usePlanningStore";
import { CheckCircle2, Circle, Plus, Trash2, Wallet, Calculator, ShieldAlert, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PlanejamentoPage() {
  const { expenses, addExpense, removeExpense, togglePaid, resetMonth } = usePlanningStore();
  
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [isEssential, setIsEssential] = useState(true);

  const formatCurrency = (val: number) => 
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newAmount) return;
    
    addExpense({
      name: newName,
      amount: parseFloat(newAmount),
      isEssential
    });
    
    setNewName("");
    setNewAmount("");
    
    // Sync to create the transaction immediately
    const { useFinanceStore } = await import('@/store/useFinanceStore');
    await useFinanceStore.getState().syncPlannedExpenses();
  };

  const handleToggle = async (expense: PlannedExpense) => {
    togglePaid(expense.id);
    
    const { useFinanceStore } = await import('@/store/useFinanceStore');
    const { transactions, selectedDate, toggleTransactionStatus } = useFinanceStore.getState();
    const targetDate = new Date(selectedDate);
    
    // Find the matching transaction for this month
    const matchingTx = transactions.find(t => {
      const d = new Date(t.date);
      return d.getMonth() === targetDate.getMonth() && 
             d.getFullYear() === targetDate.getFullYear() && 
             t.description.toLowerCase() === expense.name.toLowerCase() &&
             t.expenseType === "fixo";
    });

    if (matchingTx) {
      // Toggle it to match the new state
      const isNowPaid = !expense.isPaid;
      if (
        (isNowPaid && matchingTx.status !== "completed") || 
        (!isNowPaid && matchingTx.status === "completed")
      ) {
        toggleTransactionStatus(matchingTx.id);
      }
    }
  };

  const essentialExpenses = expenses.filter(e => e.isEssential);
  const nonEssentialExpenses = expenses.filter(e => !e.isEssential);

  const totalEssential = essentialExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalNonEssential = nonEssentialExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = expenses.filter(e => !e.isPaid).reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = expenses.filter(e => e.isPaid).reduce((acc, curr) => acc + curr.amount, 0);

  // Regra de Ouro do Usuário
  const idealReserve = (totalEssential * 8) + (totalNonEssential * 0.4);

  const renderExpenseItem = (expense: PlannedExpense) => (
    <div key={expense.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-sm group hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => handleToggle(expense)}
          className={cn(
            "transition-colors",
            expense.isPaid ? "text-primary" : "text-neutral-500 hover:text-white"
          )}
        >
          {expense.isPaid ? <CheckCircle2 size={24} /> : <Circle size={24} />}
        </button>
        <div>
          <p className={cn(
            "text-sm font-bold",
            expense.isPaid ? "text-neutral-400 line-through" : "text-white"
          )}>
            {expense.name}
          </p>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
            {expense.isPaid ? "Pago" : "Pendente"}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <span className={cn(
          "font-display font-bold",
          expense.isPaid ? "text-neutral-500" : "text-white"
        )}>
          {formatCurrency(expense.amount)}
        </span>
        <button 
          onClick={() => removeExpense(expense.id)}
          className="text-neutral-600 hover:text-danger opacity-0 group-hover:opacity-100 transition-all p-1"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="text-primary" size={24} />
          <h1 className="text-3xl font-display font-bold text-white tracking-tight uppercase">Planejamento Mensal</h1>
        </div>
        <button 
          onClick={resetMonth}
          className="text-xs font-bold uppercase tracking-widest px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-sm border border-white/10 transition-colors"
        >
          Resetar Mês (Marcar tudo Pendente)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Painel de Resumo */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-carbon-900 border border-white/5 p-6 rounded-sm space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Calculator size={16} className="text-primary" /> Resumo do Salário
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-xs text-neutral-400 uppercase tracking-widest">A Pagar (Pendente)</span>
                <span className="text-lg font-display font-bold text-danger">{formatCurrency(totalPending)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-xs text-neutral-400 uppercase tracking-widest">Já Pago</span>
                <span className="text-lg font-display font-bold text-primary">{formatCurrency(totalPaid)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs font-bold text-white uppercase tracking-widest">Custo de Vida Total</span>
                <span className="text-xl font-display font-bold text-white">{formatCurrency(totalEssential + totalNonEssential)}</span>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 p-6 rounded-sm space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert size={16} className="text-primary" /> Reserva de Emergência Ideal
            </h3>
            <p className="text-[10px] text-neutral-400">
              Cálculo baseado em <strong className="text-white">8x os gastos essenciais</strong> + <strong className="text-white">40% dos não essenciais</strong>.
            </p>
            <div className="pt-2">
              <span className="text-3xl font-display font-bold text-white">
                {formatCurrency(idealReserve)}
              </span>
            </div>
          </div>

          {/* Form de Adicionar */}
          <div className="bg-carbon-900 border border-white/5 p-6 rounded-sm space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Adicionar Gasto Fixo</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <input 
                type="text"
                placeholder="Ex: Aluguel"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-sm p-3 text-sm text-white focus:outline-none focus:border-primary/50"
              />
              <input 
                type="number"
                step="0.01"
                placeholder="Valor (R$)"
                value={newAmount}
                onChange={e => setNewAmount(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-sm p-3 text-sm text-white focus:outline-none focus:border-primary/50"
              />
              <div className="flex gap-2 p-1 bg-white/5 rounded-sm border border-white/5">
                <button
                  type="button"
                  onClick={() => setIsEssential(true)}
                  className={cn(
                    "flex-1 py-2 rounded-xs text-[10px] font-bold uppercase tracking-widest transition-all",
                    isEssential ? "bg-primary text-carbon-black" : "text-neutral-500 hover:text-white"
                  )}
                >
                  Essencial
                </button>
                <button
                  type="button"
                  onClick={() => setIsEssential(false)}
                  className={cn(
                    "flex-1 py-2 rounded-xs text-[10px] font-bold uppercase tracking-widest transition-all",
                    !isEssential ? "bg-white/20 text-white" : "text-neutral-500 hover:text-white"
                  )}
                >
                  Não Essencial
                </button>
              </div>
              <button 
                type="submit"
                className="w-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary hover:text-carbon-black font-display font-bold py-3 rounded-sm transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Adicionar
              </button>
            </form>
          </div>
        </div>

        {/* Listas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h2 className="text-lg font-display font-bold text-white">Gastos Essenciais</h2>
              <span className="text-xs font-bold text-neutral-400 bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest">
                {formatCurrency(totalEssential)}
              </span>
            </div>
            {essentialExpenses.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-4">Nenhum gasto essencial cadastrado.</p>
            ) : (
              <div className="space-y-2">
                {essentialExpenses.map(renderExpenseItem)}
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h2 className="text-lg font-display font-bold text-white">Gastos Não Essenciais</h2>
              <span className="text-xs font-bold text-neutral-400 bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest">
                {formatCurrency(totalNonEssential)}
              </span>
            </div>
            {nonEssentialExpenses.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-4">Nenhum gasto não essencial cadastrado.</p>
            ) : (
              <div className="space-y-2">
                {nonEssentialExpenses.map(renderExpenseItem)}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
