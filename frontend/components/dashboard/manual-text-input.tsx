"use client";

import React, { useState } from "react";
import { Send, Keyboard, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { ExtractedQueryData } from "./structured-result";
import { API_BASE_URL } from "@/lib/api-config";

interface ManualTextInputProps {
  onSuccess: (data: {
    rawTranscript: string;
    extractedData: ExtractedQueryData;
    processingTimeMs: number;
    source: string;
  }) => void;
}

export function ManualTextInput({ onSuccess }: ManualTextInputProps) {
  const [queryText, setQueryText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sampleQueries = [
    {
      label: "ধানের পাতায় বাদামী দাগ (Aman Rice Blast)",
      text: "আমার আমন ধানের পাতায় বাদামী ছোপ ছোপ দাগ পড়েছে এবং ডগা শুকিয়ে যাচ্ছে। চারা রোপণ করেছি বিশ দিন আগে, রাজশাহীর গোদাগাড়ী থেকে বলছি।",
    },
    {
      label: "আলুর পাতায় মোড়ক রোগ (Potato Blight)",
      text: "আলু গাছের নিচের দিকের পাতায় কালো জলছাপ দাগ এবং পাতা কুঁকড়ে যাচ্ছে। চার সপ্তাহ আগে রোপণ করেছি রংপুর সদরে।",
    },
    {
      label: "Boro Rice Nitrogen Deficiency (English)",
      text: "Boro rice tillers look stunted with pale yellow lower leaves. Transplanted 25 days ago in Jessore district.",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim() || queryText.trim().length < 5) {
      setErrorMessage("Please enter at least a brief description of your crop and symptoms.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/text-intake`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query_text: queryText }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error (HTTP ${response.status})`);
      }

      const result = await response.json();
      onSuccess({
        rawTranscript: result.raw_transcript,
        extractedData: result.extracted_data,
        processingTimeMs: result.processing_time_ms,
        source: result.source,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to process query";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-heading font-bold text-forest-900 flex items-center gap-1.5">
            <Keyboard className="w-3.5 h-3.5 text-soil" />
            <span>Type or Paste Farmer Query (বাংলায় বা ইংরেজিতে লিখুন)</span>
          </label>
          <span className="text-[11px] font-mono text-soil-500">
            {queryText.length} characters
          </span>
        </div>

        <textarea
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          placeholder="যেমন: আমার আমন ধানের পাতায় বাদামী দাগ পড়েছে, চারা লাগিয়েছি ২০ দিন আগে, রাজশাহীর গোদাগাড়ীতে..."
          rows={4}
          disabled={isLoading}
          className="w-full p-3.5 bg-warm-surface border border-warm-borderStrong rounded-xl text-warm-ink text-sm font-sans focus:outline-none focus:ring-2 focus:ring-amber focus:border-transparent transition-all placeholder:text-warm-inkSubtle/60 leading-relaxed"
        />
      </div>

      {/* Preset Quick Test Chips */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-mono text-soil-700 font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber" />
          <span>Quick Test Presets (ক্লিক করে পরীক্ষা করুন):</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleQueries.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => setQueryText(sample.text)}
              disabled={isLoading}
              className="text-[11px] px-2.5 py-1 bg-warm-card hover:bg-warm-surface text-forest-800 border border-warm-borderStrong rounded-md transition-colors text-left font-sans"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !queryText.trim()}
        className="w-full py-3.5 bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-forest-50 font-heading font-semibold text-sm rounded-xl border border-forest-700 shadow-panel transition-all flex items-center justify-center gap-2 group"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 text-amber animate-spin" />
            <span>Analyzing Agronomic Context...</span>
          </>
        ) : (
          <>
            <span>Extract Structured Parameters</span>
            <Send className="w-4 h-4 text-amber transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </form>
  );
}
