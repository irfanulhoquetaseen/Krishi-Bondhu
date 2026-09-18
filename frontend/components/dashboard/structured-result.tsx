"use client";

import React from "react";
import { Leaf, Calendar, AlertCircle, MapPin, Globe2, RotateCcw, ArrowRight, CheckCircle2, Quote } from "lucide-react";

export interface ExtractedQueryData {
  crop_type: string;
  planting_date_estimate?: string | null;
  damage_description: string;
  geographic_union?: string | null;
  language_detected: string;
}

interface StructuredResultProps {
  rawTranscript: string;
  extractedData: ExtractedQueryData;
  processingTimeMs: number;
  source: string;
  onReset: () => void;
  onContinueToAdvisory?: () => void;
}

export function StructuredResult({
  rawTranscript,
  extractedData,
  processingTimeMs,
  source,
  onReset,
  onContinueToAdvisory,
}: StructuredResultProps) {
  const isBangla = extractedData.language_detected.toLowerCase() === "bn";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-forest-900 text-forest-50 rounded-xl border border-forest-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-forest-800 border border-forest-700 flex items-center justify-center text-amber">
            <CheckCircle2 className="w-4 h-4 text-amber" />
          </div>
          <div>
            <div className="text-xs font-heading font-bold text-forest-50">
              Voice Diagnostic Intake Completed
            </div>
            <div className="text-[11px] font-mono text-forest-200">
              Latency: {processingTimeMs}ms • Engine: {source}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-forest-950 text-amber text-xs font-mono font-semibold rounded border border-forest-700">
            <Globe2 className="w-3.5 h-3.5" />
            <span>{isBangla ? "বাংলা (Bangla Speech)" : "English Query"}</span>
          </span>
        </div>
      </div>

      {/* Verbatim Transcript Box */}
      <div className="p-5 bg-warm-surface dark:bg-forest-900/50 border border-warm-borderStrong dark:border-forest-700 rounded-xl relative">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-soil dark:text-soil-300 uppercase tracking-wider mb-2">
          <Quote className="w-3.5 h-3.5 text-amber" />
          <span>Raw Spoken Transcript (অডিও প্রতিলিপি)</span>
        </div>
        <blockquote className="text-base text-forest-950 dark:text-forest-100 font-sans italic leading-relaxed pl-2 border-l-2 border-amber">
          &ldquo;{rawTranscript}&rdquo;
        </blockquote>
      </div>

      {/* Structured Parameters Extraction Card */}
      <div className="p-6 bg-warm-card dark:bg-forest-900/70 border border-warm-border dark:border-forest-700 rounded-xl shadow-subtle space-y-4">
        <div className="border-b border-warm-border dark:border-forest-700/80 pb-3 flex items-center justify-between">
          <div>
            <h4 className="font-heading font-bold text-lg text-forest-900 dark:text-forest-50">
              Extracted Agronomic Profile
            </h4>
            <p className="text-xs text-warm-inkMuted dark:text-forest-300 mt-0.5">
              Parsed from spoken natural language into structured decision variables.
            </p>
          </div>
          <span className="font-mono text-[11px] text-soil dark:text-soil-300 bg-soil-50 dark:bg-forest-950/60 border border-soil-200 dark:border-forest-800 px-2 py-0.5 rounded">
            JSON Validated
          </span>
        </div>

        {/* 2x2 Field Parameters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* 1. Crop Type */}
          <div className="p-4 bg-warm-bg dark:bg-forest-950/60 border border-warm-border dark:border-forest-800 rounded-lg flex items-start gap-3">
            <div className="p-2 bg-emerald-50 dark:bg-forest-900 border border-emerald-200 dark:border-forest-700 rounded text-forest-700 dark:text-forest-200 shrink-0 mt-0.5">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-soil-600 dark:text-soil-300 uppercase tracking-wider block">
                Target Crop Variety
              </span>
              <span className="font-heading font-bold text-base text-forest-900 dark:text-forest-50 block mt-0.5">
                {extractedData.crop_type || "Unspecified Crop"}
              </span>
            </div>
          </div>

          {/* 2. Planting Date Estimate */}
          <div className="p-4 bg-warm-bg dark:bg-forest-950/60 border border-warm-border dark:border-forest-800 rounded-lg flex items-start gap-3">
            <div className="p-2 bg-amber-50 dark:bg-forest-900 border border-amber-200 dark:border-forest-700 rounded text-amber-800 dark:text-amber-300 shrink-0 mt-0.5">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-soil-600 dark:text-soil-300 uppercase tracking-wider block">
                Planting / Transplanting Phase
              </span>
              <span className="font-heading font-bold text-base text-forest-900 dark:text-forest-50 block mt-0.5">
                {extractedData.planting_date_estimate || "Lifecycle stage not specified"}
              </span>
            </div>
          </div>

          {/* 3. Damage / Symptoms Description */}
          <div className="p-4 bg-warm-bg dark:bg-forest-950/60 border border-warm-border dark:border-forest-800 rounded-lg flex items-start gap-3 md:col-span-2">
            <div className="p-2 bg-rose-50 dark:bg-forest-900 border border-rose-200 dark:border-forest-700 rounded text-rose-700 dark:text-rose-300 shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <span className="text-[11px] font-mono text-soil-600 dark:text-soil-300 uppercase tracking-wider block">
                Clinical Damage & Foliar Symptoms
              </span>
              <p className="text-sm font-sans font-medium text-warm-ink dark:text-forest-100 mt-0.5 leading-relaxed">
                {extractedData.damage_description}
              </p>
            </div>
          </div>

          {/* 4. Geographic Location */}
          <div className="p-4 bg-warm-bg dark:bg-forest-950/60 border border-warm-border dark:border-forest-800 rounded-lg flex items-start gap-3 md:col-span-2">
            <div className="p-2 bg-blue-50 dark:bg-forest-900 border border-blue-200 dark:border-forest-700 rounded text-blue-700 dark:text-blue-300 shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-soil-600 dark:text-soil-300 uppercase tracking-wider block">
                Identified Administrative Union / District
              </span>
              <span className="font-heading font-bold text-base text-forest-900 dark:text-forest-50 block mt-0.5">
                {extractedData.geographic_union || "Regional barind/delta zone"}
              </span>
            </div>
          </div>

        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-warm-border dark:border-forest-700/80 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-warm-surface dark:bg-forest-900 hover:bg-warm-border dark:hover:bg-forest-800 text-soil-800 dark:text-soil-200 text-xs font-semibold rounded-lg border border-warm-borderStrong dark:border-forest-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Record Another Query (পুনরায় বলুন)</span>
          </button>

          {onContinueToAdvisory && (
            <button
              type="button"
              onClick={onContinueToAdvisory}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest-800 hover:bg-forest-900 text-forest-50 text-xs font-heading font-semibold rounded-lg border border-forest-700 shadow-sm transition-all"
            >
              <span>Dispatch to Advisory Engine</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
