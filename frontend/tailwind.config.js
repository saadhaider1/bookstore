/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8B5A2B',
        secondary: '#D4A574',
        accent: '#2C3E50',
      },
    },
  },
  plugins: [],
}
