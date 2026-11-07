import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from './Icon'
import { useFollowUp } from '../lib/local'
import { useI18n } from '../lib/i18n'

// Offer: "Want a gentle check-in later?" — stored only in this browser.
export function FollowUpOffer({ onDone }) {
  const { t } = useI18n()
  const [, setFollow] = useFollowUp()
  const [set, setSet] = useState(false)
  const schedule = (when) => {
    const d = new Date()
    if (when === '1h') d.setHours(d.getHours() + 1)
    if (when === 'tonight') { d.setHours(20, 0, 0, 0); if (d < new Date()) d.setDate(d.getDate() + 1) }
    if (when === 'tomorrow') { d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0) }
    setFollow({ at: d.getTime() })
    setSet(true)
  }
  if (set) return <p className="text-sm text-ink-muted">{t('followup_set')}</p>
  return (
    <div>
      <p className="text-sm text-ink-muted">{t('followup_offer')}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {[['1h', t('in_1h')], ['tonight', t('tonight')], ['tomorrow', t('tomorrow')]].map(([k, l]) => (
          <button key={k} onClick={() => schedule(k)} className="rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-line hover:ring-teal">{l}</button>
        ))}
        <button onClick={onDone} className="rounded-full px-4 py-2 text-sm text-ink-muted hover:text-ink">{t('no_thanks')}</button>
      </div>
    </div>
  )
}

// Banner shown on the next visit after the chosen time. Never notifies anyone else.
export default function FollowUpBanner() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [follow, setFollow] = useFollowUp()
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(id) }, [])
  const due = follow && now >= follow.at
  const answer = (a) => {
    setFollow(null)
    if (a === 'worse') navigate('/help/talk')
    else if (a === 'same') navigate('/help/calm')
  }
  return (
    <AnimatePresence>
      {due && (
        <motion.div role="dialog" aria-labelledby="fu-title" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
          className="fixed bottom-20 left-1/2 z-40 w-[min(92vw,440px)] -translate-x-1/2 rounded-xl bg-surface p-5 shadow-lift ring-1 ring-line">
          <button onClick={() => setFollow(null)} className="absolute right-3 top-3 rounded-full p-1.5 text-ink-faint hover:bg-ink/5" aria-label={t('close')}><Icon name="x" size={16} /></button>
          <p id="fu-title" className="text-lg font-bold">{t('checking_in')}</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[['better', t('f_better'), 'bg-sage-soft'], ['same', t('f_same'), 'bg-sky-soft'], ['worse', t('f_worse'), 'bg-teal-soft']].map(([k, l, c]) => (
              <button key={k} onClick={() => answer(k)} className={`rounded-md px-2 py-3 text-sm font-semibold ${c} hover:brightness-95`}>{l}</button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
