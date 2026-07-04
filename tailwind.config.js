/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", 
          "./screens/**/*.{js,jsx,ts,tsx}",
          "./patients/**/*.{js,jsx,ts,tsx}",
          "./therapist/**/*.{js,jsx,ts,tsx}",
          "./admin/**/*.{js,jsx,ts,tsx}",
          "./components/**/*.{js,jsx,ts,tsx}",
          "./navigation/**/*.{js,jsx,ts,tsx}"
        ],
  theme: {
    extend: {
      colors: {
        background: '#F7FAF8',
        surface: '#FFFFFF',
        'surface-muted': '#EEF5F3',
        primary: '#0F3D4A',
        'primary-soft': '#D8E8E8',
        accent: '#5E8FA8',
        'accent-soft': '#E7F0F5',
        success: '#4F9D69',
        'success-soft': '#E6F4EA',
        danger: '#D96C6C',
        'danger-soft': '#FCEAEA',
        warning: '#D89A3D',
        text: '#1F2A33',
        muted: '#63727D',
        subtle: '#8A97A0',
        border: '#DDE7E4',
        header: '#0F3D4A',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
      },
    },
  },
  plugins: [],
}

