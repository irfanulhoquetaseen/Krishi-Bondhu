import React from "react";
import Link from "next/link";
import { ArrowLeft, Cpu, ScanEye, Mic, Sparkles } from "lucide-react";
import {
  UploadSectionSkeleton,
  DiagnosisReportSkeleton,
} from "@/components/dashboard/dashboard-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-warm-bg dark:bg-forest-950 transition-colors duration-200">
      {/* Top transition accent line */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-forest-900/20 z-50 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber via-amber-400 to-amber-300 w-full animate-pulse" />
      </div>

      {/* Header Sticky Navigation Skeleton */}
      <header className="sticky top-0 z-40 bg-warm-card/85 dark:bg-forest-950/85 backdrop-blur-md border-b border-warm-border dark:border-forest-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-heading font-semibold text-soil hover:text-forest-900 dark:text-soil-300 dark:hover:text-forest-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-amber" />
              <span className="hidden sm:inline">Back to Field Overview</span>
            </Link>
            <div className="h-4 w-px bg-warm-borderStrong dark:bg-forest-800" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm sm:text-base text-forest-900 dark:text-forest-50 tracking-tight">
                  Autonomous Dashboard
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-forest-100 text-forest-800 dark:bg-forest-900 dark:text-amber border border-forest-300 dark:border-forest-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber animate-ping" />
                  Live Sync
                </span>
              </div>
              <p className="text-[11px] text-warm-inkMuted dark:text-forest-300/75 hidden md:block">
                Prescriptive Agronomic Advisory &amp; Clinical Crop Passport
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Engine Status pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-warm-surface dark:bg-forest-900/80 border border-warm-borderStrong dark:border-forest-700 text-xs font-mono">
              <Cpu className="w-3.5 h-3.5 text-amber animate-spin" />
              <span className="text-forest-900 dark:text-forest-100 font-bold hidden sm:inline">
                AI Engine Initializing
              </span>
              <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
            </div>

            {/* Theme Toggle placeholder */}
            <div className="w-8 h-8 rounded-lg bg-warm-surface dark:bg-forest-900 border border-warm-borderStrong dark:border-forest-700" />
          </div>
        </div>

        {/* Mobile Horizontal Sub-Navigation Pill Strip Skeleton */}
        <div className="lg:hidden border-t border-warm-border/60 dark:border-forest-800/60 bg-warm-surface/70 dark:bg-forest-950/70 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-semibold">
          {[
            "Intake (Vision/Voice)",
            "Diagnosis Report",
            "Price Anomaly",
            "Field Telemetry",
            "Health Card",
          ].map((title, idx) => (
            <div
              key={idx}
              className="px-2.5 py-1 rounded-full bg-warm-card dark:bg-forest-900 border border-warm-borderStrong dark:border-forest-700 whitespace-nowrap text-warm-ink dark:text-forest-100 opacity-70"
            >
              {title}
            </div>
          ))}
        </div>
      </header>

      {/* Main Dashboard Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Section 1: Multimodal Intake Suite (Vision & Voice) */}
        <section id="intake-suite" className="space-y-4">
          {/* Intake Mode Switcher Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-warm-surface dark:bg-forest-900/60 border border-warm-borderStrong dark:border-forest-700 rounded-xl">
            <div className="flex items-center gap-1.5">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-heading font-bold bg-forest-800 text-forest-50 dark:bg-forest-700 shadow-subtle">
                <ScanEye className="w-4 h-4 text-amber" />
                <span>Visual Crop Disease Detection (Task 2)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-forest-900/60 text-amber rounded">
                  Vision API
                </span>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-heading font-bold text-warm-inkMuted dark:text-forest-300 opacity-60">
                <Mic className="w-4 h-4 text-soil dark:text-soil-300" />
                <span>Bangla Spoken Query Intake (Task 1)</span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-soil dark:text-soil-300 px-3">
              <Sparkles className="w-3.5 h-3.5 text-amber animate-spin" />
              <span>AI Foliar Pathology Diagnostic</span>
            </div>
          </div>

          {/* Upload Section Skeleton immediately visible! */}
          <UploadSectionSkeleton />
        </section>

        {/* Section 2: Diagnosis Report Skeleton */}
        <section id="diagnosis-report" className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-warm-border dark:border-forest-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-forest-100 text-forest-800 dark:bg-forest-900 dark:text-forest-200 font-mono text-[10px] font-bold border border-forest-300 dark:border-forest-700">
                Task 3 Engine
              </span>
              <Skeleton className="h-6 w-64" />
            </div>
            <Skeleton className="h-7 w-48" />
          </div>
          <DiagnosisReportSkeleton />
        </section>
      </main>
    </div>
  );
}
