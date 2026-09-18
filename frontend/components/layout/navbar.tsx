"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X, Compass, Activity, Layers, ShieldAlert } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#hero", label: "Overview", icon: Compass },
    { href: "#problem", label: "Agronomic Gap", icon: ShieldAlert },
    { href: "#workflow", label: "5-Step Engine", icon: Layers },
    { href: "#telemetry", label: "Field Telemetry", icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-warm-bg/90 dark:bg-forest-950/90 backdrop-blur-md border-b border-warm-border dark:border-forest-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Mark & Identity */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative flex items-center justify-center w-11 h-11 bg-forest-800 border border-forest-600 rounded-lg shadow-sm transition-transform duration-200 group-hover:scale-105">
              <span className="font-heading font-bold text-amber text-lg tracking-wider">
                KB
              </span>
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-amber rounded-full ring-2 ring-warm-bg dark:ring-forest-950" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-xl text-forest-900 dark:text-forest-100 tracking-tight leading-tight">
                Krishi Bondhu
              </span>
              <span className="text-[11px] font-medium text-soil dark:text-soil-300 tracking-wide uppercase">
                Agro-Advisory Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-warm-inkMuted dark:text-forest-300 hover:text-forest-800 dark:hover:text-forest-100 hover:bg-warm-surface/80 dark:hover:bg-forest-900/60 rounded-md transition-colors"
                >
                  <Icon className="w-4 h-4 text-soil/70 dark:text-soil-300" />
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Action CTA & Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/passport"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-soil dark:text-soil-300 hover:text-forest-900 dark:hover:text-forest-100 bg-warm-surface dark:bg-forest-900 hover:bg-warm-border dark:hover:bg-forest-800 rounded-lg border border-warm-borderStrong dark:border-forest-700 transition-all"
            >
              <span>Field Health Card</span>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest-800 hover:bg-forest-900 text-forest-50 text-sm font-semibold rounded-lg border border-forest-700 shadow-sm hover:shadow-panel transition-all duration-200 group"
            >
              <span>Enter Dashboard</span>
              <ArrowUpRight className="w-4 h-4 text-amber transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* Mobile Right Controls: Theme Toggle & Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 text-warm-inkMuted dark:text-forest-300 hover:text-forest-800 dark:hover:text-forest-100 hover:bg-warm-surface dark:hover:bg-forest-900 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-warm-border bg-warm-bg dark:bg-forest-950 px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-base font-medium text-warm-ink dark:text-forest-200 hover:text-forest-800 dark:hover:text-forest-50 hover:bg-warm-surface dark:hover:bg-forest-900 rounded-md"
                >
                  <Icon className="w-5 h-5 text-soil dark:text-soil-300" />
                  {link.label}
                </a>
              );
            })}
          </div>
          <div className="pt-2 space-y-2">
            <Link
              href="/passport"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-warm-surface dark:bg-forest-900 border border-warm-borderStrong dark:border-forest-700 text-forest-900 dark:text-forest-100 font-semibold rounded-lg shadow-sm text-sm"
            >
              <span>Field Health Card (Passport)</span>
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-forest-800 text-forest-50 font-semibold rounded-lg shadow-sm"
            >
              <span>Enter Dashboard</span>
              <ArrowUpRight className="w-4 h-4 text-amber" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
