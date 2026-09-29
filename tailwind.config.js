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
          dark: "rgb(var(--vault-dark-rgb) / <alpha-value>)",
          surface: "rgb(var(--vault-surface-rgb) / <alpha-value>)",
          elevated: "rgb(var(--vault-elevated-rgb) / <alpha-value>)",
          border: "rgb(var(--vault-border-rgb) / <alpha-value>)",
          borderHover: "rgb(var(--vault-border-hover-rgb) / <alpha-value>)",
          subtle: "rgb(var(--vault-subtle-rgb) / <alpha-value>)",
          text: "rgb(var(--vault-text-rgb) / <alpha-value>)",
          muted: "rgb(var(--vault-muted-rgb) / <alpha-value>)",
          dim: "rgb(var(--vault-dim-rgb) / <alpha-value>)",
          indigo: "#4F46E5",
          indigoLight: "#6366F1",
          cyan: "#06B6D4",
          cyanLight: "#22D3EE",
          violet: "#8B5CF6",
          emerald: "#10B981",
          amber: "#F59E0B",
          red: "#EF4444",
        },
        navy: {
          950: "rgb(var(--vault-dark-rgb) / <alpha-value>)",
          900: "rgb(var(--vault-surface-rgb) / <alpha-value>)",
          850: "rgb(var(--vault-elevated-rgb) / <alpha-value>)",
          800: "rgb(var(--vault-subtle-rgb) / <alpha-value>)",
          700: "rgb(var(--vault-border-rgb) / <alpha-value>)",
          600: "rgb(var(--vault-border-hover-rgb) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "'JetBrains Mono'",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        elevated: "0 4px 20px -2px rgba(0, 0, 0, 0.25)",
        glowIndigo: "0 0 20px -4px rgba(99, 102, 241, 0.25)",
        glowCyan: "0 0 20px -4px rgba(6, 182, 212, 0.25)",
        glowViolet: "0 0 20px -4px rgba(139, 92, 246, 0.25)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
    },
  },
  plugins: [],
};
