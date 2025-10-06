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
        background: "var(--background)",
        foreground: "var(--foreground)",
        // FR-DLS Color Palette
        'fpl-primary': '#2B1654',      // Deep violet - competitive energy
        'fpl-accent': '#78FF9E',        // Lime green - victory/progress
        'fpl-dark': '#0C0C0C',          // Premium dark mode base
        'fpl-text-secondary': '#9BA1B0', // Subtle contrast
        'fpl-violet': {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#2B1654',
        },
        'fpl-lime': {
          50: '#F7FEE7',
          100: '#ECFCCB',
          200: '#D9F99D',
          300: '#BEF264',
          400: '#A3E635',
          500: '#78FF9E',
          600: '#65D84A',
          700: '#4ADE80',
          800: '#22C55E',
          900: '#16A34A',
        },
      },
      fontFamily: {
        'jakarta': ['"Plus Jakarta Sans"', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'fpl': '12px',
      },
      boxShadow: {
        'fpl': '0 4px 12px rgba(0, 0, 0, 0.25)',
        'fpl-glow': '0 0 20px rgba(120, 255, 158, 0.3)',
        'fpl-glow-violet': '0 0 20px rgba(139, 92, 246, 0.4)',
      },
      backdropBlur: {
        'fpl': '12px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(120, 255, 158, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(120, 255, 158, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
