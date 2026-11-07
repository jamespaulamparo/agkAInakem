import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Icon from './Icon'
import { useI18n } from '../lib/i18n'

// Three small, self-explanatory buttons in one family of deep, muted tones
// (same lightness and weight, different hue). Red only for danger.
export default function HelpChoices({ delay = 0, size = 'md' }) {
  const { t } = useI18n()
  const items = [
    { to: '/help/calm', icon: 'wind', label: t('choice_calm'), cls: 'bg-calmbtn text-white hover:bg-calmbtn-hover' },
    { to: '/help/talk', icon: 'message', label: t('choice_talk'), cls: 'bg-talkbtn text-white hover:bg-talkbtn-hover' },
    { to: '/help/emergency', icon: 'phone', label: t('choice_danger_short'), cls: 'bg-alert text-white hover:bg-alert-hover' },
  ]
  const pad = size === 'lg' ? 'px-6 py-3.5 text-base' : 'px-5 py-3 text-[0.95rem]'
  return (
    <ul className="flex flex-wrap justify-center gap-3">
      {items.map((it, i) => (
        <motion.li key={it.to} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: delay + i * 0.07, duration: 0.45 }}>
          <Link to={it.to} className={`inline-flex items-center gap-2 rounded-full font-bold shadow-soft transition-all hover:-translate-y-0.5 ${pad} ${it.cls}`}>
            <Icon name={it.icon} size={18} />{it.label}
          </Link>
        </motion.li>
      ))}
    </ul>
  )
}
