import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from '../components/Icon'
import EntryEditor from '../components/journal/EntryEditor'
import { WeekView, MonthView, YearView } from '../components/journal/Calendar'
import WeeklySummary from '../components/journal/WeeklySummary'
import { JournalArt } from '../components/Illustrations'
import { Page, Spinner } from '../components/Layout'
import { useJournal } from '../lib/journal'
import { useLocal } from '../lib/local'
import { MOODS, feelingLabel } from '../lib/feelings'
import { addDays, fmt, iso, parse, startOfWeek, todayIso } from '../lib/dates'
import { useI18n } from '../lib/i18n'
import { useAuth } from '../lib/auth'

function MoveBanner({ journal }) {
  const { t } = useI18n()
  const [done, setDone] = useState(null)
  if (journal.mode !== 'account' || (!journal.localCount && !done)) return null
  return (
    <div className="mb-8 flex flex-wrap items-center justify-center gap-3 rounded-lg bg-sky-soft px-4 py-3 text-sm">
      {done ? <span>{t('j_moved')} ({done.created})</span> : (<>
        <span>{journal.localCount} ·</span>
        <button onClick={async () => setDone(await journal.moveLocal())} className="font-semibold text-sky-ink underline underline-offset-4">{t('j_move')}</button>
      </>)}
    </div>
  )
}

export default function Journal() {
  const { t, lang } = useI18n()
  const { user } = useAuth()
  const journal = useJournal()
  const [date, setDate] = useState(todayIso())
  const [view, setView] = useLocal('agk_journal_view', 'month')
  const [cursor, setCursor] = useState(new Date())
  const [showSummary, setShowSummary] = useLocal('agk_weekly_summary', true)

  const step = (n) => {
    const c = new Date(cursor)
    if (view === 'week') c.setDate(c.getDate() + 7 * n)
    if (view === 'month') c.setMonth(c.getMonth() + n, 1)
    if (view === 'year') c.setFullYear(c.getFullYear() + n)
    setCursor(c)
  }
  const pick = (d) => { setDate(d); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const label = view === 'week'
    ? `${fmt(startOfWeek(cursor), lang, { month: 'short', day: 'numeric' })} – ${fmt(addDays(startOfWeek(cursor), 6), lang, { month: 'short', day: 'numeric', year: 'numeric' })}`
    : view === 'month' ? fmt(cursor, lang, { month: 'long', year: 'numeric' }) : String(cursor.getFullYear())

  // entries inside the visible period, newest first
  const archive = useMemo(() => {
    let a, b
    if (view === 'week') { a = startOfWeek(cursor); b = addDays(a, 6) }
    else if (view === 'month') { a = new Date(cursor.getFullYear(), cursor.getMonth(), 1); b = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0) }
    else { a = new Date(cursor.getFullYear(), 0, 1); b = new Date(cursor.getFullYear(), 11, 31) }
    return Object.values(journal.entries).filter((e) => e.date >= iso(a) && e.date <= iso(b)).sort((x, y) => (x.date < y.date ? 1 : -1))
  }, [journal.entries, view, cursor])

  if (journal.loading) return <Spinner />
  const empty = Object.keys(journal.entries).length === 0

  return (
    <Page className="pt-10 sm:pt-14">
      <div className="mx-auto max-w-3xl">
        <MoveBanner journal={journal} />
        <h1 className="text-center text-3xl font-extrabold sm:text-5xl">{t('j_today_q')}</h1>
        <div className="mt-8"><EntryEditor journal={journal} date={date} setDate={setDate} /></div>
      </div>

      {empty ? (
        <div className="mx-auto mt-20 max-w-xs text-center">
          <JournalArt />
          <p className="mt-4 text-ink-muted">{t('no_entries')}</p>
          {!user && <Link to="/login" className="mt-2 inline-block text-sm font-semibold text-teal-ink">{t('j_local_cta')} →</Link>}
        </div>
      ) : (
        <div className="mx-auto mt-24 max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
            <div className="flex items-center gap-1">
              <button onClick={() => step(-1)} className="rounded-full p-2 hover:bg-ink/5" aria-label="Previous"><Icon name="arrowLeft" size={18} /></button>
              <h2 className="min-w-[10rem] text-center text-lg font-bold capitalize">{label}</h2>
              <button onClick={() => step(1)} className="rounded-full p-2 hover:bg-ink/5" aria-label="Next"><Icon name="arrow" size={18} /></button>
            </div>
            <div className="flex rounded-full bg-ink/5 p-1 text-sm" role="tablist">
              {['week', 'month', 'year'].map((v) => (
                <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)} className={`relative rounded-full px-4 py-1.5 font-semibold ${view === v ? 'text-ink' : 'text-ink-muted'}`}>
                  {view === v && <motion.span layoutId="jview" className="absolute inset-0 rounded-full bg-surface shadow-soft" />}
                  <span className="relative">{t(v)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <AnimatePresence mode="wait">
              <motion.div key={view} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {view === 'week' && <WeekView cursor={cursor} entries={journal.entries} selected={date} onPick={pick} />}
                {view === 'month' && <MonthView cursor={cursor} entries={journal.entries} selected={date} onPick={pick} />}
                {view === 'year' && <YearView cursor={cursor} entries={journal.entries} onPickMonth={(d) => { setCursor(d); setView('month') }} />}
              </motion.div>
            </AnimatePresence>
            <div className="mt-6 flex justify-center gap-5 text-xs text-ink-muted">
              {['green', 'yellow', 'red'].map((m) => <span key={m} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: MOODS[m].fill }} />{t(MOODS[m].label)}</span>)}
            </div>
          </div>

          <div className="mt-20 grid gap-16 lg:grid-cols-[1fr_1fr]">
            <div>
              <label className="mb-6 flex cursor-pointer items-center gap-3 text-sm font-semibold text-ink-muted">
                <span className={`relative h-6 w-11 rounded-full transition ${showSummary ? 'bg-teal-ink' : 'bg-line'}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${showSummary ? 'left-[22px]' : 'left-0.5'}`} />
                </span>
                <input type="checkbox" className="sr-only" checked={showSummary} onChange={(e) => setShowSummary(e.target.checked)} />
                {t('summary_toggle')}
              </label>
              {showSummary && <WeeklySummary entries={journal.entries} anyDay={view === 'week' ? cursor : parse(date)} />}
            </div>
            <section>
              <h2 className="text-2xl font-bold">{t('archive')}</h2>
              {archive.length === 0 ? <p className="mt-4 text-ink-muted">{t('no_entries')}</p> : (
                <ul className="mt-4 divide-y divide-line border-y border-line">
                  {archive.slice(0, 60).map((e) => (
                    <li key={e.date}>
                      <button onClick={() => pick(e.date)} className="flex w-full items-start gap-4 py-4 text-left hover:bg-surface/60">
                        <span className="mt-1 h-4 w-4 shrink-0 rounded-full" style={{ background: MOODS[e.mood].fill }} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold">{fmt(parse(e.date), lang, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          {e.feelings?.length > 0 && <span className="word block italic text-ink-muted">{e.feelings.map((f) => feelingLabel(f, lang)).join(', ')}</span>}
                          {e.note && <span className="mt-0.5 block truncate text-sm text-ink-faint">{e.note}</span>}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}
    </Page>
  )
}
