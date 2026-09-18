import React from "react";
import Link from "next/link";
import { Sprout, Activity, FileText, Cpu, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-forest-950 text-forest-100 border-t border-forest-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Column 1: Brand & Mission */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-forest-900 border border-forest-700 rounded-lg">
                <span className="font-heading font-bold text-amber text-base">KB</span>
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-lg text-forest-50 tracking-tight">
                  Krishi Bondhu
                </span>
                <span className="text-[11px] font-medium text-amber-300 uppercase tracking-wider">
                  কৃষি বন্ধু • Agro-Advisory Platform
                </span>
              </div>
            </div>
            <p className="text-sm text-forest-200/90 leading-relaxed max-w-sm">
              An algorithmic agro-intelligence framework engineered to deliver prescriptive,
              stage-specific field advisories for smallholder farmers across Bangladesh&apos;s agro-ecological zones.
            </p>
            {/* Live Telemetry Ping */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-forest-900/90 border border-forest-700 rounded-full text-xs">
              <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
              <span className="text-forest-200 font-mono text-[11px]">System Status: Advisory Engine Operational</span>
            </div>
          </div>

          {/* Column 2: Supported Crops */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-heading font-semibold text-sm text-amber tracking-wide uppercase">
              Target Crops & Phenology
            </h4>
            <ul className="space-y-2 text-sm text-forest-200/80">
              <li className="hover:text-amber transition-colors flex items-center gap-2">
                <Sprout className="w-3.5 h-3.5 text-amber/80" />
                <span>Aman Rice (BRRI dhan49, 87)</span>
              </li>
              <li className="hover:text-amber transition-colors flex items-center gap-2">
                <Sprout className="w-3.5 h-3.5 text-amber/80" />
                <span>Boro Rice (BRRI dhan28, 29)</span>
              </li>
              <li className="hover:text-amber transition-colors flex items-center gap-2">
                <Sprout className="w-3.5 h-3.5 text-amber/80" />
                <span>Jute (Corchorus olitorius)</span>
              </li>
              <li className="hover:text-amber transition-colors flex items-center gap-2">
                <Sprout className="w-3.5 h-3.5 text-amber/80" />
                <span>Potato (Diamant, Cardinal)</span>
              </li>
              <li className="hover:text-amber transition-colors flex items-center gap-2">
                <Sprout className="w-3.5 h-3.5 text-amber/80" />
                <span>Mustard (BARI Sarisha-14)</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform Capabilities */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-heading font-semibold text-sm text-amber tracking-wide uppercase">
              Intelligence Layers
            </h4>
            <ul className="space-y-2 text-sm text-forest-200/80">
              <li className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-forest-400" />
                <span>Soil NPK & Moisture Telemetry</span>
              </li>
              <li className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-forest-400" />
                <span>Stage-Specific Nutrient Timing</span>
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-forest-400" />
                <span>Pathogen Early Detection Models</span>
              </li>
              <li className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-forest-400" />
                <span>Microclimate Extreme Warnings</span>
              </li>
              <li className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-forest-400" />
                <span>Prescriptive Irrigation Schedules</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Navigation & API */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-heading font-semibold text-sm text-amber tracking-wide uppercase">
              Navigation
            </h4>
            <div className="flex flex-col space-y-2 text-sm text-forest-200/80">
              <Link href="/dashboard" className="hover:text-amber transition-colors flex items-center gap-1">
                <span>Dashboard</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
              <a href="#hero" className="hover:text-amber transition-colors">Overview</a>
              <a href="#problem" className="hover:text-amber transition-colors">Agronomic Problem</a>
              <a href="#workflow" className="hover:text-amber transition-colors">5-Step Process</a>
              <a href="#telemetry" className="hover:text-amber transition-colors">Live Telemetry</a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-forest-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-forest-300/70 font-mono">
          <div>
            &copy; {new Date().getFullYear()} Krishi Bondhu. Engineered for Hackathon MVP Demonstration.
          </div>
          <div className="flex items-center gap-4">
            <span>FastAPI Core: v0.1.0-mvp</span>
            <span>•</span>
            <span>Next.js App Router</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
