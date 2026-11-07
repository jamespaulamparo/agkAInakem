import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from '../components/Icon'
import TypeTag from '../components/TypeTag'
import { Page } from '../components/Layout'
import CrisisMessage from '../components/CrisisMessage'
import { hasCrisisWords } from '../lib/crisis'
import { api } from '../lib/api'
import { useI18n } from '../lib/i18n'

// Echo the person's sentence with the phrases that matched gently underlined.
function Highlighted({ text, fragments }) {
  const parts = useMemo(() => {
    if (!fragments.length) return [{ s: text }]
    const esc = fragments.sort((a, b) => b.length - a.length).map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, "[\\s,.'’-]+"))
    const re = new RegExp(`(${esc.join('|')})`, 'gi')
    return text.split(re).map((s, i) => ({ s, hit: i % 2 === 1 }))
  }, [text, fragments])
  return (
    <p className="word text-2xl italic leading-relaxed text-ink sm:text-3xl">
      &ldquo;{parts.map((p, i) => p.hit
        ? <motion.mark key={i} className="bg-transparent text-teal-ink" initial={{ backgroundSize: '0% 2px' }} animate={{ backgroundSize: '100% 2px' }}
            style={{ backgroundImage: 'linear-gradient(#4FA8A0,#4FA8A0)', backgroundRepeat: 'no-repeat', backgroundPosition: '0 92%' }} transition={{ delay: 0.3 + i * 0.05, duration: 0.6 }}>{p.s}</motion.mark>
        : <span key={i}>{p.s}</span>)}&rdquo;
    </p>
  )
}

export default function Explore() {
  const { t, pick, lang } = useI18n()
  const [params, setParams] = useSearchParams()
  const initial = params.get('q') || ''
  const [text, setText] = useState(initial)
  const [submitted, setSubmitted] = useState('')
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [dismissed, setDismissed] = useState(new Set())

  const run = async (value) => {
    const v = value.trim()
    if (!v) return
    setBusy(true); setError(null); setDismissed(new Set())
    try {
      const r = await api.explore(v, lang)
      setResult(r); setSubmitted(v)
      // Keep the text out of the URL after the first visit: it may be sensitive.
      if (params.get('q')) setParams({}, { replace: true })
    } catch (e) {
      setError(e.status === 429 ? 'Please wait a moment before trying again.' : 'Something went wrong. Please try again.')
    } finally { setBusy(false) }
  }
  useEffect(() => { if (initial) run(initial) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const visible = (result?.results || []).filter((r) => !dismissed.has(r.slug))
  const fragments = [...new Set((result?.results || []).flatMap((r) => r.matched))]

  return (
    <Page className="pt-12 sm:pt-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-center text-3xl font-extrabold sm:text-5xl">{t('explore_title')}</h1>
        <form onSubmit={(e) => { e.preventDefault(); run(text) }} className="mt-10">
          <label htmlFor="explore-text" className="sr-only">{t('explore_placeholder')}</label>
          <div className="rounded-lg border border-line bg-surface p-2 shadow-soft focus-within:border-teal focus-within:ring-4 focus-within:ring-teal/15">
            <textarea id="explore-text" rows={3} value={text} maxLength={1200} onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); run(text) } }}
              placeholder={t('explore_placeholder')} className="block w-full resize-none bg-transparent px-3 py-2 text-lg leading-relaxed outline-none placeholder:text-ink-faint" />
            <div className="flex items-center justify-between gap-3 px-2 pb-1">
              <p className="flex items-center gap-1.5 text-xs text-ink-faint"><Icon name="lock" size={13} />{t('explore_note')}</p>
              <button type="submit" disabled={busy || !text.trim()} className="btn-primary shrink-0">
                {busy ? <motion.span className="h-2 w-2 rounded-full bg-white" animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.9 }} /> : <Icon name="sparkle" size={16} />}
                {t('explore_go')}
              </button>
            </div>
          </div>
        </form>
        {(hasCrisisWords(text) || result?.show_support) && <div className="mt-6"><CrisisMessage /></div>}
        {error && <p className="mt-4 text-center text-sm text-amber">{error}</p>}

        <AnimatePresence mode="wait">
          {result && (
            <motion.div key={submitted} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-14">
              
              <div className="mt-8"><Highlighted text={submitted} fragments={fragments} /></div>

              {visible.length === 0 ? (
                <p className="mt-10 text-ink-muted">{t('explore_none')} <Link to="/dictionary" className="link">{t('nav_dictionary')}</Link></p>
              ) : (
                <ol className="mt-10 border-t border-line">
                  <AnimatePresence>
                    {visible.map((r, i) => (
                      <motion.li key={r.slug} layout className="group relative border-b border-line py-7"
                        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40, transition: { duration: 0.25 } }}
                        transition={{ delay: 0.15 + i * 0.09, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pr-10">
                          <Link to={`/dictionary/${r.slug}`} className="word text-3xl font-medium hover:text-teal-ink sm:text-4xl">{r.term}</Link>
                          <TypeTag type={r.term_type} />
                          <span className={`rounded-full px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider ${r.fit === 'closer' ? 'bg-teal-soft text-teal-ink' : 'bg-ink/5 text-ink-muted'}`}>
                            {r.fit === 'closer' ? t('fit_closer') : t('fit_possible')}
                          </span>
                        </div>
                        <p className="mt-2 max-w-prose leading-relaxed text-ink-muted">{pick(r, 'short_definition')}</p>
                        <ul className="mt-3 space-y-1.5">
                          {r.reasons.slice(0, 2).map((why, j) => (
                            <li key={j} className="flex gap-2 text-sm text-ink"><Icon name="check" size={16} className="mt-0.5 shrink-0 text-sage-ink" />{why.text}</li>
                          ))}
                        </ul>
                        {r.distinctions.length > 0 && (
                          <p className="mt-3 text-sm text-ink-faint">
                            {t('not_same')}{' '}
                            {r.distinctions.map((d, j) => (
                              <span key={d.slug}><Link to={`/dictionary/${d.slug}`} title={d.explanation} className="word italic text-teal-ink hover:underline">{d.term}</Link>{j < r.distinctions.length - 1 ? ', ' : ''}</span>
                            ))}
                          </p>
                        )}
                        <div className="mt-4 flex items-center gap-4 text-sm font-semibold">
                          <Link to={`/dictionary/${r.slug}`} className="inline-flex items-center gap-1.5 text-teal-ink hover:gap-2.5 transition-all">{t('open_word')} <Icon name="arrow" size={15} /></Link>
                        </div>
                        <button onClick={() => setDismissed((s) => new Set(s).add(r.slug))} title={t('not_quite')} aria-label={`${t('not_quite')}: ${r.term}`}
                          className="absolute right-0 top-8 rounded-full p-2 text-ink-faint opacity-60 transition hover:bg-ink/5 hover:text-ink group-hover:opacity-100">
                          <Icon name="x" size={18} />
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ol>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!result && !busy && (
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {(lang === 'fil'
              ? ['Pagod na pagod na ako at sobra na ang lahat', 'Hindi ko maiwasang mag-isip nang paulit-ulit', 'Parang walang nakakaintindi sa akin']
              : ['I feel tired and everything is becoming too much', 'I keep replaying what I said', 'I feel like I\u2019m watching my life from far away']
            ).map((s) => (
              <button key={s} onClick={() => { setText(s); run(s) }} className="rounded-full border border-line px-4 py-2 text-sm text-ink-muted transition hover:border-teal hover:text-ink">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </Page>
  )
}
