"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, AlertTriangle, Keyboard, Volume2 } from "lucide-react";
import { AudioVisualizer } from "./audio-visualizer";
import { StructuredResult, ExtractedQueryData } from "./structured-result";
import { ManualTextInput } from "./manual-text-input";
import { VoiceProcessingSkeleton } from "./dashboard-skeletons";
import { API_BASE_URL } from "@/lib/api-config";

type IntakeState = "idle" | "recording" | "processing" | "done";

export function VoiceIntakeCard({ onAdvisoryReady }: { onAdvisoryReady?: (data: ExtractedQueryData) => void }) {
  const [mode, setMode] = useState<"voice" | "manual">("voice");
  const [state, setState] = useState<IntakeState>("idle");
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Completed result state
  const [resultData, setResultData] = useState<{
    rawTranscript: string;
    extractedData: ExtractedQueryData;
    processingTimeMs: number;
    source: string;
  } | null>(null);

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const startRecording = async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];
    setDurationSeconds(0);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage("Audio recording is not supported in this browser. Please use the Manual Input option below.");
      setMode("manual");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : undefined,
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all audio tracks to release microphone hardware
        stream.getTracks().forEach((track) => track.stop());

        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }

        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });

        await uploadAudio(audioBlob);
      };

      mediaRecorder.start(250); // Slice data every 250ms
      setState("recording");

      // Start duration timer
      timerIntervalRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Microphone access denied";
      console.warn("Microphone access error:", msg);
      setErrorMessage("Microphone access unavailable or denied. Switched to manual query input mode.");
      setMode("manual");
      setState("idle");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      setState("processing");
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      mediaRecorderRef.current = null;
    }
    audioChunksRef.current = [];
    setDurationSeconds(0);
    setState("idle");
  };

  const uploadAudio = async (blob: Blob) => {
    setState("processing");
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("file", blob, "farmer_query.webm");
    formData.append("farmer_id", "demo-farmer-session");

    try {
      const response = await fetch(`${API_BASE_URL}/api/voice-intake`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setResultData({
        rawTranscript: data.raw_transcript,
        extractedData: data.extracted_data,
        processingTimeMs: data.processing_time_ms,
        source: data.source,
      });
      setState("done");
      if (onAdvisoryReady) {
        onAdvisoryReady(data.extracted_data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to process voice query";
      setErrorMessage(msg);
      setState("idle");
    }
  };

  const handleManualSuccess = (data: {
    rawTranscript: string;
    extractedData: ExtractedQueryData;
    processingTimeMs: number;
    source: string;
  }) => {
    setResultData(data);
    setState("done");
    if (onAdvisoryReady) {
      onAdvisoryReady(data.extractedData);
    }
  };

  const resetAll = () => {
    cancelRecording();
    setResultData(null);
    setErrorMessage(null);
    setState("idle");
  };

  return (
    <div className="bg-warm-card dark:bg-forest-950/60 border-2 border-warm-borderStrong dark:border-forest-800 rounded-2xl p-6 sm:p-8 shadow-panel relative overflow-hidden transition-colors duration-200">
      
      {/* Decorative top accent line in warm amber */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-forest-800 via-amber to-soil-600" />

      {/* Card Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-border dark:border-forest-800 pb-5 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded text-amber-900 dark:text-amber-300 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <Volume2 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>Voice-Guided Intake (কণ্ঠস্বর ইনটেক)</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-heading font-bold text-forest-900 dark:text-forest-100">
            Speak Your Crop Diagnostic Query
          </h3>
          <p className="text-xs sm:text-sm text-warm-inkMuted dark:text-forest-300/80 mt-1">
            Describe symptoms in colloquial Bangla or English. AI transcribes speech and extracts field parameters.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        {state !== "done" && (
          <div className="flex items-center bg-warm-surface dark:bg-forest-900/60 p-1 rounded-xl border border-warm-borderStrong dark:border-forest-700 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setMode("voice")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber ${
                mode === "voice"
                  ? "bg-forest-800 text-forest-50 dark:bg-forest-700 shadow-sm"
                  : "text-warm-inkMuted dark:text-forest-300 hover:text-forest-900 dark:hover:text-forest-100"
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice (কথা বলুন)</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("manual")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber ${
                mode === "manual"
                  ? "bg-forest-800 text-forest-50 dark:bg-forest-700 shadow-sm"
                  : "text-warm-inkMuted dark:text-forest-300 hover:text-forest-900 dark:hover:text-forest-100"
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Manual Text (টাইপ করুন)</span>
            </button>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-semibold">Query Processing Notice:</strong>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Dynamic View Area */}
      {state === "done" && resultData ? (
        <StructuredResult
          rawTranscript={resultData.rawTranscript}
          extractedData={resultData.extractedData}
          processingTimeMs={resultData.processingTimeMs}
          source={resultData.source}
          onReset={resetAll}
          onContinueToAdvisory={() => {
            const el = document.getElementById("diagnosis-report");
            if (el) {
              el.scrollIntoView({ behavior: "smooth" });
            }
          }}
        />
      ) : mode === "manual" ? (
        <ManualTextInput onSuccess={handleManualSuccess} />
      ) : (
        /* Voice Intake State Flow */
        <div className="space-y-6">
          
          {/* IDLE STATE */}
          {state === "idle" && (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
              <button
                type="button"
                onClick={startRecording}
                className="relative group flex items-center justify-center w-24 h-24 rounded-full bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 dark:hover:bg-forest-600 text-amber border-2 border-forest-700 dark:border-forest-500 shadow-panel hover:shadow-elevated transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber"
                aria-label="Start recording audio query in Bangla or English"
              >
                <div className="absolute inset-0 rounded-full border border-amber/30 group-hover:scale-110 transition-transform" />
                <Mic className="w-10 h-10 text-amber group-hover:text-amber-300 transition-colors" />
              </button>

              <div className="space-y-1.5 max-w-md">
                <span className="font-heading font-bold text-base sm:text-lg text-forest-900 dark:text-forest-100 block">
                  Tap Microphone to Begin Speaking (মাইক্রোফোনে চাপ দিন)
                </span>
                <p className="text-xs text-warm-inkMuted dark:text-forest-300/80 leading-relaxed">
                  Mention your crop name, approximate planting time, and what you see on the leaves or stems.
                </p>
              </div>

              {/* Spoken Query Guidance Hints */}
              <div className="p-3.5 bg-warm-surface dark:bg-forest-900/40 border border-warm-border dark:border-forest-800 rounded-xl text-xs text-soil dark:text-soil-300 max-w-lg text-left space-y-1">
                <span className="font-mono text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider block">
                  Example Spoken Query (নমুনা কথন):
                </span>
                <p className="italic text-forest-900 dark:text-forest-200 font-sans">
                  &ldquo;আমার আমন ধানের পাতায় বাদামী ছোপ ছোপ দাগ পড়েছে, চারা রোপণ করেছি ২০ দিন আগে, রাজশাহীর গোদাগাড়ী থেকে বলছি।&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* RECORDING STATE */}
          {state === "recording" && (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-6">
              <AudioVisualizer isRecording={true} durationSeconds={durationSeconds} />

              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={stopRecording}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-forest-800 hover:bg-forest-900 dark:bg-forest-700 dark:hover:bg-forest-600 text-forest-50 font-heading font-semibold text-sm rounded-xl border border-forest-700 dark:border-forest-500 shadow-panel transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
                >
                  <Square className="w-4 h-4 text-amber fill-amber" />
                  <span>Done Speaking • Process Query (রেকর্ড শেষ)</span>
                </button>

                <button
                  type="button"
                  onClick={cancelRecording}
                  className="w-full sm:w-auto px-4 py-3 text-xs text-soil dark:text-soil-300 hover:text-forest-900 dark:hover:text-forest-100 font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded-lg"
                >
                  Cancel (বাতিল)
                </button>
              </div>
            </div>
          )}

          {/* PROCESSING STATE: Beautiful Spoken Transcript & Entity Skeleton */}
          {state === "processing" && <VoiceProcessingSkeleton />}

        </div>
      )}

    </div>
  );
}
