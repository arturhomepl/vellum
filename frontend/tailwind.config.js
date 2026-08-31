/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vellum: {
          bg: '#fcfcfc',
          panel: '#f3f3f3',
          border: '#e5e5e5',
        }
      }
    },
  },
  plugins: [],
}
