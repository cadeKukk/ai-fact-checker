import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#f7f6f2',
        ink: {
          DEFAULT: '#141414',
          soft: '#524f48',
          faint: '#75726b',
        },
        line: 'rgba(20, 20, 20, 0.16)',
        accent: '#2038e6',
      },
    },
  },
  plugins: [],
}
export default config
