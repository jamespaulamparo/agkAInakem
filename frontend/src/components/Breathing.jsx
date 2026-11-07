import { track } from '../lib/track'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../lib/i18n'

// 4-4-6 paced breathing. Optional; stops whenever the person wants.
const PHASES = [
  { key: 'breathe_in', secs: 4, scale: 1 },
  { key: 'hold', secs: 4, scale: 1 },
  { key: 'breathe_out', secs: 6, scale: 0.55 },
]

export default function Breathing({ speak, onFinish, rounds: target = 4 }) {
  const { t } = useI18n()
  const [running, setRunning] = useState(false)
  const [st, setSt] = useState({ phase: 0, left: PHASES[0].secs, rounds: 0 })
  const timer = useRef(null)

  useEffect(() => {
    if (!running) return
    timer.current = setInterval(() => {
      setSt(({ phase, left, rounds }) => {
        if (left > 1) return { phase, left: left - 1, rounds }
        const n = (phase + 1) % PHASES.length
        return { phase: n, left: PHASES[n].secs, rounds: n === 0 ? rounds + 1 : rounds }
      })
    }, 1000)
    return () => clearInterval(timer.current)
  }, [running])

  // Speak each phase change; finish after the target number of rounds.
  useEffect(() => { if (running) speak?.(t(PHASES[st.phase].key)) }, [st.phase, running]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (running && st.rounds >= target) { setRunning(false); track('breathe_done'); onFinish?.() }
  }, [st.rounds]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = () => {
    if (running) onFinish?.()
    setSt({ phase: 0, left: PHASES[0].secs, rounds: 0 })
    if (!running) track('breathe_start')
    setRunning(!running)
  }
  const { phase, left, rounds } = st
  const p = PHASES[phase]
  return (
    <div className="flex flex-col items-center">
      <button type="button" onClick={toggle} aria-label={running ? t('stop') : t('start')}
        className="relative flex aspect-square w-[min(72vw,300px)] items-center justify-center rounded-full focus-visible:outline-offset-8">
        <motion.span className="absolute inset-0 rounded-full bg-sky-soft" animate={{ scale: running ? (p.scale === 1 ? 1 : 0.7) : 0.8 }} transition={{ duration: running ? p.secs : 0.6, ease: 'easeInOut' }} />
        <motion.span className="absolute inset-[18%] rounded-full bg-teal/85" animate={{ scale: running ? p.scale : 0.7 }} transition={{ duration: running ? p.secs : 0.6, ease: 'easeInOut' }} />
        <span className="relative text-center text-white" aria-live="polite">
          {running ? (<>
            <span className="block text-lg font-semibold">{t(p.key)}</span>
            <span className="word block text-5xl">{left}</span>
          </>) : <span className="block text-xl font-semibold">{t('start')}</span>}
        </span>
      </button>
      {running && (
        <div className="mt-6 flex items-center gap-4">
          <div className="flex gap-1.5">{Array.from({ length: target }).map((_, i) => <span key={i} className={`h-1.5 w-6 rounded-full ${i < rounds ? 'bg-teal' : 'bg-line'}`} />)}</div>
          <button onClick={toggle} className="btn-ghost ring-1 ring-line">{t('stop')}</button>
        </div>
      )}
    </div>
  )
}
