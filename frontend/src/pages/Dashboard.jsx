import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Page, Spinner } from '../components/Layout'
import Icon from '../components/Icon'
import { BarList, ChartCard, LineChart, SegmentedBar, StackedColumns, StatTile } from '../components/viz/Charts'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { feelingLabel } from '../lib/feelings'

const C = { teal: 'rgb(var(--teal-ink))', green: 'var(--viz-green)', yellow: 'var(--viz-yellow)', red: 'var(--viz-red)', s1: 'var(--viz-1)', s2: 'var(--viz-2)', s3: 'var(--viz-3)' }
const MOODS = [['green', 'Doing okay', C.green], ['yellow', 'Stretched', C.yellow], ['red', 'Struggling', C.red]]
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const NAMES = {
  breathe_start: 'Breathing started', breathe_done: 'Breathing finished', grounding_done: '5-4-3-2-1 grounding finished', read_aloud: 'Read-aloud turned on',
  plan_saved: 'Safety plan saved', plan_printed: 'Safety plan printed', contact_added: 'Contact added', text_contact: 'Text to a contact', location_share: 'Location share started',
  followup_set: 'Follow-up set', crisis_shown: 'Crisis message shown', nudge_shown: 'Professional-help nudge shown', nudge_click: 'Nudge → professional help',
  nudge_snooze: 'Nudge “Not now”', professional_print: 'Pattern summary printed', emergency: '911', crisis_line: 'Crisis & mental health lines', hospital: 'Hospital (ITRMC)',
  government: 'Government office', contact: 'Personal contact', guest: 'Without account', account: 'With account', hit: 'Found words', miss: 'No match',
  results: 'Suggested words', none: 'No suggestion', mobile: 'Phone', tablet: 'Tablet', desktop: 'Computer', en: 'English', fil: 'Filipino', light: 'Light', dark: 'Dark', auto: 'Auto',
  everyday: 'Everyday', psychological: 'Psychological', clinical: 'Clinical',
}
const name = (k) => NAMES[k] || k.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase())
const rows = (items, f = name) => ({ columns: ['Item', 'Count'], rows: items.map((i) => [f(i.label), i.n]) })
const parts = (items, colors = [C.s1, C.s2, C.s3]) => items.slice(0, 3).map((i, k) => ({ label: name(i.label), n: i.n, color: colors[k] }))

function StaffLogin() {
  const { login, user } = useAuth()
  const [f, setF] = useState({ email: '', password: '' })
  const [err, setErr] = useState('')
  const submit = async (e) => {
    e.preventDefault(); setErr('')
    try { const r = await login(f); if (!r.user?.is_staff) setErr('This account doesn’t have staff access.') } catch (x) { setErr(x.data?.detail || 'Could not sign in.') }
  }
  return (
    <form onSubmit={submit} className="mx-auto mt-10 max-w-sm space-y-3">
      <p className="text-sm text-ink-muted">{user ? 'You are signed in without staff access. Sign in with an admin account.' : 'For the project team. Sign in with an admin account.'}</p>
      <input className="field" placeholder="Admin username or email" autoComplete="username" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required />
      <input className="field" type="password" placeholder="Password" autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required />
      {err && <p className="text-sm text-alert">{err}</p>}
      <button className="btn-primary w-full py-3">Sign in</button>
    </form>
  )
}

function Section({ title, note, children }) {
  return (
    <section className="border-t border-line py-10">
      <h2 className="text-xl font-bold">{title}</h2>
      {note && <p className="mt-1 max-w-2xl text-sm text-ink-muted">{note}</p>}
      <div className="mt-6 grid gap-10 md:grid-cols-2">{children}</div>
    </section>
  )
}

export default function Dashboard() {
  const { user, ready } = useAuth()
  const [days, setDays] = useState(30)
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)
  const [withDemo, setWithDemo] = useState(true)
  const [tick, setTick] = useState(0)
  const [busy, setBusy] = useState(null)
  useEffect(() => {
    if (!user?.is_staff) return
    setLoading(true)
    api.stats(days, withDemo).then((d) => { setData(d); setErr(null) }).catch(setErr).finally(() => setLoading(false))
  }, [days, withDemo, tick, user?.is_staff])
  const demoAction = async (load) => {
    if (!load && !window.confirm('Remove all sample accounts, journals and usage counts? Real data is not affected.')) return
    setBusy(load ? 'load' : 'clear')
    try { await api.demoData(load); setTick((x) => x + 1) } finally { setBusy(null) }
  }

  if (!ready) return <Spinner />
  if (!user?.is_staff) return <Page className="pt-14"><h1 className="text-center text-4xl font-extrabold">Dashboard</h1><StaffLogin /></Page>
  if (!data) return err ? <Page className="pt-14"><p className="text-alert">Could not load statistics.</p></Page> : <Spinner />

  const h = data.headline, a = data.accounts, r = data.research
  const daily = (k, label, color) => ({ label, color, data: data.daily[k] })
  return (
    <Page className="pb-20 pt-10 sm:pt-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-muted">{new Date(data.range.start).toLocaleDateString()} – {new Date(data.range.end).toLocaleDateString()} · anonymous counts only</p>
        </div>
      </div>

      {/* Filters: one row, above everything they scope */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {[[7, '7 days'], [30, '30 days'], [90, '90 days'], [365, '12 months']].map(([d, l]) => (
          <button key={d} onClick={() => setDays(d)} aria-pressed={days === d}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 ${days === d ? 'bg-ink text-paper ring-ink' : 'text-ink-muted ring-line hover:text-ink'}`}>{l}</button>
        ))}
        <label className="ml-2 flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink-muted">
          <input type="checkbox" checked={withDemo} onChange={(e) => setWithDemo(e.target.checked)} className="h-4 w-4 accent-teal-ink" />Include sample data
        </label>
        <a href={`/api/stats/export.csv?demo=${withDemo ? 1 : 0}`} className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold text-teal-ink ring-1 ring-line hover:ring-teal"><Icon name="download" size={14} />Daily counts (CSV)</a>
      </div>

      {withDemo && data.demo.users > 0 && (
        <p className="mt-4 rounded-lg bg-amber-soft px-4 py-2.5 text-sm text-ink-muted">
          <strong className="text-ink">Includes sample data:</strong> {data.demo.users} made-up accounts ({data.demo.research} opted in to research) and sample usage counts. Untick “Include sample data” to see real data only.
        </p>
      )}
      <div className={`transition-opacity ${loading ? 'opacity-50' : ''}`}>
        <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-5">
          <StatTile label="Visits" value={h.visits} prev={h.visits_prev} />
          <StatTile label="Breathing finished" value={h.breathe_done} prev={h.breathe_done_prev} />
          <StatTile label="Help calls tapped" value={h.calls} prev={h.calls_prev} />
          <StatTile label="Word look-ups" value={h.term_views} prev={h.term_views_prev} />
          <StatTile label="Accounts" value={h.users} hint={`${h.users_new} new in this period`} />
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <ChartCard title="Visits per day" table={{ columns: ['Date', 'Visits'], rows: data.daily.visit.map((d) => [d.date, d.n]) }}>
            <LineChart series={[daily('visit', 'Visits', C.teal)]} />
          </ChartCard>
          <ChartCard title="Help used per day" legend={[['Breathing finished', C.s1, 'line'], ['Check-ins', C.s2, 'line'], ['Calls tapped', C.s3, 'line']]}
            table={{ columns: ['Date', 'Breathing', 'Check-ins', 'Calls'], rows: data.daily.visit.map((d, i) => [d.date, data.daily.breathe_done[i].n, data.daily.checkin_saved[i].n, data.daily.call[i].n]) }}>
            <LineChart series={[daily('breathe_done', 'Breathing finished', C.s1), daily('checkin_saved', 'Check-ins', C.s2), daily('call', 'Calls tapped', C.s3)]} />
          </ChartCard>
        </div>

        <Section title="Getting help" note="How often each help tool is used. Calls are counted by type of line only; numbers dialled are never recorded.">
          <ChartCard title="Help tools" table={rows(data.help)}><BarList items={data.help} format={name} /></ChartCard>
          <div className="space-y-10">
            <ChartCard title="Calls tapped, by type" table={rows(data.calls)}><BarList items={data.calls} format={name} color={C.s1} /></ChartCard>
            <ChartCard title="Safety signals" sub="Crisis words typed (text not stored) and the professional-help nudge" table={rows(data.safety)}><BarList items={data.safety} format={name} color={C.s2} /></ChartCard>
          </div>
        </Section>

        <Section title="Pages and people" note="Page views by section, and the device, language and theme of each visit.">
          <ChartCard title="Page views" table={rows(data.pages)}><BarList items={data.pages.slice(0, 12)} format={name} /></ChartCard>
          <div className="space-y-8">
            {[['Devices', data.devices], ['Language', data.langs], ['Theme', data.themes]].map(([t, items]) => (
              <ChartCard key={t} title={t} legend={parts(items).map((p) => [`${p.label} · ${p.n}`, p.color])} table={rows(items)}><SegmentedBar parts={parts(items)} /></ChartCard>
            ))}
          </div>
        </Section>

        <Section title="Dictionary" note="Most-viewed words, whether dictionary searches found something, and whether “find words” suggested any. Search text is never stored.">
          <ChartCard title="Most-viewed words" table={rows(data.top_terms)}><BarList items={data.top_terms} format={name} /></ChartCard>
          <div className="space-y-8">
            <ChartCard title="Dictionary searches" legend={parts(data.search, [C.s1, C.s2]).map((p) => [`${p.label} · ${p.n}`, p.color])} table={rows(data.search)}><SegmentedBar parts={parts(data.search, [C.s1, C.s2])} /></ChartCard>
            <ChartCard title="“Find words” runs" legend={parts(data.explore, [C.s1, C.s2]).map((p) => [`${p.label} · ${p.n}`, p.color])} table={rows(data.explore)}><SegmentedBar parts={parts(data.explore, [C.s1, C.s2])} /></ChartCard>
            <ChartCard title="Words saved" table={rows(data.saved_terms)}><BarList items={data.saved_terms} format={name} color={C.s3} /></ChartCard>
            <ChartCard title={`Entries by category · ${data.content.terms} words`} table={rows(data.content.by_category)}><BarList items={data.content.by_category} color={C.s1} /></ChartCard>
          </div>
        </Section>

        <Section title="Accounts" note="Counts only. Individual accounts and journal entries are never shown here.">
          <div className="grid grid-cols-2 gap-8 self-start">
            <StatTile label="Total accounts" value={a.total} />
            <StatTile label="Active in last 30 days" value={a.active_30d} />
            <StatTile label="Using the journal" value={a.with_journal} />
            <StatTile label="Journal entries" value={a.entries} />
            <StatTile label="Research opt-ins" value={a.research_opt_in} />
            <StatTile label="Data exports · deletions" value={a.exports + a.deleted} hint={`${a.exports} exports, ${a.deleted} deletions`} />
          </div>
          <div className="space-y-8">
            <ChartCard title="New accounts per day" table={{ columns: ['Date', 'New'], rows: a.daily_new.map((d) => [d.date, d.n]) }}><LineChart series={[{ label: 'New accounts', color: C.teal, data: a.daily_new }]} height={150} /></ChartCard>
            <ChartCard title="Check-ins saved" legend={parts(data.checkins, [C.s1, C.s2]).map((p) => [`${p.label} · ${p.n}`, p.color])} table={rows(data.checkins)}><SegmentedBar parts={parts(data.checkins, [C.s1, C.s2])} /></ChartCard>
          </div>
        </Section>

        <section className="border-t border-line py-10">
          <h2 className="text-xl font-bold">Research: journal patterns</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-muted">Only from people who opted in to research ({r.participants}). Totals only; notes are never read. Groups smaller than {r.min_group} people are hidden.</p>
          {r.suppressed ? (
            <p className="mt-6 rounded-lg bg-surface px-5 py-4 text-sm text-ink-muted ring-1 ring-line">Not enough participants yet. Research charts appear once at least {r.min_group} people have opted in, so no one can be identified.</p>
          ) : (
            <div className="mt-6 grid gap-10 md:grid-cols-2">
              <ChartCard title={`How people felt · ${r.entries} check-ins`} legend={MOODS.map(([k, l, c]) => [`${l} · ${r.moods[k]}`, c])} table={{ columns: ['Colour', 'Check-ins'], rows: MOODS.map(([k, l]) => [l, r.moods[k]]) }}>
                <SegmentedBar parts={MOODS.map(([k, l, c]) => ({ label: l, n: r.moods[k], color: c }))} />
              </ChartCard>
              <ChartCard title="By day of the week" legend={MOODS.map(([, l, c]) => [l, c])} table={{ columns: ['Day', 'Okay', 'Stretched', 'Struggling'], rows: r.weekday.map((d) => [WEEKDAYS[d.day], d.green, d.yellow, d.red]) }}>
                <StackedColumns groups={r.weekday.map((d) => ({ label: WEEKDAYS[d.day], values: d }))} keys={MOODS} />
              </ChartCard>
              <ChartCard title="Week by week" legend={MOODS.map(([, l, c]) => [l, c])} table={{ columns: ['Week of', 'Okay', 'Stretched', 'Struggling'], rows: r.weekly.map((w) => [w.week, w.green, w.yellow, w.red]) }}>
                <StackedColumns groups={r.weekly.map((w) => ({ label: new Date(w.week + 'T00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), values: w }))} keys={MOODS} />
              </ChartCard>
              <ChartCard title="Feelings chosen most" table={rows(r.feelings, (s) => feelingLabel(s, 'en'))}><BarList items={r.feelings} format={(s) => feelingLabel(s, 'en')} color={C.s1} /></ChartCard>
            </div>
          )}
        </section>

        <section className="border-t border-line py-10">
          <h2 className="text-xl font-bold">Admin tools</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-muted">Sample data is made-up and clearly marked: accounts end in @demo.agkainakem.local and can’t be signed in to. Removing it never touches real data.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={() => demoAction(true)} disabled={!!busy} className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50">
              <Icon name="sparkle" size={15} />{busy === 'load' ? 'Adding…' : data.demo.users ? 'Regenerate sample data' : 'Add sample data'}
            </button>
            <button onClick={() => demoAction(false)} disabled={!!busy || !data.demo.users} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-line hover:ring-teal disabled:opacity-40">
              <Icon name="x" size={15} />{busy === 'clear' ? 'Removing…' : 'Remove sample data'}
            </button>
            <a href={`/api/stats/export.csv?demo=${withDemo ? 1 : 0}`} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-line hover:ring-teal"><Icon name="download" size={15} />Download daily counts</a>
            <a href="/admin/" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-ink-muted ring-1 ring-line hover:ring-teal">Edit dictionary &amp; hotlines (Django admin)</a>
          </div>
        </section>

        <p className="border-t border-line pt-6 text-xs text-ink-faint">
          What’s collected and why is described in the <Link to="/privacy" className="underline">Privacy Notice</Link>. Raw rows: Django admin → Anonymous usage counts.
        </p>
      </div>
    </Page>
  )
}
