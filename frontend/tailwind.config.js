/** Design tokens live here and in src/index.css — never hard-code brand colours in components. */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Theme-aware tokens: values live in src/index.css (light + dark).
        teal: { DEFAULT: '#4FA8A0', hover: '#3F918A', ink: v('teal-ink'), soft: v('teal-soft') },
        sky: { DEFAULT: '#8EC5E8', ink: v('sky-ink'), soft: v('sky-soft') },
        sage: { DEFAULT: '#A9C8A5', ink: v('sage-ink'), soft: v('sage-soft') },
        paper: v('paper'),
        surface: v('surface'),
        ink: { DEFAULT: v('ink'), muted: v('ink-muted'), faint: v('ink-faint') },
        line: v('line'),
        alert: { DEFAULT: '#AF4A33', hover: '#984029', soft: v('alert-soft') },
        amber: { DEFAULT: v('amber'), soft: v('amber-soft') },
        calmbtn: { DEFAULT: '#3E7A5A', hover: '#346A4D' },
        talkbtn: { DEFAULT: '#3A6F96', hover: '#315F82' },
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
