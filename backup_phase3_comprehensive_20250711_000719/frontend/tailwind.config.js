/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      // Mobile-first responsive breakpoints
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      // Enhanced spacing for mobile
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // Touch-friendly sizes
      minHeight: {
        'touch': '44px',
        'screen-mobile': '100vh',
        'screen-mobile-small': '100svh',
      },
      // StarGuide brand colors
      colors: {
        starguide: {
          primary: '#4C1D95',
          secondary: '#7C3AED',
          accent: '#F59E0B',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          dark: '#0F172A',
          light: '#F8FAFC',
        }
      }
    },
  },
  plugins: [
    // Add responsive typography
    require('@tailwindcss/typography'),
  ],
};