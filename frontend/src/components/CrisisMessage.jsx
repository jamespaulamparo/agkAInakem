import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Icon from './Icon'
import { tel } from '../lib/local'
import { useI18n } from '../lib/i18n'

// Fixed, reviewed wording — never generated. Shown as soon as crisis words are typed.
export default function CrisisMessage({ compact = false }) {
  const { t } = useI18n()
  return (
    <motion.div role="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border-l-4 border-alert bg-alert-soft ${compact ? 'px-4 py-3' : 'px-5 py-5'}`}>
      <p className={`font-bold ${compact ? 'text-base' : 'text-lg'}`}>{t('fixed_msg')}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a href={tel('911')} className="inline-flex items-center gap-2 rounded-full bg-alert px-4 py-2 text-sm font-bold text-white"><Icon name="phone" size={15} />911</a>
        <a href={tel('1553')} className="inline-flex items-center gap-2 rounded-full bg-teal-ink px-4 py-2 text-sm font-bold text-white"><Icon name="phone" size={15} />1553</a>
        <Link to="/help/emergency" className="inline-flex items-center px-2 py-2 text-sm font-semibold text-ink">{t('emergency')} →</Link>
      </div>
    </motion.div>
  )
}
