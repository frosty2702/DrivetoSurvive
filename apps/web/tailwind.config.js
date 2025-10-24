/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'f1-red': '#E10600',
        'f1-blue': '#0066CC',
        'f1-yellow': '#FFD700',
        'f1-green': '#00D2BE',
        'f1-orange': '#FF8700',
        'f1-purple': '#6C5CE7',
        'f1-pink': '#E84393',
        'f1-cyan': '#00CEC9',
        'f1-lime': '#A4B0BE',
        'f1-indigo': '#5F27CD',
      },
    },
  },
  plugins: [],
}