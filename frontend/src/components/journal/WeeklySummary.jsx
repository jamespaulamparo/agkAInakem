import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Icon from '../Icon'
import { MOODS, feelingLabel } from '../../lib/feelings'
import { weekSummary } from '../../lib/insights'
import { addDays, fmt, parse } from '../../lib/dates'
import { useI18n } from '../../lib/i18n'

export default function WeeklySummary({ entries, anyDay }) {
  const { t, lang } = useI18n()
  const s = weekSummary(entries, anyDay)
  const L = lang === 'fil' ? 'fil' : 'en'
  const range = `${fmt(s.start, lang, { month: 'short', day: 'numeric' })} – ${fmt(addDays(s.start, 6), lang, { month: 'short', day: 'numeric' })}`
  return (
    <section aria-labelledby="ws-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="ws-title" className="text-2xl font-bold">{t('summary')}</h2>
        <span className="text-sm text-ink-muted">{range}</span>
      </div>
      <p className="mt-1 text-xs text-ink-faint">{t('summary_note')}</p>

      {/* the week at a glance */}
      <div className="mt-6 flex items-end gap-2">
        {s.days.map((d, i) => {
          const e = entries[d]
          return (
            <div key={d} className="flex flex-1 flex-col items-center gap-1.5">
              <motion.span className="w-full max-w-[40px] rounded-full" initial={{ height: 0 }} animate={{ height: e ? 40 : 10 }} transition={{ delay: i * 0.05 }}
                style={{ background: e ? MOODS[e.mood].fill : '#ECEFEC' }} />
              <span className="text-[0.7rem] font-semibold text-ink-faint">{fmt(parse(d), lang, { weekday: 'narrow' })}</span>
            </div>
          )
        })}
      </div>

      {s.logged > 0 && (
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {['green', 'yellow', 'red'].filter((m) => s.counts[m]).map((m) => (
            <span key={m} className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: MOODS[m].fill }} />{t(MOODS[m].label)} · {s.counts[m]}</span>
          ))}
        </div>
      )}

      {s.topFeelings.length > 0 && (
        <p className="mt-4 text-sm text-ink-muted">
          {lang === 'fil' ? 'Madalas lumabas:' : 'Came up often:'}{' '}
          {s.topFeelings.map(([slug, n], i) => (
            <span key={slug}><Link to={`/dictionary/${slug}`} className="word text-base italic text-teal-ink hover:underline">{feelingLabel(slug, lang)}</Link> ×{n}{i < s.topFeelings.length - 1 ? ', ' : ''}</span>
          ))}
        </p>
      )}

      <ul className="mt-5 space-y-3">
        {s.notes.map((n, i) => (
          <li key={i} className="flex gap-3">
            <Icon name="sparkle" size={16} className="mt-1 shrink-0 text-teal" />
            <span>{n[L]} {n.link && <Link to={n.link} className="ml-1 font-semibold text-teal-ink">{n.cta[lang === 'fil' ? 1 : 0]} →</Link>}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
