// @ts-nocheck
import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: "true",
      padding: {
        DEFAULT: "0.5rem",
        sm: "2rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      gridTemplateColumns: {
        // Tùy chỉnh số cột nhiều hơn 12
        "13": "repeat(13, minmax(0, 1fr))",
        "14": "repeat(14, minmax(0, 1fr))",
        "15": "repeat(14, minmax(0, 1fr))",
        "16": "repeat(16, minmax(0, 1fr))",
        "17": "repeat(16, minmax(0, 1fr))",
        "18": "repeat(16, minmax(0, 1fr))",
        "19": "repeat(16, minmax(0, 1fr))",
        "20": "repeat(20, minmax(0, 1fr))",
      },
      gridColumn: {
        // Thêm các giá trị col-span-* tương ứng
        "13": "span 13 / span 13",
        "14": "span 14 / span 14",
        "15": "span 15 / span 15",
        "16": "span 16 / span 16",
        "17": "span 17 / span 17",
        "18": "span 18 / span 18",
        "19": "span 19 / span 19",
        "20": "span 20 / span 20",
      },
      fontFamily: {
        "road-rage": ['"Road Rage"', "cursive"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        "color-1": "hsl(var(--color-1))",
        "color-2": "hsl(var(--color-2))",
        "color-3": "hsl(var(--color-3))",
        "color-4": "hsl(var(--color-4))",
        "color-5": "hsl(var(--color-5))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        marquee: {
          "0%": {
            transform: "translateX(0%)",
          },
          "100%": {
            transform: "translateX(-100%)",
          },
          from: {
            transform: "translateX(0)",
          },
          to: {
            transform: "translateX(calc(-100% - var(--gap)))",
          },
        },
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        slideDown: {
          from: {
            height: "0",
            opacity: "0",

          },
          to: {
            height: "var(--radix-collapsible-content-height)",
            opacity: "1",

          },
        },
        slideUp: {
          from: {
            height: "var(--radix-collapsible-content-height)",
            opacity: "1",

          },
          to: {
            height: "0",
            opacity: "0",
          },
        },
        "marquee-vertical": {
          from: {
            transform: "translateY(0)",
          },
          to: {
            transform: "translateY(calc(-100% - var(--gap)))",
          },
        },
        "aurora-border": {
          "0%, 100%": {
            borderRadius: "37% 29% 27% 27% / 28% 25% 41% 37%",
          },
          "25%": {
            borderRadius: "47% 29% 39% 49% / 61% 19% 66% 26%",
          },
          "50%": {
            borderRadius: "57% 23% 47% 72% / 63% 17% 66% 33%",
          },
          "75%": {
            borderRadius: "28% 49% 29% 100% / 93% 20% 64% 25%",
          },
        },
        "aurora-1": {
          "0%, 100%": {
            top: "0",
            right: "0",
          },
          "50%": {
            top: "50%",
            right: "25%",
          },
          "75%": {
            top: "25%",
            right: "50%",
          },
        },
        "aurora-2": {
          "0%, 100%": {
            top: "0",
            left: "0",
          },
          "60%": {
            top: "75%",
            left: "25%",
          },
          "85%": {
            top: "50%",
            left: "50%",
          },
        },
        "aurora-3": {
          "0%, 100%": {
            bottom: "0",
            left: "0",
          },
          "40%": {
            bottom: "50%",
            left: "25%",
          },
          "65%": {
            bottom: "25%",
            left: "50%",
          },
        },
        "aurora-4": {
          "0%, 100%": {
            bottom: "0",
            right: "0",
          },
          "50%": {
            bottom: "25%",
            right: "40%",
          },
          "90%": {
            bottom: "50%",
            right: "25%",
          },
        },
      },
      animation: {
        marquee: "marquee var(--duration) infinite linear",
        slideDown: "slideDown 0.3s ease-out",
        slideUp: "slideUp 0.3s ease-out",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "marquee-vertical": "marquee-vertical var(--duration) linear infinite",
      },
      typography: {
        compact: {
          css: {
            h1: { marginTop: "1rem", marginBottom: "0.5rem" },
            h2: { marginTop: "0.75rem", marginBottom: "0.5rem" },
            h3: { marginTop: "0.5rem", marginBottom: "0.25rem" },
            p: { marginTop: "0.25rem", marginBottom: "0.25rem" },
            ul: {
              marginTop: "0.25rem",
              marginBottom: "0.25rem",
              paddingLeft: "1.25rem",
            },
            li: { marginTop: "0.125rem", marginBottom: "0.125rem" },
          },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
} satisfies Config;

export default config;
