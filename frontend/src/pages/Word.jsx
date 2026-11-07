import { lazy, Suspense, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Icon from '../components/Icon'
import TypeTag from '../components/TypeTag'
import { Page, Spinner, ErrorNote } from '../components/Layout'
import { api, useApi } from '../lib/api'
import { useI18n } from '../lib/i18n'
import { useSaved } from '../lib/saved'

const WordMap = lazy(() => import('../components/WordMap'))
const DISTINCT = ['different_from', 'often_confused_with']

function Section({ title, children, delay = 0 }) {
  return (
    <motion.section className="mt-12" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.5, delay }}>
      <h2 className="eyebrow mb-4">{title}</h2>
      {children}
    </motion.section>
  )
}

export default function Word() {
  const { slug } = useParams()
  const { t, pick, lang } = useI18n()
  const { has, toggle } = useSaved()
  const { data: term, error, loading } = useApi(() => api.term(slug), [slug])
  const graph = useApi(() => api.related(slug), [slug])

  const { distinctions, connected } = useMemo(() => {
    const rels = term?.relationships || []
    const distinctions = rels.filter((r) => DISTINCT.includes(r.type))
    const grouped = new Map()
    rels.filter((r) => !DISTINCT.includes(r.type)).forEach((r) => grouped.set(r.label, [...(grouped.get(r.label) || []), r]))
    return { distinctions, connected: [...grouped.entries()] }
  }, [term])

  if (loading && !term) return <Spinner />
  if (error) return <ErrorNote error={error} />
  const saved = has(term.slug)

  return (
    <Page className="pt-8 sm:pt-12">
      <nav className="text-sm text-ink-faint" aria-label="Breadcrumb">
        <Link to="/dictionary" className="hover:text-ink">{t('back_dict')}</Link>
        <span className="mx-2">/</span>
        <Link to={`/dictionary?category=${term.category.slug}`} className="hover:text-ink">{pick(term.category, 'name')}</Link>
      </nav>

      <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-16">
        <article className="min-w-0 max-w-prose">
          <header>
            <motion.h1 className="word text-5xl font-medium leading-none sm:text-7xl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {term.term}
            </motion.h1>
            <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-ink-muted">
              <TypeTag type={term.term_type} className="text-lg" />
              {term.term_fil && <span className="italic">· {term.term_fil}</span>}
              {term.aliases?.length > 0 && <span className="text-sm text-ink-faint">· {t('also')} {term.aliases.slice(0, 3).join(', ')}</span>}
              <button onClick={() => toggle(term)} aria-pressed={saved}
                className={`ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${saved ? 'bg-teal-soft text-teal-ink' : 'text-ink-muted hover:bg-ink/5'}`}>
                <motion.span animate={{ scale: saved ? [1, 1.3, 1] : 1 }}><Icon name="bookmark" size={16} className={saved ? 'fill-current' : ''} /></motion.span>
                {saved ? t('saved') : t('save')}
              </button>
            </div>
          </header>

          {term.term_type === 'clinical' && (
            <p className="mt-6 flex gap-2.5 border-l-2 border-ink pl-4 text-sm text-ink-muted"><Icon name="shield" size={18} className="mt-0.5 shrink-0 text-ink" />{t('clinical_note')}</p>
          )}

          <ol className="mt-8 space-y-5">
            <li className="flex gap-4 text-xl leading-relaxed sm:text-2xl">
              <span className="word text-teal-ink">1.</span><span>{pick(term, 'short_definition')}</span>
            </li>
          </ol>

          {term.in_simpler_terms && (
            <p className="mt-6 border-l-2 border-sky pl-5 text-lg italic text-ink-muted">
              <span className="eyebrow mb-1 block not-italic">{t('simpler')}</span>
              {pick(term, 'in_simpler_terms')}
            </p>
          )}
          {term.detailed_definition && <p className="mt-6 leading-relaxed text-ink-muted">{pick(term, 'detailed_definition')}</p>}

          {distinctions.length > 0 && (
            <Section title={t('not_same')}>
              <ul className="space-y-5">
                {distinctions.map((r) => (
                  <li key={r.slug + r.type} className="flex gap-3">
                    <span className="mt-2.5 h-px w-4 shrink-0 bg-ink-faint" />
                    <p className="leading-relaxed">
                      <Link to={`/dictionary/${r.slug}`} className="word text-xl italic text-teal-ink hover:underline">{r.term}</Link>
                      <span className="text-ink-muted"> — {pick(r, 'explanation')}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {term.examples.length > 0 && (
            <Section title={t('examples')}>
              {term.examples.map((e, i) => (
                <p key={i} className="word text-xl italic leading-relaxed text-ink">&ldquo;{lang === 'fil' && e.text_fil ? e.text_fil : e.text}&rdquo;</p>
              ))}
            </Section>
          )}

          {term.reflection_questions.length > 0 && (
            <Section title={t('reflect')}>
              <ul className="space-y-3">
                {term.reflection_questions.map((q, i) => (
                  <li key={i} className="flex gap-3 leading-relaxed"><span className="text-sage-ink">?</span>{lang === 'fil' && q.text_fil ? q.text_fil : q.text}</li>
                ))}
              </ul>
            </Section>
          )}

          {/* Accessible list of every curated relationship (the graph is a visual companion) */}
          {connected.length > 0 && (
            <Section title={t('connected')}>
              <dl className="space-y-4">
                {connected.map(([label, rels]) => (
                  <div key={label} className="sm:flex sm:gap-6">
                    <dt className="w-44 shrink-0 text-sm font-semibold text-ink-faint">{label}</dt>
                    <dd className="mt-1 sm:mt-0">
                      {rels.map((r, i) => (
                        <span key={r.slug}>
                          <Link to={`/dictionary/${r.slug}`} title={r.explanation} className="word text-lg italic text-teal-ink hover:underline">{r.term}</Link>
                          {i < rels.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </Section>
          )}

          <footer className="mt-14 border-t border-line pt-6 text-sm text-ink-faint">
            {term.sources.length > 0 && (
              <p><span className="font-semibold">{t('references')}:</span>{' '}
                {term.sources.map((s, i) => (
                  <span key={i}>{s.url ? <a href={s.url} target="_blank" rel="noreferrer" className="hover:text-ink hover:underline">{s.title}</a> : s.title} ({s.citation}){i < term.sources.length - 1 ? '; ' : ''}</span>
                ))}
              </p>
            )}
            {term.review_status !== 'approved' && <p className="mt-2 flex items-center gap-2"><Icon name="sparkle" size={14} />{t('review_note')}</p>}
          </footer>
        </article>

        <aside className="mt-14 lg:mt-0">
          <div className="lg:sticky lg:top-24">
            {graph.data && graph.data.nodes.length > 1 && (
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
                className="rounded-xl bg-surface/60" style={{ background: 'radial-gradient(closest-side, rgba(142,197,232,.18), transparent)' }}>
                <Suspense fallback={<div className="h-[420px]" />}>
                  <WordMap key={slug} nodes={graph.data.nodes} edges={graph.data.edges} center={slug} height={420} labelAll />
                </Suspense>
              </motion.div>
            )}
            <Link to={`/explore`} className="mt-6 flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink">
              <Icon name="message" size={16} />{t('dict_describe')} →
            </Link>
          </div>
        </aside>
      </div>
    </Page>
  )
}
