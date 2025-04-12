/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        'pastel-orange': '#FFB74D',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
