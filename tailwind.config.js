import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          300: '#a5b4fc',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
        },
        purple: {
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        orange: {
          400: '#fb923c',
          500: '#f97316',
        },
      },
      backgroundImage: {
        'grad-beginner': 'linear-gradient(135deg, #34d399, #14b8a6)',
        'grad-intermediate': 'linear-gradient(135deg, #6366f1, #4338ca)',
        'grad-advanced': 'linear-gradient(135deg, #8b5cf6, #4338ca)',
        'grad-streak': 'linear-gradient(135deg, #fb923c, #f59e0b)',
        'grad-hero': 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      },
      fontFamily: {
        dyslexic: ['OpenDyslexic', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px -2px rgba(15,23,42,0.06), 0 1px 3px -1px rgba(15,23,42,0.04)',
        'card-hover': '0 12px 32px -6px rgba(79,70,229,0.14), 0 4px 8px -2px rgba(15,23,42,0.06)',
        brand: '0 4px 14px -2px rgba(79,70,229,0.35)',
        glass: '0 8px 32px -4px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.2)',
      },
      keyframes: {
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.25s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [typography],
}
