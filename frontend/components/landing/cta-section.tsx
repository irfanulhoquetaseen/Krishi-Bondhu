"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Terminal, ShieldCheck, CheckCircle } from "lucide-react";
import { ScrollReveal } from "../ui/scroll-reveal";

export function CtaSection() {
  return (
    <section className="py-20 md:py-28 bg-forest-900 text-forest-50 border-t border-forest-800 relative overflow-hidden">
      {/* Subtle organic background grid */}
      <div className="absolute inset-0 agro-grid-pattern opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="bg-forest-950/90 border-2 border-forest-700 rounded-2xl p-8 sm:p-12 lg:p-16 shadow-elevated">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Heading & Call to Action */}
            <div className="lg:col-span-8 space-y-6">
              <ScrollReveal direction="up" delay={0.1}>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-forest-800/80 border border-forest-600 rounded-full text-xs font-mono text-amber">
                  <Sparkles className="w-3.5 h-3.5 text-amber" />
                  <span>Interactive MVP Ready for Testing</span>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.2}>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-forest-50 tracking-tight leading-tight">
                  Ready to Deploy Intelligent Agronomy on Your Plots?
                </h2>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.3}>
                <p className="text-base sm:text-lg text-forest-200 max-w-2xl leading-relaxed">
                  Enter our live advisory dashboard to test simulated Bangla speech intake, explore crop disease
                  classification models, and review instantaneous prescriptive field health cards.
                </p>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.4}>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-amber hover:bg-amber-400 text-forest-950 font-heading font-bold text-base rounded-lg shadow-amberGlow transition-all duration-200 hover:-translate-y-0.5 group"
                  >
                    <span>Enter Advisory Dashboard</span>
                    <ArrowRight className="w-5 h-5 text-forest-950 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>

                  <a
                    href="http://localhost:8000/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-4 bg-forest-900 hover:bg-forest-800 text-forest-100 border border-forest-700 font-heading font-semibold text-sm rounded-lg transition-colors"
                  >
                    <Terminal className="w-4 h-4 text-amber" />
                    <span>View FastAPI Swagger Docs</span>
                  </a>
                </div>
              </ScrollReveal>
            </div>

            {/* Right Column: Key Safeguards & Features */}
            <div className="lg:col-span-4">
              <ScrollReveal direction="left" delay={0.3}>
                <div className="bg-forest-900 border border-forest-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-3 text-amber font-heading font-bold text-sm uppercase tracking-wide">
                    <ShieldCheck className="w-5 h-5" />
                    <span>Core Platform Commitments</span>
                  </div>
                  <ul className="space-y-3 text-xs text-forest-200">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Calibrated specifically for Bangladesh&apos;s 30 Agro-Ecological Zones</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Zero ungrounded generic advice; strictly dosage-bounded</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Sub-Assistant Agriculture Officer (SAAO) field copilot mode</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Full CORS-enabled FastAPI microservices architecture</span>
                    </li>
                  </ul>
                  <div className="pt-3 border-t border-forest-800 text-[11px] font-mono text-amber-300 flex items-center justify-between">
                    <span>STAGE: MVP PROTOTYPE</span>
                    <span>READY FOR INGESTION</span>
                  </div>
                </div>
              </ScrollReveal>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
