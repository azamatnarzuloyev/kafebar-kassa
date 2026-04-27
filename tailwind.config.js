/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          start: '#0B0F1A', end: '#121826',
          card:  'rgba(255, 255, 255, 0.04)',
          'card-hover': 'rgba(255, 255, 255, 0.08)',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.08)',
          strong: 'rgba(255, 255, 255, 0.12)',
        },
        brand: {
          50: '#EFF6FF', 100: '#DBEAFE', 200: '#BFDBFE',
          300: '#93C5FD', 400: '#60A5FA', 500: '#3B82F6',
          600: '#2563EB', 700: '#1D4ED8', 800: '#1E40AF', 900: '#1E3A8A',
        },
        status: {
          pending:  '#F59E0B', accepted: '#3B82F6',
          ready:    '#10B981', paid:     '#8B5CF6',
          cancel:   '#EF4444',
        },
        accent: {
          green:      '#22C55E',
          'green-bg': 'rgba(34, 197, 94, 0.15)',
          red:        '#EF4444',
          'red-bg':   'rgba(239, 68, 68, 0.15)',
          amber:      '#F59E0B',
          'amber-bg': 'rgba(245, 158, 11, 0.15)',
        },
        text: {
          primary:   '#FFFFFF', secondary: '#D1D5DB',
          muted:     '#9CA3AF', dim:       '#6B7280',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
        'gradient-app':   'linear-gradient(180deg, #0B0F1A 0%, #121826 100%)',
      },
      boxShadow: {
        'glow-brand':   '0 0 0 4px rgba(59, 130, 246, 0.2)',
        'glow-pending': '0 0 0 4px rgba(245, 158, 11, 0.25)',
        'glass': '0 4px 24px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'pulse-ring': 'pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shake':      'shake 0.4s ease-in-out',
        'slide-up':   'slideUp 0.25s ease-out',
        'pop':        'pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        pulseRing: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245, 158, 11, 0.4)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(245, 158, 11, 0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%':      { transform: 'translateX(-4px)' },
          '75%':      { transform: 'translateX(4px)' },
        },
        slideUp: {
          from: { transform: 'translateY(100%)', opacity: 0 },
          to:   { transform: 'translateY(0)', opacity: 1 },
        },
        pop: {
          '0%':   { transform: 'scale(1)' },
          '40%':  { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

