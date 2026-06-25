/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        homify: {
          primary: 'rgb(var(--h-primary) / <alpha-value>)',
          'primary-light': 'rgb(var(--h-primary-light) / <alpha-value>)',
          accent: 'rgb(var(--h-accent) / <alpha-value>)',
          'accent-hover': 'rgb(var(--h-accent-hover) / <alpha-value>)',
          surface: 'rgb(var(--h-surface) / <alpha-value>)',
          card: 'rgb(var(--h-card) / <alpha-value>)',
          text: 'rgb(var(--h-text) / <alpha-value>)',
          muted: 'rgb(var(--h-muted) / <alpha-value>)',
          border: 'rgb(var(--h-border) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        btn: '12px',
        modal: '24px',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        dock: 'var(--shadow-dock)',
      },
      zIndex: {
        map: '1',
        modal: '1100',
      },
    },
  },
  plugins: [],
};
