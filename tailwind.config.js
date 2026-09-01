/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#395144',
          surface: '#2d4033',
          card: '#4E6C50',
          text: '#F0EBCE',
          muted: '#AA8B56',
        },
        light: {
          bg: '#F0EBCE',
          surface: '#ffffff',
          card: '#AA8B56',
          text: '#395144',
          muted: '#4E6C50',
        },
        accent: '#395144',
        accentLight: '#AA8B56',
        cream: '#F0EBCE',
        beige: '#AA8B56',
        sand: '#4E6C50',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        script: ['"Dancing Script"', 'cursive'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'spin-slow-paused': 'spin 3s linear infinite paused',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 1 },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
