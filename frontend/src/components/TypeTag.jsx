import { useI18n } from '../lib/i18n'

// Dictionary-style usage label, like "n." or "adj." in a print dictionary.
export default function TypeTag({ type, className = '' }) {
  const { t } = useI18n()
  const tone = type === 'clinical' ? 'text-ink' : type === 'psychological' ? 'text-sky-ink' : 'text-sage-ink'
  return <span className={`word text-[0.95em] italic ${tone} ${className}`}>{t(`type_${type}`)}</span>
}
