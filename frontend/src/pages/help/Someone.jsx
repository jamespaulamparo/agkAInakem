import { TogetherArt } from '../../components/Illustrations'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from '../../components/Icon'
import { api } from '../../lib/api'
import { useI18n } from '../../lib/i18n'

const NALC = [
  { key: 'notice', icon: 'eye', en: 'Notice', fil: 'Pansinin',
    what: ['Look for changes that last, not one bad day.', 'Hanapin ang mga pagbabagong nagtatagal, hindi isang masamang araw lang.'],
    signs: [['Pulling away from friends or activities', 'Pag-iwas sa kaibigan o gawain'], ['Seeming exhausted, flat or irritable', 'Mukhang pagod, matamlay o mainisin'], ['Saying things like “what’s the point”', 'Nagsasabi ng “wala nang silbi”'], ['Changes in sleep, eating, school or work', 'Pagbabago sa tulog, pagkain, pag-aaral o trabaho']] },
  { key: 'ask', icon: 'message', en: 'Ask', fil: 'Magtanong',
    what: ['Pick a private, unhurried moment. Ask openly.', 'Pumili ng pribado at hindi nagmamadaling sandali. Magtanong nang bukas.'],
    say: [['“I’ve noticed you seem quieter lately. How are you, really?”', '“Napansin kong parang tahimik ka nitong mga araw. Kumusta ka talaga?”'], ['“Do you want to talk about it? No pressure.”', '“Gusto mo bang pag-usapan? Walang pilitan.”']],
    avoid: [['Asking in front of others', 'Pagtatanong sa harap ng iba'], ['“What’s wrong with you?”', '“Ano bang problema mo?”']],
    note: ['If you’re worried about suicide, it’s okay to ask directly: “Are you thinking about suicide?” Asking does not put the idea in their head.', 'Kung nag-aalala ka tungkol sa pagpapakamatay, maaari kang magtanong nang diretso. Hindi nito itinatanim ang ideya.'] },
  { key: 'listen', icon: 'ear', en: 'Listen', fil: 'Makinig',
    what: ['Your job is to understand, not to fix.', 'Ang trabaho mo ay umunawa, hindi ayusin.'],
    say: [['“That sounds really hard.”', '“Ang bigat niyan.”'], ['“Thank you for telling me.”', '“Salamat at sinabi mo sa akin.”']],
    avoid: [['“It could be worse.”', '“Mas malala pa ang iba.”'], ['“Just think positive.”', '“Mag-isip ka lang ng positibo.”'], ['Sharing their story with others (unless their safety is at risk)', 'Pagkukuwento sa iba (maliban kung nasa panganib sila)']] },
  { key: 'connect', icon: 'link', en: 'Connect', fil: 'Ikonekta',
    what: ['Help them take one step toward support.', 'Tulungan silang humakbang patungo sa suporta.'],
    say: [['“Would you like help finding someone to talk to?”', '“Gusto mo bang tulungan kitang humanap ng makakausap?”'], ['“I can go with you to the guidance office.”', '“Sasamahan kita sa guidance office.”']],
    note: ['If they are in immediate danger, stay with them and call 911 or 1553. And take care of yourself too.', 'Kung nasa agarang panganib, samahan sila at tumawag sa 911 o 1553. Alagaan mo rin ang sarili mo.'] },
]

export default function SomeoneElse() {
  const { lang, t } = useI18n()
  const L = lang === 'fil' ? 1 : 0
  const [i, setI] = useState(0)
  const s = NALC[i]
  return (
    <div>
      <div className="mx-auto mb-10 w-40"><TogetherArt /></div>
      <ol className="relative flex justify-between">
        <span className="absolute left-[12%] right-[12%] top-6 h-0.5 bg-line" aria-hidden="true" />
        <motion.span className="absolute left-[12%] top-6 h-0.5 origin-left bg-teal" animate={{ width: `${(i / 3) * 76}%` }} aria-hidden="true" />
        {NALC.map((n, j) => (
          <li key={n.key} className="relative z-10 flex w-1/4 flex-col items-center">
            <button onClick={() => setI(j)} aria-current={i === j ? 'step' : undefined}
              className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${j <= i ? 'bg-teal-ink text-white' : 'bg-surface text-ink-faint ring-1 ring-line'} ${i === j ? 'scale-110 shadow-lift' : ''}`}>
              <Icon name={n.icon} />
            </button>
            <span className={`mt-2 text-sm font-semibold ${i === j ? 'text-ink' : 'text-ink-faint'}`}>{lang === 'fil' ? n.fil : n.en}</span>
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        <motion.div key={s.key} className="mx-auto mt-14 max-w-2xl" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
          <p className="text-2xl font-bold leading-snug sm:text-3xl">{s.what[L]}</p>
          {s.signs && (
            <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {s.signs.map((x, j) => <li key={j} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />{x[L]}</li>)}
            </ul>
          )}
          {s.say && (
            <div className="mt-8 space-y-3">
              {s.say.map((x, j) => <p key={j} className="word border-l-2 border-sky pl-5 text-xl italic sm:text-2xl">{x[L]}</p>)}
            </div>
          )}
          {s.avoid && (
            <div className="mt-8">
              <p className="eyebrow mb-2">{lang === 'fil' ? 'Iwasan' : 'Avoid'}</p>
              <ul className="space-y-2">{s.avoid.map((x, j) => <li key={j} className="flex gap-3 text-ink-muted"><Icon name="x" size={16} className="mt-1 shrink-0 text-ink-faint" />{x[L]}</li>)}</ul>
            </div>
          )}
          {s.note && <p className="mt-8 flex gap-3 rounded-md bg-sage-soft px-4 py-3 text-sm"><Icon name="shield" size={18} className="mt-0.5 shrink-0 text-sage-ink" />{s.note[L]}</p>}
          {s.key === 'connect' && (
            <Link to="/help/talk" className="mt-6 inline-flex items-center gap-2 font-semibold text-teal-ink">{t('choice_talk')} <Icon name="arrow" size={16} /></Link>
          )}
          <div className="mt-10 flex justify-between">
            <button onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} className="btn-ghost"><Icon name="arrowLeft" size={16} />{t('back')}</button>
            {i < 3 && <button onClick={() => setI(i + 1)} className="btn-primary">{t('next')}: {lang === 'fil' ? NALC[i + 1].fil : NALC[i + 1].en}<Icon name="arrow" size={16} /></button>}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

