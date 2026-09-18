"use client";

import React from "react";
import { Mic, ScanEye, BrainCircuit, TrendingUp, FileCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { ScrollReveal } from "../ui/scroll-reveal";

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: Mic,
      tag: "Voice Intake",
      title: "Bangla Speech Intake",
      summary:
        "Farmers speak naturally in their native Bangla or local dialect. The voice intake pipeline transcribes speech and parses crop parameters, eliminating digital literacy barriers.",
      detail: "Bangla ASR • Dialect Parsing • Intent Tagging",
    },
    {
      number: "02",
      icon: ScanEye,
      tag: "Disease Detection",
      title: "Foliar Vision Diagnostics",
      summary:
        "Computer vision models analyze uploaded leaf photos to identify fungal blasts, bacterial leaf blight, and pest feeding signatures within milliseconds.",
      detail: "Multi-class Crop Vision • Confidence Scoring • Blast & Blight Focus",
    },
    {
      number: "03",
      icon: BrainCircuit,
      tag: "AI Reasoning",
      title: "Agronomic Phenology Engine",
      summary:
        "Our specialized agricultural intelligence synthesizes visual findings with soil NPK values, growth stage (e.g. tillering vs. panicle), and 72-hour weather forecasts.",
      detail: "Agro-LLM Inference • Nutrient Equilibrium • Climate Stress Indices",
    },
    {
      number: "04",
      icon: TrendingUp,
      tag: "Price Analysis",
      title: "Mandi Market Intelligence",
      summary:
        "Direct integration with Department of Agricultural Marketing (DAM) price feeds compares wholesale mandi rates so farmers know when and where to sell for peak profit.",
      detail: "DAM API Feeds • Wholesale Rate Arbitrage • Post-Harvest Optimization",
    },
    {
      number: "05",
      icon: FileCheck,
      tag: "Field Health Card",
      title: "Prescriptive Digital Summary",
      summary:
        "Generates a concrete, dosage-accurate action plan delivered via web dashboard or SMS: exact fertilizer splits, irrigation deferrals, and preventive spray windows.",
      detail: "Actionable Treatment Plan • SMS Fallback • PDF Export",
    },
  ];

  return (
    <section id="workflow" className="py-20 md:py-32 bg-warm-bg relative overflow-hidden">
      {/* Background architectural grid */}
      <div className="absolute inset-0 agro-grid-pattern opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-forest-100 dark:bg-forest-900/70 border border-forest-300 dark:border-forest-700 rounded text-forest-800 dark:text-forest-200 text-xs font-mono font-semibold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-forest-700 dark:bg-amber" />
              Autonomous Advisory Pipeline
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-forest-900 dark:text-forest-50 tracking-tight leading-tight">
              From Rural Spoken Word to Actionable Field Prescription
            </h2>
            <p className="text-base sm:text-lg text-warm-inkMuted mt-4 leading-relaxed">
              Our 5-stage multimodal pipeline bridges low-literacy field conditions with high-precision
              computational agronomy in under two seconds.
            </p>
          </ScrollReveal>
        </div>

        {/* 5 Connected Steps Layout */}
        <div className="relative">
          
          {/* Subtle connecting path line on large screens (horizontal) */}
          <div className="hidden xl:block absolute top-[44px] left-[6%] right-[6%] h-[2px] bg-warm-borderStrong dark:bg-forest-800 z-0" />

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <ScrollReveal key={step.number} direction="up" delay={0.12 * (idx + 1)}>
                  <div className="h-full flex flex-col justify-between p-5 sm:p-6 bg-warm-card border border-warm-border rounded-xl shadow-subtle hover:border-forest-600 hover:shadow-panel transition-all duration-200 group relative">
                    
                    <div>
                      {/* Top Row: Step Number & Icon */}
                      <div className="flex items-center justify-between gap-3 mb-5">
                        <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-forest-800 text-amber font-heading font-bold text-sm shadow-sm ring-4 ring-warm-bg dark:ring-forest-950 group-hover:scale-105 transition-transform">
                          <Icon className="w-5 h-5 text-amber" />
                        </div>
                        <span className="font-mono text-xs font-bold text-soil-500 dark:text-soil-300 bg-soil-50 dark:bg-forest-950/60 border border-soil-200 dark:border-forest-800 px-2 py-0.5 rounded">
                          STEP {step.number}
                        </span>
                      </div>

                      {/* Tag & Title */}
                      <div className="text-[11px] font-mono font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
                        {step.tag}
                      </div>
                      <h3 className="font-heading font-bold text-lg text-forest-900 dark:text-forest-100 mb-2 leading-snug">
                        {step.title}
                      </h3>

                      {/* Summary */}
                      <p className="text-xs text-warm-ink leading-relaxed mb-4">
                        {step.summary}
                      </p>
                    </div>

                    {/* Footer Tech Tag */}
                    <div className="pt-3 border-t border-warm-border/70 dark:border-forest-800/80 mt-2">
                      <div className="text-[10px] font-mono text-soil-700 dark:text-soil-300 font-medium">
                        {step.detail}
                      </div>
                    </div>

                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>

        {/* Pipeline Summary Bar */}
        <ScrollReveal direction="up" delay={0.65}>
          <div className="mt-12 p-4 bg-warm-surface dark:bg-forest-900/60 border border-warm-borderStrong dark:border-forest-700 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-forest-900 dark:text-forest-100 font-medium">
              <CheckCircle2 className="w-4 h-4 text-forest-700 dark:text-forest-300 shrink-0" />
              <span>Full end-to-end pipeline executes in ~1,150ms with zero manual data entry required.</span>
            </div>
            <a
              href="/dashboard"
              className="inline-flex items-center gap-1.5 font-heading font-bold text-forest-800 dark:text-amber hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
            >
              <span>Test the Pipeline in Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
