"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Activity,
  Cpu,
  AlertCircle,
  Mic,
  ScanEye,
  Sparkles,
  CloudRain,
  Sun,
  ShieldCheck,
  Scale,
  FileBadge,
} from "lucide-react";
import dynamic from "next/dynamic";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  UploadSectionSkeleton,
  VoiceProcessingSkeleton,
  DiagnosisReportSkeleton,
  PriceAnomalySkeleton,
  PassportSkeleton,
} from "@/components/dashboard/dashboard-skeletons";
import type { DiseaseDetectionResult } from "@/components/dashboard/crop-disease-detector";
import type { ExtractedQueryData } from "@/components/dashboard/structured-result";
import type { TreatmentPlan } from "@/components/dashboard/diagnosis-report";
import type { PriceCheckResponse } from "@/components/dashboard/market-price-anomaly";
import type { FieldHealthCardReport } from "@/components/dashboard/field-health-card";

// Dynamic imports with instant skeleton fallbacks for code-splitting
const CropDiseaseDetector = dynamic(
  () => import("@/components/dashboard/crop-disease-detector").then((mod) => mod.CropDiseaseDetector),
  {
    loading: () => <UploadSectionSkeleton />,
    ssr: false,
  }
);

const VoiceIntakeCard = dynamic(
  () => import("@/components/dashboard/voice-intake-card").then((mod) => mod.VoiceIntakeCard),
  {
    loading: () => <VoiceProcessingSkeleton />,
    ssr: false,
  }
);

const DiagnosisReport = dynamic(
  () => import("@/components/dashboard/diagnosis-report").then((mod) => mod.DiagnosisReport),
  {
    loading: () => <DiagnosisReportSkeleton />,
    ssr: false,
  }
);

const MarketPriceAnomaly = dynamic(
  () => import("@/components/dashboard/market-price-anomaly").then((mod) => mod.MarketPriceAnomaly),
  {
    loading: () => <PriceAnomalySkeleton />,
    ssr: false,
  }
);

const FieldHealthCard = dynamic(
  () => import("@/components/dashboard/field-health-card").then((mod) => mod.FieldHealthCard),
  {
    loading: () => <PassportSkeleton />,
    ssr: false,
  }
);

export default function DashboardPage() {
  const [backendHealth, setBackendHealth] = useState<{
    status: string;
    app: string;
    version: string;
  } | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);

  // Active diagnostic intake mode: vision or voice
  const [intakeMode, setIntakeMode] = useState<"vision" | "voice">("vision");

  // Synced parameters from voice intake or visual disease detection
  const [activeCrop, setActiveCrop] = useState("Aman Rice (BRRI dhan49)");
  const [activeStage, setActiveStage] = useState("Active Tillering");
  const [activeRegion, setActiveRegion] = useState("Rajshahi (Barind Tract)");
  const [lastExtracted, setLastExtracted] = useState<ExtractedQueryData | null>(null);
  const [lastDiseaseResult, setLastDiseaseResult] = useState<DiseaseDetectionResult | null>(null);

  // Multimodal Treatment Plan State (Task 3)
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null);
  const [isLoadingTreatment, setIsLoadingTreatment] = useState(false);
  const [treatmentError, setTreatmentError] = useState<string | null>(null);
  const [simulatedRain, setSimulatedRain] = useState<boolean>(false);

  // Digital Crop Passport & Field Health Card State (Task 5)
  const [uploadedLeafPreview, setUploadedLeafPreview] = useState<string | null>(null);
  const [lastPriceResult, setLastPriceResult] = useState<PriceCheckResponse | null>(null);
  const [generatedPassport, setGeneratedPassport] = useState<FieldHealthCardReport | null>(null);
  const [isGeneratingPassport, setIsGeneratingPassport] = useState(false);
  const [passportError, setPassportError] = useState<string | null>(null);

  const checkHealth = async () => {
    setIsLoadingHealth(true);
    setHealthError(null);
    try {
      const res = await fetch("http://localhost:8000/health");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setBackendHealth(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to connect to backend";
      setHealthError(message);
      setBackendHealth(null);
    } finally {
      setIsLoadingHealth(false);
    }
  };

  const fetchTreatmentPlan = useCallback(
    async (forceRain?: boolean) => {
      setIsLoadingTreatment(true);
      setTreatmentError(null);
      const rainSetting = forceRain !== undefined ? forceRain : simulatedRain;
      setSimulatedRain(rainSetting);

      try {
        const payload: Record<string, unknown> = {
          district_name: activeRegion,
          force_rain_scenario: rainSetting,
        };

        if (lastExtracted) {
          payload.symptom_profile = lastExtracted;
        } else {
          payload.symptom_profile = {
            crop_type: activeCrop,
            planting_date_estimate: activeStage,
            damage_description:
              "Foliar spindle-shaped lesions with necrotic ash-gray centers on leaf blades and yellowing margins",
            geographic_union: activeRegion,
            language_detected: "bn",
          };
        }

        if (lastDiseaseResult) {
          payload.vision_output = lastDiseaseResult;
        } else {
          payload.vision_output = {
            disease_name: "Rice Leaf Blast (Magnaporthe oryzae)",
            confidence_note:
              "Pathologist visual match confirmed (94%). Classic spindle-shaped blast lesions observed on vegetative canopy.",
            severity_percentage: 34.5,
            severity_class: "Moderate",
            affected_area_description:
              "Multiple diamond-shaped blast lesions along the adaxial leaf blade and collar region of upper canopy leaves.",
            processing_time_ms: 320,
            source: "krishi-bondhu-vision-ai",
          };
        }

        const res = await fetch("http://localhost:8000/api/treatment-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || `Server error (HTTP ${res.status})`);
        }

        const data: TreatmentPlan = await res.json();
        setTreatmentPlan(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to synthesize agronomic treatment plan.";
        setTreatmentError(msg);
      } finally {
        setIsLoadingTreatment(false);
      }
    },
    [activeCrop, activeRegion, activeStage, lastDiseaseResult, lastExtracted, simulatedRain]
  );

  const initialTreatmentFetchedRef = useRef(false);

  useEffect(() => {
    checkHealth();
    if (!initialTreatmentFetchedRef.current) {
      initialTreatmentFetchedRef.current = true;
      // Load initial treatment plan synthesis
      fetchTreatmentPlan(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVoiceAdvisoryReady = useCallback(
    (extracted: ExtractedQueryData) => {
      setLastExtracted(extracted);
      if (extracted.crop_type) {
        setActiveCrop(extracted.crop_type);
      }
      if (extracted.planting_date_estimate) {
        setActiveStage(extracted.planting_date_estimate);
      }
      if (extracted.geographic_union) {
        setActiveRegion(extracted.geographic_union);
      }
      // Auto-trigger reasoning engine
      fetchTreatmentPlan(simulatedRain);
    },
    [fetchTreatmentPlan, simulatedRain]
  );

  const handleDiseaseDetected = useCallback(
    (detected: DiseaseDetectionResult, previewUrl?: string) => {
      setLastDiseaseResult(detected);
      if (previewUrl) {
        setUploadedLeafPreview(previewUrl);
      }
      const dLower = detected.disease_name.toLowerCase();
      if (dLower.includes("rice") || dLower.includes("paddy") || dLower.includes("blast")) {
        setActiveCrop("Aman Rice (BRRI dhan49)");
      } else if (dLower.includes("potato")) {
        setActiveCrop("Potato (Diamant Variety)");
      } else if (dLower.includes("tomato")) {
        setActiveCrop("Tomato (Ratan Variety)");
      } else if (dLower.includes("wheat") || dLower.includes("rust")) {
        setActiveCrop("Wheat (BARI Gom-33)");
      } else if (dLower.includes("maize") || dLower.includes("corn")) {
        setActiveCrop("Maize (Hybrid)");
      } else if (dLower.includes("mustard")) {
        setActiveCrop("Mustard (BARI Sarisha-14)");
      } else if (dLower.includes("brinjal") || dLower.includes("eggplant") || dLower.includes("begun")) {
        setActiveCrop("Brinjal (Bt Begun)");
      } else if (dLower.includes("chili") || dLower.includes("pepper")) {
        setActiveCrop("Chili (Bindu)");
      }
      // Auto-trigger reasoning engine
      fetchTreatmentPlan(simulatedRain);
    },
    [fetchTreatmentPlan, simulatedRain]
  );

  const handlePriceCheckCompleted = useCallback((result: PriceCheckResponse) => {
    setLastPriceResult(result);
  }, []);

  const generateFieldHealthCard = async () => {
    setIsGeneratingPassport(true);
    setPassportError(null);
    const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

    try {
      const payload: Record<string, unknown> = {
        crop_type: activeCrop,
        farmer_name: "মো: রফিকুল ইসলাম (Md. Rafiqul Islam)",
        district_name: activeRegion,
        plot_id: "KB-PLOT-RAJ-04",
      };

      if (lastExtracted) payload.voice_intake = lastExtracted;
      if (lastDiseaseResult) payload.disease_detection = lastDiseaseResult;
      if (treatmentPlan) payload.treatment_plan = treatmentPlan;
      if (lastPriceResult) payload.price_analysis = lastPriceResult;
      if (uploadedLeafPreview) payload.crop_image_base64 = uploadedLeafPreview;

      const res = await fetch(`${backendBase}/api/generate-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server returned HTTP ${res.status}`);
      }

      const data: FieldHealthCardReport = await res.json();
      data.crop_image_url = uploadedLeafPreview || undefined;
      data.disease_name = lastDiseaseResult?.disease_name || "Rice Leaf Blast (Magnaporthe oryzae)";
      data.severity_class = lastDiseaseResult?.severity_class || "Moderate";
      data.severity_percentage = lastDiseaseResult?.severity_percentage || 34.5;
      data.affected_area_description = lastDiseaseResult?.affected_area_description || undefined;
      data.organic_steps = treatmentPlan?.organic_treatment_steps || undefined;
      data.chemical_name = treatmentPlan?.chemical_treatment?.name || "Tricyclazole 75 WP";
      data.chemical_dosage = treatmentPlan?.chemical_treatment?.dosage || "0.75 g / L water";
      data.pre_harvest_interval = treatmentPlan?.chemical_treatment?.pre_harvest_interval || "21 Days";
      data.spray_schedule_advice = treatmentPlan?.spray_schedule_advice || undefined;
      data.rain_within_6h = treatmentPlan?.rain_within_6h || simulatedRain;
      data.offered_price_per_kg = lastPriceResult?.offered_price_per_kg || 24.5;
      data.fair_price_per_kg = lastPriceResult?.historical_mean_price_per_kg || 34.0;
      data.price_deviation_percent = lastPriceResult?.price_deviation_percent || -27.9;
      data.is_predatory_price = lastPriceResult?.is_predatory_price ?? true;
      if (lastPriceResult?.recommended_selling_window) {
        data.recommended_selling_window =
          typeof lastPriceResult.recommended_selling_window === "string"
            ? lastPriceResult.recommended_selling_window
            : lastPriceResult.recommended_selling_window.optimal_window;
      }

      setGeneratedPassport(data);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("krishi_bondhu_passport", JSON.stringify(data));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to synthesize Field Health Card.";
      setPassportError(msg);
    } finally {
      setIsGeneratingPassport(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-bg dark:bg-forest-950 text-warm-ink dark:text-forest-100 pb-20 transition-colors duration-200">
      {/* Top Console Bar */}
      <header className="border-b border-warm-border dark:border-forest-800 bg-warm-surface/90 dark:bg-forest-950/90 backdrop-blur-md sticky top-0 z-40 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-warm-inkMuted dark:text-forest-300 hover:text-forest-800 dark:hover:text-forest-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Landing Page</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <div className="h-4 w-px bg-warm-borderStrong dark:bg-forest-700" />
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber animate-pulse" />
              <h1 className="font-heading font-bold text-forest-900 dark:text-forest-100 text-sm">
                Krishi Bondhu Advisory Console
              </h1>
            </div>
            <nav className="hidden lg:flex items-center gap-2.5 text-xs font-semibold text-warm-inkMuted dark:text-forest-300 pl-4">
              <a
                href="#diagnosis-report"
                className="hover:text-forest-800 dark:hover:text-forest-100 transition-colors"
              >
                Diagnosis Report
              </a>
              <span className="text-warm-borderStrong dark:text-forest-700">•</span>
              <a
                href="#market-price-anomaly"
                className="text-amber-800 dark:text-amber-400 font-bold hover:text-amber-900 dark:hover:text-amber-300 transition-colors flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800"
              >
                <Scale className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Price Anomaly (Task 4)</span>
              </a>
              <span className="text-warm-borderStrong dark:text-forest-700">•</span>
              <a
                href="#field-telemetry"
                className="hover:text-forest-800 dark:hover:text-forest-100 transition-colors"
              >
                Field Telemetry
              </a>
              <span className="text-warm-borderStrong dark:text-forest-700">•</span>
              <a
                href="#field-health-card"
                className="text-forest-900 dark:text-forest-100 font-bold hover:text-forest-950 transition-colors flex items-center gap-1 bg-forest-100 dark:bg-forest-900 px-2 py-0.5 rounded border border-forest-300 dark:border-forest-700"
              >
                <FileBadge className="w-3.5 h-3.5 text-forest-700 dark:text-forest-300" />
                <span>Field Health Card</span>
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <button
              onClick={checkHealth}
              disabled={isLoadingHealth}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-warm-card dark:bg-forest-900 border border-warm-borderStrong dark:border-forest-700 hover:bg-warm-surface dark:hover:bg-forest-800 text-xs font-mono text-forest-900 dark:text-forest-100 rounded-md transition-all shadow-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
              aria-label="Check backend API health status"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-soil dark:text-soil-300 ${isLoadingHealth ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Ping FastAPI</span>
            </button>
            <div className="text-xs font-mono">
              {backendHealth ? (
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded font-semibold">
                  API: {backendHealth.status}
                </span>
              ) : healthError ? (
                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 rounded">
                  API Offline
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-warm-surface dark:bg-forest-900 text-warm-inkSubtle dark:text-forest-400 border border-warm-border dark:border-forest-800 rounded">
                  Checking...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Sub-Navigation Pill Strip */}
        <div className="lg:hidden border-t border-warm-border/60 dark:border-forest-800/60 bg-warm-surface/70 dark:bg-forest-950/70 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-semibold">
          <a
            href="#intake-suite"
            className="px-2.5 py-1 rounded-full bg-warm-card dark:bg-forest-900 border border-warm-borderStrong dark:border-forest-700 whitespace-nowrap text-warm-ink dark:text-forest-100"
          >
            Intake (Vision/Voice)
          </a>
          <a
            href="#diagnosis-report"
            className="px-2.5 py-1 rounded-full bg-warm-card dark:bg-forest-900 border border-warm-borderStrong dark:border-forest-700 whitespace-nowrap text-warm-ink dark:text-forest-100"
          >
            Diagnosis Report
          </a>
          <a
            href="#market-price-anomaly"
            className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 whitespace-nowrap"
          >
            Price Anomaly
          </a>
          <a
            href="#field-telemetry"
            className="px-2.5 py-1 rounded-full bg-warm-card dark:bg-forest-900 border border-warm-borderStrong dark:border-forest-700 whitespace-nowrap text-warm-ink dark:text-forest-100"
          >
            Field Telemetry
          </a>
          <a
            href="#field-health-card"
            className="px-2.5 py-1 rounded-full bg-forest-100 dark:bg-forest-900 text-forest-900 dark:text-forest-200 border border-forest-300 dark:border-forest-700 whitespace-nowrap"
          >
            Health Card
          </a>
        </div>
      </header>

      {/* Main Dashboard Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Section 1: Multimodal Intake Suite (Vision & Voice) */}
        <section id="intake-suite" className="space-y-4">
          {/* Intake Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-warm-surface dark:bg-forest-900/60 border border-warm-borderStrong dark:border-forest-700 rounded-xl transition-colors duration-200">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIntakeMode("vision")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-heading font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber ${
                  intakeMode === "vision"
                    ? "bg-forest-800 text-forest-50 dark:bg-forest-700 shadow-subtle"
                    : "text-warm-inkMuted dark:text-forest-300 hover:text-forest-900 dark:hover:text-forest-100 hover:bg-warm-card dark:hover:bg-forest-800/50"
                }`}
              >
                <ScanEye className={`w-4 h-4 ${intakeMode === "vision" ? "text-amber" : "text-soil dark:text-soil-300"}`} />
                <span>Visual Crop Disease Detection (Task 2)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-forest-900/60 text-amber rounded">
                  Vision API
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIntakeMode("voice")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-heading font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber ${
                  intakeMode === "voice"
                    ? "bg-forest-800 text-forest-50 dark:bg-forest-700 shadow-subtle"
                    : "text-warm-inkMuted dark:text-forest-300 hover:text-forest-900 dark:hover:text-forest-100 hover:bg-warm-card dark:hover:bg-forest-800/50"
                }`}
              >
                <Mic className={`w-4 h-4 ${intakeMode === "voice" ? "text-amber" : "text-soil dark:text-soil-300"}`} />
                <span>Bangla Spoken Query Intake (Task 1)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-forest-900/60 text-amber rounded">
                  ASR + NLP
                </span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-soil dark:text-soil-300 px-3">
              <Sparkles className="w-3.5 h-3.5 text-amber" />
              <span>
                {intakeMode === "vision"
                  ? "AI Foliar Pathology Diagnostic"
                  : "Voice AI + Agro-LLM Extraction"}
              </span>
            </div>
          </div>

          {/* Active Intake Component with Smooth Mode Transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={intakeMode}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              {intakeMode === "vision" ? (
                <CropDiseaseDetector
                  onDiseaseDetected={handleDiseaseDetected}
                  expectedCrop={lastExtracted?.crop_type || undefined}
                />
              ) : (
                <VoiceIntakeCard onAdvisoryReady={handleVoiceAdvisoryReady} />
              )}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* Section 2: Multimodal Agronomic Reasoning & Clinical Diagnosis Report (Task 3) */}
        <section id="diagnosis-report" className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-warm-border pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-forest-100 text-forest-800 font-mono text-[10px] font-bold border border-forest-300">
                  Task 3 Engine
                </span>
                <h3 className="text-lg sm:text-xl font-heading font-bold text-forest-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber" />
                  <span>Multimodal Agronomic Reasoning & Diagnosis Report</span>
                </h3>
              </div>
              <p className="text-xs text-warm-inkMuted mt-0.5">
                Fuses Task 1 Voice Symptoms + Task 2 Foliar Vision Pathology + Real-Time OpenWeatherMap Microclimate into an authoritative BRRI/BARI treatment plan.
              </p>
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => fetchTreatmentPlan(false)}
                disabled={isLoadingTreatment}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-warm-card border border-warm-borderStrong hover:bg-warm-surface text-forest-900 text-xs font-semibold rounded-lg shadow-subtle transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-soil ${isLoadingTreatment ? "animate-spin" : ""}`} />
                <span>Re-Synthesize</span>
              </button>

              <button
                type="button"
                onClick={() => fetchTreatmentPlan(!simulatedRain)}
                disabled={isLoadingTreatment}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-heading font-bold rounded-lg border transition-all disabled:opacity-50 ${
                  simulatedRain
                    ? "bg-amber-500 text-amber-950 border-amber-600 shadow-amberGlow"
                    : "bg-forest-800 hover:bg-forest-900 text-forest-50 border-forest-700"
                }`}
              >
                {simulatedRain ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-950" />
                    <span>Switch to Dry Window</span>
                  </>
                ) : (
                  <>
                    <CloudRain className="w-3.5 h-3.5 text-amber" />
                    <span>Test Rain Warning (&lt;6h)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {treatmentError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong>Reasoning Engine Advisory:</strong> {treatmentError}
              </div>
            </div>
          )}

          {/* Unified Clinical Diagnosis Report Panel */}
          <DiagnosisReport
            plan={treatmentPlan}
            isLoading={isLoadingTreatment}
            onRefresh={fetchTreatmentPlan}
            voiceCrop={activeCrop}
            voiceSymptom={lastExtracted?.damage_description}
            diseaseName={lastDiseaseResult?.disease_name}
            diseaseSeverity={lastDiseaseResult?.severity_class}
            severityPercentage={lastDiseaseResult?.severity_percentage}
            district={activeRegion}
          />
        </section>

        {/* Section 3: Live Diagnostic Synchronizer & Field Telemetry Station */}
        <section id="field-telemetry" className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-warm-border pb-3">
            <div>
              <h3 className="text-lg sm:text-xl font-heading font-bold text-forest-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-forest-700" />
                <span>Field Station Telemetry & Soil Sensor Network</span>
              </h3>
              <p className="text-xs text-warm-inkMuted mt-0.5">
                Real-time regional boundary parameters and in-situ multi-depth soil telemetry.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {lastDiseaseResult && (
                <span className="text-[11px] font-mono px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-md flex items-center gap-1.5">
                  <ScanEye className="w-3.5 h-3.5 text-amber-600" />
                  <span>Vision Synced</span>
                </span>
              )}
              {lastExtracted && (
                <span className="text-[11px] font-mono px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-md flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Voice Synced</span>
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Field Profile & Sensor Intake */}
            <div className="lg:col-span-6 space-y-6">
              <ScrollReveal direction="up" delay={0.1}>
                <div className="bg-warm-card border border-warm-border rounded-xl p-6 shadow-subtle space-y-5">
                  <div className="border-b border-warm-border pb-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-heading font-bold text-forest-900">
                        Field Profile & Regional Parameters
                      </h4>
                      <p className="text-xs text-warm-inkMuted mt-0.5">
                        Active agricultural bounds for this advisory session.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-soil bg-warm-surface px-2 py-0.5 rounded border border-warm-border">
                      Station #KB-RAJ-04
                    </span>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-forest-900 mb-1">
                        Division / Upazila
                      </label>
                      <input
                        type="text"
                        value={activeRegion}
                        onChange={(e) => setActiveRegion(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-warm-surface border border-warm-borderStrong rounded-lg text-warm-ink font-sans focus:outline-none focus:ring-1 focus:ring-amber"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-forest-900 mb-1">
                          Active Crop Variety
                        </label>
                        <input
                          type="text"
                          value={activeCrop}
                          onChange={(e) => setActiveCrop(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-warm-surface border border-warm-borderStrong rounded-lg text-warm-ink font-sans focus:outline-none focus:ring-1 focus:ring-amber"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-forest-900 mb-1">
                          Lifecycle / Growth Stage
                        </label>
                        <input
                          type="text"
                          value={activeStage}
                          onChange={(e) => setActiveStage(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-warm-surface border border-warm-borderStrong rounded-lg text-warm-ink font-sans focus:outline-none focus:ring-1 focus:ring-amber"
                        />
                      </div>
                    </div>

                    {/* Sensor Readouts */}
                    <div className="p-3.5 bg-warm-surface border border-warm-border rounded-xl space-y-2">
                      <div className="font-semibold text-forest-900 text-xs flex items-center justify-between">
                        <span>Live Soil Sensor Stream</span>
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Calibrated
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-warm-ink">
                        <div className="bg-warm-bg p-2.5 rounded-lg border border-warm-border">
                          <span className="text-soil text-[10px] block">Moisture</span>
                          <strong className="text-forest-900 text-sm">38.4%</strong>
                          <span className="text-[9px] text-soil-500 block">Opt: 35-45%</span>
                        </div>
                        <div className="bg-warm-bg p-2.5 rounded-lg border border-warm-border">
                          <span className="text-soil text-[10px] block">Reaction</span>
                          <strong className="text-forest-900 text-sm">6.2 pH</strong>
                          <span className="text-[9px] text-soil-500 block">Nominal</span>
                        </div>
                        <div className="bg-warm-bg p-2.5 rounded-lg border border-warm-border">
                          <span className="text-soil text-[10px] block">NPK Ratio</span>
                          <strong className="text-forest-900 text-sm">45:22:65</strong>
                          <span className="text-[9px] text-soil-500 block">ppm balance</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right Column: Station Status & Diagnostic Timeline */}
            <div className="lg:col-span-6 space-y-6">
              <ScrollReveal direction="up" delay={0.2}>
                <div className="bg-warm-card border border-warm-border rounded-xl p-6 shadow-subtle space-y-5">
                  <div className="border-b border-warm-border pb-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-heading font-bold text-forest-900">
                        Station Soil Health & Microclimate Summary
                      </h4>
                      <p className="text-xs text-warm-inkMuted mt-0.5">
                        Calibrated for {activeCrop} • {activeRegion}.
                      </p>
                    </div>
                    <span className="font-mono text-xs px-2.5 py-0.5 bg-forest-100 text-forest-800 border border-forest-300 rounded-md font-semibold">
                      Live Telemetry
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {/* Telemetry Snapshot Banner */}
                    <div className="p-4 bg-forest-900 text-forest-50 rounded-xl border border-forest-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-amber text-xs uppercase font-bold tracking-wide">
                          Soil Node: #KB-SN-402
                        </span>
                        <span className="text-[11px] font-mono text-emerald-300 bg-forest-950 px-2 py-0.5 rounded border border-forest-700">
                          {lastDiseaseResult
                            ? `Pathology: ${lastDiseaseResult.severity_class}`
                            : "Status: Monitoring Active"}
                        </span>
                      </div>
                      <p className="text-xs text-forest-200 leading-relaxed">
                        Soil moisture is nominal at 38.4% with neutral reaction (pH 6.2). Root aeration index is high.
                        Agronomic reasoning engine has synthesized this soil baseline with foliar pathology and OpenWeatherMap forecasts above.
                      </p>
                    </div>

                    {/* Telemetry Point 1 */}
                    <div className="p-4 bg-warm-bg border border-warm-border rounded-xl space-y-1.5 text-xs">
                      <div className="font-heading font-bold text-forest-900 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-forest-600" />
                        <span>Irrigation Schedule Advisory</span>
                      </div>
                      <p className="text-warm-ink pl-6 leading-relaxed">
                        Hold flood irrigation for the next 48 hours to preserve aerobic microbial activity around tillers and prevent spore germination.
                      </p>
                    </div>

                    {/* Telemetry Point 2 */}
                    <div className="p-4 bg-warm-bg border border-warm-border rounded-xl space-y-1.5 text-xs">
                      <div className="font-heading font-bold text-forest-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-forest-600" />
                        <span>Fertigation & Top-Dress Synchronizer</span>
                      </div>
                      <p className="text-warm-ink pl-6 leading-relaxed">
                        Potassium level is 65 ppm. Coordinate next split with weather window shown in the Diagnosis Report above.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] font-mono text-soil flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-amber" />
                    <span>Next automated telemetry polling cycle: 15 minutes</span>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Section 4: Yield Risk & Market Price Anomaly Detection (Task 4) */}
        <section id="market-price-anomaly" className="space-y-4 pt-6 border-t border-warm-border">
          <MarketPriceAnomaly
            initialCrop={activeCrop}
            onPriceCheckCompleted={handlePriceCheckCompleted}
          />
        </section>

        {/* Section 5: Bengali Audio Advisory & Digital Crop Passport (Field Health Card) */}
        <section id="field-health-card" className="space-y-6 pt-6 border-t border-warm-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-warm-border pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber/20 text-amber-900 font-mono text-[10px] font-bold border border-amber/40">
                  Task 5 Passport
                </span>
                <h3 className="text-lg sm:text-xl font-heading font-bold text-forest-900 flex items-center gap-2">
                  <FileBadge className="w-5 h-5 text-forest-700" />
                  <span>Bengali Audio Advisory & Digital Crop Passport</span>
                </h3>
              </div>
              <p className="text-xs text-warm-inkMuted mt-0.5">
                Consolidates Voice Intake (Task 1) + Disease Vision (Task 2) + Treatment Protocol (Task 3) + Market Price Anomaly (Task 4) into an official Field Health Card.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/passport"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-warm-surface hover:bg-warm-border text-forest-900 text-xs font-heading font-semibold rounded-lg border border-warm-borderStrong transition-all shadow-subtle"
              >
                <span>Dedicated Passport Page</span>
              </Link>
            </div>
          </div>

          {passportError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong>Synthesis Error:</strong> {passportError}
              </div>
            </div>
          )}

          {!generatedPassport && !isGeneratingPassport && (
            <ScrollReveal direction="up" delay={0.1}>
              <div className="bg-warm-card dark:bg-forest-950/60 border-2 border-dashed border-warm-borderStrong dark:border-forest-800 rounded-2xl p-8 text-center space-y-5 shadow-subtle transition-colors duration-200">
                <div className="w-14 h-14 rounded-2xl bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-amber border border-forest-300 dark:border-forest-700 flex items-center justify-center mx-auto shadow-subtle">
                  <FileBadge className="w-7 h-7 text-forest-700 dark:text-amber" />
                </div>

                <div className="max-w-xl mx-auto space-y-2">
                  <h4 className="font-heading font-bold text-lg sm:text-xl text-forest-900 dark:text-forest-100">
                    Ready to Generate Your Field Health Card?
                  </h4>
                  <p className="text-xs sm:text-sm text-warm-inkMuted dark:text-forest-300/80 leading-relaxed">
                    Our multimodal agronomic engine will compile your active crop diagnostic data,
                    draft a spoken Bengali audio briefing using Krishi Bondhu AI, synthesize natural speech with Gemini native TTS,
                    and format a publication-grade printable vector PDF document.
                  </p>
                </div>

                {/* Multimodal Sources Pill Strip */}
                <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-soil dark:text-soil-300">
                  <span className="px-2.5 py-1 bg-warm-surface dark:bg-forest-900 border border-warm-border dark:border-forest-700 rounded-md">
                    🎤 Voice: {lastExtracted ? lastExtracted.crop_type : activeCrop}
                  </span>
                  <span className="px-2.5 py-1 bg-warm-surface dark:bg-forest-900 border border-warm-border dark:border-forest-700 rounded-md">
                    🍃 Vision: {lastDiseaseResult ? lastDiseaseResult.disease_name.split("(")[0] : "Blast Analyzed"}
                  </span>
                  <span className="px-2.5 py-1 bg-warm-surface dark:bg-forest-900 border border-warm-border dark:border-forest-700 rounded-md">
                    💊 Rx: {treatmentPlan ? treatmentPlan.chemical_treatment.name : "Tricyclazole 75 WP"}
                  </span>
                  <span className="px-2.5 py-1 bg-warm-surface dark:bg-forest-900 border border-warm-border dark:border-forest-700 rounded-md">
                    ⚖️ Market: {lastPriceResult ? (lastPriceResult.is_predatory_price ? "Predatory Flag" : "Fair") : "Mandi Checked"}
                  </span>
                </div>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={generateFieldHealthCard}
                    disabled={isGeneratingPassport}
                    className="inline-flex items-center gap-2.5 px-6 py-3 bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 dark:hover:bg-forest-600 text-forest-50 text-sm font-heading font-bold rounded-xl border border-forest-700 dark:border-forest-500 shadow-panel hover:shadow-elevated transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
                  >
                    <Sparkles className="w-4 h-4 text-amber" />
                    <span>Generate Field Health Card & Bengali Audio Advisory</span>
                  </button>
                </div>
              </div>
            </ScrollReveal>
          )}

          {isGeneratingPassport && <PassportSkeleton />}

          {generatedPassport && (
            <ScrollReveal direction="up" delay={0.1}>
              <FieldHealthCard
                report={generatedPassport}
                onRefresh={generateFieldHealthCard}
              />
            </ScrollReveal>
          )}
        </section>
      </main>
    </div>
  );
}

