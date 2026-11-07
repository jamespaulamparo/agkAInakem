import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Icon from '../components/Icon'
import HelpChoices from '../components/HelpChoices'
import { JournalArt, WordsArt } from '../components/Illustrations'
import CrisisMessage from '../components/CrisisMessage'
import { HeartStatic } from '../components/Brand'
import { hasCrisisWords } from '../lib/crisis'
import { api } from '../lib/api'
import { useI18n } from '../lib/i18n'

const Heart3D = lazy(() => import('../components/Heart3D'))
const WordMap = lazy(() => import('../components/WordMap'))

function CyclingWord() {
  const { t } = useI18n()
  const words = t('hero_words')
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % words.length), 2400)
    return () => clearInterval(id)
  }, [words.length])
  return (
    <span className="relative inline-grid align-baseline">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={words[i]} className="word col-start-1 row-start-1 whitespace-nowrap font-normal italic text-teal-ink"
          initial={{ y: '0.6em', opacity: 0, filter: 'blur(6px)' }} animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-0.6em', opacity: 0, filter: 'blur(6px)' }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>
          {words[i]}.
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function Hero() {
  const { t, simple } = useI18n()
  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center overflow-hidden px-4 pb-28 pt-4">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true"
        style={{ background: 'radial-gradient(60% 45% at 50% 25%, rgba(142,197,232,.22), transparent 70%), radial-gradient(40% 40% at 75% 75%, rgba(169,200,165,.18), transparent 70%)' }} />
      <motion.div className="flex h-[26svh] min-h-[170px] w-full max-w-[420px] items-center justify-center" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
        {simple ? <HeartStatic size={150} /> : <Suspense fallback={<HeartStatic size={150} />}><Heart3D /></Suspense>}
      </motion.div>
      <motion.h1 className="mt-2 text-center text-[2.3rem] font-extrabold leading-[1.08] sm:text-6xl"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }}>
        {t('need_q')}
      </motion.h1>
      <div className="mt-9"><HelpChoices delay={0.25} /></div>
    </section>
  )
}

function WordsSection() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const crisis = hasCrisisWords(text)
  const submit = (e) => {
    e.preventDefault()
    if (text.trim()) navigate(`/explore?q=${encodeURIComponent(text.trim())}`)
  }
  return (
    <section className="bg-surface px-4 py-20 sm:py-28">
      <div className="mx-auto grid max-w-page items-center gap-12 md:grid-cols-[0.8fr_1.2fr]">
      <Reveal className="mx-auto w-full max-w-sm"><WordsArt /></Reveal>
      <Reveal className="flex flex-col items-center text-center md:items-start md:text-left">
        <h2 className="text-3xl font-extrabold leading-tight sm:text-5xl">{t('words_title')}<br /><CyclingWord /></h2>
        <form onSubmit={submit} className="mt-8 flex w-full max-w-xl items-center gap-2 rounded-full border border-line bg-paper p-1.5 pl-5 focus-within:border-teal focus-within:ring-4 focus-within:ring-teal/15">
          <label htmlFor="hero-q" className="sr-only">{t('hero_placeholder')}</label>
          <input id="hero-q" value={text} onChange={(e) => setText(e.target.value)} placeholder={t('hero_placeholder')}
            className="min-w-0 flex-1 bg-transparent py-2.5 text-base outline-none placeholder:text-ink-faint" autoComplete="off" />
          <motion.button type="submit" aria-label={t('explore_go')} whileTap={{ scale: 0.92 }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-ink text-white disabled:opacity-40" disabled={!text.trim()}>
            <Icon name="arrow" size={20} />
          </motion.button>
        </form>
        {crisis && <div className="mt-5 w-full max-w-xl text-left"><CrisisMessage compact /></div>}
        <Link to="/dictionary" className="mt-5 inline-block text-sm font-medium text-ink-muted hover:text-ink">{t('hero_browse')} →</Link>
      </Reveal>
      </div>
    </section>
  )
}

function Reveal({ children, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div ref={ref} className={className} initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  )
}

function JournalSection() {
  const { t } = useI18n()
  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="mx-auto grid max-w-page items-center gap-12 md:grid-cols-[1.2fr_0.8fr]">
        <Reveal className="text-center md:text-left">
          <h2 className="text-3xl font-extrabold sm:text-5xl">{t('home_journal')}</h2>
          <div className="mt-8 flex justify-center gap-2 md:justify-start" aria-hidden="true">
            {['#A9C8A5', '#A9C8A5', '#E9D29B', '#A9C8A5', '#E6A994', '#E9D29B', '#A9C8A5'].map((c, i) => (
              <motion.span key={i} className="h-9 w-9 rounded-full sm:h-11 sm:w-11" style={{ background: c }}
                initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.07, type: 'spring', bounce: 0.4 }} />
            ))}
          </div>
          <Link to="/journal" className="mt-8 inline-flex items-center gap-2 font-semibold text-teal-ink transition-all hover:gap-3">{t('open_journal')} <Icon name="arrow" size={18} /></Link>
        </Reveal>
        <Reveal className="mx-auto w-full max-w-sm"><JournalArt /></Reveal>
      </div>
    </section>
  )
}

function MapSection() {
  const { t } = useI18n()
  const [graph, setGraph] = useState(null)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '200px' })
  useEffect(() => { if (inView && !graph) api.graph().then(setGraph).catch(() => {}) }, [inView, graph])
  const [h, setH] = useState(560)
  useEffect(() => { const f = () => setH(window.innerWidth < 640 ? 460 : 580); f(); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f) }, [])
  return (
    <section ref={ref} className="py-20 sm:py-28">
      <Reveal className="mx-auto max-w-page px-4 text-center sm:px-6">
        <h2 className="text-3xl font-extrabold sm:text-5xl">{t('map_title')}</h2>
        <p className="mt-3 text-ink-muted">{t('map_sub')}</p>
      </Reveal>
      <div className="mx-auto mt-8 max-w-[1400px] px-2">
        {graph ? <Suspense fallback={<div style={{ height: h }} />}><WordMap nodes={graph.nodes} edges={graph.edges} height={h} /></Suspense> : <div style={{ height: h }} />}
      </div>
    </section>
  )
}

/* A looping illustration of the extension: select → right-click → definition. */
function ExtensionDemo() {
  const [step, setStep] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref)
  useEffect(() => {
    if (!inView) return
    const durations = [1400, 1100, 900, 3600]
    const id = setTimeout(() => setStep((s) => (s + 1) % 4), durations[step])
    return () => clearTimeout(id)
  }, [step, inView])
  return (
    <div ref={ref} className="relative mx-auto w-full max-w-xl" aria-hidden="true">
      <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-soft">
        <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
          {['#E4E9E5', '#E4E9E5', '#E4E9E5'].map((c, i) => <span key={i} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />)}
          <span className="ml-3 h-5 flex-1 rounded-full bg-paper" />
        </div>
        <div className="space-y-2.5 px-6 py-7">
          <span className="block h-2.5 w-3/4 rounded-full bg-line" />
          <p className="text-[0.95rem] leading-relaxed text-ink-muted">
            After finals week, many students say they feel{' '}
            <span className="relative inline-block">
              <motion.span className="absolute inset-0 -mx-0.5 rounded-sm bg-sky/50" initial={false} animate={{ scaleX: step >= 1 ? 1 : 0 }} style={{ originX: 0 }} transition={{ duration: 0.5 }} />
              <span className="relative font-semibold text-ink">overwhelmed</span>
            </span>{' '}rather than simply tired.
          </p>
          <span className="block h-2.5 w-2/3 rounded-full bg-line" />
          <span className="block h-2.5 w-1/2 rounded-full bg-line" />
        </div>
      </div>
      <AnimatePresence>
        {step === 2 && (
          <motion.div className="absolute left-[46%] top-[58%] rounded-md border border-line bg-surface px-3 py-2 text-xs font-semibold shadow-lift"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            Look up with agk<span className="text-teal-ink">AI</span>nakem
          </motion.div>
        )}
        {step === 3 && (
          <motion.div className="absolute right-[-4%] top-[42%] w-[min(300px,78%)] rounded-lg bg-ink p-4 text-white shadow-lift sm:right-[-10%]"
            initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6 }}
            transition={{ type: 'spring', bounce: 0.25 }}>
            <p className="word text-2xl">Overwhelm</p>
            <p className="mt-1 text-xs leading-snug text-white/80">The feeling that demands exceed what you can manage right now.</p>
            <div className="mt-3 flex flex-wrap gap-1.5 text-[0.7rem]">
              {['Stress', 'Emotional exhaustion', 'Burnout'].map((w) => <span key={w} className="rounded-full bg-white/10 px-2 py-0.5">{w}</span>)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div className="absolute text-ink" animate={{ left: step === 0 ? '20%' : '44%', top: step === 0 ? '80%' : '56%' }} transition={{ duration: 0.9, ease: 'easeInOut' }}>
        <Icon name="cursor" size={22} className="fill-surface" />
      </motion.div>
    </div>
  )
}

function ExtensionSection() {
  const { t } = useI18n()
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto grid max-w-page items-center gap-14 px-4 sm:px-6 md:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <h2 className="text-3xl font-extrabold sm:text-5xl">{t('ext_title')}</h2>
          <Link to="/extension" className="mt-8 inline-flex items-center gap-2 font-semibold text-teal-ink hover:gap-3 transition-all">
            {t('ext_cta')} <Icon name="arrow" size={18} />
          </Link>
        </Reveal>
        <Reveal><ExtensionDemo /></Reveal>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Hero />
      <JournalSection />
      <WordsSection />
      <MapSection />
      <ExtensionSection />
    </>
  )
}
