/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      textShadow: {
        glow: '0 0 8px rgba(185, 75, 114, 0.3)',
      },
      colors: {
        'background': '#F8EADF',
        'text-primary': '#4E3B31',
        'text-secondary': '#A1887F',
        'primary': '#F4B5C7',
        'accent': '#E799A3',
        'accent-vibrant': '#F43F5E',
        'secondary': '#D9C8E3',
        'secondary-dark': '#C4B5D6',
        'border': '#E8D9CF',
        'about-from': '#4b2c2c',
        'about-to': '#8e5a5a',
        'blog-from': '#6a4b6f',
        'blog-to': '#d16b8a',
        'premium-from': '#b94b72',
        'premium-to': '#f3a6b6',
        'premium-anim-from': '#FDBB2D',
        'premium-anim-via': '#D62976',
        'premium-anim-to': '#FA7E1E',
      },
      screens: {
        'xs': '475px',
      },
      fontFamily: {
        'serif': ['"Playfair Display"', 'serif'],
        'sans': ['"Montserrat"', 'sans-serif'],
        'roboto': ['"Roboto"', 'sans-serif'],
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'gradient-x': 'gradient-x 3s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(251, 194, 219, 0.4)',
        'glow-purple': '0 0 20px rgba(197, 163, 255, 0.4)',
      }
    },
  },
  plugins: [
    plugin(function({ addUtilities, theme }) {
      const newUtilities = {};
      const textShadows = theme('textShadow');
      if (textShadows) {
        Object.keys(textShadows).forEach(key => {
          newUtilities[`.text-shadow-${key}`] = {
            textShadow: textShadows[key],
          };
        });
      }
      addUtilities(newUtilities);
    })
  ],
};