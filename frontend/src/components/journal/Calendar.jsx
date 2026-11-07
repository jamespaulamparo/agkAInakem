import { motion } from 'framer-motion'
import { MOODS } from '../../lib/feelings'
import { addDays, iso, startOfWeek, todayIso, fmt } from '../../lib/dates'
import { useI18n } from '../../lib/i18n'

const dot = (e) => (e ? MOODS[e.mood].fill : 'transparent')

function DayCell({ d, entry, selected, onPick, outside, size = 'md' }) {
  const id = iso(d)
  const future = id > todayIso()
  const isToday = id === todayIso()
  return (
    <button disabled={future} onClick={() => onPick(id)} aria-label={`${id}${entry ? ` · ${entry.mood}` : ''}`} aria-pressed={selected}
      className={`group relative flex aspect-square items-center justify-center rounded-full text-sm transition ${outside ? 'opacity-30' : ''} ${future ? 'cursor-default opacity-30' : 'hover:ring-2 hover:ring-teal/40'} ${selected ? 'ring-2 ring-ink' : ''}`}
      style={{ background: dot(entry) }}>
      <span className={`${size === 'lg' ? 'text-base' : 'text-xs'} ${isToday ? 'font-extrabold text-ink underline decoration-2 underline-offset-2' : entry ? 'font-semibold text-ink' : 'text-ink-muted'}`}>{d.getDate()}</span>
    </button>
  )
}

const WEEKDAYS = (lang) => Array.from({ length: 7 }, (_, i) => fmt(addDays(new Date(2024, 0, 1), i), lang, { weekday: 'narrow' }))

export function WeekView({ cursor, entries, selected, onPick }) {
  const { lang } = useI18n()
  const start = startOfWeek(cursor)
  return (
    <div className="grid grid-cols-7 gap-2 sm:gap-4">
      {Array.from({ length: 7 }, (_, i) => addDays(start, i)).map((d) => (
        <div key={iso(d)} className="flex flex-col items-center gap-2">
          <span className="text-xs font-semibold uppercase text-ink-faint">{fmt(d, lang, { weekday: 'short' })}</span>
          <div className="w-full max-w-[72px]"><DayCell d={d} entry={entries[iso(d)]} selected={selected === iso(d)} onPick={onPick} size="lg" /></div>
        </div>
      ))}
    </div>
  )
}

export function MonthView({ cursor, entries, selected, onPick }) {
  const { lang } = useI18n()
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const start = startOfWeek(first)
  const cells = Array.from({ length: 42 }, (_, i) => addDays(start, i))
  const rows = cells[35].getMonth() !== cursor.getMonth() ? cells.slice(0, 35) : cells
  return (
    <div className="mx-auto max-w-md">
      <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-ink-faint">{WEEKDAYS(lang).map((w, i) => <span key={i}>{w}</span>)}</div>
      <motion.div key={iso(first)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-7 gap-1.5">
        {rows.map((d) => <DayCell key={iso(d)} d={d} entry={entries[iso(d)]} selected={selected === iso(d)} onPick={onPick} outside={d.getMonth() !== cursor.getMonth()} />)}
      </motion.div>
    </div>
  )
}

export function YearView({ cursor, entries, onPickMonth }) {
  const { lang } = useI18n()
  const y = cursor.getFullYear()
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 12 }, (_, m) => {
        const first = new Date(y, m, 1)
        const start = startOfWeek(first)
        const days = Array.from({ length: 42 }, (_, i) => addDays(start, i))
        return (
          <button key={m} onClick={() => onPickMonth(first)} className="rounded-md p-2 text-left hover:bg-surface">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-muted">{fmt(first, lang, { month: 'short' })}</p>
            <div className="grid grid-cols-7 gap-[3px]">
              {days.map((d) => {
                const inMonth = d.getMonth() === m
                const e = inMonth && entries[iso(d)]
                return <span key={iso(d)} className="aspect-square rounded-[3px]" style={{ background: !inMonth ? 'transparent' : e ? MOODS[e.mood].fill : 'rgb(var(--line))' }} />
              })}
            </div>
          </button>
        )
      })}
    </div>
  )
}
