// Sample check-ins for demonstrations. Dates are remembered so they can be removed again.
import { addDays, iso } from './dates'
import { load, save } from './storage'

const KEY = 'agk_demo_dates'
const FEEL = [['mindfulness'], ['feeling-drained', 'stress'], ['anxiety'], [], ['belonging'], ['overwhelm', 'feeling-drained'], ['sadness'], ['feeling-drained'], ['frustration'], ['mindfulness', 'belonging']]

export function demoEntries(existing) {
  const out = []
  for (let i = 1; i <= 42; i++) {
    if (i % 5 === 0) continue                       // a few skipped days look realistic
    const d = addDays(new Date(), -i)
    const date = iso(d)
    if (existing[date]) continue
    const wd = (d.getDay() + 6) % 7
    let mood = i > 14 ? (i % 4 === 0 ? 'yellow' : 'green') : (i % 3 === 0 ? 'red' : 'yellow')
    if (wd === 0 && i > 7) mood = i % 2 ? 'red' : 'yellow'   // harder Mondays
    out.push({ date, mood, feelings: FEEL[i % FEEL.length], note: '' })
  }
  return out
}
export const demoDates = () => load(KEY, [])
export const rememberDemo = (dates) => save(KEY, [...new Set([...demoDates(), ...dates])])
export const forgetDemo = () => save(KEY, [])
