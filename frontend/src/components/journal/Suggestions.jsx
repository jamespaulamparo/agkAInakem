import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Icon from '../Icon'
import { suggestions } from '../../lib/suggestions'
import { useContacts, usePlan } from '../../lib/local'
import { useI18n } from '../../lib/i18n'

export default function Suggestions({ entries }) {
  const { t, lang } = useI18n()
  const [plan] = usePlan()
  const [contacts] = useContacts()
  const list = suggestions(entries, { hasPlan: !!plan, contactCount: contacts.length })
  if (!list.length) return null
  const L = lang === 'fil' ? 'fil' : 'en'
  return (
    <section aria-labelledby="sg-title">
      <h2 id="sg-title" className="text-2xl font-bold">{t('suggested')}</h2>
      <p className="mt-1 text-xs text-ink-faint">{t('suggested_note')}</p>
      <ul className="mt-5 divide-y divide-line border-y border-line">
        {list.map((s, i) => (
          <motion.li key={s.key} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
            className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.priority <= 2 ? 'bg-talkbtn' : 'bg-calmbtn'}`} />
            <p className="min-w-0 flex-1">{s[L]}</p>
            {s.to && (
              <Link to={s.to} data-track="suggestion_click" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-teal-ink hover:gap-2.5 transition-all">
                {s.cta[L === 'fil' ? 1 : 0]} <Icon name="arrow" size={15} />
              </Link>
            )}
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
