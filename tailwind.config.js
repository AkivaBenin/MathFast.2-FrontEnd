/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      screens: {
        'xs': '320px',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
      },
      colors: {
        arcade: {
          neonPink: '#ff007f',
          neonCyan: '#00ffff',
          neonGreen: '#39ff14',
          neonPurple: '#b026ff',
          neonYellow: '#ffea00',
          darkBg: '#0f0f1b',
          panelBg: '#1a1a2e'
        }
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translate3d(-8px, 0, 0)' },
          '20%, 40%, 60%, 80%': { transform: 'translate3d(8px, 0, 0)' },
        },
        pingPong: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(calc(100% - 8px), 0, 0)' },
        }
      },
      animation: {
        shake: 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both',
        'ping-pong': 'pingPong 800ms infinite alternate linear',
      }
    },
  },
  plugins: [],
}
