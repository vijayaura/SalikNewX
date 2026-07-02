/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        liva: {
          orange: '#F05A28',
          'orange-light': '#FF7A45',
          cream: '#F5F0E8',
          muted: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
