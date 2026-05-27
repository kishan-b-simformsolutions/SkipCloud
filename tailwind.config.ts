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
        ink: "#050505",
        mist: "#0d0d0d",
        signal: "#22d3ee",
        pulse: "#60a5fa",
        ember: "#c084fc",
      },
      boxShadow: {
        soft: "0 20px 60px rgba(7, 17, 31, 0.16)",
        glow: "0 0 32px rgba(34, 211, 238, 0.22)",
        "glow-lg": "0 0 60px rgba(96, 165, 250, 0.16)",
      },
      backgroundImage: {
        grid: "radial-gradient(circle at 1px 1px, rgba(7,17,31,0.12) 1px, transparent 0)",
      },
      animation: {
        float: "float 7s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
