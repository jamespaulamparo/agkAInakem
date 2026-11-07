import { track } from '../lib/track'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Icon from '../components/Icon'
import TypeTag from '../components/TypeTag'
import { Page, Spinner, ErrorNote } from '../components/Layout'
import { api, useApi } from '../lib/api'
import { useI18n } from '../lib/i18n'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function useDebounced(value, ms = 220) {
  const [v, setV] = useState(value)
  useEffect(() => { const id = setTimeout(() => setV(value), ms); return () => clearTimeout(id) }, [value, ms])
  return v
}

export default function Dictionary() {
  const { t, pick, lang } = useI18n()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(params.get('q') || '')
  const category = params.get('category') || ''
  const type = params.get('type') || ''
  const dq = useDebounced(q)

  useEffect(() => {
    const next = new URLSearchParams(params)
    dq ? next.set('q', dq) : next.delete('q')
    setParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dq])

  const setParam = (k, v) => {
    const next = new URLSearchParams(params)
    v ? next.set(k, v) : next.delete(k)
    setParams(next, { replace: true })
  }

  const cats = useApi(() => api.categories(), [])
  const all = useApi(() => api.search({}), [])                       // for the A–Z availability
  const res = useApi(() => api.search({ q: dq, category, type }), [dq, category, type])

  const head = (r) => (lang === 'fil' && r.term_fil) || r.term
  const available = useMemo(() => new Set((all.data?.results || []).map((r) => head(r)[0].toUpperCase())), [all.data, lang]) // eslint-disable-line react-hooks/exhaustive-deps
  const groups = useMemo(() => {
    const list = res.data?.results || []
    if (dq) return [[null, list]]                    // ranked results: keep ranking, no letter groups
    const m = new Map()
    ;[...list].sort((a, b) => head(a).localeCompare(head(b), lang === 'fil' ? 'fil' : 'en')).forEach((r) => { const L = head(r)[0].toUpperCase(); m.set(L, [...(m.get(L) || []), r]) })
    return [...m.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [res.data, dq, lang]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (dq.trim().length >= 2 && res.data) track('search', res.data.count ? 'hit' : 'miss') }, [res.data]) // eslint-disable-line react-hooks/exhaustive-deps

  const jump = (L) => document.getElementById(`letter-${L}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <Page className="pt-10 sm:pt-14">
      <div className="lg:grid lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-16">
        <div className="min-w-0">
          <h1 className="text-4xl font-extrabold sm:text-5xl">{t('dict_title')}</h1>

          <div className="relative mt-7">
            <Icon name="search" className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-ink-faint" size={22} />
            <label htmlFor="dict-q" className="sr-only">{t('dict_search')}</label>
            <input id="dict-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('dict_search')}
              className="word w-full border-b-2 border-line bg-transparent py-3 pl-9 text-2xl outline-none transition-colors placeholder:font-sans placeholder:text-lg placeholder:text-ink-faint focus:border-teal sm:text-3xl" autoComplete="off" />
          </div>

          {/* Filters: plain text, like a dictionary's index — not chips or cards */}
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {[['', t('dict_all')], ['everyday', t('type_everyday')], ['psychological', t('type_psychological')], ['clinical', t('type_clinical')]].map(([v, label]) => (
              <button key={v || 'all'} onClick={() => setParam('type', v)}
                className={`font-semibold capitalize transition-colors ${type === v ? 'text-ink underline decoration-teal decoration-2 underline-offset-[6px]' : 'text-ink-faint hover:text-ink'}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-x-4 gap-y-2 overflow-x-auto pb-2 text-sm [scrollbar-width:none] sm:flex-wrap">
            <button onClick={() => setParam('category', '')} className={`shrink-0 ${!category ? 'font-semibold text-teal-ink' : 'text-ink-muted hover:text-ink'}`}>{t('dict_all')}</button>
            {(cats.data || []).filter((c) => c.term_count).map((c) => (
              <button key={c.slug} onClick={() => setParam('category', c.slug === category ? '' : c.slug)}
                className={`shrink-0 whitespace-nowrap ${category === c.slug ? 'font-semibold text-teal-ink' : 'text-ink-muted hover:text-ink'}`}>
                {pick(c, 'name')}
              </button>
            ))}
          </div>

          <nav className="-mx-1 mt-4 flex gap-0.5 overflow-x-auto pb-1 lg:hidden [scrollbar-width:none]" aria-label="Jump to letter">
            {LETTERS.filter((L) => available.has(L)).map((L) => (
              <button key={L} disabled={!!dq} onClick={() => jump(L)} className="word min-w-[2rem] rounded px-1.5 py-1 text-lg text-ink hover:bg-teal-soft disabled:text-ink/30">{L}</button>
            ))}
          </nav>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
            {res.data ? `${res.data.count} ${t('dict_entries')}` : ' '}
          </p>

          {res.loading && !res.data ? <Spinner /> : res.error ? <ErrorNote error={res.error} /> : (
            <div className="mt-2">
              {groups.length === 0 && (
                <div className="py-14 text-ink-muted">
                  <p>{t('dict_none')}</p>
                  <Link to={`/explore?q=${encodeURIComponent(q)}`} className="link mt-3 inline-block font-semibold">{t('dict_describe')} →</Link>
                </div>
              )}
              {groups.map(([L, items]) => (
                <section key={L || 'results'} id={L ? `letter-${L}` : undefined} className="scroll-mt-24">
                  {L && <h2 className="word mt-10 border-b border-line pb-2 text-4xl font-medium text-teal-ink">{L}</h2>}
                  <ol>
                    {items.map((r, i) => (
                      <motion.li key={r.slug} className="border-b border-line py-5"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i, 10) * 0.025 }}>
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <Link to={`/dictionary/${r.slug}`} className="word text-2xl font-semibold text-ink hover:text-teal-ink">{head(r)}</Link>
                          <TypeTag type={r.term_type} />
                          {lang === 'fil' && r.term_fil && <span className="text-sm italic text-ink-faint">{r.term}</span>}
                        </div>
                        <p className="mt-1.5 max-w-prose leading-relaxed text-ink-muted">{pick(r, 'short_definition')}</p>
                        {r.see_also.length > 0 && (
                          <p className="mt-2 text-sm text-ink-faint">
                            {t('see_also')}:{' '}
                            {r.see_also.map((s, j) => (
                              <span key={s.slug}>
                                <Link to={`/dictionary/${s.slug}`} className="word italic text-teal-ink hover:underline">{head(s)}</Link>
                                {j < r.see_also.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </p>
                        )}
                      </motion.li>
                    ))}
                  </ol>
                </section>
              ))}
            </div>
          )}
        </div>

        {/* A–Z index: sticky on desktop, horizontal strip on mobile */}
        <aside className="order-first hidden lg:block">
          <nav className="sticky top-24 mt-24 grid grid-cols-5 gap-1" aria-label="Jump to letter">
            {LETTERS.map((L) => {
              const has = available.has(L) && !dq
              return (
                <button key={L} disabled={!has} onClick={() => jump(L)}
                  className={`word h-9 rounded-md text-lg ${has ? 'text-ink hover:bg-teal-soft hover:text-teal-ink' : 'text-ink/20'}`}>{L}</button>
              )
            })}
          </nav>
        </aside>
      </div>
    </Page>
  )
}
