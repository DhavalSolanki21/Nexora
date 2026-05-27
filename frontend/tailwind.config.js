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
          // Data science theme additions
          "data-blue": "#4285f4",
          "data-green": "#34a853",
          "data-yellow": "#fbbc05",
          "data-red": "#ea4335",
          "data-purple": "#9c27b0",
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
        "lift": "0 20px 48px rgba(23, 21, 20, 0.08), 0 8px 16px rgba(147, 201, 152, 0.06)",
        "data-viz": "0 8px 24px rgba(147, 201, 152, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
      },
      backgroundImage: {
        grid: `linear-gradient(rgba(147, 201, 152, 0.06) 1px, transparent 1px),
               linear-gradient(90deg, rgba(147, 201, 152, 0.06) 1px, transparent 1px)`,
        "grid-fine": `linear-gradient(rgba(147, 201, 152, 0.03) 1px, transparent 1px),
                     linear-gradient(90deg, rgba(147, 201, 152, 0.03) 1px, transparent 1px)`,
        "data-gradient": "linear-gradient(135deg, rgba(147, 201, 152, 0.1) 0%, rgba(147, 201, 152, 0.02) 100%)",
        "mesh-gradient": `linear-gradient(45deg, 
          rgba(147, 201, 152, 0.05) 0%, 
          rgba(147, 201, 152, 0.02) 25%,
          transparent 50%,
          rgba(147, 201, 152, 0.02) 75%,
          rgba(147, 201, 152, 0.05) 100%)`,
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-in": "slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in-up": "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "accent-pulse": "accentPulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2.5s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "data-ping": "dataPing 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "gradient-shift": "gradientShift 8s ease infinite",
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
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        dataPing: {
          "75%, 100%": {
            transform: "scale(2)",
            opacity: "0",
          },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [],
};
