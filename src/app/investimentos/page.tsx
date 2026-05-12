"use client";

import React from "react";
import { InvestmentReserve } from "@/components/finance/InvestmentReserve";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export default function InvestmentsPage() {
  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-center gap-3">
        <TrendingUp className="text-primary" size={24} />
        <h1 className="text-3xl font-display font-bold text-white tracking-tight uppercase">Investimentos & Patrimnio</h1>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <InvestmentReserve />
      </motion.div>
    </div>
  );
}
