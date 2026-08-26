/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#05070E",
          surface: "#0A0E1A",
          card: "rgba(13, 17, 28, 0.85)",
          cardHover: "rgba(20, 26, 42, 0.95)",
          border: "rgba(255, 255, 255, 0.08)",
        },
        aurora: {
          cyan: "#22D3EE",
          violet: "#A855F7",
          pink: "#F43F5E",
          emerald: "#10B981",
          amber: "#F59E0B",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
