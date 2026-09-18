"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  FileText,
  Copy,
  Check,
  Headphones,
  AlertCircle,
} from "lucide-react";

interface AudioAdvisoryPlayerProps {
  audioBase64?: string;
  audioUrl?: string;
  audioFormat?: string;
  audioError?: string;
  bengaliScript?: string;
  cropName?: string;
  className?: string;
}

export function AudioAdvisoryPlayer({
  audioBase64,
  audioUrl,
  audioFormat = "audio/wav",
  audioError,
  bengaliScript,
  cropName = "Crop",
  className = "",
}: AudioAdvisoryPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [showScript, setShowScript] = useState(false);
  const [copied, setCopied] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const effectiveError = audioError || playbackError;

  // Derive audio source: either audioUrl or data URL from base64
  const audioSrc = audioUrl || (audioBase64 ? `data:${audioFormat};base64,${audioBase64}` : null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (!isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const onError = () => {
      setPlaybackError("অডিও ফাইল প্লে করতে ত্রুটি হয়েছে (Unable to decode or play audio).");
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [audioSrc]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setPlaybackError(null);
        })
        .catch((err) => {
          console.warn("[AudioAdvisoryPlayer] Playback blocked or failed:", err);
          setIsPlaying(false);
          setPlaybackError("ব্রাউজার অডিও চালু করতে বাধা দিয়েছে। অনুগ্রহ করে ক্লিক করে অনুমতি দিন।");
        });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const restartAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
    audio.play().then(() => setIsPlaying(true));
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const togglePlaybackRate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const rates = [1.0, 1.25, 1.5];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    audio.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const copyTranscript = () => {
    if (!bengaliScript) return;
    navigator.clipboard.writeText(bengaliScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`bg-warm-card border border-warm-border rounded-xl p-5 shadow-panel space-y-4 ${className}`}
    >
      {/* Hidden native audio element */}
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="metadata"
          className="hidden"
        />
      )}

      {/* Player Header */}
      <div className="flex items-center justify-between border-b border-warm-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-forest-800 text-amber flex items-center justify-center shadow-subtle">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-forest-900 text-sm">
                বাংলা অডিও পরামর্শ (Bengali Spoken Advisory)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-forest-100 text-forest-800 border border-forest-300 font-semibold">
                কৃষি অডিও পরামর্শ (AI Spoken Advisory)
              </span>
            </div>
            <p className="text-xs text-warm-inkMuted">
              {cropName} • গ্রামীণ ভাষায় তাত্ক্ষণিক কৃষি ব্রিফিং
            </p>
          </div>
        </div>

        {bengaliScript && (
          <button
            type="button"
            onClick={() => setShowScript(!showScript)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-soil hover:text-forest-900 bg-warm-surface hover:bg-warm-border rounded-md border border-warm-borderStrong transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-amber" />
            <span>{showScript ? "লুকান (Hide)" : "লিখিত রূপ (Transcript)"}</span>
          </button>
        )}
      </div>

      {/* Prominent Error Notice if TTS Failed or Audio Blocked */}
      {effectiveError && (
        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-amber-50/90 border border-amber-300/80 text-amber-950 text-xs shadow-sm">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <p className="font-semibold text-amber-900">
              অডিও বুলেটিন সাময়িকভাবে অনুপলব্ধ (Audio Advisory Notice)
            </p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              {effectiveError}
            </p>
            {bengaliScript && (
              <p className="text-[11px] text-forest-800 font-medium">
                পরামর্শটি পড়তে উপরের <strong>&quot;লিখিত রূপ (Transcript)&quot;</strong> বাটনে ক্লিক করে পুরো বার্তাটি দেখুন।
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Controls & Waveform Simulation */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Big Circular Play/Pause Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={togglePlay}
            disabled={!audioSrc}
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
            className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
              isPlaying
                ? "bg-amber-500 text-amber-950 ring-4 ring-amber-200"
                : "bg-forest-800 hover:bg-forest-900 text-warm-bg ring-2 ring-forest-700"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current translate-x-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={restartAudio}
            disabled={!audioSrc}
            title="Restart playback"
            className="w-8 h-8 rounded-full bg-warm-surface border border-warm-border hover:bg-warm-card text-soil flex items-center justify-center transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrubber & Waveform Bars */}
        <div className="flex-1 space-y-2">
          {/* Animated Waveform Simulation */}
          <div className="flex items-center gap-1 h-7 px-2 bg-warm-surface rounded-lg border border-warm-border overflow-hidden">
            {Array.from({ length: 32 }).map((_, i) => {
              // Create dynamic wave heights
              const baseHeight = ((i * 7) % 18) + 6;
              const active = (i / 32) * 100 <= progressPercent;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-150 ${
                    active ? "bg-amber-500" : "bg-warm-borderStrong"
                  } ${isPlaying ? "animate-pulse" : ""}`}
                  style={{
                    height: isPlaying ? `${Math.max(4, (baseHeight + (i % 3) * 3))}px` : `${baseHeight * 0.7}px`,
                    animationDelay: `${(i % 5) * 0.1}s`,
                  }}
                />
              );
            })}
          </div>

          {/* Interactive Seek Bar */}
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              disabled={!audioSrc}
              className="w-full h-1.5 bg-warm-border rounded-lg appearance-none cursor-pointer accent-forest-800 disabled:opacity-50"
            />
            <div className="flex items-center gap-1 font-mono text-[11px] text-warm-inkMuted shrink-0">
              <span className="font-semibold text-forest-900">{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Secondary Controls (Mute & Speed) */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={togglePlaybackRate}
            disabled={!audioSrc}
            className="px-2 py-1 bg-warm-surface hover:bg-warm-border text-forest-900 text-xs font-mono font-semibold rounded border border-warm-borderStrong transition-all"
            title="Toggle playback speed"
          >
            {playbackRate}x
          </button>

          <button
            type="button"
            onClick={toggleMute}
            disabled={!audioSrc}
            className="w-8 h-8 rounded bg-warm-surface hover:bg-warm-border text-soil hover:text-forest-900 flex items-center justify-center border border-warm-borderStrong transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Bengali Transcript Panel */}
      {showScript && bengaliScript && (
        <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-warm-surface border border-warm-borderStrong rounded-xl p-4 space-y-2 relative">
            <div className="flex items-center justify-between text-xs text-soil font-semibold border-b border-warm-border pb-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber" />
                <span>কথোপকথনমূলক অডিও বার্তা (Conversational Audio Script)</span>
              </span>
              <button
                type="button"
                onClick={copyTranscript}
                className="inline-flex items-center gap-1 text-[11px] text-forest-800 hover:text-forest-950 font-sans"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>কপি করা হয়েছে</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>কপি করুন</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs sm:text-sm text-warm-ink leading-relaxed font-sans pt-1">
              {bengaliScript}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
