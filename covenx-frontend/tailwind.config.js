/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // --- CovenX Brand Palette (derived from logo) ---
        // Navy Blue  : shield text / dark bg
        navy: {
          50:  '#eef0f8',
          100: '#cdd2eb',
          200: '#9ba6d7',
          300: '#6979c2',
          400: '#3d52ad',
          500: '#1B2D5E', // primary navy
          600: '#162550',
          700: '#111c3f',
          800: '#0c142d',
          900: '#070c1c',
          950: '#030611',
        },
        // Forest Green : main shield border
        forest: {
          50:  '#edf5ec',
          100: '#c9e4c5',
          200: '#96c990',
          300: '#63ae5a',
          400: '#469040',
          500: '#2D6A27', // primary green
          600: '#245821',
          700: '#1b441a',
          800: '#123013',
          900: '#091c0a',
        },
        // Vibrant Orange : inner shield / X letter
        ember: {
          50:  '#fff4ec',
          100: '#fde2c8',
          200: '#fabb87',
          300: '#f69346',
          400: '#f07a20',
          500: '#E8650A', // primary orange
          600: '#c25408',
          700: '#9b4306',
          800: '#743204',
          900: '#4d2102',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'brand-sm': '0 2px 8px 0 rgba(27,45,94,0.15)',
        'brand-md': '0 4px 16px 0 rgba(27,45,94,0.20)',
        'ember-sm': '0 2px 8px 0 rgba(232,101,10,0.25)',
        'forest-sm': '0 2px 8px 0 rgba(45,106,39,0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer': 'shimmer 1.5s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
