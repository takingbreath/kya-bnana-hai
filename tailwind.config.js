/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        'pastel-orange': '#FFB74D'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
