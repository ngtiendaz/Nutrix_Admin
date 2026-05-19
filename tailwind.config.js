/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8F0E9',
          100: '#D4E3D6',
          200: '#B0C7B3',
          300: '#8CAB90',
          400: '#6A9470',
          500: '#4A7C59',
          600: '#3D6A4A',
          700: '#30573C',
          800: '#23452D',
          900: '#16321F',
        },
        neutral: {
          50: '#F7F7F7',
          100: '#EFEFEF',
          200: '#E0E0E0',
          300: '#C8C8C8',
          400: '#A0A0A0',
          500: '#787878',
          600: '#5A5A5A',
          700: '#3C3C3C',
          800: '#2A2A2A',
          900: '#1A1A1A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
