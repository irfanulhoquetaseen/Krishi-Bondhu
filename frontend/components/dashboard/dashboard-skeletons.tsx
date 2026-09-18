import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sparkles,
  Cpu,
  Mic,
  FileBadge,
  CloudRain,
  ScanEye,
  UploadCloud,
  Camera,
  Image as ImageIcon,
} from "lucide-react";

/**
 * Loading skeleton for Voice Intake Query Processing
 */
export function VoiceProcessingSkeleton() {
  return (
    <div
      role="status"
      aria-label="Processing spoken voice query"
      className="space-y-6 animate-in fade-in duration-300"
    >
      {/* Header status bar */}
      <div className="flex items-center justify-between p-4 bg-warm-surface dark:bg-forest-900/50 border border-warm-borderStrong dark:border-forest-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Mic className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-heading font-bold text-forest-900 dark:text-forest-100 flex items-center gap-2">
              <span>AI Speech Recognition Active...</span>
              <span className="w-2 h-2 rounded-full bg-amber animate-ping" />
            </div>
            <div className="text-[11px] font-mono text-warm-inkMuted dark:text-forest-300/75">
              Transcribing Bengali dialect phonemes & parsing symptom entities
            </div>
          </div>
        </div>
        <Skeleton className="h-6 w-24 rounded-md" />
      </div>

      {/* Simulated Bengali Audio Waveform bars */}
      <div className="p-5 bg-forest-950 text-forest-50 rounded-xl border border-forest-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-amber">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 animate-spin" />
            <span>Fusing Acoustic Tensors</span>
          </span>
          <span className="text-forest-300">Sampling at 16,000 Hz</span>
        </div>
        <div className="flex items-end justify-between gap-1.5 h-12 pt-2 px-1">
          {[40, 70, 30, 85, 60, 95, 45, 80, 65, 90, 50, 75, 35, 85, 60, 40, 70, 90, 55, 30].map(
            (height, i) => (
              <div
                key={i}
                style={{ height: `${height}%` }}
                className="flex-1 bg-gradient-to-t from-forest-700 via-amber to-amber-300 rounded-full animate-pulse opacity-80"
              />
            )
          )}
        </div>
      </div>

      {/* Spoken Bengali Transcript placeholder */}
      <div className="space-y-3 p-5 bg-warm-card dark:bg-forest-950/40 border border-warm-border dark:border-forest-800 rounded-xl">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
      </div>

      {/* Extracted Entity Parameter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            className="p-3.5 bg-warm-surface dark:bg-forest-900/30 border border-warm-border dark:border-forest-800 rounded-xl space-y-2"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Loading skeleton for Agronomic Reasoning & Diagnosis Report
 */
export function DiagnosisReportSkeleton() {
  return (
    <div
      role="status"
      aria-label="Synthesizing agronomic diagnosis report"
      className="space-y-6 animate-in fade-in duration-300"
    >
      {/* Top weather banner skeleton */}
      <div className="p-6 bg-forest-950 text-forest-50 rounded-2xl border border-forest-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-forest-800/80 border border-forest-700 flex items-center justify-center text-amber shrink-0">
              <CloudRain className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-36 bg-forest-800" />
                <Skeleton className="h-4 w-24 bg-forest-800" />
              </div>
              <Skeleton className="h-6 w-72 sm:w-96 bg-forest-800" />
              <Skeleton className="h-4 w-full sm:w-[500px] bg-forest-800" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 bg-forest-800 rounded-lg" />
            <Skeleton className="h-8 w-24 bg-forest-800 rounded-lg" />
          </div>
        </div>

        {/* 5-sensor telemetry pills skeleton */}
        <div className="pt-4 border-t border-forest-800/80 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-forest-900/60 border border-forest-800 space-y-1.5"
            >
              <Skeleton className="h-3 w-14 bg-forest-800" />
              <Skeleton className="h-5 w-20 bg-forest-800" />
            </div>
          ))}
        </div>
      </div>

      {/* Tabs & Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Organic protocol */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 bg-warm-card dark:bg-forest-950/40 border border-warm-border dark:border-forest-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-warm-border dark:border-forest-800 pb-3">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <Skeleton className="w-5 h-5 rounded-full shrink-0 mt-0.5" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3.5 w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Chemical & Safety protocol */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 bg-warm-card dark:bg-forest-950/40 border border-warm-border dark:border-forest-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-warm-border dark:border-forest-800 pb-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>
            <div className="p-4 bg-warm-surface dark:bg-forest-900/30 border border-warm-border dark:border-forest-800 rounded-xl space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-52" />
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-5/6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for Market Price Anomaly Evaluation
 */
export function PriceAnomalySkeleton() {
  return (
    <div
      role="status"
      aria-label="Calculating market price anomaly and statistical Z-score"
      className="space-y-5 animate-in fade-in duration-300"
    >
      {/* Alert banner skeleton */}
      <div className="p-5 bg-warm-card dark:bg-forest-950/40 border-2 border-warm-borderStrong dark:border-forest-800 rounded-xl space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
              <Skeleton className="h-5 w-64" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded" />
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="p-4 bg-warm-card dark:bg-forest-950/40 border border-warm-border dark:border-forest-800 rounded-xl space-y-2"
          >
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      {/* Chart Canvas Skeleton */}
      <div className="p-6 bg-warm-card dark:bg-forest-950/40 border border-warm-border dark:border-forest-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="h-64 w-full bg-warm-surface dark:bg-forest-900/30 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex justify-between w-full">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-0.5 w-full" />
            <Skeleton className="h-0.5 w-full" />
            <Skeleton className="h-0.5 w-full" />
          </div>
          <div className="flex justify-between w-full">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for Digital Crop Passport (Field Health Card)
 */
export function PassportSkeleton() {
  return (
    <div
      role="status"
      aria-label="Synthesizing digital crop passport and Bengali audio advisory"
      className="bg-warm-card dark:bg-forest-950/60 border-2 border-warm-borderStrong dark:border-forest-800 rounded-2xl p-6 sm:p-10 shadow-panel space-y-8 animate-in fade-in duration-300"
    >
      {/* Certificate Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-border dark:border-forest-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-forest-800 text-amber flex items-center justify-center shrink-0 shadow-subtle">
            <FileBadge className="w-7 h-7 text-amber animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24 rounded-full" />
            </div>
            <Skeleton className="h-6 w-64 sm:w-80" />
            <Skeleton className="h-3.5 w-48" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* Multimodal Telemetry Status Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-3 bg-warm-surface dark:bg-forest-900/40 border border-warm-border dark:border-forest-800 rounded-xl space-y-1.5"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-28" />
          </div>
        ))}
      </div>

      {/* Two Column Layout: Leaf specimen & Audio Player */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Specimen image & Pathology info */}
        <div className="lg:col-span-5 space-y-4">
          <Skeleton className="h-52 w-full rounded-xl" />
          <div className="p-4 bg-warm-surface dark:bg-forest-900/30 border border-warm-border dark:border-forest-800 rounded-xl space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-3.5 w-4/5" />
          </div>
        </div>

        {/* Right: Bengali Spoken Audio Advisory Player Skeleton */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 bg-forest-950 text-forest-50 rounded-2xl border border-forest-800 space-y-5">
            <div className="flex items-center justify-between border-b border-forest-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber animate-spin" />
                <Skeleton className="h-4 w-48 bg-forest-800" />
              </div>
              <Skeleton className="h-5 w-24 rounded-full bg-forest-800" />
            </div>

            {/* Audio waveform player controls */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-full bg-forest-800 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-full bg-forest-800" />
                  <Skeleton className="h-3 w-1/2 bg-forest-800" />
                </div>
              </div>
              <Skeleton className="h-2 w-full rounded-full bg-forest-800" />
            </div>

            {/* Bengali text summary skeleton */}
            <div className="p-3.5 bg-forest-900/70 border border-forest-800 rounded-xl space-y-2">
              <Skeleton className="h-4 w-full bg-forest-800" />
              <Skeleton className="h-4 w-5/6 bg-forest-800" />
              <Skeleton className="h-4 w-4/6 bg-forest-800" />
            </div>
          </div>

          {/* Rx Action Items */}
          <div className="p-4 bg-warm-surface dark:bg-forest-900/30 border border-warm-border dark:border-forest-800 rounded-xl space-y-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for Visual Crop Disease Detection (Upload Section)
 */
export function UploadSectionSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading visual crop disease detector"
      className="bg-warm-card dark:bg-forest-950/60 border border-warm-border dark:border-forest-800 rounded-xl shadow-panel p-6 sm:p-8 space-y-6 animate-in fade-in duration-300"
    >
      {/* Component Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-border dark:border-forest-800 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-forest-800 text-amber flex items-center justify-center shrink-0 shadow-sm ring-4 ring-warm-bg dark:ring-forest-950">
            <ScanEye className="w-5 h-5 text-amber animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-forest-100 dark:bg-forest-900 border border-forest-300 dark:border-forest-700 rounded text-forest-800 dark:text-forest-200 text-[10px] font-mono font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-forest-700 dark:bg-amber animate-ping" />
              Multimodal Vision Diagnostic
            </div>
            <Skeleton className="h-6 w-56 sm:w-72" />
            <Skeleton className="h-4 w-72 sm:w-96" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <Skeleton className="h-7 w-32 rounded-md" />
          <Skeleton className="h-7 w-36 rounded-md" />
        </div>
      </div>

      {/* Main Dropzone Skeleton */}
      <div className="space-y-4">
        <div className="border-2 border-dashed border-warm-borderStrong dark:border-forest-700 rounded-xl p-8 sm:p-12 text-center bg-warm-surface/60 dark:bg-forest-900/30 flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-full bg-forest-100 dark:bg-forest-800/80 text-forest-800 dark:text-amber border border-forest-300 dark:border-forest-700 flex items-center justify-center animate-pulse">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div className="space-y-2 flex flex-col items-center">
            <Skeleton className="h-5 w-64 sm:w-80" />
            <Skeleton className="h-3.5 w-72 sm:w-96" />
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-44 h-9 bg-warm-card dark:bg-forest-900 border border-warm-borderStrong dark:border-forest-700 rounded-lg flex items-center justify-center gap-2 px-4 shadow-subtle">
              <Camera className="w-4 h-4 text-soil dark:text-soil-300 opacity-60" />
              <Skeleton className="h-3.5 w-24" />
            </div>
            <div className="w-full sm:w-44 h-9 bg-forest-800/90 dark:bg-forest-700 rounded-lg flex items-center justify-center gap-2 px-4 shadow-subtle">
              <ImageIcon className="w-4 h-4 text-amber opacity-80" />
              <Skeleton className="h-3.5 w-24 bg-forest-700 dark:bg-forest-600" />
            </div>
          </div>
        </div>

        {/* Instant Sample Presets Skeleton */}
        <div className="p-4 bg-warm-surface dark:bg-forest-900/40 border border-warm-border dark:border-forest-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-spin" />
              <Skeleton className="h-3.5 w-48 sm:w-64" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="p-3 bg-warm-card dark:bg-forest-950/60 border border-warm-borderStrong dark:border-forest-800 rounded-lg space-y-1.5"
              >
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-36" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Alias for semantic clarity
export const CropDiseaseDetectorSkeleton = UploadSectionSkeleton;
