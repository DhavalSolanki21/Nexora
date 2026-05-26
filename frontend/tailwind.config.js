/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        nexora: {
          dark: "#171514",
          "dark-light": "#2a2824",
          accent: "#93C998",
          "accent-dark": "#7ab37f",
          "accent-light": "#a8d9a8",
          light: "#D9D9D9",
          "light-dark": "#b8b8b8",
          bg: "#fafaf9",
          surface: "#ffffff",
          card: "rgba(255, 255, 255, 0.95)",
          border: "rgba(23, 21, 20, 0.08)",
        },
      },
      fontFamily: {
        display: ["Poppins", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(147, 201, 152, 0.12)",
        "glow-green": "0 0 40px rgba(147, 201, 152, 0.2)",
        soft: "0 1px 3px rgba(23, 21, 20, 0.06), 0 1px 2px rgba(23, 21, 20, 0.04)",
        card: "0 12px 36px rgba(147, 201, 152, 0.08)",
        dark: "0 4px 16px rgba(23, 21, 20, 0.12)",
      },
      backgroundImage: {
        grid: `linear-gradient(rgba(147, 201, 152, 0.06) 1px, transparent 1px),
               linear-gradient(90deg, rgba(147, 201, 152, 0.06) 1px, transparent 1px)`,
      },
      animation: {
        pulse_slow: "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-in": "slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in-up": "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "accent-pulse": "accentPulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fadeInUp: {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        accentPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(147, 201, 152, 0.15)" },
          "50%": { boxShadow: "0 0 40px rgba(147, 201, 152, 0.3)" },
        },
      },
    },
  },
  plugins: [],
};
