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
          paper: "#f5efe6",
          fog: "#9a9286",
          gold: "#c9a96e",
          dust: "#3a3530",
        },
      },
      fontFamily: {
        display: ["var(--font-cinzel)", "serif"],
        serif: ["var(--font-cormorant)", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
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
        glow: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "0.85" },
        },
      },
      animation: {
        "fade-up": "fade-up 1.2s ease-out both",
        "drift-slow": "drift-slow 28s ease-in-out infinite",
        glow: "glow 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
