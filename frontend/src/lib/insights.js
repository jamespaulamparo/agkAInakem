/*
 * Weekly summary: simple counts and gentle, fixed-template observations.
 * No scores are shown and nothing here is a diagnosis.
 */
import { addDays, iso, startOfWeek } from './dates'

const VALUE = { green: 2, yellow: 1, red: 0 }   // internal only, for "steadier than last week"

export function weekSummary(entries, anyDay) {
  const start = startOfWeek(anyDay)
  const days = Array.from({ length: 7 }, (_, i) => iso(addDays(start, i)))
  const prevDays = Array.from({ length: 7 }, (_, i) => iso(addDays(start, i - 7)))
  const week = days.map((d) => entries[d]).filter(Boolean)
  const prev = prevDays.map((d) => entries[d]).filter(Boolean)

  const counts = { green: 0, yellow: 0, red: 0 }
  week.forEach((e) => { counts[e.mood] += 1 })
  const feelingCounts = {}
  week.forEach((e) => (e.feelings || []).forEach((f) => { feelingCounts[f] = (feelingCounts[f] || 0) + 1 }))
  const topFeelings = Object.entries(feelingCounts).sort((a, b) => b[1] - a[1]).filter(([, n]) => n >= 2).slice(0, 3)

  const avg = (list) => (list.length ? list.reduce((s, e) => s + VALUE[e.mood], 0) / list.length : null)
  const a = avg(week), b = avg(prev)

  const notes = []   // { key, en, fil, link? }
  if (!week.length) {
    notes.push({ en: 'No check-ins this week yet. Even one a day helps you notice patterns.', fil: 'Wala pang check-in ngayong linggo. Kahit isa bawat araw ay nakatutulong para mapansin ang pattern.' })
  } else {
    if (counts.green >= Math.ceil(week.length / 2)) notes.push({ en: 'Mostly steady days. What helped? It may be worth writing down.', fil: 'Karamihan ay maayos na araw. Ano ang nakatulong? Puwedeng isulat ito.' })
    else if (counts.yellow >= counts.red) notes.push({ en: 'A stretched week. Short pauses, like one minute of slow breathing, can help.', fil: 'Mabigat-bigat na linggo. Makatutulong ang maiikling pahinga, gaya ng isang minutong mabagal na paghinga.', link: '/help/calm', cta: ['Try breathing', 'Subukan ang paghinga'] })
    if (counts.red >= 2) notes.push({ en: 'A few hard days. You don’t have to carry them alone.', fil: 'Ilang mahirap na araw. Hindi mo kailangang pasanin ito mag-isa.', link: '/help/talk', cta: ['Talk to someone', 'Makipag-usap sa tao'] })
    if (a !== null && b !== null && Math.abs(a - b) >= 0.4) {
      notes.push(a > b
        ? { en: 'Steadier than last week.', fil: 'Mas maayos kaysa noong nakaraang linggo.' }
        : { en: 'Heavier than last week. Be gentle with yourself.', fil: 'Mas mabigat kaysa noong nakaraang linggo. Maging mahinahon sa sarili.' })
    }
    if (week.length <= 2) notes.push({ en: `${week.length} of 7 days logged. More check-ins make patterns clearer.`, fil: `${week.length} sa 7 araw ang may check-in. Mas malinaw ang pattern kapag mas marami.` })
  }
  return { start, days, counts, logged: week.length, topFeelings, notes }
}
