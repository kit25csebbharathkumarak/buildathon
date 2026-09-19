/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'talent-bg': '#0B0D12',
        'talent-surface': '#12151D',
        'talent-card': '#181D28',
        'talent-card-hover': '#1F2533',
        'talent-border': '#252D3E',
        'talent-border-highlight': '#354056',
        'talent-teal': '#1D9E75',
        'talent-teal-light': '#2AD19B',
        'talent-purple': '#7F77DD',
        'talent-purple-light': '#9D96F7',
        'talent-muted': '#8895A7',
        'talent-text': '#F1F4F9',
        'talent-subtext': '#A1ADC1',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-teal': '0 0 20px -3px rgba(29, 158, 117, 0.35)',
        'glow-purple': '0 0 20px -3px rgba(127, 119, 221, 0.35)',
        'card-elevated': '0 10px 30px -10px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
};
