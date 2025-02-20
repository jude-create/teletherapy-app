/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", 
          "./screens/**/*.{js,jsx,ts,tsx}",
          "./patients/**/*.{js,jsx,ts,tsx}",
          "./therapist/**/*.{js,jsx,ts,tsx}",
          "./components/**/*.{js,jsx,ts,tsx}"
        ],
  theme: {
    extend: {
      colors: {
        'header': '#3399ff'
      }
    },
  },
  plugins: [],
}

