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
        'fpl-elevated': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      backdropBlur: {
        'fpl': '12px',
      },
      backdropSaturate: {
        '150': '1.5',
      },
      transitionTimingFunction: {
        'spring-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spring-gentle': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'spring-snappy': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'gradient-rotate': 'borderRotate 4s linear infinite',
        'reveal-up': 'revealUp 0.4s ease-out forwards',
        'card-glow': 'cardGlow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(120, 255, 158, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(120, 255, 158, 0.6)' },
        },
        borderRotate: {
          to: { '--angle': '360deg' },
        },
        revealUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        cardGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(120, 255, 158, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(120, 255, 158, 0.4)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
