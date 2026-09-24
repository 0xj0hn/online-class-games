/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        duo: {
          green: '#58CC02',
          'green-dark': '#4CAF00',
          'green-shadow': '#3DA100',
          blue: '#1CB0F6',
          'blue-dark': '#0EA5E9',
          'blue-shadow': '#0E82B8',
          yellow: '#FFC800',
          'yellow-dark': '#FFB700',
          'yellow-shadow': '#E5B000',
          red: '#FF4B4B',
          'red-shadow': '#D91C1C',
          gray: '#E5E5E5',
          'gray-dark': '#AFAFAF',
          'gray-light': '#F7F7F7',
          text: '#4B4B4B',
          'text-light': '#777777',
        },
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        'duo': '16px',
      },
      boxShadow: {
        'duo': '0 2px 0 rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
}

