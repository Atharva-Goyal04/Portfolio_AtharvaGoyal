import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "hsl(var(--canvas))",
        surface: "hsl(var(--surface))",
        ink: "hsl(var(--ink))",
        muted: "hsl(var(--muted))",
        brand: "hsl(var(--brand))",
        "brand-foreground": "hsl(var(--brand-foreground))",
        line: "hsl(var(--line))",
        cream: "#F0EBCE",
        beige: "#AA8B56",
        sand: "#4E6C50",
        forest: "#395144",
        woods: "#2d4033",
        coal: "#0B0E0D",
      },
      fontFamily: {
        display: ['var(--font-display)', "Playfair Display", "serif"],
        body: ['var(--font-body)', "Inter", "sans-serif"],
        mono: ['var(--font-mono)', "JetBrains Mono", "monospace"],
        script: ['var(--font-script)', "Dancing Script", "cursive"],
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out both",
        "slide-up": "slide-up 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;