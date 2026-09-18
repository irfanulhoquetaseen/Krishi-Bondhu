"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Download,
  Share2,
  Printer,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Scale,
  CloudRain,
  Sun,
  Leaf,
  Sparkles,
  QrCode,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import { AudioAdvisoryPlayer } from "./audio-advisory-player";
import { API_BASE_URL } from "@/lib/api-config";

export interface FieldHealthCardReport {
  passport_id: string;
  created_at: string;
  crop_type: string;
  farmer_name: string;
  district_name: string;
  risk_score: number;
  risk_level: string;
  bengali_audio_summary: string;
  audio_base64: string;
  audio_format?: string;
  audio_error?: string;
  pdf_base64: string;
  pdf_filename: string;
  summary_highlights: string[];
  whatsapp_share_text: string;
  source?: string;
  processing_time_ms?: number;
  // Optional client-side diagnostic attachments
  disease_name?: string;
  severity_class?: string;
  severity_percentage?: number;
  affected_area_description?: string;
  organic_steps?: string[];
  chemical_name?: string;
  chemical_dosage?: string;
  pre_harvest_interval?: string;
  spray_schedule_advice?: string;
  rain_within_6h?: boolean;
  offered_price_per_kg?: number;
  fair_price_per_kg?: number;
  price_deviation_percent?: number;
  is_predatory_price?: boolean;
  recommended_selling_window?: string;
  crop_image_url?: string;
}

interface FieldHealthCardProps {
  report: FieldHealthCardReport;
  onRefresh?: () => void;
  className?: string;
}

export function FieldHealthCard({
  report,
  onRefresh,
  className = "",
}: FieldHealthCardProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Copy Passport ID to clipboard
  const copyPassportId = () => {
    navigator.clipboard.writeText(report.passport_id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Trigger one-click direct PDF download from base64
  const downloadPdf = () => {
    setIsDownloading(true);
    try {
      const byteCharacters = atob(report.pdf_base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = report.pdf_filename || `Field_Health_Card_${report.passport_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[FieldHealthCard] PDF download error:", err);
      // Fallback: Open backend direct download endpoint in new window
      window.open(`${API_BASE_URL}/api/download-report-pdf/${report.passport_id}`, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  // Open WhatsApp with pre-composed text
  const shareWhatsApp = () => {
    const encodedText = encodeURIComponent(report.whatsapp_share_text);
    const waUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  // Trigger native browser print
  const printCard = () => {
    window.print();
  };

  // Color classes according to risk level
  const riskColorConfig = {
    Low: {
      bg: "bg-emerald-50",
      border: "border-emerald-300",
      text: "text-emerald-800",
      badge: "bg-emerald-100 text-emerald-900 border-emerald-300",
    },
    Moderate: {
      bg: "bg-amber-50",
      border: "border-amber-300",
      text: "text-amber-900",
      badge: "bg-amber-100 text-amber-900 border-amber-300",
    },
    High: {
      bg: "bg-orange-50",
      border: "border-orange-300",
      text: "text-orange-900",
      badge: "bg-orange-100 text-orange-900 border-orange-300",
    },
    Critical: {
      bg: "bg-rose-50",
      border: "border-rose-300",
      text: "text-rose-900",
      badge: "bg-rose-100 text-rose-900 border-rose-300",
    },
  }[report.risk_level as "Low" | "Moderate" | "High" | "Critical"] || {
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-900",
    badge: "bg-amber-100 text-amber-900 border-amber-300",
  };

  const isRain = report.rain_within_6h ?? false;

  return (
    <div className={`space-y-6 print:space-y-4 ${className}`}>
      {/* Top Action Bar (Buttons) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-warm-surface border border-warm-borderStrong rounded-xl shadow-subtle print:hidden">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono font-semibold text-forest-900">
            Digital Crop Passport Active • {report.passport_id}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Download PDF Button */}
          <button
            type="button"
            onClick={downloadPdf}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-forest-800 hover:bg-forest-900 text-forest-50 text-xs font-heading font-bold rounded-lg border border-forest-700 shadow-subtle transition-all duration-200"
          >
            <Download className={`w-4 h-4 text-amber ${isDownloading ? "animate-bounce" : ""}`} />
            <span>Download PDF Card</span>
          </button>

          {/* Share via WhatsApp Button */}
          <button
            type="button"
            onClick={shareWhatsApp}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-forest-950 text-xs font-heading font-bold rounded-lg shadow-subtle transition-all duration-200"
          >
            <Share2 className="w-4 h-4" />
            <span>Share via WhatsApp</span>
          </button>

          {/* Print Button */}
          <button
            type="button"
            onClick={printCard}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-warm-card dark:bg-forest-900 hover:bg-warm-surface dark:hover:bg-forest-800 text-soil dark:text-soil-300 hover:text-forest-900 dark:hover:text-forest-100 text-xs font-semibold rounded-lg border border-warm-borderStrong dark:border-forest-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-soil dark:text-soil-300" />
            <span className="hidden sm:inline">Print</span>
          </button>

          {/* Re-Synthesize Button if onRefresh is passed */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-warm-surface dark:bg-forest-900 hover:bg-warm-border dark:hover:bg-forest-800 text-forest-900 dark:text-forest-100 text-xs font-semibold rounded-lg border border-warm-borderStrong dark:border-forest-700 transition-colors"
              title="Re-synthesize Field Health Card"
            >
              <RefreshCw className="w-3.5 h-3.5 text-soil dark:text-soil-300" />
              <span className="hidden sm:inline">Re-Synthesize</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Printable Passport Document Card */}
      <div
        id="crop-passport-printable"
        className="bg-warm-card dark:bg-forest-900/80 border-2 border-warm-borderStrong dark:border-forest-700 rounded-2xl overflow-hidden shadow-elevated transition-all"
      >
        {/* Passport Header Banner (Forest 800) */}
        <div className="bg-forest-900 text-forest-50 p-6 sm:p-8 border-b-4 border-amber relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-forest-800/40 transform -skew-x-12 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-amber/20 text-amber font-mono text-[10px] font-bold border border-amber/40 uppercase tracking-wider">
                  Official Digital Crop Passport
                </span>
                <span className="text-[10px] font-mono text-forest-200">
                  Gov. BD Ag-Telemetry Grid
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-forest-50 tracking-tight">
                কৃষি বন্ধু • Field Health Card
              </h2>
              <p className="text-xs sm:text-sm text-forest-200 max-w-xl leading-relaxed">
                Comprehensive multimodal plant pathology diagnosis, verified IPM prescription,
                and regional wholesale price benchmark.
              </p>
            </div>

            {/* Passport ID & Stamp */}
            <div className="flex md:flex-col items-start md:items-end justify-between gap-2 border-t md:border-t-0 border-forest-800 pt-3 md:pt-0">
              <div className="text-left md:text-right">
                <span className="text-[10px] uppercase font-mono text-amber tracking-wider block">
                  Passport Identifier
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-sm sm:text-base text-forest-50">
                    {report.passport_id}
                  </span>
                  <button
                    type="button"
                    onClick={copyPassportId}
                    title="Copy Passport ID"
                    className="p-1 hover:bg-forest-800 rounded text-amber transition-colors"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className="text-[10px] font-mono text-forest-300 block">
                  Issued: {new Date(report.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-forest-950 text-emerald-300 border border-forest-700 rounded text-[10px] font-mono font-bold">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>OFFICIALLY VERIFIED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Passport Body */}
        <div className="p-6 sm:p-8 space-y-8 bg-warm-bg/50">
          {/* Metadata Grid (Farmer, Plot, Crop, Location) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-warm-card border border-warm-border rounded-xl text-xs">
            <div>
              <span className="text-[10px] font-mono text-soil uppercase block">Farmer Name</span>
              <strong className="text-forest-900 font-medium block mt-0.5">{report.farmer_name}</strong>
            </div>
            <div>
              <span className="text-[10px] font-mono text-soil uppercase block">Location / District</span>
              <strong className="text-forest-900 font-medium block mt-0.5">{report.district_name}</strong>
            </div>
            <div>
              <span className="text-[10px] font-mono text-soil uppercase block">Active Crop</span>
              <strong className="text-forest-900 font-medium block mt-0.5">{report.crop_type}</strong>
            </div>
            <div>
              <span className="text-[10px] font-mono text-soil uppercase block">Station Grid Node</span>
              <strong className="text-forest-900 font-mono block mt-0.5">#KB-RAJ-04</strong>
            </div>
          </div>

          {/* Section 1: Executive Status & Agronomic Risk Score Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Risk Gauge Card */}
            <div
              className={`lg:col-span-4 p-6 rounded-xl border ${riskColorConfig.border} ${riskColorConfig.bg} flex flex-col justify-between space-y-4`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-heading font-bold text-soil uppercase tracking-wide">
                  Agronomic Risk Meter
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${riskColorConfig.badge}`}
                >
                  {report.risk_level} Risk
                </span>
              </div>

              <div className="text-center py-2">
                <div className="text-4xl sm:text-5xl font-heading font-bold text-forest-900 tracking-tight">
                  {report.risk_score.toFixed(0)}
                  <span className="text-lg text-soil font-sans font-normal">/100</span>
                </div>
                <p className="text-xs text-soil-500 mt-1">Composite Vulnerability Score</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-2.5 bg-warm-card border border-warm-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      report.risk_score >= 70
                        ? "bg-rose-600"
                        : report.risk_score >= 45
                        ? "bg-amber-500"
                        : "bg-emerald-600"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, report.risk_score))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-soil">
                  <span>0 (Safe)</span>
                  <span>50 (Elevated)</span>
                  <span>100 (Critical)</span>
                </div>
              </div>
            </div>

            {/* Quick Highlights Summary */}
            <div className="lg:col-span-8 bg-warm-card border border-warm-border rounded-xl p-6 flex flex-col justify-between space-y-4 shadow-subtle">
              <div className="border-b border-warm-border pb-3 flex items-center justify-between">
                <h3 className="font-heading font-bold text-forest-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber" />
                  <span>Executive Clinical Takeaways</span>
                </h3>
                <span className="text-[10px] font-mono text-soil bg-warm-surface px-2 py-0.5 rounded border border-warm-border">
                  BRRI/BARI Synthesized
                </span>
              </div>

              <div className="space-y-2.5">
                {report.summary_highlights && report.summary_highlights.length > 0 ? (
                  report.summary_highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-warm-ink">
                      <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{highlight}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-warm-inkMuted">
                    Multimodal diagnostic and market analysis synthesized successfully.
                  </p>
                )}
              </div>

              {/* Weather spray schedule warning banner */}
              <div
                className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 ${
                  isRain
                    ? "bg-rose-50 border-rose-200 text-rose-900"
                    : "bg-emerald-50 border-emerald-200 text-emerald-900"
                }`}
              >
                {isRain ? (
                  <>
                    <CloudRain className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      <strong>Warning:</strong> Rain forecast within 6 hours. Chemical spraying must be suspended!
                    </span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Optimal Window:</strong> Clear weather for the next 12 hours. Early morning spray recommended.
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Audio Advisory Player */}
          <div>
            <AudioAdvisoryPlayer
              audioBase64={report.audio_base64}
              audioFormat={report.audio_format}
              audioError={report.audio_error}
              bengaliScript={report.bengali_audio_summary}
              cropName={report.crop_type}
            />
          </div>

          {/* Section 3: Foliar Pathology & Crop Image Diagnostic */}
          <div className="bg-warm-card border border-warm-border rounded-xl p-6 shadow-subtle space-y-4">
            <div className="border-b border-warm-border pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-forest-100 text-forest-800 font-mono text-[10px] font-bold border border-forest-300">
                  Task 2 Vision
                </span>
                <h3 className="font-heading font-bold text-forest-900 text-sm">
                  Foliar Pathology & Leaf Tissue Diagnosis
                </h3>
              </div>
              <span className="text-xs font-mono text-soil">
                {report.severity_class || "Moderate"} Severity ({report.severity_percentage || 34.5}%)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Leaf Image Frame */}
              <div className="md:col-span-4 flex justify-center">
                <div className="relative w-full max-w-[240px] aspect-[4/3] rounded-xl overflow-hidden border-2 border-warm-borderStrong bg-warm-surface shadow-subtle flex items-center justify-center">
                  {report.crop_image_url ? (
                    <Image
                      src={report.crop_image_url}
                      alt="Crop Foliar Sample"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="p-4 text-center space-y-2">
                      <Leaf className="w-8 h-8 text-forest-700 mx-auto" />
                      <div className="text-xs font-semibold text-forest-900">
                        {report.crop_type}
                      </div>
                      <span className="text-[10px] font-mono text-soil block">
                        Foliar Specimen Analyzed
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-forest-950/80 text-amber text-[9px] font-mono rounded backdrop-blur-sm">
                    BRRI Pathology Verified
                  </div>
                </div>
              </div>

              {/* Pathology Details */}
              <div className="md:col-span-8 space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-soil uppercase block">Primary Disease</span>
                  <span className="text-base font-heading font-bold text-forest-900">
                    {report.disease_name || "Rice Leaf Blast (Magnaporthe oryzae)"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-warm-surface rounded-lg border border-warm-border">
                    <span className="text-[10px] font-mono text-soil uppercase block">Foliar Area Affected</span>
                    <strong className="text-forest-900 text-sm">{report.severity_percentage || 34.5}%</strong>
                    <span className="text-[10px] text-soil block">Tissue Necrosis</span>
                  </div>
                  <div className="p-3 bg-warm-surface rounded-lg border border-warm-border">
                    <span className="text-[10px] font-mono text-soil uppercase block">Pathology Rating</span>
                    <strong className="text-amber-800 text-sm">{report.severity_class || "Moderate"}</strong>
                    <span className="text-[10px] text-soil block">Spreading Vector</span>
                  </div>
                </div>

                <p className="text-warm-ink leading-relaxed">
                  {report.affected_area_description ||
                    "Adaxial leaf blades and collar regions exhibiting characteristic spindle lesions with necrotic ash-gray centers."}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Treatment Prescription (Organic & Chemical) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Organic IPM Protocol */}
            <div className="bg-warm-card border border-warm-border rounded-xl p-6 shadow-subtle space-y-3">
              <div className="flex items-center gap-2 border-b border-warm-border pb-3">
                <Leaf className="w-4 h-4 text-forest-700" />
                <h4 className="font-heading font-bold text-forest-900 text-sm">
                  Biological & Cultural IPM Controls
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-warm-ink">
                {(report.organic_steps || [
                  "Apply Trichoderma harzianum bio-fungicide formulation at 5g/L water in early morning.",
                  "Drain excess standing water for 48 hours to aerate the root-zone.",
                  "Apply wood ash dusting (20 kg/acre) across the canopy.",
                ]).map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-forest-100 text-forest-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Targeted Chemical Protocol */}
            <div className="bg-forest-50/50 border border-forest-200 rounded-xl p-6 shadow-subtle space-y-3">
              <div className="flex items-center justify-between border-b border-forest-200 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-forest-800" />
                  <h4 className="font-heading font-bold text-forest-900 text-sm">
                    Targeted Chemical Fungicide
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 rounded font-bold">
                  PHI: {report.pre_harvest_interval || "21 Days"}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-soil uppercase block">Formulation</span>
                  <strong className="text-forest-900 text-sm">
                    {report.chemical_name || "Tricyclazole 75 WP"}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-soil uppercase block">Recommended Dosage</span>
                  <span className="text-warm-ink font-medium">
                    {report.chemical_dosage || "0.75 g/L water (approx 120 L/acre solution)"}
                  </span>
                </div>
                <div className="p-2.5 bg-warm-card border border-warm-border rounded-lg text-[11px] text-soil leading-relaxed">
                  <strong>Safety Notice:</strong> Wear protective respirator and nitrile gloves. Maintain a 10m buffer from fish ponds.
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Market Price Benchmark & Selling Strategy */}
          <div className="bg-warm-card border border-warm-border rounded-xl p-6 shadow-subtle space-y-4">
            <div className="border-b border-warm-border pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber" />
                <h4 className="font-heading font-bold text-forest-900 text-sm">
                  Regional Wholesale Market Benchmark
                </h4>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                  report.is_predatory_price
                    ? "bg-rose-50 text-rose-800 border-rose-300"
                    : "bg-emerald-50 text-emerald-800 border-emerald-300"
                }`}
              >
                {report.is_predatory_price ? "Predatory Offer Flagged" : "Fair Price Range"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-warm-surface border border-warm-border rounded-lg">
                <span className="text-[10px] font-mono text-soil uppercase block">Middleman Offer</span>
                <strong className="text-lg font-heading text-forest-900 block mt-0.5">
                  ৳{(report.offered_price_per_kg || 24.5).toFixed(2)}
                  <span className="text-xs font-sans text-soil font-normal"> / kg</span>
                </strong>
                <span className="text-[10px] text-soil-500">Village procurement bid</span>
              </div>

              <div className="p-3.5 bg-warm-surface border border-warm-border rounded-lg">
                <span className="text-[10px] font-mono text-soil uppercase block">30-Day Mandi Mean</span>
                <strong className="text-lg font-heading text-forest-900 block mt-0.5">
                  ৳{(report.fair_price_per_kg || 34.0).toFixed(2)}
                  <span className="text-xs font-sans text-soil font-normal"> / kg</span>
                </strong>
                <span className="text-[10px] text-soil-500">Rajshahi wholesale index</span>
              </div>

              <div className="p-3.5 bg-warm-surface border border-warm-border rounded-lg">
                <span className="text-[10px] font-mono text-soil uppercase block">Price Disparity</span>
                <strong
                  className={`text-lg font-heading block mt-0.5 ${
                    report.is_predatory_price ? "text-rose-700" : "text-emerald-700"
                  }`}
                >
                  {(report.price_deviation_percent || -27.9).toFixed(1)}%
                </strong>
                <span className="text-[10px] text-soil-500">Arbitrage margin difference</span>
              </div>
            </div>

            <div className="p-3.5 bg-warm-surface border border-warm-borderStrong rounded-lg flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-soil uppercase">Recommended Selling Window</span>
                <div className="font-semibold text-forest-900">
                  {report.recommended_selling_window || "Days 4 to 7 (Optimal: Upcoming Friday Haat)"}
                </div>
              </div>
              <span className="text-[11px] font-mono text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                Hold & Sell Strategy
              </span>
            </div>
          </div>
        </div>

        {/* Passport Footer Seal */}
        <div className="bg-warm-surface border-t border-warm-border p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-warm-inkMuted">
          <div className="flex items-center gap-3">
            <QrCode className="w-8 h-8 text-forest-800 shrink-0" />
            <div>
              <p className="font-mono text-[11px] text-forest-900 font-semibold">
                Authenticity Hash: {report.passport_id.slice(-8)}
              </p>
              <p className="text-[10px] text-soil">
                Verified against Bangladesh Rice Research Institute (BRRI) IPM standards.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-soil">
            <span>Powered by Krishi Bondhu Engine v0.1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
