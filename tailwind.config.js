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
    },
  },
  plugins: [typography],
}
