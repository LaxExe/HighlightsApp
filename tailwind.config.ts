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
        // Base - warm off-white coffee tones
        base: {
          50:  '#FAF8F5',  // main background
          100: '#F3EFE9',  // sidebar background  
          200: '#E8E0D5',  // borders
          300: '#D4C8B8',  // stronger borders
          400: '#A89880',  // muted text
          500: '#7A6A58',  // secondary text
          600: '#4A3F35',  // primary text
          700: '#2C2420',  // headings
        },
        // Accent - Claude's warm orange
        accent: {
          DEFAULT: '#CC6B2C',
          hover:   '#B85E24',
          light:   '#F5E6D8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config