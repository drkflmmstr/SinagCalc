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
        sun:   { DEFAULT: "#F5A623", light: "#FFF6E0", glow: "#FFCC5C" },
        grove: { DEFAULT: "#1E6B45", mid: "#2D8B5A",   light: "#E9F5EF" },
        sky:   { DEFAULT: "#0F4C81", light: "#E8F1FA" },
        soil:  "#2C1A0E",
        cream: "#FEFAF3",
      },
      fontFamily: {
        serif: ["DM Serif Display", "Georgia", "serif"],
        sans:  ["DM Sans", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "fade-up":    "fadeUp 0.4s ease forwards",
      },
      keyframes: {
        pulseGlow: {
          "0%,100%": { boxShadow: "0 0 0 14px rgba(255,204,92,0.18), 0 0 0 28px rgba(255,204,92,0.09)" },
          "50%":     { boxShadow: "0 0 0 20px rgba(255,204,92,0.26), 0 0 0 38px rgba(255,204,92,0.13)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
