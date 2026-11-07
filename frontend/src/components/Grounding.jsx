import { track } from '../lib/track'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from './Icon'
import { useI18n } from '../lib/i18n'

// Feet on the floor, then 5-4-3-2-1. One step per screen; skippable at any point.
const STEPS = [
  { n: null, icon: 'user', key: 'g_feet' },
  { n: 5, icon: 'eye', key: 'g_see' },
  { n: 4, icon: 'hand', key: 'g_touch' },
  { n: 3, icon: 'ear', key: 'g_hear' },
  { n: 2, icon: 'nose', key: 'g_smell' },
  { n: 1, icon: 'drop', key: 'g_taste' },
]

export default function Grounding({ speak, onFinish }) {
  const { t } = useI18n()
  const [i, setI] = useState(0)
  const s = STEPS[i]
  useEffect(() => { speak?.(t(s.key)) }, [i]) // eslint-disable-line react-hooks/exhaustive-deps
  const next = () => (i === STEPS.length - 1 ? (track('grounding_done'), onFinish?.()) : setI(i + 1))
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35 }}>
          <div className="relative mx-auto flex h-36 w-36 items-center justify-center">
            <motion.span className="absolute inset-0 rounded-full bg-teal-soft" initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.4 }} />
            {s.n ? <span className="word relative text-7xl text-teal-ink">{s.n}</span> : <Icon name={s.icon} size={56} className="relative text-teal-ink" />}
            {s.n && <span className="absolute -bottom-1 -right-1 flex h-11 w-11 items-center justify-center rounded-full bg-surface text-teal-ink shadow-soft"><Icon name={s.icon} size={22} /></span>}
          </div>
          <p className="mx-auto mt-6 max-w-sm text-xl font-semibold leading-snug sm:text-2xl">{t(s.key)}</p>
        </motion.div>
      </AnimatePresence>
      <div className="mt-8 flex items-center gap-3">
        <button onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} className="btn-ghost">{t('back')}</button>
        <div className="flex gap-1.5">{STEPS.map((_, j) => <span key={j} className={`h-1.5 rounded-full transition-all ${j === i ? 'w-6 bg-teal' : 'w-1.5 bg-line'}`} />)}</div>
        <button onClick={next} className="btn-primary">{i === STEPS.length - 1 ? t('done') : t('next')}</button>
      </div>
    </div>
  )
}
