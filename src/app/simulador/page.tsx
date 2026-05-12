"use client";

import React from "react";
import { ExpenseSimulator } from "@/components/simulator/ExpenseSimulator";
import { Zap } from "lucide-react";

export default function ConsultorPage() {
  return (
    <div className="p-8 space-y-8 max-w-[1200px] mx-auto pb-20">
      <div className="flex items-center gap-3">
        <Zap className="text-primary" size={24} />
        <h1 className="text-3xl font-display font-bold text-white tracking-tight uppercase">Posso assumir esse gasto?</h1>
      </div>

      <ExpenseSimulator />
    </div>
  );
}
