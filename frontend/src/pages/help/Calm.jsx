import { CalmArt } from '../../components/Illustrations'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from '../../components/Icon'
import Breathing from '../../components/Breathing'
import Grounding from '../../components/Grounding'
import { FollowUpOffer } from '../../components/FollowUp'
import { useI18n } from '../../lib/i18n'
import { useSpeech } from '../../lib/speech'
import { useLocal } from '../../lib/local'

export default function Calm() {
  const { t, lang } = useI18n()
  const [tool, setTool] = useState('breathe')
  const [audio, setAudio] = useLocal('agk_audio', false)
  const [after, setAfter] = useState(null)   // null | 'ask' | 'better'
  const speech = useSpeech(lang)
  const speak = audio && speech.available ? speech.speak : undefined

  return (
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="text-3xl font-extrabold sm:text-5xl">{t('calm_title')}</h1>

      {/* Read-aloud (uses the language chosen at the top of the page) */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
        <button onClick={() => { setAudio(!audio); speech.stop() }} aria-pressed={audio}
          className={`flex items-center gap-2 rounded-full px-3 py-2 font-semibold ring-1 ${audio ? 'bg-teal-soft text-teal-ink ring-teal/40' : 'text-ink-muted ring-line'}`}>
          <Icon name="ear" size={16} />{t('read_aloud')}
        </button>
      </div>
      {audio && !speech.available && <p className="mt-2 text-xs text-ink-faint">{t('no_voice')}</p>}

      <div className="mt-8 inline-flex rounded-full bg-ink/5 p-1" role="tablist">
        {[['breathe', t('breathe'), 'wind'], ['ground', t('ground'), 'hand']].map(([k, label, icon]) => (
          <button key={k} role="tab" aria-selected={tool === k} onClick={() => { setTool(k); setAfter(null) }}
            className={`relative flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold ${tool === k ? 'text-ink' : 'text-ink-muted'}`}>
            {tool === k && <motion.span layoutId="tool-pill" className="absolute inset-0 rounded-full bg-surface shadow-soft" />}
            <span className="relative flex items-center gap-2"><Icon name={icon} size={16} />{label}</span>
          </button>
        ))}
      </div>

      <div className="mt-10">
        <AnimatePresence mode="wait">
          {after ? (
            <motion.div key="after" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="py-6">
              {after === 'ask' ? (<>
                <p className="mx-auto max-w-md text-2xl font-bold leading-snug">{t('better_q')}</p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <button onClick={() => setAfter('better')} className="btn bg-sage-soft px-6 py-3 text-base text-sage-ink hover:brightness-95">{t('a_bit_better')}</button>
                  <Link to="/help/talk" className="btn bg-teal-ink px-6 py-3 text-base text-white hover:bg-[#245d58]">{t('choice_talk')}</Link>
                </div>
              </>) : (<>
                <div className="mx-auto mb-4 w-40"><CalmArt /></div>
                <p className="text-2xl font-bold">{t('glad')}</p>
                <div className="mt-6"><FollowUpOffer onDone={() => setAfter(null)} /></div>
              </>)}
            </motion.div>
          ) : (
            <motion.div key={tool} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {tool === 'breathe' ? <Breathing speak={speak} onFinish={() => setAfter('ask')} /> : <Grounding speak={speak} onFinish={() => setAfter('ask')} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
