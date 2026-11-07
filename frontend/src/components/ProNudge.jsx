import { useEffect } from 'react'
import { track } from '../lib/track'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Icon from './Icon'
import { useJournal } from '../lib/journal'
import { useLocal } from '../lib/local'
import { professionalSignal } from '../lib/patterns'
import { addDays, iso } from '../lib/dates'
import { useI18n } from '../lib/i18n'

// Gentle, dismissible nudge toward professional help when check-in patterns stay heavy.
// "Not now" hides it for 5 days; it comes back only if the pattern is still there.
export function ProNudgeView({ entries, variant = 'home' }) {
  const { t, lang } = useI18n()
  const [snooze, setSnooze] = useLocal('agk_pro_snooze', null)
  const sig = professionalSignal(entries)
  const show = !!sig && !(snooze && snooze > iso(new Date()))
  useEffect(() => { if (show && variant === 'home') track('nudge_shown') }, [show, variant])
  if (!show) return null
  const L = lang === 'fil' ? 'fil' : 'en'
  const reasons = sig.reasons.slice(0, 2).map((r) => r[L]).join(lang === 'fil' ? ' at ' : ' and ')
  const home = variant === 'home'
  return (
    <motion.aside role="note" initial={{ opacity: 0, y: home ? -8 : 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className={`no-print relative w-full rounded-2xl bg-sky-soft text-left ring-1 ring-sky-ink/20 ${home ? 'max-w-xl px-5 py-4' : 'px-6 py-5'}`}>
      <div className="flex items-start gap-3.5">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-talkbtn text-white"><Icon name="users" size={17} /></span>
        <div className="min-w-0 flex-1">
          <p className="font-bold leading-snug">{t('pro_title')}</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">{t('pro_noticed')} {reasons}. {!home && t('pro_body')}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link to="/help/professional" data-track="nudge_click" className="inline-flex items-center gap-1.5 rounded-full bg-talkbtn px-4 py-2 text-sm font-semibold text-white transition hover:bg-talkbtn-hover">
              {t('pro_cta')} <Icon name="arrow" size={15} />
            </Link>
            <button onClick={() => { track('nudge_snooze'); setSnooze(iso(addDays(new Date(), 5))) }} className="text-sm font-semibold text-ink-muted hover:text-ink">{t('pro_later')}</button>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}

export default function ProNudge({ variant }) {
  const { entries, loading } = useJournal()
  if (loading) return null
  return <ProNudgeView entries={entries} variant={variant} />
}
