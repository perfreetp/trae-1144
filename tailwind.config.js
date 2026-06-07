/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: '#e8f0f8',
          100: '#c5d9ed',
          200: '#9fbfe0',
          300: '#79a5d3',
          400: '#5c91c9',
          500: '#3f7dbf',
          600: '#3572b0',
          700: '#29649e',
          800: '#1e578d',
          900: '#0f2b46',
          950: '#0a1e32',
        },
        accent: {
          50: '#e6faf2',
          100: '#b3f2dc',
          200: '#80eac6',
          300: '#4de2b0',
          400: '#26dc9e',
          500: '#00c48c',
          600: '#00b07e',
          700: '#009a6d',
          800: '#00845d',
          900: '#005e41',
        },
        warning: {
          50: '#fff5e6',
          100: '#ffe0b3',
          200: '#ffcc80',
          300: '#ffb74d',
          400: '#ffa726',
          500: '#ff8c00',
          600: '#e67e00',
          700: '#cc7000',
          800: '#b36200',
          900: '#8c4d00',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '"DM Sans"', 'sans-serif'],
        mono: ['"DM Sans"', 'monospace'],
      },
    },
  },
  plugins: [],
};
