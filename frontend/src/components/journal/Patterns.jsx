import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { analyse } from '../../lib/patterns'
import { MOODS, feelingLabel } from '../../lib/feelings'
import { useI18n } from '../../lib/i18n'

// 30-day pattern summary: counts, stretches, feelings and week-by-week shape. No scores, no diagnosis.
export default function Patterns({ entries, print = false }) {
  const { t, lang } = useI18n()
  const fil = lang === 'fil'
  const P = analyse(entries)
  if (P.last30.length < 3) return null
  const n = P.last30.length
  const facts = []
  const add = (en, f) => facts.push(fil ? f : en)

  if (P.longestGreen.length >= 2) add(`Longest steady stretch: ${P.longestGreen.length} days.`, `Pinakamahabang maayos na tuloy-tuloy: ${P.longestGreen.length} araw.`)
  if (P.longestRed.length >= 2) add(`Longest run of hard days: ${P.longestRed.length} days.`, `Pinakamahabang tuloy-tuloy na mahirap na araw: ${P.longestRed.length} araw.`)
  else if (P.longestHeavy.length >= 4) add(`Longest stretch without a steady day: ${P.longestHeavy.length} days.`, `Pinakamahabang walang maayos na araw: ${P.longestHeavy.length} araw.`)
  if (P.bounces) add(`Bounced back from a hard day within 3 days: ${P.bounces} time${P.bounces > 1 ? 's' : ''}.`, `Nakabawi mula sa mahirap na araw sa loob ng 3 araw: ${P.bounces} beses.`)
  if (P.weekday !== null && P.weekend !== null && Math.abs(P.weekday - P.weekend) >= 0.5)
    add(P.weekday < P.weekend ? 'Weekdays tend to be heavier than weekends.' : 'Weekends tend to be heavier than weekdays.', P.weekday < P.weekend ? 'Mas mabigat ang mga araw ng pasok kaysa weekend.' : 'Mas mabigat ang weekend kaysa sa ibang araw.')
  const withMood = P.feelings.filter((f) => f.n >= 2)
  const light = withMood.filter((f) => f.mean >= 1.5).sort((a, b) => b.mean - a.mean)[0]
  const heavy = withMood.filter((f) => f.mean <= 0.5).sort((a, b) => a.mean - b.mean)[0]
  if (light) add(`“${feelingLabel(light.slug, 'en')}” shows up on your steadier days.`, `Lumalabas ang “${feelingLabel(light.slug, 'fil')}” sa mas maayos mong mga araw.`)
  if (heavy) add(`“${feelingLabel(heavy.slug, 'en')}” shows up on your harder days.`, `Lumalabas ang “${feelingLabel(heavy.slug, 'fil')}” sa mas mahirap mong mga araw.`)
  const pair = Object.entries(P.pairs).sort((a, b) => b[1] - a[1])[0]
  if (pair && pair[1] >= 2) { const [x, y] = pair[0].split('|'); add(`“${feelingLabel(x, 'en')}” and “${feelingLabel(y, 'en')}” often come together (${pair[1]} times).`, `Madalas magkasama ang “${feelingLabel(x, 'fil')}” at “${feelingLabel(y, 'fil')}” (${pair[1]} beses).`) }

  const weeks = [...P.weekAvgs].reverse()   // oldest → newest
  const known = weeks.filter((v) => v !== null)
  let shape = null
  if (known.length >= 3) {
    const d = known[known.length - 1] - known[0]
    shape = d >= 0.4 ? (fil ? 'gumagaan' : 'getting lighter') : d <= -0.4 ? (fil ? 'bumibigat' : 'getting heavier') : (fil ? 'halos pareho' : 'about the same')
  }

  return (
    <section aria-labelledby="pt-title" className={print ? 'break-inside-avoid' : ''}>
      <h2 id="pt-title" className="text-2xl font-bold">{t('patterns_title')}</h2>
      <p className="mt-1 text-xs text-ink-faint">{t('patterns_note')}</p>

      <div className="mt-5">
        <p className="text-sm font-semibold">{fil ? `${n} check-in` : `${n} check-ins`}</p>
        <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-line" role="img" aria-label={`${P.counts.green} ${t('mood_green')}, ${P.counts.yellow} ${t('mood_yellow')}, ${P.counts.red} ${t('mood_red')}`}>
          {['green', 'yellow', 'red'].map((m) => P.counts[m] > 0 && (
            <motion.span key={m} style={{ background: MOODS[m].fill }} initial={{ width: 0 }} animate={{ width: `${(P.counts[m] / n) * 100}%` }} transition={{ duration: 0.8 }} />
          ))}
        </div>
        <div className="mt-2 flex gap-4 text-xs text-ink-muted">
          {['green', 'yellow', 'red'].map((m) => <span key={m} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: MOODS[m].fill }} />{P.counts[m]} {t(MOODS[m].label)}</span>)}
        </div>
      </div>

      {known.length >= 2 && (
        <div className="mt-6 flex items-end gap-4">
          <div className="flex h-14 items-end gap-2" aria-hidden="true">
            {weeks.map((v, i) => (
              <motion.span key={i} className="w-6 rounded-t-md" style={{ background: v === null ? 'rgb(var(--line))' : v >= 1.4 ? MOODS.green.fill : v >= 0.7 ? MOODS.yellow.fill : MOODS.red.fill }}
                initial={{ height: 4 }} animate={{ height: v === null ? 4 : 10 + (v / 2) * 46 }} transition={{ delay: i * 0.08 }} />
            ))}
          </div>
          <p className="pb-1 text-sm text-ink-muted">{fil ? 'Bawat linggo, luma → bago' : 'Week by week, oldest → newest'}{shape && <><br /><span className="font-semibold text-ink">{shape}</span></>}</p>
        </div>
      )}

      {P.feelings.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {P.feelings.slice(0, 5).map((f) => (
            <Link key={f.slug} to={`/dictionary/${f.slug}`} className="rounded-full px-3 py-1 text-sm ring-1 ring-line hover:ring-teal">
              <span className="word italic">{feelingLabel(f.slug, lang)}</span> <span className="text-ink-faint">×{f.n}</span>
            </Link>
          ))}
        </div>
      )}

      {facts.length > 0 && (
        <ul className="mt-6 space-y-2 text-sm leading-relaxed">
          {facts.map((f) => <li key={f} className="flex gap-2.5"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-ink" />{f}</li>)}
        </ul>
      )}
    </section>
  )
}
