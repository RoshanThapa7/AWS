import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0b1220',
        card: '#111a2e',
        accent: '#34d399'
      }
    }
  },
  plugins: []
} satisfies Config;
