/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2f7622',
          hover: '#266219',
        },
        secondary: {
          DEFAULT: '#f39700',
          hover: '#db8700',
        },
      },
      fontFamily: {
        sans: ['League Spartan', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}