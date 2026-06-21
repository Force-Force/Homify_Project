/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        homify: {
          primary: '#1B4332',
          'primary-light': '#2D6A4F',
          accent: '#E07A5F',
          'accent-hover': '#C96A52',
          surface: '#FAFAF8',
          card: '#FFFFFF',
          text: '#1A1A2E',
          muted: '#6B7280',
          border: '#E5E7EB',
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
        card: '0 1px 3px rgba(27, 67, 50, 0.06), 0 4px 12px rgba(27, 67, 50, 0.04)',
        'card-hover': '0 4px 16px rgba(27, 67, 50, 0.12)',
        dock: '0 8px 32px rgba(27, 67, 50, 0.18)',
      },
    },
  },
  plugins: [],
};
