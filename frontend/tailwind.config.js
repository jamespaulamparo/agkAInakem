/** Design tokens live here and in src/index.css — never hard-code brand colours in components. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        teal: { DEFAULT: '#4FA8A0', hover: '#3F918A', ink: '#2B6F69', soft: '#E3F1EF' },
        sky: { DEFAULT: '#8EC5E8', ink: '#2F6688', soft: '#E6F2FA' },
        sage: { DEFAULT: '#A9C8A5', ink: '#3F6B3B', soft: '#EBF3EA' },
        paper: '#F7F4EF',
        surface: '#FFFFFF',
        ink: { DEFAULT: '#263A38', muted: '#5F716D', faint: '#8C9B97' },
        line: '#E4E9E5',
        alert: { DEFAULT: '#AF4A33', hover: '#984029', soft: '#FBEDE8' },
        calmbtn: { DEFAULT: '#3E7A5A', hover: '#346A4D' },
        talkbtn: { DEFAULT: '#3A6F96', hover: '#315F82' },
        amber: { DEFAULT: '#C98A2B', soft: '#FBF2E3' },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        word: ['Newsreader', 'Georgia', 'Cambria', 'serif'],
      },
      borderRadius: { sm: '8px', md: '14px', lg: '20px', xl: '28px' },
      boxShadow: { soft: '0 8px 24px rgba(38, 58, 56, 0.06)', lift: '0 18px 50px rgba(38, 58, 56, 0.12)' },
      maxWidth: { prose: '44rem', page: '72rem' },
    },
  },
  plugins: [],
}
