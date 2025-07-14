/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'love-island': {
          'pink': '#E91E63',
          'orange': '#FF9800',
          'teal': '#26C6DA',
          'purple': '#9C27B0',
          'yellow': '#FFEB3B'
        }
      },
    },
  },
  plugins: [],
}