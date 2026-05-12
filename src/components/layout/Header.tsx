"use client";

import React from "react";
import { Search, Bell, Plus, Moon, Sun, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";

export function Header() {
  const openTransactionModal = useUIStore((state) => state.openTransactionModal);

  return (
    <header className="h-20 flex items-center justify-between px-8 bg-background/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Pesquisar transações, contas..."
            className="w-full bg-white/5 border border-white/5 rounded-sm py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:bg-white/10 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-xs border border-white/10 text-[10px] text-neutral-500 font-mono">
            /
          </div>
        </div>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-3 ml-8">
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-sm border border-white/5 mr-4">
          <button className="px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors">7D</button>
          <button className="px-3 py-1.5 text-xs font-medium bg-primary text-carbon-black rounded-xs shadow-lg">30D</button>
          <button className="px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors">90D</button>
          <button className="px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-1">
            <Filter size={12} /> Personalizado
          </button>
        </div>

        <button className="p-2.5 rounded-sm bg-white/5 border border-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
        </button>

        <button className="p-2.5 rounded-sm bg-white/5 border border-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-all">
          <Moon size={20} />
        </button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openTransactionModal}
          className="flex items-center gap-2 bg-primary text-carbon-black px-4 py-2.5 rounded-sm font-display font-bold text-sm shadow-[0_0_20px_rgba(223,255,0,0.2)]"
        >
          <Plus size={18} strokeWidth={3} />
          <span className="hidden sm:inline">Nova Transação</span>
        </motion.button>

        <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-neutral-700 to-neutral-900 border border-white/10 ml-2 overflow-hidden cursor-pointer hover:border-primary/50 transition-colors">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
            alt="User" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
