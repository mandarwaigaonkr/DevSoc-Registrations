import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        page: "rgb(var(--color-page) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-muted": "rgb(var(--surface-muted) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        text: "rgb(var(--text) / <alpha-value>)",
        "text-muted": "rgb(var(--text-muted) / <alpha-value>)",
        "text-subtle": "rgb(var(--text-subtle) / <alpha-value>)",
        "on-accent": "rgb(var(--on-accent) / <alpha-value>)",
        accent: {
          light: "rgb(var(--accent-light) / <alpha-value>)",
          DEFAULT: "rgb(var(--accent-primary) / <alpha-value>)",
          dark: "rgb(var(--accent-primary-dark) / <alpha-value>)",
          blue: "rgb(var(--accent-secondary) / <alpha-value>)",
          "blue-dark": "rgb(var(--accent-secondary-dark) / <alpha-value>)"
        },
        secondary: {
          light: "rgb(var(--secondary-light) / <alpha-value>)",
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          dark: "rgb(var(--secondary-dark) / <alpha-value>)"
        }
      },
      fontFamily: {
        display: ["var(--font-inter)", "Inter", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
        soft: ["var(--font-inter)", "Inter", "sans-serif"]
      },
      borderRadius: {
        xl: "16px",
        xl2: "12px",
        xl3: "1rem",
        xl4: "1.5rem",
        pill: "999px"
      },
      maxWidth: {
        content: "1200px"
      },
      boxShadow: {
        soft: "0 20px 60px rgba(24,24,27,0.08)",
        primary: "0 18px 36px rgba(4,50,109,0.24)"
      }
    }
  },
  plugins: []
};

export default config;
