"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("kb-theme") as "light" | "dark" | null;
    if (stored) {
      setTheme(stored);
      if (stored === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("kb-theme", nextTheme);

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-lg border border-warm-borderStrong bg-warm-surface opacity-0 ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-lg bg-warm-card dark:bg-forest-900 border border-warm-borderStrong dark:border-forest-700 text-warm-ink dark:text-forest-100 hover:bg-warm-surface dark:hover:bg-forest-800 transition-all duration-200 shadow-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-amber ${className}`}
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4 text-soil-600 hover:text-forest-900 dark:text-soil-300 dark:hover:text-forest-100 transition-transform hover:-rotate-12 duration-200" />
      ) : (
        <Sun className="w-4 h-4 text-amber hover:text-amber-300 transition-transform hover:rotate-45 duration-200" />
      )}
    </button>
  );
}
