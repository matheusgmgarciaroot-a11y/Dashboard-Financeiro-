"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Wallet, 
  TrendingUp, 
  ShieldCheck, 
  Zap,
  Target, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  BarChart3,
  PieChart
} from "lucide-react";
import { useSidebar } from "@/hooks/useSidebar";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Visão do Mês", href: "/" },
  { icon: TrendingUp, label: "Receitas / Salários", href: "/receitas" },
  { icon: ArrowRightLeft, label: "Gastos do Mês", href: "/gastos" },
  { icon: Target, label: "Planejamento Mensal", href: "/planejamento" },
  { icon: PieChart, label: "Análise de Gastos", href: "/analise" },
  { icon: ShieldCheck, label: "Reserva Financeira", href: "/reserva" },
  { icon: Wallet, label: "Valor em Caixa", href: "/caixa" },
  { icon: Zap, label: "Consultor de Gastos", href: "/simulador" },
  { icon: BarChart3, label: "Gráficos", href: "/insights" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isExpanded, toggle } = useSidebar();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isExpanded ? 240 : 80 }}
      className={cn(
        "fixed left-0 top-0 h-full bg-carbon-black border-r border-white/5 z-50 flex flex-col transition-colors duration-300",
        !isExpanded && "items-center"
      )}
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center px-6 mb-8">
        <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-sm shrink-0 shadow-[0_0_20px_rgba(223,255,0,0.3)]">
          <span className="text-carbon-black font-display font-bold text-xl">C</span>
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="ml-3 flex flex-col"
            >
              <span className="font-display font-bold text-lg tracking-tight text-white whitespace-nowrap leading-none">
                Carbon Finance
              </span>
              <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] mt-1">Intelligence</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "group relative flex items-center px-3 py-3 rounded-sm transition-all duration-200 cursor-pointer",
                  isActive 
                    ? "bg-white/5 text-primary" 
                    : "text-neutral-500 hover:text-white hover:bg-white/[0.02]"
                )}
              >
                <item.icon size={20} className={cn("shrink-0 transition-transform duration-300 group-hover:scale-110", isActive && "text-primary")} />
                
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-4 font-medium text-xs uppercase tracking-widest whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}

                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-white/5 mt-auto">
        {isExpanded && (
           <div className="mb-4 px-3 py-4 bg-white/5 rounded-sm border border-white/5">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Upgrade Pro</p>
              <p className="text-xs text-white font-medium mb-3 leading-relaxed">Libere o simulador avançado e multi-contas.</p>
              <button className="w-full py-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase rounded-xs hover:bg-primary hover:text-carbon-black transition-all">
                Assinar Pro
              </button>
           </div>
        )}

        <div className="space-y-1">
          <div className={cn(
            "flex items-center px-3 py-3 rounded-sm text-neutral-500 hover:text-white hover:bg-white/[0.02] transition-all cursor-pointer"
          )}>
            <Settings size={20} className="shrink-0" />
            {isExpanded && <span className="ml-4 font-medium text-xs uppercase tracking-widest">Configurações</span>}
          </div>
          
          <div className={cn(
            "flex items-center px-3 py-3 rounded-sm text-danger/70 hover:text-danger hover:bg-danger/5 transition-all cursor-pointer"
          )}>
            <LogOut size={20} className="shrink-0" />
            {isExpanded && <span className="ml-4 font-medium text-xs uppercase tracking-widest">Sair</span>}
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={toggle}
          className="w-full mt-4 flex items-center justify-center p-2 rounded-sm border border-white/5 hover:bg-white/5 text-neutral-400 transition-all"
        >
          {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </motion.aside>
  );
}
