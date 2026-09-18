"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";

interface AudioVisualizerProps {
  isRecording: boolean;
  durationSeconds: number;
}

export function AudioVisualizer({ isRecording, durationSeconds }: AudioVisualizerProps) {
  // Format seconds as MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  // Waveform bar heights animation variants
  const barVariants: Variants = {
    initial: { height: 8 },
    animate: (i: number) => ({
      height: isRecording ? [10, 24 + (i % 5) * 8, 12, 36 - (i % 4) * 6, 8] : 8,
      transition: {
        duration: 0.6 + (i % 3) * 0.15,
        repeat: Infinity,
        ease: "easeInOut" as const,
        delay: (i % 8) * 0.08,
      },
    }),
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-5 my-4">
      {/* Concentric Pulsing Rings around Microphone Container */}
      <div className="relative flex items-center justify-center w-28 h-28">
        {isRecording && (
          <>
            <motion.div
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: [1, 1.4, 1.8], opacity: [0.7, 0.3, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
              className="absolute inset-0 rounded-full bg-amber/25 pointer-events-none"
            />
            <motion.div
              initial={{ scale: 1, opacity: 0.9 }}
              animate={{ scale: [1, 1.25, 1.5], opacity: [0.8, 0.4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
              className="absolute inset-0 rounded-full bg-forest-700/20 pointer-events-none"
            />
          </>
        )}

        <div className="relative z-10 w-20 h-20 rounded-full bg-forest-900 border-2 border-amber flex items-center justify-center shadow-panel">
          <div className="w-4 h-4 rounded-full bg-rose-500 animate-pulse" />
        </div>
      </div>

      {/* Recording Duration Timer */}
      <div className="flex items-center gap-2 font-mono text-sm">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
        <span className="font-bold text-forest-900 text-base">{formatTime(durationSeconds)}</span>
        <span className="text-soil text-xs uppercase tracking-wider">Listening in Bangla / English</span>
      </div>

      {/* Dynamic Audio Frequency Waveform Simulation */}
      <div className="flex items-center gap-1.5 h-10 px-6 py-2 bg-warm-surface border border-warm-borderStrong rounded-full">
        {[...Array(16)].map((_, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={barVariants}
            initial="initial"
            animate="animate"
            className="w-1 rounded-full bg-forest-800"
          />
        ))}
      </div>
    </div>
  );
}
