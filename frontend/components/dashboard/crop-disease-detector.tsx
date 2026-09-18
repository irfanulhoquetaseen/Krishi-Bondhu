"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  ScanEye,
  UploadCloud,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Cpu,
  Layers,
  ShieldAlert,
  FileCheck,
} from "lucide-react";

export interface DiseaseDetectionResult {
  disease_name: string;
  confidence_note: string;
  diagnostic_reasoning?: string;
  severity_percentage: number;
  severity_class: "Mild" | "Moderate" | "Severe" | "Critical";
  affected_area_description: string;
  processing_time_ms: number;
  source: string;
}

interface CropDiseaseDetectorProps {
  onDiseaseDetected?: (result: DiseaseDetectionResult, previewUrl?: string) => void;
  expectedCrop?: string;
}

type ScanStage = "idle" | "uploading" | "segmenting" | "analyzing" | "completed" | "error";

export function CropDiseaseDetector({ onDiseaseDetected, expectedCrop }: CropDiseaseDetectorProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scanStage, setScanStage] = useState<ScanStage>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<DiseaseDetectionResult | null>(null);

  // User override for crop context: null = pure visual mode, string = custom crop, undefined = inherit expectedCrop
  const [cropOverride, setCropOverride] = useState<string | null | undefined>(undefined);

  const effectiveCrop = cropOverride !== undefined ? (cropOverride || undefined) : (expectedCrop || undefined);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Helper to generate realistic leaf canvas images for immediate sample testing
  const generateSampleLeafBlob = useCallback(
    (type: "blast" | "blight" | "healthy"): Promise<File> => {
      return new Promise((resolve) => {
        const canvas = document.createElement("canvas");
        canvas.width = 600;
        canvas.height = 400;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Background: soil/neutral field tone
        ctx.fillStyle = "#FAF7F0";
        ctx.fillRect(0, 0, 600, 400);

        // Draw leaf silhouette (slender paddy blade)
        ctx.save();
        ctx.translate(300, 200);
        ctx.rotate(-0.15);

        ctx.beginPath();
        ctx.moveTo(-220, 20);
        ctx.bezierCurveTo(-100, -70, 100, -70, 240, -10);
        ctx.bezierCurveTo(120, 70, -80, 60, -220, 20);
        ctx.closePath();

        if (type === "healthy") {
          ctx.fillStyle = "#2D6A4F";
          ctx.fill();
          // Midrib
          ctx.strokeStyle = "#52B788";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(-220, 20);
          ctx.lineTo(240, -10);
          ctx.stroke();
        } else if (type === "blight") {
          // Yellowed/blighted leaf
          const grad = ctx.createLinearGradient(-220, 0, 240, 0);
          grad.addColorStop(0, "#40916C");
          grad.addColorStop(0.5, "#DDA15E");
          grad.addColorStop(1, "#BC6C25");
          ctx.fillStyle = grad;
          ctx.fill();

          // Midrib
          ctx.strokeStyle = "#D4A373";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-220, 20);
          ctx.lineTo(240, -10);
          ctx.stroke();

          // Marginal wavy necrotic lesions
          ctx.fillStyle = "#7F4F24";
          for (let x = 20; x < 220; x += 30) {
            ctx.beginPath();
            ctx.ellipse(x, -35 + Math.sin(x) * 8, 22, 12, 0.2, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Rice Leaf Blast: green blade with spindle-shaped necrotic blast spots
          ctx.fillStyle = "#386641";
          ctx.fill();

          // Midrib
          ctx.strokeStyle = "#6A994E";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-220, 20);
          ctx.lineTo(240, -10);
          ctx.stroke();

          // Spindle lesions (gray center, brown halo)
          const spots = [
            { x: -90, y: -15, w: 28, h: 12 },
            { x: -30, y: 12, w: 34, h: 14 },
            { x: 40, y: -20, w: 42, h: 16 },
            { x: 110, y: 5, w: 30, h: 13 },
            { x: 160, y: -10, w: 22, h: 10 },
          ];

          spots.forEach((spot) => {
            // Brown border
            ctx.fillStyle = "#6B2D18";
            ctx.beginPath();
            ctx.ellipse(spot.x, spot.y, spot.w, spot.h, 0.1, 0, Math.PI * 2);
            ctx.fill();
            // Gray-ash center
            ctx.fillStyle = "#D6CCC2";
            ctx.beginPath();
            ctx.ellipse(spot.x, spot.y, spot.w * 0.55, spot.h * 0.55, 0.1, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        ctx.restore();

        // Overlay specimen badge
        ctx.fillStyle = "rgba(31, 61, 43, 0.85)";
        ctx.fillRect(16, 16, 260, 36);
        ctx.fillStyle = "#FAF7F0";
        ctx.font = "bold 13px 'Space Grotesk', sans-serif";
        ctx.fillText(`SPECIMEN: ${type.toUpperCase()}_LEAF_CANOPY`, 28, 39);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], `specimen_${type}_sample.jpg`, { type: "image/jpeg" });
              resolve(file);
            }
          },
          "image/jpeg",
          0.92
        );
      });
    },
    []
  );

  const handleFileSelection = (file: File) => {
    const lowerName = file.name.toLowerCase();
    const isSupportedCustomExt =
      lowerName.endsWith(".avif") || lowerName.endsWith(".heic") || lowerName.endsWith(".heif");

    if (!file.type.startsWith("image/") && !isSupportedCustomExt) {
      setErrorMessage("Please select a valid image file (JPEG, PNG, WEBP, AVIF, HEIC).");
      return;
    }
    setErrorMessage(null);
    setSelectedFile(file);
    setResult(null);
    setScanStage("idle");

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handlePresetSelect = async (type: "blast" | "blight" | "healthy") => {
    try {
      const file = await generateSampleLeafBlob(type);
      handleFileSelection(file);
    } catch {
      setErrorMessage("Could not load sample specimen.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const executeAnalysis = async () => {
    if (!selectedFile) return;

    setScanStage("uploading");
    setErrorMessage(null);

    // Multi-phase UI status animation
    setTimeout(() => {
      setScanStage((prev) => (prev === "uploading" ? "segmenting" : prev));
    }, 450);

    setTimeout(() => {
      setScanStage((prev) => (prev === "segmenting" ? "analyzing" : prev));
    }, 950);

    const formData = new FormData();
    formData.append("file", selectedFile, selectedFile.name);
    if (effectiveCrop && effectiveCrop.trim()) {
      formData.append("expected_crop", effectiveCrop.trim());
    }

    try {
      const response = await fetch("http://localhost:8000/api/disease-detection", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server responded with HTTP ${response.status}`);
      }

      const data: DiseaseDetectionResult = await response.json();
      setResult(data);
      setScanStage("completed");

      if (onDiseaseDetected) {
        onDiseaseDetected(data, previewUrl || undefined);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to analyze crop foliage image.";
      setErrorMessage(msg);
      setScanStage("error");
    }
  };

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setScanStage("idle");
    setErrorMessage(null);
  };

  // Severity badge color configuration
  const getSeverityBadge = (severity: "Mild" | "Moderate" | "Severe" | "Critical") => {
    switch (severity) {
      case "Mild":
        return {
          container: "bg-emerald-100 text-emerald-800 border-emerald-300",
          dot: "bg-emerald-600",
          meter: "bg-emerald-600",
          label: "Mild Severity",
        };
      case "Moderate":
        return {
          container: "bg-amber-100 text-amber-900 border-amber-300",
          dot: "bg-amber-600",
          meter: "bg-amber-500",
          label: "Moderate Severity",
        };
      case "Severe":
        return {
          container: "bg-orange-100 text-orange-900 border-orange-300",
          dot: "bg-orange-600",
          meter: "bg-orange-600",
          label: "Severe Infection",
        };
      case "Critical":
        return {
          container: "bg-rose-100 text-rose-900 border-rose-300",
          dot: "bg-rose-600",
          meter: "bg-rose-600",
          label: "Critical Collapse",
        };
    }
  };

  return (
    <div className="bg-warm-card border border-warm-border rounded-xl shadow-panel p-6 sm:p-8 space-y-6">
      {/* Component Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-border pb-5">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-forest-800 text-amber flex items-center justify-center shrink-0 shadow-sm ring-4 ring-warm-bg">
            <ScanEye className="w-5 h-5 text-amber" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-forest-100 border border-forest-300 rounded text-forest-800 text-[10px] font-mono font-semibold uppercase tracking-wider mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-forest-700" />
              Multimodal Vision Diagnostic
            </div>
            <h3 className="text-xl sm:text-2xl font-heading font-bold text-forest-900 tracking-tight">
              Visual Crop Disease Detection
            </h3>
            <p className="text-xs sm:text-sm text-warm-inkMuted mt-0.5">
              Instant foliar pathology analysis using plant pathologist vision models.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {effectiveCrop ? (
            <span className="px-2.5 py-1 bg-forest-100 dark:bg-forest-900 border border-forest-300 dark:border-forest-700 text-forest-900 dark:text-forest-100 rounded-md font-medium flex items-center gap-1.5 shadow-subtle">
              <span className="text-soil-500 dark:text-soil-300 text-[10px]">Crop Context:</span>
              <strong className="text-forest-800 dark:text-amber">{effectiveCrop}</strong>
              <button
                type="button"
                onClick={() => setCropOverride(null)}
                title="Remove crop context to diagnose purely on visual symptoms (skips crop-symptom consistency check)"
                className="ml-1 px-1.5 py-0.5 rounded bg-forest-200/70 hover:bg-rose-100 text-forest-900 hover:text-rose-700 text-[10px] font-sans font-medium transition-colors"
              >
                Clear (Pure Visual)
              </button>
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-warm-surface dark:bg-forest-900/50 border border-warm-borderStrong dark:border-forest-700 text-soil dark:text-soil-300 rounded-md font-medium flex items-center gap-1.5 shadow-subtle">
              <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
              <span>Pure Visual Mode (Crop Auto-Detect)</span>
              {expectedCrop && (
                <button
                  type="button"
                  onClick={() => setCropOverride(undefined)}
                  title={`Restore crop context from voice intake: ${expectedCrop}`}
                  className="ml-1 px-1.5 py-0.5 rounded bg-warm-card hover:bg-forest-100 text-soil-700 hover:text-forest-900 text-[10px] font-sans font-medium transition-colors border border-warm-border"
                >
                  Use Voice Crop ({expectedCrop})
                </button>
              )}
            </span>
          )}
          <span className="px-2.5 py-1 bg-warm-surface border border-warm-borderStrong text-forest-900 rounded-md font-medium">
            AI-Powered Diagnostics
          </span>
        </div>
      </div>

      {/* Main Diagnostic Workspace */}
      {!result ? (
        <div className="space-y-6">
          {/* Upload Dropzone & Camera Controls */}
          {!previewUrl ? (
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? "border-amber bg-amber-50/60 scale-[0.99]"
                    : "border-warm-borderStrong hover:border-forest-700 bg-warm-surface/70 hover:bg-warm-surface"
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-amber border border-forest-300 dark:border-forest-700 flex items-center justify-center transition-transform group-hover:scale-105">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-heading font-bold text-base text-forest-900 dark:text-forest-100">
                    Drag and drop crop leaf image here
                  </p>
                  <p className="text-xs text-warm-inkMuted dark:text-forest-300/80 mt-1">
                    Or click to browse from device • JPEG, PNG, WEBP, AVIF, HEIC up to 15MB
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cameraInputRef.current?.click();
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-warm-card dark:bg-forest-900 border border-warm-borderStrong dark:border-forest-700 hover:border-forest-700 hover:bg-warm-surface dark:hover:bg-forest-800 text-forest-900 dark:text-forest-100 text-xs font-semibold rounded-lg shadow-subtle transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
                  >
                    <Camera className="w-4 h-4 text-soil dark:text-soil-300" />
                    <span>Camera Capture (Mobile)</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 dark:hover:bg-forest-600 text-forest-50 text-xs font-semibold rounded-lg shadow-subtle transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
                  >
                    <ImageIcon className="w-4 h-4 text-amber" />
                    <span>Browse Image File</span>
                  </button>
                </div>
              </div>

              {/* Hidden native inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.heic,.heif,.avif"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelection(e.target.files[0]);
                  }
                }}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*,.heic,.heif,.avif"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelection(e.target.files[0]);
                  }
                }}
              />

              {/* Instant Sample Presets for Testing */}
              <div className="p-4 bg-warm-surface dark:bg-forest-900/40 border border-warm-border dark:border-forest-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-bold text-forest-900 dark:text-forest-100 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Instant Sample Specimens (Preloaded Benchmarks):</span>
                  </span>
                  <span className="text-[10px] font-mono text-soil-500 dark:text-soil-300">1-Click Test</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handlePresetSelect("blast")}
                    className="p-3 text-left bg-warm-card dark:bg-forest-950/60 hover:bg-warm-cardAlt dark:hover:bg-forest-900 border border-warm-borderStrong dark:border-forest-800 hover:border-amber dark:hover:border-amber-500/80 rounded-lg transition-all text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
                  >
                    <div className="font-heading font-bold text-forest-900 dark:text-forest-100">Rice Leaf Blast</div>
                    <div className="text-[10px] text-warm-inkMuted dark:text-forest-300/80 mt-0.5">
                      Spindle lesions with ashy centers
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePresetSelect("blight")}
                    className="p-3 text-left bg-warm-card dark:bg-forest-950/60 hover:bg-warm-cardAlt dark:hover:bg-forest-900 border border-warm-borderStrong dark:border-forest-800 hover:border-amber dark:hover:border-amber-500/80 rounded-lg transition-all text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
                  >
                    <div className="font-heading font-bold text-forest-900 dark:text-forest-100">Bacterial Leaf Blight</div>
                    <div className="text-[10px] text-warm-inkMuted dark:text-forest-300/80 mt-0.5">
                      Marginal wavy chlorotic stripes
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePresetSelect("healthy")}
                    className="p-3 text-left bg-warm-card dark:bg-forest-950/60 hover:bg-warm-cardAlt dark:hover:bg-forest-900 border border-warm-borderStrong dark:border-forest-800 hover:border-forest-600 dark:hover:border-forest-400 rounded-lg transition-all text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
                  >
                    <div className="font-heading font-bold text-forest-900 dark:text-forest-100">Healthy Rice Canopy</div>
                    <div className="text-[10px] text-warm-inkMuted dark:text-forest-300/80 mt-0.5">
                      Normal leaf turgor & greening
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Selected Image Preview & Scanner State */
            <div className="space-y-5">
              <div className="relative rounded-xl overflow-hidden border-2 border-warm-borderStrong bg-warm-surface shadow-subtle max-h-[380px] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Crop foliage specimen preview"
                  className="w-full h-auto max-h-[380px] object-contain rounded-lg"
                />

                {/* Laser scanline overlay when analyzing */}
                {(scanStage === "uploading" || scanStage === "segmenting" || scanStage === "analyzing") && (
                  <div className="absolute inset-0 bg-forest-950/40 backdrop-blur-[1px] flex flex-col items-center justify-center p-6 text-forest-50">
                    {/* Animated scanning radar line */}
                    <div className="absolute inset-x-0 h-1 bg-amber shadow-amberGlow animate-pulse top-1/2 -translate-y-1/2" />
                    
                    <div className="relative z-10 bg-forest-900/90 border border-forest-700 px-6 py-4 rounded-xl text-center space-y-2 shadow-elevated max-w-sm">
                      <div className="flex items-center justify-center gap-2 text-amber font-heading font-bold text-sm">
                        <Cpu className="w-4 h-4 animate-spin" />
                        <span>Pathologist Vision Active</span>
                      </div>
                      <p className="text-xs text-forest-200 font-mono">
                        {scanStage === "uploading" && "Transmitting foliar tensors to API..."}
                        {scanStage === "segmenting" && "Segmenting foliar lamina & lesion margins..."}
                        {scanStage === "analyzing" && "Running plant pathology inference..."}
                      </p>
                      <div className="w-full bg-forest-950 h-1.5 rounded-full overflow-hidden mt-2">
                        <div className="bg-amber h-full rounded-full transition-all duration-500 w-3/4 animate-pulse" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-warm-surface border border-warm-border rounded-xl">
                <div className="flex flex-wrap items-center gap-3 text-xs text-warm-ink font-mono">
                  <div className="flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-forest-700" />
                    <span className="font-semibold">{selectedFile?.name}</span>
                    <span className="text-soil-500">
                      ({selectedFile ? (selectedFile.size / 1024).toFixed(1) : 0} KB)
                    </span>
                  </div>
                  <span className="text-warm-borderStrong hidden sm:inline">•</span>
                  {effectiveCrop ? (
                    <span className="text-[11px] text-soil-700 dark:text-soil-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span>Context: <strong className="text-forest-900 dark:text-amber">{effectiveCrop}</strong></span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-soil-700 dark:text-soil-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber animate-pulse shrink-0" />
                      <span>Pure Visual Mode (Visual lesions only • consistency check skipped)</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={scanStage === "uploading" || scanStage === "segmenting" || scanStage === "analyzing"}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-warm-card border border-warm-borderStrong hover:bg-warm-surface text-forest-900 text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-soil" />
                    <span>Change Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={executeAnalysis}
                    disabled={scanStage === "uploading" || scanStage === "segmenting" || scanStage === "analyzing"}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-forest-800 hover:bg-forest-900 text-forest-50 text-xs font-bold font-heading rounded-lg shadow-subtle hover:shadow-panel transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-amber" />
                    <span>Run Pathology Diagnostic</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-3 text-xs text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Diagnostic Request Failed</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Result Card Presentation */
        <div className="space-y-6 animate-in fade-in duration-300">
          {(() => {
            const badge = getSeverityBadge(result.severity_class);
            return (
              <div className="space-y-5">
                {/* Result Top Banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-forest-900 text-forest-50 rounded-xl border border-forest-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-forest-800 border border-forest-700 flex items-center justify-center text-amber">
                      <CheckCircle2 className="w-5 h-5 text-amber" />
                    </div>
                    <div>
                      <div className="text-xs font-heading font-bold text-forest-50">
                        Foliar Pathology Evaluation Complete
                      </div>
                      <div className="text-[11px] font-mono text-forest-200">
                        Latency: {result.processing_time_ms}ms • Pipeline: {result.source}
                      </div>
                    </div>
                  </div>

                  {/* Color-Coded Severity Badge */}
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border font-heading font-bold text-xs ${badge.container}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                    <span>{result.severity_class} Severity ({result.severity_percentage.toFixed(1)}%)</span>
                  </div>
                </div>

                {/* Main Pathology Diagnosis Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Image Thumbnail with Diagnosis */}
                  <div className="lg:col-span-5 space-y-4">
                    {previewUrl && (
                      <div className="rounded-xl overflow-hidden border border-warm-borderStrong bg-warm-surface shadow-subtle">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewUrl}
                          alt="Diagnosed specimen"
                          className="w-full h-48 sm:h-56 object-cover"
                        />
                        <div className="p-3 bg-warm-card border-t border-warm-border flex items-center justify-between text-xs font-mono text-soil">
                          <span>Specimen Analyzed</span>
                          <span className="font-semibold text-forest-900">100% In-Focus</span>
                        </div>
                      </div>
                    )}

                    {/* Damage Severity Gauge */}
                    <div className="p-4 bg-warm-bg border border-warm-border rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-forest-900">Estimated Foliar Damage</span>
                        <strong className="font-mono text-sm text-forest-900">
                          {result.severity_percentage.toFixed(1)}%
                        </strong>
                      </div>
                      <div className="w-full bg-warm-borderStrong h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${badge.meter}`}
                          style={{ width: `${Math.min(100, Math.max(2, result.severity_percentage))}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-soil-500 pt-1">
                        <span>Mild (0-15%)</span>
                        <span>Moderate (16-40%)</span>
                        <span>Severe (41-75%)</span>
                        <span>Critical (&gt;75%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Structured Pathology Findings */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Primary Disease Identified */}
                    <div className="p-5 bg-warm-card border border-warm-border rounded-xl shadow-subtle space-y-3">
                      <div>
                        <span className="text-[11px] font-mono font-semibold text-soil-600 uppercase tracking-wider block">
                          Identified Pathogen / Clinical Status
                        </span>
                        <h4 className="text-xl sm:text-2xl font-heading font-bold text-forest-900 leading-tight mt-0.5">
                          {result.disease_name}
                        </h4>
                      </div>

                      {result.disease_name.toLowerCase().includes("uncertain") && (
                        <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-2 text-xs text-amber-950">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <strong>Conservative Safeguard:</strong> Image resolution, lighting, or symptoms are insufficient for definitive diagnosis. Manual field inspection recommended before applying chemical treatments.
                          </div>
                        </div>
                      )}

                      <div className="space-y-1 text-xs">
                        <span className="font-semibold text-forest-900 font-mono text-[11px]">Diagnostic Confidence:</span>
                        <p className="text-warm-ink leading-relaxed">
                          {result.confidence_note}
                        </p>
                      </div>

                      {result.diagnostic_reasoning && (
                        <div className="pt-2 border-t border-warm-border space-y-1 text-xs">
                          <span className="font-semibold text-forest-900 font-mono text-[11px] flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber" />
                            Diagnostic Reasoning (Visible Symptoms):
                          </span>
                          <p className="text-warm-ink leading-relaxed">
                            {result.diagnostic_reasoning}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Affected Region Description */}
                    <div className="p-4 bg-warm-surface border border-warm-border rounded-xl space-y-2">
                      <div className="text-xs font-heading font-bold text-forest-900 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-forest-700" />
                        <span>Affected Foliar Regions & Symptom Morphology</span>
                      </div>
                      <p className="text-xs text-warm-ink leading-relaxed pl-5">
                        {result.affected_area_description}
                      </p>
                    </div>

                    {/* Pathology Notice */}
                    <div className="p-4 bg-forest-50/60 border border-forest-200 rounded-xl flex items-start gap-3 text-xs text-forest-950">
                      <ShieldAlert className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <strong>Integrated Pest Management (IPM) Directive:</strong> Calibrated against BRRI/BARI diagnostic thresholds. Recommended fungicide or bactericide split should follow weather humidity forecast.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-warm-border">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-warm-card border border-warm-borderStrong hover:bg-warm-surface text-forest-900 text-xs font-semibold rounded-lg transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-soil" />
                    <span>Scan Another Leaf</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-forest-800 dark:text-forest-200 font-medium hidden sm:inline">
                      Diagnosis ready for treatment plan synthesis
                    </span>
                    <a
                      href="#diagnosis-report"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-forest-800 hover:bg-forest-900 text-forest-50 text-xs font-heading font-bold rounded-lg shadow-subtle transition-all"
                    >
                      <span>View Diagnosis Report</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
