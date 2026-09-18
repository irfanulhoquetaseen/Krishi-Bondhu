import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Deep forest green palette (Primary)
        forest: {
          50: "#F2F7F4",
          100: "#E1ECE5",
          200: "#C3D9CB",
          300: "#9BBBAB",
          400: "#6F9B82",
          500: "#4B7D61",
          600: "#35644C",
          700: "#284E3B",
          800: "#1F3D2B", // Core primary
          900: "#172F22",
          950: "#0E1D15",
          DEFAULT: "#1F3D2B",
        },
        // Warm amber palette (Accent)
        amber: {
          50: "#FDF9F0",
          100: "#FAF0D8",
          200: "#F3DFB0",
          300: "#EBCA82",
          400: "#E2B455",
          500: "#D9A441", // Core accent
          600: "#BF882C",
          700: "#976822",
          800: "#77511F",
          900: "#61431E",
          DEFAULT: "#D9A441",
        },
        // Soil brown palette (Secondary)
        soil: {
          50: "#F9F6F3",
          100: "#EFE9E2",
          200: "#DFD3C6",
          300: "#C8B6A2",
          400: "#94785E",
          500: "#775D45",
          600: "#5C4632", // Core secondary
          700: "#4A3828",
          800: "#3B2C20",
          900: "#2E2219",
          DEFAULT: "#5C4632",
        },
        // Warm off-white & editorial surfaces (dynamic light/dark via CSS variables)
        warm: {
          bg: "var(--bg-warm, #FAF7F0)",
          surface: "var(--surface-warm, #F4EFE6)",
          card: "var(--card-warm, #FBF9F4)",
          cardAlt: "var(--card-alt-warm, #F2EDE2)",
          border: "var(--border-warm, #E5DED0)",
          borderStrong: "var(--border-strong, #D6CCBC)",
          ink: "var(--ink-primary, #142018)",
          inkMuted: "var(--ink-muted, #4C5951)",
          inkSubtle: "var(--ink-subtle, #738077)",
        },
      },
      fontFamily: {
        heading: ["var(--font-space-grotesk)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight: "-0.025em",
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(31, 61, 43, 0.04)",
        panel: "0 4px 20px -2px rgba(31, 61, 43, 0.06), 0 1px 3px rgba(31, 61, 43, 0.03)",
        elevated: "0 12px 32px -4px rgba(31, 61, 43, 0.12), 0 2px 6px rgba(31, 61, 43, 0.04)",
        amberGlow: "0 0 25px -3px rgba(217, 164, 65, 0.3)",
      },
      keyframes: {
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
