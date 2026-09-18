"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  FileBadge,
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { FieldHealthCard, FieldHealthCardReport } from "@/components/dashboard/field-health-card";
import { PassportSkeleton } from "@/components/dashboard/dashboard-skeletons";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { API_BASE_URL } from "@/lib/api-config";

export default function PassportPage() {
  const [report, setReport] = useState<FieldHealthCardReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDefaultOrStoredReport = async () => {
    setIsLoading(true);
    setError(null);

    // 1. Check if passport was stored from Dashboard session
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("krishi_bondhu_passport");
        if (stored) {
          const parsed = JSON.parse(stored);
          setReport(parsed);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("[PassportPage] Could not parse stored passport:", err);
      }
    }

    // 2. Otherwise synthesize report from backend API
    try {
      const res = await fetch(`${API_BASE_URL}/api/generate-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmer_name: "মো: রফিকুল ইসলাম (Md. Rafiqul Islam)",
          district_name: "Godagari, Rajshahi",
          plot_id: "KB-PLOT-RAJ-04",
          disease_detection: {
            disease_name: "Rice Leaf Blast (Magnaporthe oryzae)",
            confidence_note: "Visual match 94%. Spindle lesions with necrotic centers.",
            severity_percentage: 34.5,
            severity_class: "Moderate",
            affected_area_description: "Adaxial leaf blades and collar regions exhibiting lesions",
            processing_time_ms: 290.0,
            source: "krishi-bondhu-vision-ai",
          },
          treatment_plan: {
            root_cause_explanation: "Fungal infection catalyzed by humidity and morning dew.",
            organic_treatment_steps: [
              "Apply Trichoderma harzianum bio-fungicide at 5g/L water in early morning.",
              "Drain excess water for 48 hours to aerate root-zone.",
              "Apply wood ash dusting (20 kg/acre) across canopy.",
            ],
            chemical_treatment: {
              name: "Tricyclazole 75 WP",
              dosage: "0.75 g / L water (approx 120 L / acre solution)",
              pre_harvest_interval: "21 Days (PHI)",
            },
            safety_precautions: [
              "Wear protective mask and gloves.",
              "Do not spray within 10 meters of fish ponds.",
            ],
            spray_schedule_advice: "Optimal Spray Window Active: Apply between 6:30 AM - 8:30 AM.",
            rain_within_6h: false,
            spray_warning_active: false,
          },
          price_analysis: {
            is_predatory_price: true,
            price_deviation_percent: -27.9,
            volatility_score: 0.32,
            recommended_selling_window: "Days 4 to 7 (Optimal: Upcoming Friday Haat)",
            historical_price_chart_data: [],
            crop_type: "Aman Rice",
            crop_display_name: "Aman Rice (BRRI dhan49)",
            harvested_volume_kg: 1200.0,
            offered_price_per_kg: 24.50,
            historical_mean_price_per_kg: 34.00,
            historical_std_dev: 2.15,
            z_score: -4.42,
            anomaly_status: "Severe Predatory Anomaly Detected",
            offered_total_value_bdt: 29400.0,
            fair_market_total_value_bdt: 40800.0,
            estimated_financial_loss_bdt: 11400.0,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data: FieldHealthCardReport = await res.json();
      setReport(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load Digital Crop Passport.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDefaultOrStoredReport();
  }, []);

  return (
    <div className="min-h-screen bg-warm-bg dark:bg-forest-950 text-warm-ink dark:text-forest-100 pb-24 transition-colors duration-200">
      {/* Top Header Navigation */}
      <header className="border-b border-warm-border dark:border-forest-800 bg-warm-surface/90 dark:bg-forest-950/90 backdrop-blur-md sticky top-0 z-40 print:hidden transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-0 sm:h-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-warm-inkMuted dark:text-forest-300 hover:text-forest-800 dark:hover:text-forest-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Advisory Console</span>
            </Link>
            <div className="hidden sm:block h-4 w-px bg-warm-borderStrong dark:bg-forest-700" />
            <div className="flex items-center gap-2">
              <FileBadge className="w-4 h-4 text-amber" />
              <h1 className="font-heading font-bold text-forest-900 dark:text-forest-100 text-sm">
                Digital Crop Passport Certificate
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
            <ThemeToggle />
            <button
              type="button"
              onClick={fetchDefaultOrStoredReport}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-warm-card dark:bg-forest-900 border border-warm-borderStrong dark:border-forest-700 hover:bg-warm-surface dark:hover:bg-forest-800 text-xs font-semibold text-forest-900 dark:text-forest-100 rounded-md transition-all shadow-subtle disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
              aria-label="Re-fetch digital crop passport"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-soil dark:text-soil-300 ${isLoading ? "animate-spin" : ""}`} />
              <span>Re-Fetch Passport</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <ScrollReveal direction="up" delay={0.1}>
          {isLoading ? (
            <PassportSkeleton />
          ) : error ? (
            <div className="p-8 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-center space-y-4 shadow-panel">
              <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400 mx-auto" />
              <div className="space-y-1">
                <h2 className="font-heading font-bold text-base text-rose-900 dark:text-rose-200">
                  Failed to Load Field Health Card
                </h2>
                <p className="text-xs text-rose-700 dark:text-rose-300">{error}</p>
              </div>
              <button
                type="button"
                onClick={fetchDefaultOrStoredReport}
                className="px-4 py-2 bg-rose-800 text-white rounded-lg text-xs font-semibold hover:bg-rose-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              >
                Try Again
              </button>
            </div>
          ) : report ? (
            <FieldHealthCard report={report} onRefresh={fetchDefaultOrStoredReport} />
          ) : null}
        </ScrollReveal>
      </main>
    </div>
  );
}
