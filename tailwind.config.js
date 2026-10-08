/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/store/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        // Custom breakpoints for precise responsive control
        'xs': '320px',      // Very small mobile
        'sm': '480px',      // Large mobile
        'md': '768px',      // Tablet
        'lg': '1024px',     // Laptop
        'xl': '1280px',     // Desktop
        '2xl': '1536px',    // Large desktop
        '3xl': '1920px',    // Extra large desktop
      },
      spacing: {
        // Consistent spacing scale
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
        '42': '10.5rem',
        '46': '11.5rem',
        '54': '13.5rem',
        '58': '14.5rem',
        '62': '15.5rem',
        '66': '16.5rem',
        '70': '17.5rem',
        '74': '18.5rem',
        '78': '19.5rem',
        '82': '20.5rem',
        '86': '21.5rem',
        '90': '22.5rem',
        '94': '23.5rem',
        '98': '24.5rem',
      },
      fontSize: {
        // Consistent type scale
        'xxs': '0.625rem',    // 10px
        '3xs': '0.6875rem',   // 11px
        '2xs': '0.75rem',     // 12px
        'xs': '0.8125rem',    // 13px
        'sm': '0.875rem',     // 14px
        'base': '0.9375rem',  // 15px
        'lg': '1rem',         // 16px
        'xl': '1.125rem',     // 18px
        '2xl': '1.25rem',     // 20px
        '3xl': '1.5rem',      // 24px
        '4xl': '1.75rem',     // 28px
        '5xl': '2rem',        // 32px
      },
      borderRadius: {
        // Consistent border radius scale
        'none': '0',
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
        'full': '9999px',
      },
      boxShadow: {
        // Consistent shadow scale
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      maxWidth: {
        // Responsive content containers
        'content-xs': '100%',
        'content-sm': '640px',
        'content-md': '768px',
        'content-lg': '1024px',
        'content-xl': '1280px',
        'content-2xl': '1600px',
      },
      sidebar: {
        'mobile': '0px',
        'compact': '72px',
        'desktop': '250px',
      },
    },
  },
  plugins: [],
}
