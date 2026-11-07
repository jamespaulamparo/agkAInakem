/*
 * Pattern analysis over journal check-ins. Fixed rules, no AI, no scores shown, no diagnosis.
 * Used for: the "talk with a professional" nudge, the 30-day pattern summary, and suggestions.
 */
import { addDays, iso, parse } from './dates'

export const VALUE = { green: 2, yellow: 1, red: 0 }
const avg = (l) => (l.length ? l.reduce((s, e) => s + VALUE[e.mood], 0) / l.length : null)
const midnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

// Runs of check-ins matching a test, newest first. A single day without a check-in doesn't
// break a run (people forget); two missing days, or a non-matching check-in, do.
function runs(entries, test, today, span) {
  const out = []
  let cur = null, miss = 0
  for (let i = 0; i < span; i++) {
    const d = iso(addDays(today, -i)), e = entries[d]
    if (!e) { if (cur && ++miss >= 2) { out.push(cur); cur = null } continue }
    miss = 0
    if (test(e)) {
      if (cur) { cur.length += 1; cur.start = d } else cur = { length: 1, end: d, start: d, daysAgo: i }
    } else if (cur) { out.push(cur); cur = null }
  }
  if (cur) out.push(cur)
  return out
}

export function analyse(entries, today = new Date()) {
  today = midnight(today)
  const day = (n) => entries[iso(addDays(today, -n))]
  const range = (from, to) => Array.from({ length: to - from }, (_, i) => day(from + i)).filter(Boolean)
  const last14 = range(0, 14), last30 = range(0, 30)
  const weeks = [0, 1, 2, 3].map((w) => range(w * 7, w * 7 + 7))   // weeks[0] = most recent 7 days

  const counts = { green: 0, yellow: 0, red: 0 }
  last30.forEach((e) => { counts[e.mood] += 1 })

  const redRuns = runs(entries, (e) => e.mood === 'red', today, 60)
  const heavyRuns = runs(entries, (e) => e.mood !== 'green', today, 60)
  const greenRuns = runs(entries, (e) => e.mood === 'green', today, 60)
  const longest = (rs, within = 30) => rs.filter((r) => r.daysAgo < within).reduce((m, r) => (r.length > m.length ? r : m), { length: 0 })

  // Feelings: how often, and whether they go with lighter or heavier days.
  const feelings = {}
  last30.forEach((e) => (e.feelings || []).forEach((f) => {
    const x = (feelings[f] ||= { n: 0, sum: 0, n14: 0 })
    x.n += 1; x.sum += VALUE[e.mood]
  }))
  last14.forEach((e) => (e.feelings || []).forEach((f) => { if (feelings[f]) feelings[f].n14 += 1 }))
  const overall = avg(last30)
  const feelingList = Object.entries(feelings).map(([slug, x]) => ({ slug, n: x.n, n14: x.n14, mean: x.sum / x.n })).sort((a, b) => b.n - a.n)
  const pairs = {}
  last30.forEach((e) => {
    const f = [...new Set(e.feelings || [])].sort()
    for (let i = 0; i < f.length; i++) for (let j = i + 1; j < f.length; j++) { const k = f[i] + '|' + f[j]; pairs[k] = (pairs[k] || 0) + 1 }
  })

  // Weekday vs weekend (last 8 weeks).
  const wk = [], we = []
  for (let i = 0; i < 56; i++) { const e = day(i); if (e) ([0, 6].includes(addDays(today, -i).getDay()) ? we : wk).push(e) }

  // Ups and downs: colour changes between consecutive check-ins (last 14 entries).
  const ordered = Object.values(entries).filter((e) => e.date <= iso(today)).sort((a, b) => (a.date < b.date ? 1 : -1))
  const recentSeq = ordered.slice(0, 14)
  let changes = 0, bigSwings = 0
  for (let i = 1; i < recentSeq.length; i++) {
    const d = Math.abs(VALUE[recentSeq[i].mood] - VALUE[recentSeq[i - 1].mood])
    if (d) changes += 1
    if (d === 2) bigSwings += 1
  }

  // Bounce-back: a red day followed within 3 days by green (last 30 days).
  let bounces = 0
  for (let i = 0; i < 30; i++) {
    const e = day(i)
    if (e?.mood === 'red' && [1, 2, 3].some((k) => i - k >= 0 && day(i - k)?.mood === 'green')) bounces += 1
  }

  const lastDate = ordered[0]?.date
  return {
    total: ordered.length, last14, last30, weeks, counts, overall,
    weekAvgs: weeks.map((w) => (w.length >= 3 ? avg(w) : null)),
    redRuns, heavyRuns, greenRuns,
    longestRed: longest(redRuns), longestHeavy: longest(heavyRuns), longestGreen: longest(greenRuns),
    currentRed: redRuns[0]?.daysAgo <= 2 ? redRuns[0].length : 0,
    feelings: feelingList, pairs,
    weekday: wk.length >= 4 ? avg(wk) : null, weekend: we.length >= 3 ? avg(we) : null,
    changes, bigSwings, seqLength: recentSeq.length, bounces,
    gap: lastDate ? Math.round((today - parse(lastDate)) / 864e5) : null,
  }
}

/*
 * When patterns suggest it may help to talk with a professional (counsellor, doctor, psychologist).
 * Returns null, or { reasons: [{en, fil}] }. Thresholds are deliberately conservative and need clinician review.
 */
export function professionalSignal(entries, today = new Date()) {
  const a = analyse(entries, today)
  const reasons = []
  const add = (en, fil) => reasons.push({ en, fil })

  const recentRedRun = a.redRuns.find((r) => r.daysAgo <= 7 && r.length >= 4)
  if (recentRedRun) add(`${recentRedRun.length} hard days in a row`, `${recentRedRun.length} magkakasunod na mahirap na araw`)

  const red14 = a.last14.filter((e) => e.mood === 'red').length
  if (a.last14.length >= 6 && red14 / a.last14.length >= 0.5) add(`hard days on ${red14} of your last ${a.last14.length} check-ins`, `mahirap na araw sa ${red14} sa huling ${a.last14.length} check-in`)

  const heavyWeeks = a.weekAvgs.filter((v) => v !== null && v <= 0.75).length
  if (heavyWeeks >= 3) add(`${heavyWeeks} of the last 4 weeks felt heavy`, `${heavyWeeks} sa huling 4 na linggo ang mabigat`)

  const [w0, w1, w2] = a.weekAvgs
  if (w0 !== null && w1 !== null && w2 !== null && w0 < w1 && w1 < w2 && w2 - w0 >= 0.6 && w0 <= 1) add('each week heavier than the one before', 'bawat linggo ay mas mabigat kaysa sa nauna')

  const heavyRun = a.heavyRuns.find((r) => r.daysAgo <= 3 && r.length >= 10)
  if (heavyRun && !recentRedRun) add(`${heavyRun.length} days in a row without a steady day`, `${heavyRun.length} araw na walang maayos na araw`)

  const hope = a.feelings.find((f) => f.slug === 'hopelessness')
  const numb = a.feelings.find((f) => f.slug === 'emotional-numbness')
  if ((hope?.n14 || 0) >= 2 || (hope?.n14 || 0) + (numb?.n14 || 0) >= 3) add('feeling hopeless or numb more than once lately', 'paulit-ulit na pakiramdam na walang pag-asa o manhid')

  return reasons.length ? { reasons, strong: reasons.length >= 2 || !!recentRedRun } : null
}
