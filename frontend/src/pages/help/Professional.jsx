import { track } from '../../lib/track'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../components/Icon'
import Patterns from '../../components/journal/Patterns'
import { TalkArt } from '../../components/Illustrations'
import { useResources } from '../../components/HelpNow'
import { Lines } from './Talk'
import { useJournal } from '../../lib/journal'
import { professionalSignal } from '../../lib/patterns'
import { useI18n } from '../../lib/i18n'

const T = {
  title: ['Talking with a professional', 'Pakikipag-usap sa propesyonal'],
  sub: ['It isn’t only for emergencies. A counsellor, psychologist or doctor can help you see patterns and blind spots in how you feel, and work through them with you.', 'Hindi lang ito para sa emergency. Matutulungan ka ng counselor, psychologist o doktor na makita ang mga pattern at hindi mo napapansin sa nararamdaman mo, at harapin ang mga ito kasama mo.'],
  helps: [['Notice patterns you can’t see from the inside', 'Name what’s going on, in plain words', 'Learn skills for hard days', 'Decide on next steps together'], ['Mapansin ang mga pattern na mahirap makita mula sa loob', 'Pangalanan ang nangyayari, sa simpleng salita', 'Matuto ng paraan para sa mahihirap na araw', 'Magpasya ng susunod na hakbang nang magkasama']],
  s1: ['Free, by phone, today', 'Libre, sa telepono, ngayon'],
  s2: ['Near you', 'Malapit sa iyo'],
  rhu: ['Your barangay health centre or Rural Health Unit: a doctor or nurse there can listen and refer you.', 'Ang barangay health center o Rural Health Unit: makikinig at makapag-rerefer ang doktor o nars doon.'],
  s3: ['At school or work', 'Sa paaralan o trabaho'],
  school: ['A guidance counsellor, school clinic, or your workplace clinic or HR can connect you to support. What you share is kept confidential under the Mental Health Act (RA 11036).', 'Makakatulong ang guidance counselor, school clinic, o ang clinic o HR sa trabaho. Kumpidensyal ang ibinabahagi mo ayon sa Mental Health Act (RA 11036).'],
  s4: ['What to say', 'Ano ang sasabihin'],
  script: ['I’ve been feeling heavy most days for a few weeks. I’d like to talk to someone about it.', 'Ilang linggo na akong mabigat ang pakiramdam halos araw-araw. Gusto kong makipag-usap sa isang tao tungkol dito.'],
  copy: ['Copy', 'Kopyahin'], copied: ['Copied', 'Nakopya'],
  s5: ['Bring your patterns (optional)', 'Dalhin ang mga pattern mo (opsyonal)'],
  bring: ['It can help to show what you’ve noticed. Print or save this summary as a PDF. Sharing it is always your choice.', 'Makatutulong na ipakita ang napansin mo. I-print o i-save bilang PDF ang buod na ito. Ikaw ang magpapasya kung ibabahagi.'],
  print: ['Print or save as PDF', 'I-print o i-save bilang PDF'],
  noData: ['Check in for a few days in your journal to see a summary here.', 'Mag-check-in nang ilang araw sa journal para makita ang buod dito.'],
  urgent: ['If you might hurt yourself or someone else, don’t wait.', 'Kung maaari mong masaktan ang sarili o iba, huwag nang maghintay.'],
  why: ['Why you’re seeing this: your check-ins show', 'Bakit mo ito nakikita: makikita sa mga check-in mo ang'],
}

function Step({ n, title, children }) {
  return (
    <li className="relative grid grid-cols-[2.5rem_1fr] gap-4 pb-12 last:pb-0 print:pb-4">
      <span className="word z-10 flex h-10 w-10 items-center justify-center rounded-full bg-talkbtn text-lg text-white">{n}</span>
      <div className="min-w-0 pt-1.5">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="mt-4">{children}</div>
      </div>
    </li>
  )
}

export default function Professional() {
  const { lang } = useI18n()
  const L = lang === 'fil' ? 1 : 0
  const s = (k) => T[k][L]
  const resources = useResources()
  const { entries } = useJournal()
  const sig = professionalSignal(entries)
  const [copied, setCopied] = useState(false)
  const lines = resources.filter((r) => r.kind === 'crisis_line')
  const clinics = resources.filter((r) => r.kind === 'hospital')
  const copy = async () => { try { await navigator.clipboard.writeText(s('script')); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* ignore */ } }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold sm:text-5xl">{s('title')}</h1>
          <p className="mt-3 text-ink-muted">{s('sub')}</p>
        </div>
        <div className="no-print w-28 shrink-0 sm:w-40"><TalkArt /></div>
      </div>

      {sig && (
        <p className="no-print mt-6 rounded-xl bg-sky-soft px-4 py-3 text-sm text-ink-muted">
          {s('why')} {sig.reasons.map((r) => r[lang === 'fil' ? 'fil' : 'en']).join('; ')}.
        </p>
      )}

      <ul className="mt-8 flex flex-wrap gap-2">
        {T.helps[L].map((h) => <li key={h} className="rounded-full bg-surface px-3.5 py-1.5 text-sm ring-1 ring-line">{h}</li>)}
      </ul>

      <ol className="relative mt-12 before:absolute before:bottom-6 before:left-5 before:top-6 before:w-px before:bg-line">
        <Step n="1" title={s('s1')}><Lines list={lines} /></Step>
        <Step n="2" title={s('s2')}>
          <Lines list={clinics} />
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">{s('rhu')}</p>
        </Step>
        <Step n="3" title={s('s3')}><p className="text-sm leading-relaxed text-ink-muted">{s('school')}</p></Step>
        <Step n="4" title={s('s4')}>
          <blockquote className="word border-l-2 border-talkbtn pl-4 text-lg italic leading-relaxed">“{s('script')}”</blockquote>
          <button onClick={copy} className="no-print mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-ink"><Icon name={copied ? 'check' : 'message'} size={15} />{copied ? s('copied') : s('copy')}</button>
        </Step>
        <Step n="5" title={s('s5')}>
          <p className="text-sm leading-relaxed text-ink-muted">{s('bring')}</p>
          <div className="mt-6">{Object.keys(entries).length >= 3 ? <Patterns entries={entries} print /> : <p className="text-sm text-ink-faint">{s('noData')}</p>}</div>
          {Object.keys(entries).length >= 3 && (
            <button onClick={() => { track('professional_print'); window.print() }} className="no-print mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-line hover:ring-teal"><Icon name="printer" size={15} />{s('print')}</button>
          )}
        </Step>
      </ol>

      <p className="no-print mt-14 border-t border-line pt-6 text-sm text-ink-muted">
        {s('urgent')} <Link to="/help/emergency" className="font-semibold text-alert">911 · 1553 →</Link>
      </p>
    </div>
  )
}
