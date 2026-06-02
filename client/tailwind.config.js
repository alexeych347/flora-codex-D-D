/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: '#F4E4BC',
        'parchment-dark': '#E8D5A3',
        ink: '#1C1208',
        'ink-light': '#3D2B1F',
        gold: '#C9A84C',
        'gold-glow': '#F0C060',
        forest: '#2D5A27',
        rarity: {
          common: '#8A9B8A',
          uncommon: '#4A7C59',
          rare: '#3A5F8A',
          legendary: '#8B4513',
        },
      },
      fontFamily: {
        cinzel: ['"Cinzel Decorative"', 'serif'],
        garamond: ['"EB Garamond"', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-in-out',
        'page-glow': 'pageGlow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pageGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(201,168,76,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(201,168,76,0.6)' },
        },
      },
    },
  },
  plugins: [],
};
