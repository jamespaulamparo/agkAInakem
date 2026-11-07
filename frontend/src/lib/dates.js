// Local-calendar date helpers (avoid UTC shifts from toISOString).
export const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
export const startOfWeek = (d) => addDays(d, -((d.getDay() + 6) % 7))      // Monday
export const todayIso = () => iso(new Date())
export const fmt = (d, lang, opts) => d.toLocaleDateString(lang === 'fil' ? 'fil-PH' : 'en-PH', opts)
