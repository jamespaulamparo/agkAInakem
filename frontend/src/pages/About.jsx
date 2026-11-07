import { PlanArt } from '../components/Illustrations'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import { Page } from '../components/Layout'
import { useI18n } from '../lib/i18n'

const IS = [
  ['book', 'A dictionary for feelings and mental health words', 'Diksiyonaryo para sa damdamin at salita ng kalusugang pangkaisipan'],
  ['map', 'A guide to reaching out — for you or someone else', 'Gabay sa paghingi ng tulong — para sa iyo o sa iba'],
  ['globe', 'Free, open, and usable without an account', 'Libre, bukas, at magagamit nang walang account'],
]
const ISNT = [
  ['A diagnosis or a test', 'Diagnosis o pagsusuri'],
  ['A therapist or a chatbot', 'Therapist o chatbot'],
  ['An emergency service — call 911 or 1553', 'Emergency service — tumawag sa 911 o 1553'],
]
const PRIVACY = [
  ['user', 'Accounts are optional', 'Opsyonal ang account'],
  ['lock', 'What you type to find words is not saved', 'Hindi sine-save ang tina-type mo'],
  ['cursor', 'The extension reads only what you select', 'Ang extension ay bumabasa lang ng pinili mo'],
  ['pulse', 'Your journal is private: only you can see it, and you can delete it any time', 'Pribado ang journal mo: ikaw lang ang makakakita, at mabubura mo ito kahit kailan'],
]

const fade = (i = 0) => ({ initial: { opacity: 0, y: 14 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: i * 0.08, duration: 0.5 } })

export default function About() {
  const { t, lang } = useI18n()
  const L = lang === 'fil' ? 2 : 1
  return (
    <Page className="pt-14 sm:pt-20">
      <motion.h1 {...fade()} className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-6xl">{t('about_title')}</motion.h1>

      <div className="mt-16 grid gap-14 md:grid-cols-2">
        <section>
          <h2 className="eyebrow mb-6">{lang === 'fil' ? 'Ito ay' : 'It is'}</h2>
          <ul className="space-y-7">
            {IS.map((x, i) => (
              <motion.li key={i} {...fade(i)} className="flex items-start gap-4 text-lg font-semibold sm:text-xl">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-soft text-teal-ink"><Icon name={x[0]} /></span>
                <span className="pt-2">{x[L]}</span>
              </motion.li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="eyebrow mb-6">{lang === 'fil' ? 'Hindi ito' : 'It isn’t'}</h2>
          <ul className="space-y-7">
            {ISNT.map((x, i) => (
              <motion.li key={i} {...fade(i)} className="flex items-start gap-4 text-lg font-semibold text-ink-muted sm:text-xl">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink-muted"><Icon name="x" /></span>
                <span className="pt-2">{x[L - 1]}</span>
              </motion.li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-28">
        <div className="flex items-center gap-6">
          <div className="w-28 shrink-0"><PlanArt /></div>
          <motion.h2 {...fade()} className="text-3xl font-extrabold sm:text-4xl">{lang === 'fil' ? 'Pribado bilang default.' : 'Private by default.'}</motion.h2>
        </div>
        <ul className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {PRIVACY.map((x, i) => (
            <motion.li key={i} {...fade(i)}>
              <motion.span className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-soft text-sky-ink" whileHover={{ rotate: -8, scale: 1.06 }}>
                <Icon name={x[0]} size={24} />
              </motion.span>
              <p className="mt-4 font-semibold leading-snug">{x[L]}</p>
            </motion.li>
          ))}
        </ul>
      </section>

      <section className="mt-28 grid gap-12 border-t border-line pt-14 md:grid-cols-2">
        <motion.div {...fade()}>
          <h2 className="text-2xl font-bold">{lang === 'fil' ? 'Paano isinusulat ang mga salita' : 'How the words are written'}</h2>
          <p className="mt-3 leading-relaxed text-ink-muted">
            {lang === 'fil'
              ? 'Bawat salita ay may kahulugan, pagkakaiba sa kahawig na salita, at sanggunian. Minamarkahan namin ang mga draft hanggang masuri ng kwalipikadong propesyonal. Ang mga klinikal na termino ay hindi ginagamit bilang kapalit ng pang-araw-araw na damdamin.'
              : 'Every entry has a definition, how it differs from similar words, and references. Entries are marked as drafts until a qualified professional reviews them. Clinical terms are never used as casual synonyms for everyday feelings.'}
          </p>
          <Link to="/dictionary" className="mt-4 inline-flex items-center gap-1.5 font-semibold text-teal-ink">{t('nav_dictionary')} <Icon name="arrow" size={16} /></Link>
        </motion.div>
        <motion.div {...fade(1)}>
          <h2 className="text-2xl font-bold">{lang === 'fil' ? 'Ang AI sa agkAInakem' : 'The “AI” in agkAInakem'}</h2>
          <p className="mt-3 leading-relaxed text-ink-muted">
            {lang === 'fil'
              ? 'Ang paghahanap ng salita ay gumagamit ng mga pariralang isinulat at sinuri ng tao — hindi ito nanghuhula, nag-di-diagnose, o nagbibigay ng iskor. Ikaw ang magpapasya kung aling salita ang akma.'
              : 'Finding words uses phrases written and checked by people — it doesn’t guess, diagnose, or score anything. You decide which words fit.'}
          </p>
          <p className="mt-4 text-sm text-ink-faint">
            {lang === 'fil' ? 'Nakabase sa San Fernando, La Union. Kumpirmahin ang mga numero bago gamitin sa publiko.' : 'Based in San Fernando, La Union. Local numbers are being re-confirmed before public launch.'}
          </p>
        </motion.div>
      </section>
    </Page>
  )
}
