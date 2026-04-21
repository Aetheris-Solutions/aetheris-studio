import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0a0a0a",
          deep: "#050505",
          card: "#0e0e0e",
          paper: "#fafaf9",
          fog: "#a8a29e",
          mute: "#78716c",
          line: "#1f1f1f",
          gold: "#d4b896",
          edge: "#2a2724",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        widest2: "0.32em",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "drift-slow": {
          "0%": { transform: "translate3d(0,0,0) scale(1.02)" },
          "50%": { transform: "translate3d(-1.5%, 0.5%, 0) scale(1.04)" },
          "100%": { transform: "translate3d(0,0,0) scale(1.02)" },
        },
        "marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        glow: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "0.85" },
        },
        "blink": {
          "0%, 50%": { opacity: "1" },
          "51%, 100%": { opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 1.2s ease-out both",
        "drift-slow": "drift-slow 28s ease-in-out infinite",
        "marquee": "marquee 60s linear infinite",
        glow: "glow 6s ease-in-out infinite",
        "blink": "blink 1.1s step-end infinite",
      },
    },
  },
  plugins: [],
};

export default config;
