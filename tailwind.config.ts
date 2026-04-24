import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta extraída del logo de Bel — tonos dorados/beige cálidos
        primary: {
          50:  '#FAF6EF',
          100: '#F2EADC',
          200: '#E5D6BA',
          300: '#D4C4A0',
          400: '#C9B896',
          500: '#B8A078', // dorado principal del logo
          600: '#A08A63',
          700: '#8B7654',
          800: '#6E5D42',
          900: '#4A3F2D',
          950: '#2C251B',
        },
        accent: {
          50:  '#FBF8F2',
          100: '#F6EFDF',
          200: '#E9D9B0',
          300: '#D7BF82',
          400: '#C4A561',
          500: '#A58542', // acento más saturado
          600: '#8B6F35',
          700: '#6F582B',
          800: '#534222',
          900: '#3A2E18',
        },
        neutral: {
          50:  '#FAFAF8',
          100: '#F4F3EE',
          200: '#E8E6DE',
          300: '#D2CEC2',
          400: '#A8A397',
          500: '#7A766B',
          600: '#52504A',
          700: '#3B3A36',
          800: '#26251F', // negro del logo
          900: '#1A1A17',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #B8A078 0%, #D4C4A0 50%, #B8A078 100%)',
        'subtle-gold': 'linear-gradient(180deg, #FAF6EF 0%, #F2EADC 100%)',
      },
    },
  },
}
export default config
