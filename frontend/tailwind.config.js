/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'blueprint-blue': '#0044CC',
        'accent-orange': '#FF5722',
        'light-gray': '#F5F5F5',
        'medium-gray': '#E0E0E0',
        'dark-gray': '#333333',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
