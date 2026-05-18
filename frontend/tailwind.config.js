/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'te-orange': '#FF6B00',
        'te-dark': '#1A1A1A',
        'te-gray': '#2D2D2D',
      },
    },
  },
  plugins: [],
}
