"use client";

import React, { useState, useEffect, useId, useCallback, useRef } from "react";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  BarChart3,
  RefreshCw,
  Scale,
  Sparkles,
  HelpCircle,
  Coins,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { ScrollReveal } from "@/components/ScrollReveal";
import { PriceAnomalySkeleton } from "./dashboard-skeletons";

export interface HistoricalPricePoint {
  date: string;
  day_number: number;
  price_per_kg: number;
  min_price: number;
  max_price: number;
  offered_price?: number;
}

export interface SellingWindowRecommendation {
  optimal_window: string;
  trend_direction: string;
  expected_price_range: string;
  action_advice: string;
  estimated_additional_earnings_bdt: number;
}

export interface PriceCheckResponse {
  is_predatory_price: boolean;
  price_deviation_percent: number;
  volatility_score: number;
  recommended_selling_window: SellingWindowRecommendation | string;
  historical_price_chart_data: HistoricalPricePoint[];
  crop_type?: string;
  crop_display_name?: string;
  harvested_volume_kg?: number;
  offered_price_per_kg?: number;
  historical_mean_price_per_kg?: number;
  historical_std_dev?: number;
  z_score?: number;
  anomaly_status?: string;
  offered_total_value_bdt?: number;
  fair_market_total_value_bdt?: number;
  estimated_financial_loss_bdt?: number;
}

interface MarketPriceAnomalyProps {
  initialCrop?: string;
  onPriceCheckCompleted?: (result: PriceCheckResponse) => void;
}

const CROP_PRESETS = [
  { id: "aman_rice", name: "Aman Rice (BRRI dhan49)", defaultPrice: 34.0 },
  { id: "potato", name: "Potato (Diamant Variety)", defaultPrice: 28.5 },
  { id: "tomato", name: "Tomato (Ratan Variety)", defaultPrice: 48.0 },
  { id: "onion", name: "Onion (Taherpuri)", defaultPrice: 60.0 },
  { id: "green_chilli", name: "Green Chilli", defaultPrice: 110.0 },
  { id: "wheat", name: "Wheat (Sonalika)", defaultPrice: 39.5 },
];

export function MarketPriceAnomaly({
  initialCrop,
  onPriceCheckCompleted,
}: MarketPriceAnomalyProps) {
  const formId = useId();
  const [cropType, setCropType] = useState<string>(
    initialCrop || "Aman Rice (BRRI dhan49)"
  );
  const [volumeKg, setVolumeKg] = useState<string>("1200");
  const [offeredPrice, setOfferedPrice] = useState<string>("24.50");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PriceCheckResponse | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Update crop if prop updates
  useEffect(() => {
    if (initialCrop) {
      setCropType(initialCrop);
    }
  }, [initialCrop]);

  const onPriceCheckCompletedRef = useRef(onPriceCheckCompleted);
  useEffect(() => {
    onPriceCheckCompletedRef.current = onPriceCheckCompleted;
  });

  const evaluatePrice = useCallback(
    async (crop: string, volume: number, price: number) => {
      setIsLoading(true);
      setError(null);

      const backendBase =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

      try {
        const res = await fetch(`${backendBase}/api/price-check`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            crop_type: crop,
            harvested_volume_kg: volume,
            offered_price_per_kg: price,
          }),
        });

        if (!res.ok) {
          const errPayload = await res.json().catch(() => ({}));
          throw new Error(
            errPayload.detail || `Server returned HTTP ${res.status}`
          );
        }

        const data: PriceCheckResponse = await res.json();
        setResult(data);
        if (onPriceCheckCompletedRef.current) {
          onPriceCheckCompletedRef.current(data);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to evaluate market price anomaly.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const initialEvaluatedRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
    if (!initialEvaluatedRef.current) {
      initialEvaluatedRef.current = true;
      // Automatically trigger initial analysis with default preset
      evaluatePrice("Aman Rice (BRRI dhan49)", 1200, 24.5);
    }
  }, [evaluatePrice]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const volNum = parseFloat(volumeKg);
    const priceNum = parseFloat(offeredPrice);

    if (isNaN(volNum) || volNum <= 0) {
      setError("Please provide a valid positive harvest volume in kilograms.");
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Please provide a valid offered price per kilogram.");
      return;
    }

    evaluatePrice(cropType, volNum, priceNum);
  };

  const handleSelectPresetScenario = (type: "predatory" | "fair" | "premium") => {
    let testPrice = 24.5;
    if (type === "predatory") {
      testPrice = 24.5; // -29% below mean
      setOfferedPrice("24.50");
    } else if (type === "fair") {
      testPrice = 35.0; // Fair benchmark
      setOfferedPrice("35.00");
    } else {
      testPrice = 41.5; // Premium forward price
      setOfferedPrice("41.50");
    }
    const volNum = parseFloat(volumeKg) || 1200;
    evaluatePrice(cropType, volNum, testPrice);
  };

  const sellingWindowObj: SellingWindowRecommendation | null =
    result?.recommended_selling_window &&
    typeof result.recommended_selling_window === "object"
      ? (result.recommended_selling_window as SellingWindowRecommendation)
      : null;

  const sellingWindowStr: string =
    typeof result?.recommended_selling_window === "string"
      ? result.recommended_selling_window
      : sellingWindowObj?.optimal_window || "Next 3 to 6 days";

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-warm-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-forest-100 text-forest-800 font-mono text-[10px] font-bold border border-forest-300">
              Task 4 Engine
            </span>
            <h3 className="text-lg sm:text-xl font-heading font-bold text-forest-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber" />
              <span>Yield Risk & Market Price Anomaly Detection</span>
            </h3>
          </div>
          <p className="text-xs text-warm-inkMuted mt-0.5">
            Cross-verifies broker buying offers against 30-day regional wholesale mandi benchmarks with Z-score anomaly detection, measures volatility, and schedules the optimal 7-day selling window.
          </p>
        </div>

        {/* Quick Test Scenario Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono text-soil font-semibold">
            Test Scenarios:
          </span>
          <button
            type="button"
            onClick={() => handleSelectPresetScenario("predatory")}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors shadow-subtle"
          >
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Predatory Offer (-29%)</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectPresetScenario("fair")}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md bg-forest-50 text-forest-800 border border-forest-200 hover:bg-forest-100 transition-colors shadow-subtle"
          >
            <CheckCircle2 className="w-3 h-3 text-forest-600" />
            <span>Fair Benchmark</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectPresetScenario("premium")}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md bg-warm-surface text-forest-900 border border-warm-borderStrong hover:bg-warm-border transition-colors shadow-subtle"
          >
            <TrendingUp className="w-3 h-3 text-forest-600" />
            <span>Premium (+18%)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Input Form (Left) & Results/Chart (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Intake Form */}
        <div className="lg:col-span-4 space-y-5">
          <ScrollReveal direction="up" delay={0.05}>
            <div className="bg-warm-card border border-warm-border rounded-xl p-6 shadow-subtle space-y-5">
              <div className="border-b border-warm-border pb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-heading font-bold text-forest-900">
                    Harvest & Offer Verification
                  </h4>
                  <p className="text-xs text-warm-inkMuted mt-0.5">
                    Enter transaction details to detect broker underbidding.
                  </p>
                </div>
                <Coins className="w-4 h-4 text-soil" />
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                {/* Crop Selection */}
                <div>
                  <label
                    htmlFor={`${formId}-crop`}
                    className="block font-semibold text-forest-900 mb-1"
                  >
                    Crop Type / Variety
                  </label>
                  <input
                    id={`${formId}-crop`}
                    type="text"
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    placeholder="e.g., Aman Rice (BRRI dhan49)"
                    className="w-full px-3.5 py-2.5 bg-warm-surface border border-warm-borderStrong rounded-lg text-warm-ink font-sans focus:outline-none focus:ring-1 focus:ring-amber"
                  />
                  {/* Crop quick pills */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {CROP_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setCropType(p.name);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                          cropType === p.name
                            ? "bg-forest-800 text-forest-50 border-forest-800"
                            : "bg-warm-surface text-warm-inkMuted border-warm-border hover:border-soil-400"
                        }`}
                      >
                        {p.name.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Harvested Volume */}
                <div>
                  <label
                    htmlFor={`${formId}-volume`}
                    className="block font-semibold text-forest-900 mb-1"
                  >
                    Harvested Batch Volume (kg)
                  </label>
                  <div className="relative">
                    <input
                      id={`${formId}-volume`}
                      type="number"
                      step="any"
                      min="1"
                      value={volumeKg}
                      onChange={(e) => setVolumeKg(e.target.value)}
                      placeholder="e.g., 1200"
                      className="w-full px-3.5 py-2.5 bg-warm-surface border border-warm-borderStrong rounded-lg text-warm-ink font-sans focus:outline-none focus:ring-1 focus:ring-amber pr-12"
                    />
                    <span className="absolute right-3 top-2.5 text-warm-inkSubtle font-mono text-xs">
                      kg
                    </span>
                  </div>
                  {/* Quick volume buttons */}
                  <div className="flex gap-1.5 mt-1.5">
                    {["500", "1200", "2500", "5000"].map((vol) => (
                      <button
                        key={vol}
                        type="button"
                        onClick={() => setVolumeKg(vol)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                          volumeKg === vol
                            ? "bg-soil-600 text-forest-50 border-soil-600"
                            : "bg-warm-surface text-soil border-warm-border"
                        }`}
                      >
                        {vol} kg
                      </button>
                    ))}
                  </div>
                </div>

                {/* Offered Wholesale Price */}
                <div>
                  <label
                    htmlFor={`${formId}-price`}
                    className="block font-semibold text-forest-900 mb-1"
                  >
                    Offered Price per kg (BDT / kg)
                  </label>
                  <div className="relative">
                    <input
                      id={`${formId}-price`}
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={offeredPrice}
                      onChange={(e) => setOfferedPrice(e.target.value)}
                      placeholder="e.g., 24.50"
                      className="w-full px-3.5 py-2.5 bg-warm-surface border border-warm-borderStrong rounded-lg text-warm-ink font-sans focus:outline-none focus:ring-1 focus:ring-amber pr-14"
                    />
                    <span className="absolute right-3 top-2.5 text-warm-inkSubtle font-mono text-xs">
                      ৳ / kg
                    </span>
                  </div>
                  <p className="text-[10px] text-soil mt-1">
                    Middleman broker or depot procurement rate offered.
                  </p>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-forest-800 hover:bg-forest-900 text-forest-50 font-heading font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-subtle transition-all disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber" />
                      <span>Computing Z-Score Anomaly...</span>
                    </>
                  ) : (
                    <>
                      <Scale className="w-3.5 h-3.5 text-amber" />
                      <span>Evaluate Price & Selling Window</span>
                    </>
                  )}
                </button>
              </form>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Verification Error:</strong> {error}
                  </div>
                </div>
              )}

              {/* Statistical Context Note */}
              <div className="p-3 bg-warm-surface border border-warm-border rounded-lg space-y-1 text-[11px] text-warm-inkMuted">
                <div className="flex items-center gap-1 font-semibold text-forest-900">
                  <HelpCircle className="w-3 h-3 text-soil" />
                  <span>How Anomaly Detection Works</span>
                </div>
                <p className="text-[10px] leading-relaxed">
                  The model tracks 30-day moving wholesale benchmarks across primary Bangladeshi mandis. If an offer produces a Z-score &le; -1.5 (&gt;15% below mean), predatory pricing is flagged to prevent middleman arbitrage.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Right Column: Warning Banner, Metrics & Chart */}
        <div className="lg:col-span-8 space-y-6">
          {/* Result Section */}
          {isLoading ? (
            <PriceAnomalySkeleton />
          ) : result ? (
            <ScrollReveal direction="up" delay={0.1}>
              <div className="space-y-5">
                {/* 1. Predatory Pricing Warning / Fair Price Confirmation Banner */}
                {result.is_predatory_price ? (
                  <div className="p-5 bg-amber-50 border-2 border-amber-500/80 rounded-xl text-warm-ink shadow-panel space-y-3 animate-in fade-in">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-500 text-amber-950 flex items-center justify-center shrink-0 shadow-amberGlow">
                          <AlertTriangle className="w-6 h-6 text-amber-950 stroke-[2.5]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-200 text-amber-950 border border-amber-400">
                              Predatory Pricing Detected
                            </span>
                            <span className="font-mono text-[11px] text-soil font-semibold">
                              Z-Score: {result.z_score?.toFixed(2)}σ
                            </span>
                          </div>
                          <h4 className="text-base sm:text-lg font-heading font-bold text-forest-950 mt-1">
                            Exploitative Middleman Buying Offer Alert
                          </h4>
                        </div>
                      </div>

                      <div className="text-right hidden sm:block">
                        <span className="font-mono text-xs font-bold text-rose-700 block">
                          {result.price_deviation_percent.toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-warm-inkMuted">
                          Deviation from Mean
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-warm-ink leading-relaxed">
                      The broker offer of{" "}
                      <strong className="text-forest-950 font-bold">
                        ৳{result.offered_price_per_kg?.toFixed(2)} / kg
                      </strong>{" "}
                      is{" "}
                      <strong className="text-rose-800 font-bold">
                        {Math.abs(result.price_deviation_percent).toFixed(1)}%
                        below
                      </strong>{" "}
                      the 30-day regional wholesale mean (
                      <strong>
                        ৳{result.historical_mean_price_per_kg?.toFixed(2)} / kg
                      </strong>
                      ). On your{" "}
                      <strong>
                        {result.harvested_volume_kg?.toLocaleString()} kg
                      </strong>{" "}
                      harvest, accepting this offer results in an estimated loss of{" "}
                      <strong className="text-rose-800 font-bold underline">
                        ৳{result.estimated_financial_loss_bdt?.toLocaleString()}{" "}
                        BDT
                      </strong>{" "}
                      to middleman arbitrage.
                    </p>

                    <div className="pt-2 border-t border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-forest-900 flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-amber-700" />
                        <span>
                          Advisory Action: Reject or renegotiate offer
                          immediately.
                        </span>
                      </span>
                      <span className="font-mono text-[11px] text-soil">
                        Fair Batch Value: ৳
                        {result.fair_market_total_value_bdt?.toLocaleString()}{" "}
                        BDT
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 bg-emerald-50/80 border border-emerald-300 rounded-xl text-warm-ink shadow-subtle space-y-2.5 animate-in fade-in">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Fair Market Offer
                            </span>
                            <span className="font-mono text-[11px] text-forest-700">
                              Z-Score: {result.z_score?.toFixed(2)}σ
                            </span>
                          </div>
                          <h4 className="text-base font-heading font-bold text-forest-950 mt-0.5">
                            Wholesale Price Within Normal Regional Range
                          </h4>
                        </div>
                      </div>

                      <div className="text-right hidden sm:block">
                        <span className="font-mono text-xs font-bold text-emerald-800 block">
                          {result.price_deviation_percent >= 0 ? "+" : ""}
                          {result.price_deviation_percent.toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-warm-inkMuted">
                          vs 30d Mean
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-warm-ink leading-relaxed">
                      The offered price of{" "}
                      <strong>৳{result.offered_price_per_kg?.toFixed(2)} / kg</strong>{" "}
                      is consistent with regional trading benchmarks (30-day mean:{" "}
                      <strong>৳{result.historical_mean_price_per_kg?.toFixed(2)} / kg</strong>
                      ). Total batch value is estimated at{" "}
                      <strong>৳{result.offered_total_value_bdt?.toLocaleString()} BDT</strong>.
                    </p>
                  </div>
                )}

                {/* 2. Statistical Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-warm-card border border-warm-border rounded-xl p-3.5 shadow-subtle space-y-1">
                    <span className="text-[10px] font-mono text-soil block uppercase">
                      Offered vs Mean
                    </span>
                    <div className="font-mono font-bold text-sm sm:text-base text-forest-900">
                      ৳{result.offered_price_per_kg?.toFixed(1)}{" "}
                      <span className="text-[11px] font-normal text-warm-inkSubtle">
                        / ৳{result.historical_mean_price_per_kg?.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-[9px] text-soil-500 block">
                      Per kg benchmark
                    </span>
                  </div>

                  <div className="bg-warm-card border border-warm-border rounded-xl p-3.5 shadow-subtle space-y-1">
                    <span className="text-[10px] font-mono text-soil block uppercase">
                      Deviation %
                    </span>
                    <div
                      className={`font-mono font-bold text-sm sm:text-base flex items-center gap-1 ${
                        result.price_deviation_percent < -15
                          ? "text-rose-700"
                          : result.price_deviation_percent >= 0
                          ? "text-emerald-700"
                          : "text-forest-900"
                      }`}
                    >
                      {result.price_deviation_percent < 0 ? (
                        <TrendingDown className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingUp className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {result.price_deviation_percent >= 0 ? "+" : ""}
                        {result.price_deviation_percent.toFixed(1)}%
                      </span>
                    </div>
                    <span className="text-[9px] text-soil-500 block">
                      From historical mean
                    </span>
                  </div>

                  <div className="bg-warm-card border border-warm-border rounded-xl p-3.5 shadow-subtle space-y-1">
                    <span className="text-[10px] font-mono text-soil block uppercase">
                      Volatility Score
                    </span>
                    <div className="font-mono font-bold text-sm sm:text-base text-forest-900">
                      {result.volatility_score.toFixed(3)}
                    </div>
                    <span className="text-[9px] text-soil-500 block">
                      {result.volatility_score > 0.08
                        ? "High Volatility"
                        : result.volatility_score > 0.04
                        ? "Moderate Volatility"
                        : "Low Volatility / Stable"}
                    </span>
                  </div>

                  <div className="bg-warm-card border border-warm-border rounded-xl p-3.5 shadow-subtle space-y-1">
                    <span className="text-[10px] font-mono text-soil block uppercase">
                      Arbitrage Loss
                    </span>
                    <div
                      className={`font-mono font-bold text-sm sm:text-base ${
                        (result.estimated_financial_loss_bdt || 0) > 0
                          ? "text-rose-700"
                          : "text-emerald-700"
                      }`}
                    >
                      ৳{(result.estimated_financial_loss_bdt || 0).toLocaleString()}
                    </div>
                    <span className="text-[9px] text-soil-500 block">
                      {(result.estimated_financial_loss_bdt || 0) > 0
                        ? "Revenue lost to broker"
                        : "Zero loss detected"}
                    </span>
                  </div>
                </div>

                {/* 3. Recommended Optimal 7-Day Selling Window */}
                <div className="bg-warm-card border border-warm-border rounded-xl p-5 shadow-subtle space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-warm-border pb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber" />
                      <h4 className="font-heading font-bold text-forest-900 text-sm">
                        Optimal 7-Day Selling Window & Market Momentum
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-forest-800 text-forest-50 font-bold">
                        {sellingWindowStr}
                      </span>
                    </div>
                  </div>

                  {sellingWindowObj && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-warm-surface border border-warm-border rounded-lg space-y-1">
                        <span className="text-[10px] font-mono text-soil block uppercase">
                          Market Momentum Trajectory
                        </span>
                        <div className="font-heading font-semibold text-forest-900">
                          {sellingWindowObj.trend_direction}
                        </div>
                      </div>

                      <div className="p-3 bg-warm-surface border border-warm-border rounded-lg space-y-1">
                        <span className="text-[10px] font-mono text-soil block uppercase">
                          Projected Haat Price Range
                        </span>
                        <div className="font-mono font-bold text-forest-900 text-xs">
                          {sellingWindowObj.expected_price_range}
                        </div>
                      </div>

                      <div className="p-3 bg-warm-surface border border-warm-border rounded-lg space-y-1">
                        <span className="text-[10px] font-mono text-soil block uppercase">
                          Projected Margin Recovery
                        </span>
                        <div className="font-mono font-bold text-emerald-800 text-xs">
                          +৳
                          {sellingWindowObj.estimated_additional_earnings_bdt.toLocaleString()}{" "}
                          BDT
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Strategic Action Advice */}
                  <div className="p-3.5 bg-forest-950 text-forest-50 rounded-lg border border-forest-900 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-amber font-heading font-bold text-[11px] uppercase tracking-wide">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Strategic Selling Advisory</span>
                    </div>
                    <p className="text-forest-200 leading-relaxed text-[11px]">
                      {sellingWindowObj?.action_advice ||
                        "Hold harvest for the recommended trading window to maximize wholesale profit and avoid broker price squeezing."}
                    </p>
                  </div>
                </div>

                {/* 4. Recharts Line Chart: Historical Price Trend vs Offered Price */}
                <div className="bg-warm-card border border-warm-border rounded-xl p-5 shadow-subtle space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-warm-border pb-3">
                    <div>
                      <h4 className="font-heading font-bold text-forest-900 text-sm flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-forest-700" />
                        <span>
                          30-Day Wholesale Price Trend vs. Farmer&apos;s Offered Rate
                        </span>
                      </h4>
                      <p className="text-xs text-warm-inkMuted mt-0.5">
                        Depot wholesale benchmark prices (BDT/kg) compared directly with the middleman&apos;s quote.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-forest-800 inline-block" />
                        <span className="text-forest-900">Wholesale Trend</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-amber-500 border-b border-dashed border-amber-600 inline-block" />
                        <span className="text-amber-800 font-semibold">Offered Price</span>
                      </div>
                    </div>
                  </div>

                  {/* Recharts Container */}
                  <div className="w-full h-[320px] pt-2">
                    {isMounted && result.historical_price_chart_data?.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={result.historical_price_chart_data}
                          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#E5DED0"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="day_number"
                            tickFormatter={(val) => `D${val}`}
                            stroke="#738077"
                            tick={{ fontSize: 10, fill: "#4C5951" }}
                            tickLine={false}
                          />
                          <YAxis
                            unit="৳"
                            domain={[
                              (dataMin: number) =>
                                Math.floor(
                                  Math.min(
                                    dataMin,
                                    result.offered_price_per_kg || dataMin
                                  ) * 0.95
                                ),
                              (dataMax: number) =>
                                Math.ceil(
                                  Math.max(
                                    dataMax,
                                    result.offered_price_per_kg || dataMax
                                  ) * 1.05
                                ),
                            ]}
                            stroke="#738077"
                            tick={{ fontSize: 10, fill: "#4C5951" }}
                            tickLine={false}
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0]
                                  .payload as HistoricalPricePoint;
                                const diff =
                                  (result.offered_price_per_kg || 0) -
                                  data.price_per_kg;
                                return (
                                  <div className="bg-warm-card border border-warm-borderStrong p-3 rounded-lg shadow-elevated text-xs font-mono space-y-1">
                                    <div className="font-bold text-forest-900 border-b border-warm-border pb-1 flex justify-between gap-4">
                                      <span>Day {data.day_number}</span>
                                      <span className="text-soil-500">
                                        {data.date}
                                      </span>
                                    </div>
                                    <div className="text-forest-800 flex justify-between gap-4">
                                      <span>Wholesale Benchmark:</span>
                                      <strong>৳{data.price_per_kg.toFixed(2)} / kg</strong>
                                    </div>
                                    <div className="text-amber-800 flex justify-between gap-4">
                                      <span>Offered Price:</span>
                                      <strong>
                                        ৳{(result.offered_price_per_kg || 0).toFixed(2)} / kg
                                      </strong>
                                    </div>
                                    <div
                                      className={`pt-1 border-t border-warm-border flex justify-between gap-4 font-bold ${
                                        diff < 0 ? "text-rose-700" : "text-emerald-700"
                                      }`}
                                    >
                                      <span>Middleman Gap:</span>
                                      <span>
                                        {diff > 0 ? "+" : ""}
                                        {diff.toFixed(2)} ৳/kg
                                      </span>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend
                            wrapperStyle={{
                              fontSize: "11px",
                              paddingTop: "8px",
                            }}
                          />

                          {/* Historical Wholesale Benchmark Line */}
                          <Line
                            name="Wholesale Benchmark (BDT/kg)"
                            type="monotone"
                            dataKey="price_per_kg"
                            stroke="#1F3D2B"
                            strokeWidth={2.5}
                            dot={{ r: 2.5, fill: "#1F3D2B" }}
                            activeDot={{ r: 5, fill: "#D9A441" }}
                          />

                          {/* 30-day Mean Reference Line */}
                          {result.historical_mean_price_per_kg && (
                            <ReferenceLine
                              y={result.historical_mean_price_per_kg}
                              stroke="#775D45"
                              strokeDasharray="4 4"
                              label={{
                                value: `Mean: ৳${result.historical_mean_price_per_kg.toFixed(1)}`,
                                fill: "#775D45",
                                fontSize: 9,
                                position: "insideBottomRight",
                              }}
                            />
                          )}

                          {/* Farmer's Offered Price Reference Line */}
                          {result.offered_price_per_kg && (
                            <ReferenceLine
                              y={result.offered_price_per_kg}
                              stroke={
                                result.is_predatory_price
                                  ? "#BF882C"
                                  : "#4B7D61"
                              }
                              strokeDasharray="5 5"
                              strokeWidth={2}
                              label={{
                                value: `Offered: ৳${result.offered_price_per_kg.toFixed(1)}/kg`,
                                fill: result.is_predatory_price
                                  ? "#976822"
                                  : "#284E3B",
                                fontSize: 10,
                                fontWeight: "bold",
                                position: "insideTopLeft",
                              }}
                            />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col justify-between p-4 bg-warm-surface dark:bg-forest-900/40 rounded-lg animate-pulse">
                        <div className="flex justify-between">
                          <div className="h-3 w-16 bg-warm-border dark:bg-forest-800 rounded" />
                          <div className="h-3 w-16 bg-warm-border dark:bg-forest-800 rounded" />
                        </div>
                        <div className="h-0.5 w-full bg-warm-border/50 dark:bg-forest-800/50" />
                        <div className="flex justify-between">
                          <div className="h-3 w-12 bg-warm-border dark:bg-forest-800 rounded" />
                          <div className="h-3 w-12 bg-warm-border dark:bg-forest-800 rounded" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ) : null}
        </div>
      </div>
    </div>
  );
}
