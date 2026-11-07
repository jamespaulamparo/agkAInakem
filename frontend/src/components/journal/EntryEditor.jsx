import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from '../Icon'
import { FEELINGS, MOODS } from '../../lib/feelings'
import { iso, parse, todayIso, fmt } from '../../lib/dates'
import { useI18n } from '../../lib/i18n'

export function MoodFace({ mood, size = 64, selected, dim }) {
  const m = MOODS[mood]
  const mouth = { green: 'M22 38 Q32 46 42 38', yellow: 'M22 41 L42 41', red: 'M22 44 Q32 36 42 44' }[mood]
  return (
    <motion.svg width={size} height={size} viewBox="0 0 64 64" animate={{ scale: selected ? 1.1 : dim ? 0.9 : 1, opacity: dim ? 0.45 : 1 }} aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill={m.fill} stroke={selected ? m.ink : 'transparent'} strokeWidth="3" />
      <circle cx="24" cy="27" r="2.6" fill="#263A38" /><circle cx="40" cy="27" r="2.6" fill="#263A38" />
      <path d={mouth} stroke="#263A38" strokeWidth="3" fill="none" strokeLinecap="round" />
    </motion.svg>
  )
}

/*
 * Add or edit the check-in for any day (defaults to today; past days can be picked).
 * `onSaved(entry)` lets callers react (e.g. show a gentle reply).
 */
export default function EntryEditor({ journal, date, setDate, onSaved, compact = false }) {
  const { t, lang } = useI18n()
  const existing = journal.entries[date]
  const [mood, setMood] = useState(existing?.mood || null)
  const [feelings, setFeelings] = useState(existing?.feelings || [])
  const [note, setNote] = useState(existing?.note || '')
  const [status, setStatus] = useState(null)

  useEffect(() => {
    setMood(existing?.mood || null); setFeelings(existing?.feelings || []); setNote(existing?.note || ''); setStatus(null)
  }, [date, existing?.updated_at]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleFeeling = (slug) => setFeelings((f) => (f.includes(slug) ? f.filter((x) => x !== slug) : [...f, slug].slice(0, 8)))
  const save = async () => {
    try {
      await journal.save(date, { mood, feelings, note })
      setStatus('saved')
      onSaved?.({ date, mood, feelings, note })
    } catch { setStatus('error') }
  }
  const shift = (n) => { const d = parse(date); d.setDate(d.getDate() + n); if (iso(d) <= todayIso()) setDate(iso(d)) }

  return (
    <div>
      {setDate && (
        <div className="mb-6 flex items-center justify-center gap-2">
          <button onClick={() => shift(-1)} className="rounded-full p-2 text-ink-muted hover:bg-ink/5" aria-label="Previous day"><Icon name="arrowLeft" size={18} /></button>
          <label className="relative">
            <span className="sr-only">{t('j_date')}</span>
            <input type="date" value={date} max={todayIso()} onChange={(e) => e.target.value && setDate(e.target.value)}
              className="cursor-pointer rounded-full bg-surface px-4 py-2 text-center text-sm font-semibold ring-1 ring-line focus:outline-none focus:ring-teal" />
          </label>
          <button onClick={() => shift(1)} disabled={date >= todayIso()} className="rounded-full p-2 text-ink-muted hover:bg-ink/5 disabled:opacity-30" aria-label="Next day"><Icon name="arrow" size={18} /></button>
          {date !== todayIso() && <button onClick={() => setDate(todayIso())} className="text-xs font-semibold text-teal-ink">{t('today')}</button>}
        </div>
      )}
      {!setDate && <p className="mb-4 text-center text-sm text-ink-muted">{fmt(parse(date), lang, { weekday: 'long', month: 'long', day: 'numeric' })}</p>}

      <div className="flex justify-center gap-5 sm:gap-10">
        {['green', 'yellow', 'red'].map((m) => (
          <button key={m} onClick={() => { setMood(m); setStatus(null) }} aria-pressed={mood === m} className="flex flex-col items-center gap-2">
            <MoodFace mood={m} size={compact ? 64 : 76} selected={mood === m} dim={mood && mood !== m} />
            <span className={`text-sm font-semibold ${mood === m ? 'text-ink' : 'text-ink-muted'}`}>{t(MOODS[m].label)}</span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {mood && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <p className="mt-8 text-center text-sm font-semibold text-ink-muted">{t('j_feelings')}</p>
            <div className="mx-auto mt-3 flex max-w-xl flex-wrap justify-center gap-2">
              {FEELINGS.map((f) => (
                <button key={f.slug} onClick={() => toggleFeeling(f.slug)} aria-pressed={feelings.includes(f.slug)}
                  className={`word rounded-full px-3.5 py-1 text-lg italic transition ${feelings.includes(f.slug) ? 'bg-teal-ink text-white' : 'text-ink-muted ring-1 ring-line hover:text-ink'}`}>
                  {lang === 'fil' ? f.fil : f.en}
                </button>
              ))}
            </div>
            {!compact && (
              <textarea rows={2} maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('j_note')} aria-label={t('j_note')}
                className="field mx-auto mt-6 block max-w-xl" />
            )}
            <div className="mt-6 flex items-center justify-center gap-3">
              <button onClick={save} className="btn-primary px-7">{existing ? t('j_update') : t('j_save')}</button>
              {existing && !compact && <button onClick={() => journal.remove(date)} className="btn-ghost text-ink-muted">{t('j_delete')}</button>}
            </div>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-faint" aria-live="polite">
              {status === 'saved' && <Icon name="check" size={14} className="text-sage-ink" />}
              {status === 'saved' ? t('j_saved') + ' ' : ''}
              {status === 'error' ? 'Could not save. Please try again.' : journal.mode === 'account' ? t('j_account') : <>{t('j_local')} <Link to="/login" className="font-semibold text-teal-ink">{t('j_local_cta')}</Link></>}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
