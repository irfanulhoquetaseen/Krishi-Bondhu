"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown, Activity, Droplets, ThermometerSun, Leaf, ShieldCheck, RefreshCw } from "lucide-react";
import { ScrollReveal } from "../ui/scroll-reveal";

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Pre-warm the dashboard route chunk so navigation is instantaneous
    router.prefetch("/dashboard");
  }, [router]);

  const handleTryDemoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isNavigating) return;
    setIsNavigating(true);
    router.push("/dashboard");
  };

  // Subtle parallax for background SVG contours
  const yBg = useTransform(scrollY, [0, 800], [0, 100]);
  const opacityBg = useTransform(scrollY, [0, 600], [1, 0.4]);

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden agro-grid-pattern min-h-[90vh] flex items-center"
    >
      {/* Subtle Parallax Agricultural Topographic SVG Illustration (Not a stock image) */}
      <motion.div
        style={{ y: yBg, opacity: opacityBg }}
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover text-forest-800/5 select-none"
        >
          {/* Topographic delta contour curves */}
          <path
            d="M-100 250C220 180 480 340 760 220C1040 100 1280 280 1560 210"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="6 6"
          />
          <path
            d="M-100 370C240 290 520 450 820 330C1120 210 1320 400 1560 320"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <path
            d="M-100 500C260 410 560 580 880 440C1200 300 1360 520 1560 430"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeDasharray="4 8"
          />
          <path
            d="M-100 640C280 540 600 710 940 560C1280 410 1400 640 1560 550"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M-100 780C300 670 640 840 1000 680C1360 520 1440 760 1560 670"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="8 6"
          />

          {/* Cadastral field plot boundary polygons (Subtle soil tones) */}
          <polygon
            points="120,380 280,340 340,480 190,520"
            stroke="rgba(92, 70, 50, 0.12)"
            strokeWidth="1.5"
            fill="rgba(92, 70, 50, 0.02)"
          />
          <polygon
            points="340,480 490,440 540,580 390,620"
            stroke="rgba(217, 164, 65, 0.14)"
            strokeWidth="1.5"
            fill="rgba(217, 164, 65, 0.02)"
          />
          <polygon
            points="280,340 440,300 490,440 340,480"
            stroke="rgba(31, 61, 43, 0.1)"
            strokeWidth="1.5"
            fill="rgba(31, 61, 43, 0.02)"
          />
          <polygon
            points="440,300 620,270 670,410 490,440"
            stroke="rgba(92, 70, 50, 0.1)"
            strokeWidth="1.5"
            fill="rgba(92, 70, 50, 0.01)"
          />

          {/* Stylized Agronomic Panicle Curve (Right Flank) */}
          <path
            d="M1100 850C1140 720 1210 610 1330 520C1370 490 1420 480 1450 500"
            stroke="rgba(217, 164, 65, 0.18)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="1330" cy="520" r="5" fill="rgba(217, 164, 65, 0.25)" />
          <circle cx="1270" cy="570" r="4" fill="rgba(217, 164, 65, 0.2)" />
          <circle cx="1210" cy="630" r="4.5" fill="rgba(217, 164, 65, 0.2)" />
          <circle cx="1160" cy="710" r="4" fill="rgba(217, 164, 65, 0.15)" />
        </svg>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Value Proposition & Dual CTAs */}
          <div className="lg:col-span-7 space-y-8">
            <ScrollReveal direction="up" delay={0.1}>
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-warm-surface dark:bg-forest-900/60 border border-warm-borderStrong dark:border-forest-700 rounded-md">
                <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
                <span className="font-mono text-xs font-semibold text-forest-800 dark:text-forest-200 tracking-wide uppercase">
                  National Agro-AI Initiative • Bangladesh
                </span>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.2}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-forest-900 dark:text-forest-50 leading-[1.08] tracking-tighter">
                Bridging Artificial Intelligence with Bangladesh&apos;s{" "}
                <span className="text-forest-700 dark:text-amber underline decoration-amber decoration-4 underline-offset-8">
                  Agricultural Heartland
                </span>.
              </h1>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.3}>
              <p className="text-lg sm:text-xl text-warm-inkMuted leading-relaxed max-w-2xl font-normal">
                Empowering smallholder farmers with voice-first Bangla diagnostics, multimodal crop disease vision,
                and hyper-local soil reasoning to eliminate the critical agricultural extension deficit.
              </p>
            </ScrollReveal>

            {/* Dual CTAs: "Try Demo" and "Learn More" */}
            <ScrollReveal direction="up" delay={0.4}>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/dashboard"
                  onClick={handleTryDemoClick}
                  aria-disabled={isNavigating}
                  className={`inline-flex items-center gap-2.5 px-7 py-4 bg-forest-800 hover:bg-forest-900 text-forest-50 font-heading font-semibold text-base rounded-lg border border-forest-700 shadow-panel transition-all duration-200 hover:-translate-y-0.5 group ${
                    isNavigating ? "opacity-90 cursor-wait pointer-events-none" : ""
                  }`}
                >
                  {isNavigating ? (
                    <>
                      <RefreshCw className="w-4 h-4 text-amber animate-spin" />
                      <span>Launching Console...</span>
                    </>
                  ) : (
                    <>
                      <span>Try Demo</span>
                      <ArrowRight className="w-4 h-4 text-amber transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </Link>
                
                <a
                  href="#problem"
                  className="inline-flex items-center gap-2 px-6 py-4 bg-warm-card dark:bg-forest-900 hover:bg-warm-surface dark:hover:bg-forest-800 text-forest-800 dark:text-forest-100 font-heading font-semibold text-base rounded-lg border border-warm-borderStrong dark:border-forest-700 transition-all duration-200 hover:border-soil-300 group"
                >
                  <span>Learn More</span>
                  <ChevronDown className="w-4 h-4 text-soil dark:text-soil-300 transition-transform duration-200 group-hover:translate-y-0.5" />
                </a>
              </div>
            </ScrollReveal>

            {/* Operational Metrics Strip */}
            <ScrollReveal direction="up" delay={0.5}>
              <div className="pt-6 border-t border-warm-border dark:border-forest-800 grid grid-cols-3 gap-4 max-w-xl">
                <div>
                  <div className="font-heading font-bold text-2xl sm:text-3xl text-forest-900 dark:text-forest-50">
                    64
                  </div>
                  <div className="text-xs text-soil dark:text-soil-300 font-medium mt-0.5">
                    Target Districts
                  </div>
                  <div className="text-[11px] text-warm-inkSubtle mt-0.5">
                    All agro-ecological zones
                  </div>
                </div>
                <div>
                  <div className="font-heading font-bold text-2xl sm:text-3xl text-forest-900 dark:text-forest-50">
                    Bangla
                  </div>
                  <div className="text-xs text-soil dark:text-soil-300 font-medium mt-0.5">
                    Voice-First UI
                  </div>
                  <div className="text-[11px] text-warm-inkSubtle mt-0.5">
                    Dialect-aware speech intake
                  </div>
                </div>
                <div>
                  <div className="font-heading font-bold text-2xl sm:text-3xl text-forest-900 dark:text-forest-50">
                    &lt;1.2s
                  </div>
                  <div className="text-xs text-soil dark:text-soil-300 font-medium mt-0.5">
                    Reasoning Latency
                  </div>
                  <div className="text-[11px] text-warm-inkSubtle mt-0.5">
                    FastAPI + Edge Inference
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Live Agro-Telemetry Console */}
          <div className="lg:col-span-5" id="telemetry">
            <ScrollReveal direction="left" delay={0.3}>
              <div className="bg-forest-900 text-forest-50 rounded-xl border-2 border-forest-700 shadow-elevated overflow-hidden">
                {/* Header Bar */}
                <div className="px-5 py-3.5 bg-forest-950 border-b border-forest-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber" />
                    <span className="font-mono text-xs font-semibold text-forest-100 tracking-wider">
                      STATION: KB-RAJ-04 (GODAGARI)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 bg-forest-800 text-amber-300 rounded border border-forest-700">
                    LIVE TELEMETRY
                  </span>
                </div>

                {/* Target Crop & Phenology Banner */}
                <div className="px-5 py-4 bg-forest-850/60 border-b border-forest-800/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-forest-300 font-semibold">Active Subject</span>
                      <h4 className="font-heading font-bold text-lg text-forest-50 flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-amber" />
                        Aman Rice (BRRI dhan49)
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] uppercase tracking-wider text-forest-300 font-semibold">Lifecycle Phase</span>
                      <div className="font-mono text-xs text-amber font-semibold">
                        Stage 3: Active Tillering
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diagnostic Grid */}
                <div className="p-5 grid grid-cols-2 gap-3 bg-forest-900">
                  {/* Metric 1: Soil Moisture */}
                  <div className="p-3 bg-forest-950/80 border border-forest-800 rounded-lg">
                    <div className="flex items-center justify-between text-xs text-forest-200 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Droplets className="w-3.5 h-3.5 text-blue-400" />
                        Soil Moisture
                      </span>
                      <span className="font-mono text-amber text-[11px]">38.4%</span>
                    </div>
                    <div className="w-full bg-forest-800 h-2 rounded-full overflow-hidden mt-2">
                      <div className="bg-amber h-full rounded-full" style={{ width: "65%" }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-forest-300/70 mt-1 font-mono">
                      <span>Low (20%)</span>
                      <span className="text-amber">Opt (35-45%)</span>
                      <span>Sat (60%)</span>
                    </div>
                  </div>

                  {/* Metric 2: Soil pH */}
                  <div className="p-3 bg-forest-950/80 border border-forest-800 rounded-lg">
                    <div className="flex items-center justify-between text-xs text-forest-200 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-amber" />
                        Soil Reaction (pH)
                      </span>
                      <span className="font-mono text-forest-100 text-[11px]">6.2 pH</span>
                    </div>
                    <div className="w-full bg-forest-800 h-2 rounded-full overflow-hidden mt-2">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: "55%" }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-forest-300/70 mt-1 font-mono">
                      <span>Acidic (5.0)</span>
                      <span className="text-emerald-400">Target (6.0-6.8)</span>
                    </div>
                  </div>

                  {/* Metric 3: Microclimate Temp & Humidity */}
                  <div className="p-3 bg-forest-950/80 border border-forest-800 rounded-lg">
                    <div className="flex items-center justify-between text-xs text-forest-200 mb-1">
                      <span className="flex items-center gap-1.5">
                        <ThermometerSun className="w-3.5 h-3.5 text-amber-400" />
                        Microclimate
                      </span>
                    </div>
                    <div className="font-mono text-sm text-forest-50 font-bold mt-1">
                      29.2°C <span className="text-xs font-normal text-forest-300/80">/ 76% RH</span>
                    </div>
                    <div className="text-[10px] text-forest-300/70 mt-1">
                      Pre-monsoon humidity pattern
                    </div>
                  </div>

                  {/* Metric 4: Soil NPK Saturation */}
                  <div className="p-3 bg-forest-950/80 border border-forest-800 rounded-lg">
                    <div className="flex items-center justify-between text-xs text-forest-200 mb-1">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        NPK Ratio
                      </span>
                      <span className="font-mono text-amber text-[10px]">Moderate</span>
                    </div>
                    <div className="font-mono text-xs text-forest-50 mt-1">
                      N: 45 | P: 22 | K: 65 <span className="text-[10px] text-forest-300/80">ppm</span>
                    </div>
                    <div className="text-[10px] text-forest-300/70 mt-1">
                      Phosphorus top-up indicated
                    </div>
                  </div>
                </div>

                {/* Prescriptive Advisory Banner */}
                <div className="px-5 py-4 bg-forest-950 border-t border-forest-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-amber uppercase font-semibold text-[11px] tracking-wide">
                      ⚡ Prescriptive Intervention Output
                    </span>
                    <span className="text-[10px] font-mono text-forest-300/80">
                      Sync ID: KB-8842
                    </span>
                  </div>
                  <p className="text-xs text-forest-100 leading-relaxed bg-forest-900/90 p-3 rounded border border-forest-800 font-sans">
                    <strong className="text-amber">Advisory:</strong> Soil moisture is adequate at 38.4%. Defer irrigation for 48 hours.
                    Proceed with second urea top-dress split (30 kg/acre) combined with MOP (10 kg/acre) within the 36-hour tillering window.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>

        </div>
      </div>
    </section>
  );
}
