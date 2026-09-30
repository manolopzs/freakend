/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ie-red': '#A6192E',
        'ie-dark': '#1A1A1A',
        'ie-gold': '#C8A464',
        freak: {
          bg: '#0a0a12',
          panel: '#11111f',
          pink: '#ff00aa',
          'pink-glow': '#ff2ec4',
          cyan: '#00f0ff',
          'cyan-glow': '#2de2e6',
          yellow: '#fff200',
          orange: '#ff8a00',
          purple: '#7b2dff',
          violet: '#9d00ff',
          green: '#39ff14',
        },
      },
      fontFamily: {
        comic: ['Impact', 'Haettenschweiler', 'Arial Narrow Bold', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-pink': '0 0 12px rgba(255, 0, 170, 0.6), 0 0 24px rgba(255, 0, 170, 0.3)',
        'neon-cyan': '0 0 12px rgba(0, 240, 255, 0.6), 0 0 24px rgba(0, 240, 255, 0.3)',
        'neon-yellow': '0 0 12px rgba(255, 242, 0, 0.6), 0 0 24px rgba(255, 242, 0, 0.3)',
        'neon-purple': '0 0 12px rgba(123, 45, 255, 0.6), 0 0 24px rgba(123, 45, 255, 0.3)',
      },
      animation: {
        'shake': 'shake 0.5s ease-in-out',
        'pop': 'pop 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'neon-pulse': 'neonPulse 2s ease-in-out infinite',
        'neon-flicker': 'neonFlicker 1.5s infinite alternate',
        'lightning': 'lightning 0.25s ease-out',
        'card-pop': 'cardPop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'lever-pull': 'leverPull 0.5s ease-in-out',
        'star-spin': 'starSpin 4s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-6px)' },
          '75%': { transform: 'translateX(6px)' },
        },
        pop: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        neonPulse: {
          '0%, 100%': { filter: 'brightness(1) drop-shadow(0 0 6px rgba(255,0,170,0.6))' },
          '50%': { filter: 'brightness(1.25) drop-shadow(0 0 18px rgba(255,0,170,0.9))' },
        },
        neonFlicker: {
          '0%, 18%, 22%, 25%, 53%, 57%, 100%': { opacity: '1' },
          '20%, 24%, 55%': { opacity: '0.4' },
        },
        lightning: {
          '0%': { opacity: '0', transform: 'scale(0.8) rotate(-10deg)' },
          '50%': { opacity: '1', transform: 'scale(1.1) rotate(0deg)' },
          '100%': { opacity: '0', transform: 'scale(1) rotate(5deg)' },
        },
        cardPop: {
          '0%': { transform: 'translateY(-60px) scale(0.6) rotateX(20deg)', opacity: '0' },
          '60%': { transform: 'translateY(10px) scale(1.05) rotateX(-4deg)', opacity: '1' },
          '100%': { transform: 'translateY(0) scale(1) rotateX(0)', opacity: '1' },
        },
        leverPull: {
          '0%': { transform: 'rotate(0deg)' },
          '40%': { transform: 'rotate(55deg)' },
          '60%': { transform: 'rotate(45deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        starSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
