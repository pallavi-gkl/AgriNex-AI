import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#16a34a",
          "dark-green": "#14532d",
          "ai-blue": "#2563eb",
          "sky-blue": "#38bdf8",
          golden: "#fbbf24",
          orange: "#f97316",
          "light-bg": "#f8fafc",
          "soft-green": "#ecfdf5",
          "soft-blue": "#eff6ff",
          "dark-section": "#0f172a",
        },
        emerald: {
          DEFAULT: "#16a34a",
          50:  "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#4ade80",
          500: "#16a34a",
          600: "#15803d",
          700: "#166534",
          800: "#14532d",
          900: "#052e16",
          glow: "rgba(22,163,74,0.2)",
        },
        sky: {
          DEFAULT: "#0ea5e9",
          50:  "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          glow: "rgba(14,165,233,0.2)",
        },
        indigo: {
          DEFAULT: "#8b5cf6",
          50:  "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          glow: "rgba(139,92,246,0.2)",
        },
        amber: {
          DEFAULT: "#f59e0b",
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          glow: "rgba(245,158,11,0.2)",
        },
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "scan-glow":   "scan-glow 2.5s ease-in-out infinite",
        "audio-pulse": "audio-pulse 2s cubic-bezier(0.16, 1, 0.3, 1) infinite",
        float:         "float-up 4s ease-in-out infinite",
        "neon-flicker":"neon-flicker 5s ease-in-out infinite",
        shimmer:       "shimmer 1.8s linear infinite",
        "spin-slow":   "spin-slow 8s linear infinite",
      },
      keyframes: {
        "scan-glow": {
          "0%":   { transform: "translateY(0px)" },
          "50%":  { transform: "translateY(220px)" },
          "100%": { transform: "translateY(0px)" },
        },
        "audio-pulse": {
          "0%":   { transform: "scale(1)",   opacity: "0.6" },
          "50%":  { transform: "scale(1.4)", opacity: "0" },
          "100%": { transform: "scale(1)",   opacity: "0.6" },
        },
        "float-up": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-8px)" },
        },
        "neon-flicker": {
          "0%, 100%": { opacity: "1" },
          "92%":       { opacity: "1" },
          "93%":       { opacity: "0.7" },
          "94%":       { opacity: "1" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
      },
      backdropBlur: {
        glass: "16px",
        xs:    "2px",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      spacing: {
        sidebar: "260px",
      },
      screens: {
        xs: "375px",
      },
    },
  },
  plugins: [],
};

export default config;
