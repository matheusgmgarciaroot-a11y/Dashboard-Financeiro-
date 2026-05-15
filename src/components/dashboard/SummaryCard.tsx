"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: "primary" | "success" | "danger" | "info" | "warning";
  isCurrency?: boolean;
  prefix?: string;
}

export function SummaryCard({ 
  title, 
  value, 
  icon: Icon, 
  variant = "primary",
  isCurrency = true,
  prefix = ""
}: SummaryCardProps) {
  
  const formatValue = (val: number) => {
    const safeVal = val ?? 0;
    if (!isCurrency) return `${prefix}${safeVal.toLocaleString("pt-BR")}`;
    return safeVal.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const colors = {
    primary: "text-primary border-primary/20 bg-primary/5",
    success: "text-primary border-primary/20 bg-primary/5", // Green-ish in this theme is primary
    danger: "text-danger border-danger/20 bg-danger/5",
    info: "text-blue-400 border-blue-400/20 bg-blue-400/5",
    warning: "text-yellow-400 border-yellow-400/20 bg-yellow-400/5",
  };

  return (
    <div className={cn(
      "p-6 rounded-sm border bg-carbon-900 shadow-premium transition-all hover:border-white/20 group",
      "border-white/5"
    )}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">
          {title}
        </span>
        <div className={cn("p-2 rounded-sm transition-colors", colors[variant])}>
          <Icon size={16} />
        </div>
      </div>
      
      <div className="flex flex-col">
        <h3 className="text-2xl font-display font-bold text-white tracking-tight">
          {formatValue(value)}
        </h3>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "70%" }}
            className={cn("h-full", 
              variant === "danger" ? "bg-danger" : 
              variant === "warning" ? "bg-yellow-400" : "bg-primary"
            )}
          />
        </div>
      </div>
    </div>
  );
}
