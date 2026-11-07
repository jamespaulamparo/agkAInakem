import { track } from '../lib/track'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from './Icon'
import { useLocal } from '../lib/local'
import { useJournal } from '../lib/journal'
import { todayIso } from '../lib/dates'
import { useI18n } from '../lib/i18n'

// { on: boolean, time: 'HH:MM', shown: 'YYYY-MM-DD' }
export const useReminder = () => useLocal('agk_reminder', { on: false, time: '20:00', shown: '' })

export function ReminderSettings() {
  const { t } = useI18n()
  const [r, setR] = useReminder()
  const toggle = async (on) => {
    setR({ ...r, on })
    if (on && 'Notification' in window && Notification.permission === 'default') {
      try { await Notification.requestPermission() } catch { /* optional */ }
      track('reminder_on')
    }
  }
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <label className="flex cursor-pointer items-center gap-3 font-semibold text-ink-muted">
        <span className={`relative h-6 w-11 rounded-full transition ${r.on ? 'bg-teal-ink' : 'bg-line'}`}>
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface shadow transition-all ${r.on ? 'left-[22px]' : 'left-0.5'}`} />
        </span>
        <input type="checkbox" className="sr-only" checked={r.on} onChange={(e) => toggle(e.target.checked)} />
        <Icon name="bell" size={15} />{t('reminder')}
      </label>
      {r.on && <input type="time" value={r.time} onChange={(e) => setR({ ...r, time: e.target.value || '20:00' })} aria-label={t('reminder')}
        className="rounded-full bg-surface px-3 py-1 font-semibold ring-1 ring-line focus:outline-none focus:ring-teal" />}
      {r.on && <span className="w-full text-xs text-ink-faint">{t('reminder_note')}</span>}
    </div>
  )
}

// Gentle in-app nudge (and a browser notification if allowed) once a day after the chosen time,
// only if there is no check-in yet today.
export default function ReminderBanner() {
  const { t } = useI18n()
  const { pathname } = useLocation()
  const [r, setR] = useReminder()
  const journal = useJournal()
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(id) }, [])
  const today = todayIso()
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const due = r.on && !journal.loading && hhmm >= r.time && r.shown !== today && !journal.entries[today]

  useEffect(() => {
    if (due && document.hidden && 'Notification' in window && Notification.permission === 'granted') {
      try { new Notification('agkAInakem', { body: t('reminder_due'), icon: '/static/icon-192.png', tag: 'agk-reminder' }) } catch { /* ignore */ }
    }
  }, [due]) // eslint-disable-line react-hooks/exhaustive-deps

  const dismiss = () => setR({ ...r, shown: today })
  return (
    <AnimatePresence>
      {due && pathname !== '/journal' && pathname !== '/help/emergency' && (
        <motion.div role="status" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
          className="fixed bottom-20 left-1/2 z-40 flex w-[min(92vw,440px)] -translate-x-1/2 items-center gap-3 rounded-xl bg-surface p-4 shadow-lift ring-1 ring-line no-print">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-soft text-teal-ink"><Icon name="bell" size={18} /></span>
          <p className="flex-1 text-sm font-semibold">{t('reminder_due')}</p>
          <Link to="/journal" onClick={dismiss} className="btn-primary px-4 py-2">{t('reminder_go')}</Link>
          <button onClick={dismiss} className="text-sm text-ink-faint hover:text-ink">{t('later')}</button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
