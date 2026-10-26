import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
        },
        copper: {
          DEFAULT: "#D9A15B",
          hover: "#C6904A",
          light: "#E5B97C",
          dark: "#B57D38",
          500: "#D9A15B",
          600: "#C6904A",
          muted: "rgba(217, 161, 91, 0.15)",
        },
        "deep-teal": {
          DEFAULT: "#4E9B8F",
          hover: "#3F877C",
          light: "#6DB2A6",
          500: "#4E9B8F",
          muted: "rgba(78, 155, 143, 0.15)",
        },
        terracotta: {
          DEFAULT: "#C4695A",
          hover: "#B05748",
          light: "#D37F72",
          500: "#C4695A",
          muted: "rgba(196, 105, 90, 0.15)",
        },
        fintech: {
          base: "#0A0E12",
          surface: "#12181D",
          card: "#141C24",
          border: "#222E3A",
          subtle: "#1B242D",
          input: "#0D1217",
        },
        warm: {
          offwhite: "#EDE6D9",
          muted: "#8A949E",
          subdued: "#566573",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgb(15 23 42 / 0.06), 0 8px 24px rgb(15 23 42 / 0.04)",
        copper: "0 4px 20px -2px rgba(217, 161, 91, 0.25)",
        glow: "0 0 25px -5px rgba(217, 161, 91, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
