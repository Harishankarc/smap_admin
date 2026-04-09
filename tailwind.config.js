/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#0F3A38',
          800: '#0F4C5C',
          700: '#0C5F5B',
          600: '#0D9488',
          500: '#0F9D94',
          400: '#14B8A6',
          300: '#2DD4BF',
          200: '#5EEAD4',
          100: '#CCFBF1',
          50:  '#F0FDFA',
        },
        surface: '#FFFFFF',
        bg: '#F8FAFC',
        border: '#E2E8F0',
        text: {
          primary:   '#0F172A',
          secondary: '#64748B',
        },
        status: {
          present:  '#16A34A',
          absent:   '#DC2626',
          late:     '#D97706',
          unknown:  '#7C3AED',
          inactive: '#94A3B8',
        },
        // shadcn CSS variable mappings
        background:  'var(--background)',
        foreground:  'var(--foreground)',
        card:        { DEFAULT: 'var(--card)', foreground: 'var(--card-foreground)' },
        popover:     { DEFAULT: 'var(--popover)', foreground: 'var(--popover-foreground)' },
        primary:     { DEFAULT: 'var(--primary)', foreground: 'var(--primary-foreground)' },
        secondary:   { DEFAULT: 'var(--secondary)', foreground: 'var(--secondary-foreground)' },
        muted:       { DEFAULT: 'var(--muted)', foreground: 'var(--muted-foreground)' },
        accent:      { DEFAULT: 'var(--accent)', foreground: 'var(--accent-foreground)' },
        destructive: { DEFAULT: 'var(--destructive)', foreground: 'var(--destructive-foreground)' },
        input:       'var(--input)',
        ring:        'var(--ring)',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      boxShadow: {
        card:      '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)',
        'card-md': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
        sidebar:   '4px 0 16px 0 rgb(0 0 0 / 0.12)',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      minWidth: {
        screen: '1280px',
      },
      animation: {
        'fade-in':         'fadeIn 0.2s ease-out',
        'slide-in':        'slideIn 0.25s ease-out',
        'pulse-dot':       'pulseDot 2s ease-in-out infinite',
        'accordion-down':  'accordion-down 0.2s ease-out',
        'accordion-up':    'accordion-up 0.2s ease-out',
      },
      keyframes: {
        fadeIn:            { from: { opacity: '0' },                              to: { opacity: '1' } },
        slideIn:           { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseDot:          { '0%, 100%': { opacity: '1' },                        '50%': { opacity: '0.4' } },
        'accordion-down':  { from: { height: '0' },                              to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up':    { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}