"use client";

import React from "react";
import { IAInsightsPanel } from "@/components/ai-insights/IAInsightsPanel";
import { PredictabilityCharts } from "@/components/charts/PredictabilityCharts";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function InsightsPage() {
  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-center gap-3">
        <Sparkles className="text-primary" size={24} />
        <h1 className="text-3xl font-display font-bold text-white tracking-tight uppercase">Insights & Previses</h1>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <IAInsightsPanel />
        <PredictabilityCharts />
      </motion.div>
    </div>
  );
}
