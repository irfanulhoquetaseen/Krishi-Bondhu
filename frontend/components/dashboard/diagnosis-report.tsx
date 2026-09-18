"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Thermometer,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Sparkles,
  Layers,
  Leaf,
  FlaskConical,
  Printer,
  ChevronRight,
  Mic,
  ScanEye,
  Cpu,
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { DiagnosisReportSkeleton } from "./dashboard-skeletons";

export interface ChemicalTreatment {
  name: string;
  dosage: string;
  pre_harvest_interval: string;
}

export interface WeatherContext {
  location_name: string;
  latitude: number;
  longitude: number;
  temperature_c: number;
  humidity_percentage: number;
  wind_speed_kmh: number;
  forecast_condition: string;
  rainfall_mm: number;
  rain_expected_6h: boolean;
  rain_forecast_details: string;
  is_live_api: boolean;
  source_attribution: string;
}

export interface TreatmentPlan {
  root_cause_explanation: string;
  organic_treatment_steps: string[];
  chemical_treatment: ChemicalTreatment;
  safety_precautions: string[];
  spray_schedule_advice: string;
  rain_within_6h: boolean;
  spray_warning_active: boolean;
  weather_context?: WeatherContext;
  source?: string;
  processing_time_ms?: number;
}

interface DiagnosisReportProps {
  plan: TreatmentPlan | null;
  isLoading?: boolean;
  onRefresh?: (forceRain?: boolean) => void;
  voiceCrop?: string;
  voiceSymptom?: string;
  diseaseName?: string;
  diseaseSeverity?: string;
  severityPercentage?: number;
  district?: string;
}

export function DiagnosisReport({
  plan,
  isLoading = false,
  onRefresh,
  voiceCrop = "Aman Rice",
  voiceSymptom,
  diseaseName,
  diseaseSeverity,
  severityPercentage,
  district = "Rajshahi (Barind Zone)",
}: DiagnosisReportProps) {
  const [activeTab, setActiveTab] = useState<"organic" | "chemical">("organic");

  if (isLoading) {
    return <DiagnosisReportSkeleton />;
  }

  if (!plan) {
    return (
      <div className="bg-warm-card dark:bg-forest-950/60 border border-warm-border dark:border-forest-800 rounded-xl p-8 text-center space-y-4 shadow-subtle transition-colors duration-200">
        <div className="w-12 h-12 rounded-full bg-forest-100 dark:bg-forest-900 border border-forest-300 dark:border-forest-700 text-forest-800 dark:text-amber flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6 text-amber" />
        </div>
        <div className="max-w-md mx-auto space-y-1.5">
          <h3 className="font-heading font-bold text-lg text-forest-900 dark:text-forest-100">
            Multimodal Agronomic Reasoning Engine
          </h3>
          <p className="text-xs text-warm-inkMuted dark:text-forest-300/80 leading-relaxed">
            Synthesizes Voice Intake (Task 1), Foliar Pathology Vision (Task 2),
            and Real-Time OpenWeatherMap Telemetry into an authoritative agronomic treatment plan.
          </p>
        </div>
        {onRefresh && (
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onRefresh(false)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-forest-800 hover:bg-forest-900 text-forest-50 text-xs font-heading font-bold rounded-lg shadow-subtle transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber" />
              <span>Generate Treatment Plan (Clear Window)</span>
            </button>
            <button
              type="button"
              onClick={() => onRefresh(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-warm-surface hover:bg-warm-border text-forest-900 text-xs font-heading font-semibold rounded-lg border border-warm-borderStrong transition-all"
            >
              <CloudRain className="w-4 h-4 text-amber" />
              <span>Simulate Imminent Rain Scenario (&lt;6h)</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  const weather = plan?.weather_context;
  const isRainImminent = plan?.rain_within_6h ?? false;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP WEATHER-AWARE ADVISORY BANNER */}
      <ScrollReveal direction="up" delay={0.05}>
        <div
          className={`rounded-2xl border transition-all duration-300 overflow-hidden shadow-panel ${
            isRainImminent
              ? "bg-amber-50/90 border-amber-400 text-amber-950"
              : "bg-forest-900 border-forest-800 text-forest-50"
          }`}
        >
          {/* Banner Header Alert */}
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                    isRainImminent
                      ? "bg-amber-100 border-amber-300 text-amber-800 animate-pulse"
                      : "bg-forest-800 border-forest-700 text-amber"
                  }`}
                >
                  {isRainImminent ? (
                    <AlertTriangle className="w-6 h-6 text-amber-700" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-amber" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold tracking-wider ${
                        isRainImminent
                          ? "bg-amber-200/80 text-amber-900 border border-amber-300"
                          : "bg-forest-950 text-amber border border-forest-700"
                      }`}
                    >
                      {isRainImminent ? "Active Weather Prohibition" : "Optimal Application Status"}
                    </span>
                    <span className="text-xs opacity-75 font-mono">
                      {weather?.location_name || district}
                    </span>
                  </div>

                  <h3
                    className={`text-lg sm:text-xl font-heading font-bold leading-tight ${
                      isRainImminent ? "text-amber-950" : "text-forest-50"
                    }`}
                  >
                    {isRainImminent
                      ? "⚠️ ADVISORY RESTRICTION: RAIN FORECAST WITHIN 6 HOURS — DO NOT SPRAY NOW"
                      : "✅ OPTIMAL SPRAY WINDOW ACTIVE (DRY CANOPY PROTOCOL)"}
                  </h3>

                  <p
                    className={`text-xs max-w-3xl leading-relaxed ${
                      isRainImminent ? "text-amber-900" : "text-forest-200"
                    }`}
                  >
                    {isRainImminent
                      ? "Chemical foliar application must be suspended immediately. Precipitation will wash off active ingredients into field drainage channels, destroying chemical efficacy and causing environmental contamination. Defer spraying until leaves are completely dry after rain."
                      : "Current microclimate conditions are optimal for foliar application. No precipitation forecast for the next 6-12 hours with mild wind speeds and adequate leaf surface dryness."}
                  </p>
                </div>
              </div>

              {/* Weather Simulation Switcher */}
              {onRefresh && (
                <div className="flex items-center sm:flex-col gap-2 shrink-0 sm:items-end">
                  <div className="text-[11px] font-mono opacity-80 flex items-center gap-1.5">
                    <span>Weather Mode:</span>
                    <span className="font-bold">
                      {isRainImminent ? "Rain <6h" : "Dry Window"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/10 p-1 rounded-lg border border-black/10">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => onRefresh(false)}
                      className={`px-2.5 py-1 text-[11px] font-mono rounded transition-all ${
                        !isRainImminent
                          ? "bg-forest-700 text-forest-50 font-bold shadow-subtle"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      Dry Window
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => onRefresh(true)}
                      className={`px-2.5 py-1 text-[11px] font-mono rounded transition-all ${
                        isRainImminent
                          ? "bg-amber-500 text-amber-950 font-bold shadow-subtle"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      Rain &lt;6h
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Weather Telemetry Strip */}
            {weather && (
              <div
                className={`pt-4 border-t grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono ${
                  isRainImminent ? "border-amber-200" : "border-forest-800"
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl flex items-center gap-2.5 ${
                    isRainImminent ? "bg-amber-100/70 border border-amber-200" : "bg-forest-950/60 border border-forest-800"
                  }`}
                >
                  <Thermometer className="w-4 h-4 text-amber shrink-0" />
                  <div>
                    <span className="text-[10px] opacity-70 block">Temperature</span>
                    <strong className="text-sm font-sans">{weather.temperature_c}°C</strong>
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded-xl flex items-center gap-2.5 ${
                    isRainImminent ? "bg-amber-100/70 border border-amber-200" : "bg-forest-950/60 border border-forest-800"
                  }`}
                >
                  <Droplets className="w-4 h-4 text-amber shrink-0" />
                  <div>
                    <span className="text-[10px] opacity-70 block">Humidity</span>
                    <strong className="text-sm font-sans">{weather.humidity_percentage}% RH</strong>
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded-xl flex items-center gap-2.5 ${
                    isRainImminent ? "bg-amber-100/70 border border-amber-200" : "bg-forest-950/60 border border-forest-800"
                  }`}
                >
                  <Wind className="w-4 h-4 text-amber shrink-0" />
                  <div>
                    <span className="text-[10px] opacity-70 block">Wind Speed</span>
                    <strong className="text-sm font-sans">{weather.wind_speed_kmh} km/h</strong>
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded-xl flex items-center gap-2.5 ${
                    isRainImminent ? "bg-amber-100/70 border border-amber-200" : "bg-forest-950/60 border border-forest-800"
                  }`}
                >
                  <CloudRain className="w-4 h-4 text-amber shrink-0" />
                  <div>
                    <span className="text-[10px] opacity-70 block">6h Precip Total</span>
                    <strong className="text-sm font-sans">{weather.rainfall_mm} mm</strong>
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded-xl col-span-2 sm:col-span-1 flex items-center gap-2.5 ${
                    isRainImminent ? "bg-amber-100/70 border border-amber-200" : "bg-forest-950/60 border border-forest-800"
                  }`}
                >
                  {isRainImminent ? (
                    <CloudRain className="w-4 h-4 text-amber-700 shrink-0" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber shrink-0" />
                  )}
                  <div className="truncate">
                    <span className="text-[10px] opacity-70 block">Sky Condition</span>
                    <strong className="text-xs font-sans truncate block" title={weather.forecast_condition}>
                      {weather.forecast_condition}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Provider Footer Bar */}
          <div
            className={`px-5 py-2 text-[11px] font-mono flex items-center justify-between border-t ${
              isRainImminent
                ? "bg-amber-100/80 border-amber-300 text-amber-900"
                : "bg-forest-950 border-forest-800 text-forest-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
              <span>
                Telemetry Source: {weather?.source_attribution || "OpenWeatherMap Free Tier"}
              </span>
            </div>
            <span>
              Engine: {plan?.source || "Krishi Bondhu AI / BRRI Standard"}
              {plan?.processing_time_ms ? ` (${plan.processing_time_ms}ms)` : ""}
            </span>
          </div>
        </div>
      </ScrollReveal>

      {/* 2. MULTIMODAL SYNTHESIS EVIDENCE STRIP */}
      <ScrollReveal direction="up" delay={0.1}>
        <div className="p-4 bg-warm-surface border border-warm-borderStrong rounded-xl shadow-subtle flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-heading font-bold text-forest-900 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-forest-700" />
              <span>Multimodal Synthesis Input:</span>
            </span>

            {/* Task 1 Badge */}
            <div className="px-3 py-1 bg-warm-card border border-warm-border rounded-lg flex items-center gap-2">
              <Mic className="w-3.5 h-3.5 text-forest-700" />
              <span className="text-soil-600 font-mono text-[11px]">Task 1 (Voice):</span>
              <strong className="text-forest-900 font-sans">{voiceCrop}</strong>
              {voiceSymptom && (
                <span className="text-warm-inkMuted truncate max-w-[180px]" title={voiceSymptom}>
                  • {voiceSymptom}
                </span>
              )}
            </div>

            {/* Task 2 Badge */}
            <div className="px-3 py-1 bg-warm-card border border-warm-border rounded-lg flex items-center gap-2">
              <ScanEye className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-soil-600 font-mono text-[11px]">Task 2 (Vision):</span>
              <strong className="text-forest-900 font-sans">
                {diseaseName || "Rice Leaf Blast (Magnaporthe oryzae)"}
              </strong>
              {diseaseSeverity && (
                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded font-mono text-[10px]">
                  {diseaseSeverity} {severityPercentage ? `(${severityPercentage.toFixed(0)}%)` : ""}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-warm-card border border-warm-borderStrong hover:bg-warm-surface text-forest-900 text-xs font-semibold rounded-lg transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-soil" />
              <span>Print Prescription</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* 3. ROOT CAUSE EXPLANATION */}
      <ScrollReveal direction="up" delay={0.15}>
        <div className="bg-warm-card border border-warm-border rounded-xl p-6 shadow-subtle space-y-3">
          <div className="flex items-center justify-between border-b border-warm-border pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-forest-700">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-base text-forest-900">
                  Agronomic Etiology & Root Cause Analysis
                </h4>
                <p className="text-[11px] text-warm-inkMuted font-mono">
                  Pathological mechanism, physiological vulnerability & weather catalyst
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-0.5 bg-forest-50 text-forest-800 border border-forest-200 rounded-md font-semibold">
              Etiology Verified
            </span>
          </div>

          <p className="text-sm text-warm-ink font-sans leading-relaxed pt-1">
            {plan?.root_cause_explanation}
          </p>
        </div>
      </ScrollReveal>

      {/* 4. TIERED TREATMENT PLAN (ORGANIC VS CHEMICAL TABS) */}
      <ScrollReveal direction="up" delay={0.2}>
        <div className="bg-warm-card border border-warm-border rounded-xl shadow-subtle overflow-hidden">
          {/* Section Header & Tab Controls */}
          <div className="p-6 border-b border-warm-border bg-warm-surface/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-heading font-bold text-lg text-forest-900 flex items-center gap-2">
                <span>Tiered Agronomic Treatment Plan</span>
                <span className="text-xs font-mono font-normal text-warm-inkMuted">
                  (BRRI / BARI IPM Protocol)
                </span>
              </h4>
              <p className="text-xs text-warm-inkMuted mt-0.5">
                Toggle between biological organic management and precision chemical protocol.
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center p-1 bg-warm-card border border-warm-borderStrong rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab("organic")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-heading font-bold transition-all ${
                  activeTab === "organic"
                    ? "bg-forest-800 text-forest-50 shadow-subtle"
                    : "text-warm-inkMuted dark:text-forest-300 hover:text-forest-900 dark:hover:text-forest-100 hover:bg-warm-surface dark:hover:bg-forest-900"
                }`}
              >
                <Leaf className={`w-4 h-4 ${activeTab === "organic" ? "text-amber" : "text-soil"}`} />
                <span>Organic & Cultural (জৈব)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-forest-900/60 text-amber">
                  Eco-Safe
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("chemical")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-heading font-bold transition-all ${
                  activeTab === "chemical"
                    ? "bg-forest-800 text-forest-50 shadow-subtle"
                    : "text-warm-inkMuted dark:text-forest-300 hover:text-forest-900 dark:hover:text-forest-100 hover:bg-warm-surface dark:hover:bg-forest-900"
                }`}
              >
                <FlaskConical
                  className={`w-4 h-4 ${activeTab === "chemical" ? "text-amber" : "text-soil"}`}
                />
                <span>Targeted Chemical (রাসায়নিক)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-forest-900/60 text-amber">
                  Rx Protocol
                </span>
              </button>
            </div>
          </div>

          {/* Tab Content Area with Smooth Framer Motion Transition */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === "organic" ? (
                /* Organic Treatment Steps */
                <motion.div
                  key="organic"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-300">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                      <span>
                        <strong>Biological & Cultural Priority:</strong> Reduces pathogen inoculum without chemical residues or resistance development.
                      </span>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                      Zero PHI Delay
                    </span>
                  </div>

                  <div className="space-y-3">
                    {plan?.organic_treatment_steps?.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-warm-bg dark:bg-forest-900/40 border border-warm-border dark:border-forest-800 rounded-xl flex items-start gap-3.5 hover:border-warm-borderStrong dark:hover:border-forest-700 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-200 border border-forest-300 dark:border-forest-700 font-heading font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          0{idx + 1}
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-xs font-heading font-bold text-forest-900 dark:text-forest-100 block">
                            Agronomic Practice Step {idx + 1}
                          </span>
                          <p className="text-xs text-warm-ink dark:text-forest-200 leading-relaxed">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                /* Targeted Chemical Protocol */
                <motion.div
                  key="chemical"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl flex items-start gap-2.5 text-xs text-amber-950 dark:text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>Prescription Chemical Guidance:</strong> Calibrated strictly for the diagnosed severity. Ensure proper personal protective equipment and spray calibration.
                    </div>
                  </div>

                  {/* 3-Column Chemical Spec Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Name */}
                    <div className="p-5 bg-warm-bg dark:bg-forest-900/40 border border-warm-border dark:border-forest-800 rounded-xl space-y-2">
                      <span className="text-[11px] font-mono uppercase text-soil dark:text-soil-300 tracking-wider block">
                        Active Chemical & Formulation
                      </span>
                      <strong className="text-base font-heading font-bold text-forest-900 dark:text-forest-100 block">
                        {plan?.chemical_treatment?.name || "Tricyclazole 75 WP"}
                      </strong>
                      <span className="text-[11px] text-warm-inkMuted dark:text-forest-300/80 block">
                        Registered BRRI/BARI foliar fungicide
                      </span>
                    </div>

                    {/* Dosage */}
                    <div className="p-5 bg-warm-bg dark:bg-forest-900/40 border border-warm-border dark:border-forest-800 rounded-xl space-y-2">
                      <span className="text-[11px] font-mono uppercase text-soil dark:text-soil-300 tracking-wider block">
                        Clinical Dosage & Dilution
                      </span>
                      <strong className="text-base font-heading font-bold text-forest-900 dark:text-forest-100 block">
                        {plan?.chemical_treatment?.dosage}
                      </strong>
                      <span className="text-[11px] text-warm-inkMuted dark:text-forest-300/80 block">
                        Maintain uniform fine cone nozzle spray
                      </span>
                    </div>

                    {/* PHI */}
                    <div className="p-5 bg-forest-900 dark:bg-forest-950 text-forest-50 border border-forest-800 dark:border-forest-700 rounded-xl space-y-2 relative overflow-hidden">
                      <span className="text-[11px] font-mono uppercase text-amber tracking-wider block">
                        Pre-Harvest Interval (PHI)
                      </span>
                      <strong className="text-base font-heading font-bold text-amber block">
                        {plan?.chemical_treatment?.pre_harvest_interval}
                      </strong>
                      <span className="text-[11px] text-forest-200 block">
                        Mandatory waiting time before food consumption
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </ScrollReveal>

      {/* 5. SPRAY SCHEDULE ADVICE & TIMING WINDOW */}
      <ScrollReveal direction="up" delay={0.25}>
        <div
          className={`p-6 rounded-xl border shadow-subtle space-y-3 ${
            isRainImminent
              ? "bg-amber-50/90 border-amber-300 text-amber-950"
              : "bg-warm-card border-warm-border text-warm-ink"
          }`}
        >
          <div className="flex items-center justify-between border-b pb-3 border-current/15">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                  isRainImminent
                    ? "bg-amber-100 border-amber-300 text-amber-800"
                    : "bg-forest-100 border-forest-300 text-forest-800"
                }`}
              >
                <Clock className="w-4 h-4" />
              </div>
              <h4 className="font-heading font-bold text-base">
                Spray Schedule & Meteorological Advice
              </h4>
            </div>
            <span
              className={`text-[10px] font-mono px-2.5 py-0.5 rounded font-bold uppercase ${
                isRainImminent
                  ? "bg-amber-200 text-amber-900 border border-amber-300"
                  : "bg-forest-100 text-forest-800 border border-forest-300"
              }`}
            >
              {isRainImminent ? "Spraying Restricted" : "Favorable Timing"}
            </span>
          </div>

          <p className="text-xs sm:text-sm leading-relaxed font-sans font-medium">
            {plan?.spray_schedule_advice}
          </p>
        </div>
      </ScrollReveal>

      {/* 6. SAFETY PRECAUTIONS HIGHLIGHTED */}
      <ScrollReveal direction="up" delay={0.3}>
        <div className="bg-warm-card border border-warm-border rounded-xl p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-warm-border pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-base text-forest-900">
                  Critical Applicator & Environmental Safety Precautions
                </h4>
                <p className="text-[11px] text-warm-inkMuted font-mono">
                  Mandatory PPE, waterbody protection, and post-spraying livestock rules
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-bold">
              Mandatory Protocols
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {plan?.safety_precautions?.map((precaution, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-warm-bg border border-warm-border rounded-xl flex items-start gap-3"
              >
                <div className="p-1 bg-rose-100 text-rose-800 rounded mt-0.5 shrink-0">
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
                <p className="text-xs text-warm-ink font-sans leading-relaxed">{precaution}</p>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
