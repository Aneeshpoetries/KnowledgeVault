/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        vault: {
          bg:          "var(--vault-bg)",
          dark:        "var(--vault-dark)",
          surface:     "var(--vault-surface)",
          surface2:    "var(--vault-surface-2)",
          elevated:    "var(--vault-elevated)",
          border:      "var(--vault-border)",
          borderHover: "var(--vault-border-hover)",
          subtle:      "var(--vault-subtle)",
          text:        "var(--vault-text)",
          muted:       "var(--vault-muted)",
          dim:         "var(--vault-dim)",
        },
        card: {
          gold:   "var(--card-gold)",
          blue:   "var(--card-blue)",
          purple: "var(--card-purple)",
          peach:  "var(--card-peach)",
          pink:   "var(--card-pink)",
          rose:   "var(--card-rose)",
        },
        accent: {
          indigo: "var(--accent-indigo)",
          amber:  "var(--accent-amber)",
          rose:   "var(--accent-rose)",
          emerald:"var(--accent-emerald)",
          sky:    "var(--accent-sky)",
          purple: "var(--accent-purple)",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        "2xl":  "1rem",
        "3xl":  "1.25rem",
        "4xl":  "1.5rem",
        "5xl":  "2rem",
      },
      boxShadow: {
        card:     "var(--shadow-card)",
        elevated: "var(--shadow-elevated)",
        "glow-indigo": "0 0 20px -4px rgba(124,106,247,0.3)",
        "glow-rose":   "0 0 20px -4px rgba(243,145,172,0.3)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float":      "float 3s ease-in-out infinite",
        "slide-in":   "slideInFromBottom 0.2s ease forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-4px)" },
        },
        slideInFromBottom: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
