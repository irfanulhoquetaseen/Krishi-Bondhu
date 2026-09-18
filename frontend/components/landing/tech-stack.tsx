"use client";

import React from "react";
import { Server, Cpu, Layers, CloudSun, Database, Sparkles, Code2 } from "lucide-react";
import { ScrollReveal } from "../ui/scroll-reveal";

export function TechStackSection() {
  const stackItems = [
    {
      name: "FastAPI",
      role: "Async Python Core",
      category: "Backend Engine",
      icon: Server,
    },
    {
      name: "Next.js 14",
      role: "App Router & SSR",
      category: "Frontend UI",
      icon: Code2,
    },
    {
      name: "PyTorch & ONNX",
      role: "Foliar Vision Models",
      category: "Deep Learning",
      icon: Cpu,
    },
    {
      name: "Krishi AI Engine",
      role: "Agro-Reasoning Engine",
      category: "Language Models",
      icon: Sparkles,
    },
    {
      name: "DAM Market API",
      role: "Mandi Price Feeds",
      category: "Market Intelligence",
      icon: Database,
    },
    {
      name: "Copernicus & Weather",
      role: "Microclimate & NDVI",
      category: "Earth Observation",
      icon: CloudSun,
    },
    {
      name: "Framer Motion",
      role: "Fluid Micro-Interactions",
      category: "Interaction",
      icon: Layers,
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-warm-surface/80 border-b border-warm-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <ScrollReveal direction="up" delay={0.05}>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="font-mono text-xs uppercase font-semibold text-soil dark:text-soil-300 tracking-widest block mb-2">
              Technology Stack & Data Providers
            </span>
            <h3 className="font-heading font-bold text-xl sm:text-2xl text-forest-900 dark:text-forest-50 tracking-tight">
              Engineered with Robust Open Agritech & High-Throughput AI
            </h3>
          </div>
        </ScrollReveal>

        {/* Tech Badges Grid */}
        <ScrollReveal direction="up" delay={0.15}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
            {stackItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.name}
                  className="p-3.5 bg-warm-bg dark:bg-forest-900/60 border border-warm-border dark:border-forest-700/80 rounded-lg shadow-subtle hover:border-forest-600 dark:hover:border-forest-500 hover:bg-warm-card dark:hover:bg-forest-850 transition-all flex flex-col items-center text-center group"
                >
                  <div className="w-8 h-8 rounded-md bg-forest-50 dark:bg-forest-800/80 border border-forest-100 dark:border-forest-700 flex items-center justify-center text-forest-800 dark:text-amber mb-2 group-hover:bg-forest-800 group-hover:text-amber transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-heading font-bold text-xs text-forest-900 dark:text-forest-50 leading-tight">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-warm-inkMuted dark:text-forest-200 mt-0.5 leading-tight">
                    {item.role}
                  </span>
                  <span className="text-[9px] font-mono text-soil-500 dark:text-soil-300 uppercase tracking-wider mt-1 px-1.5 py-0.5 bg-warm-surface dark:bg-forest-950/60 rounded border border-transparent dark:border-forest-800">
                    {item.category}
                  </span>
                </div>
              );
            })}
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
