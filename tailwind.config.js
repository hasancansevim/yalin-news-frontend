/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        'bg-main': 'var(--color-bg-main)',
        'surface': 'var(--color-surface)',
        'border': 'var(--color-border)',
        'accent-main': 'var(--color-accent-main)',
        'accent-secondary': 'var(--color-accent-secondary)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        ui: ['var(--font-ui)', 'monospace'],
        body: ['var(--font-body)', 'serif'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
      }
    },
  },
  plugins: [],
};
