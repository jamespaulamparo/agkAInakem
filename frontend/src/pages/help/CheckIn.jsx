import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import EntryEditor from '../../components/journal/EntryEditor'
import { useJournal } from '../../lib/journal'
import { todayIso } from '../../lib/dates'
import { useI18n } from '../../lib/i18n'

// Quick check-in from the help hub. Saves into the same journal (browser or account).
export default function CheckIn() {
  const { t, lang } = useI18n()
  const journal = useJournal()
  const [saved, setSaved] = useState(null)
  const reply = {
    green: [lang === 'fil' ? 'Mabuti. Tandaan kung ano ang nakatulong ngayon.' : 'Good. Notice what helped today.', [['/journal', t('open_journal')]]],
    yellow: [lang === 'fil' ? 'Ang dami mong dinadala. Isang maliit na pahinga muna?' : 'You’re carrying a lot. Maybe a small pause first?', [['/help/calm', t('choice_calm')], ['/journal', t('open_journal')]]],
    red: [lang === 'fil' ? 'Salamat sa pagiging tapat. Hindi mo kailangang mag-isa dito.' : 'Thank you for being honest. You don’t have to do this alone.', [['/help/talk', t('choice_talk')]]],
  }
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="text-3xl font-extrabold sm:text-4xl">{t('check_title')}</h1>
      <p className="mt-2 text-sm text-ink-muted">{t('check_note')}</p>
      <div className="mt-10"><EntryEditor journal={journal} date={todayIso()} compact onSaved={setSaved} /></div>
      {saved && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-10">
          <p className="text-xl font-semibold">{reply[saved.mood][0]}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {reply[saved.mood][1].map(([to, label]) => <Link key={to} to={to} className="btn-primary">{label}</Link>)}
          </div>
        </motion.div>
      )}
    </div>
  )
}
