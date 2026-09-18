"use client";

import React from "react";
import { Users, TrendingDown, UserX, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { ScrollReveal } from "../ui/scroll-reveal";
import { CountUp } from "../ui/count-up";

export function ProblemSection() {
  const statCards = [
    {
      icon: Users,
      badge: "National Dependency",
      statComponent: <CountUp to={40} suffix="%" className="font-heading font-bold text-4xl sm:text-5xl text-forest-900 dark:text-amber-300 tracking-tight" />,
      title: "Workforce in Agriculture",
      description:
        "Over 40% of Bangladesh's national workforce depends directly on farming for daily sustenance and rural livelihoods across 16.5 million smallholdings.",
      impact: "When farm productivity stumbles, rural household incomes and national food prices destabilize immediately.",
      metricDetail: "~24.5 Million active farm laborers",
    },
    {
      icon: TrendingDown,
      badge: "Yield Penalty",
      statComponent: <CountUp to={20} rangeTo={30} suffix="%" className="font-heading font-bold text-4xl sm:text-5xl text-forest-900 dark:text-amber-300 tracking-tight" />,
      title: "Annual Harvest Lost",
      description:
        "Between 20% to 30% of aggregate crop yield is wiped out every season by delayed pathogen detection, uncalibrated urea leaching, and misjudged irrigation timings.",
      impact: "Equivalent to over $1.2B USD in annual farm-gate value evaporating before market arrival.",
      metricDetail: "Primary culrpits: Blast, Blight & Nutrient Leaching",
    },
    {
      icon: UserX,
      badge: "Extension Deficit",
      statComponent: <CountUp to={1800} prefix="1:" suffix="+" formatNumber={true} className="font-heading font-bold text-4xl sm:text-5xl text-forest-900 dark:text-amber-300 tracking-tight" />,
      title: "SAAO Overload Ratio",
      description:
        "Each Sub-Assistant Agriculture Officer (SAAO) is tasked with advising over 1,800 farm families across sprawling rural union territories with zero automated telemetry.",
      impact: "By the time an extension officer can physically inspect a diseased plot, the infection window has closed.",
      metricDetail: "1 Officer per ~2.5 sq km of fragmented plots",
    },
  ];

  return (
    <section id="problem" className="py-20 md:py-32 bg-warm-surface border-y border-warm-border relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-soil-100 dark:bg-forest-900/80 border border-soil-300 dark:border-forest-700 rounded text-soil-800 dark:text-amber-300 text-xs font-mono font-semibold uppercase tracking-wider mb-4">
              <AlertTriangle className="w-3.5 h-3.5 text-soil-600 dark:text-amber-400" />
              The Agronomic Crisis
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-forest-900 dark:text-forest-50 tracking-tight leading-tight">
              Why Bangladesh&apos;s Smallholder Farmers Suffer Compounding Losses
            </h2>
            <p className="text-base sm:text-lg text-warm-inkMuted mt-4 leading-relaxed">
              Traditional agricultural extension cannot scale physically to meet the urgent daily demands
              of millions of climate-vulnerable farmers. Without digital decision support, critical inputs
              are wasted and fungal infections spread unchecked.
            </p>
          </ScrollReveal>
        </div>

        {/* 3 Stat Cards with Animated Count-Up */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <ScrollReveal key={card.title} direction="up" delay={0.15 * (idx + 1)}>
                <div className="h-full flex flex-col justify-between p-6 sm:p-8 bg-warm-card border border-warm-border rounded-xl shadow-subtle hover:border-soil-400 dark:hover:border-forest-600 hover:shadow-panel transition-all group">
                  
                  <div>
                    {/* Header: Icon & Badge */}
                    <div className="flex items-center justify-between gap-2 mb-6">
                      <div className="p-2.5 bg-soil-100 dark:bg-forest-900/80 border border-soil-200 dark:border-forest-700 rounded-lg text-soil-700 dark:text-forest-200 group-hover:bg-forest-800 group-hover:text-amber group-hover:border-forest-700 transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 bg-warm-surface border border-warm-borderStrong dark:border-forest-700 rounded text-soil-800 dark:text-soil-200">
                        {card.badge}
                      </span>
                    </div>

                    {/* Animated Stat */}
                    <div className="mb-3">
                      {card.statComponent}
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-heading font-bold text-xl text-forest-900 dark:text-forest-100 mb-2.5">
                      {card.title}
                    </h3>
                    <p className="text-sm text-warm-ink leading-relaxed mb-4">
                      {card.description}
                    </p>
                  </div>

                  {/* Impact & Metric Detail */}
                  <div className="pt-4 border-t border-warm-border/70 dark:border-forest-800/80 space-y-2 mt-4">
                    <div className="text-xs text-soil dark:text-soil-300 font-medium flex items-start gap-1.5">
                      <span className="font-bold uppercase tracking-wider text-[10px] text-soil-800 dark:text-soil-200 shrink-0 mt-0.5">Impact:</span>
                      <span className="text-warm-inkMuted">{card.impact}</span>
                    </div>
                    <div className="text-[11px] font-mono text-soil-600 dark:text-forest-300 bg-soil-50 dark:bg-forest-950/60 px-2.5 py-1 rounded border border-soil-200 dark:border-forest-800">
                      {card.metricDetail}
                    </div>
                  </div>

                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* The AI Bridge Banner */}
        <ScrollReveal direction="up" delay={0.5}>
          <div className="bg-forest-900 text-forest-50 rounded-xl border-2 border-forest-700 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-amber uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-amber" />
                <span>The Krishi Bondhu Intervention</span>
              </div>
              <h3 className="font-heading font-bold text-xl sm:text-2xl text-forest-50">
                Transforming SAAO Capacity with Autonomous Field Reasoning
              </h3>
              <p className="text-sm text-forest-200/90 max-w-2xl leading-relaxed">
                By equipping farmers with direct voice-guided diagnostics and arming extension officers
                with real-time union-wide risk telemetry, Krishi Bondhu scales expert agronomy to every plot.
              </p>
            </div>
            <a
              href="#workflow"
              className="shrink-0 inline-flex items-center gap-2 px-5 py-3 bg-amber hover:bg-amber-400 text-forest-950 font-heading font-semibold text-sm rounded-lg transition-colors"
            >
              <span>Explore The Pipeline</span>
              <ArrowRight className="w-4 h-4 text-forest-950" />
            </a>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
