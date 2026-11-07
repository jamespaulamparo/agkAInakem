import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from '../components/Icon'
import { Page } from '../components/Layout'
import { useI18n } from '../lib/i18n'
import { useSaved } from '../lib/saved'

export default function Saved() {
  const { t, lang } = useI18n()
  const { items, toggle } = useSaved()
  return (
    <Page className="pt-14">
      <div className="mx-auto max-w-prose">
        <h1 className="text-4xl font-extrabold">{t('saved_link')}</h1>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-faint"><Icon name="lock" size={14} />{lang === 'fil' ? 'Naka-save lang sa browser na ito.' : 'Stored only in this browser.'}</p>
        {items.length === 0 ? (
          <p className="mt-12 text-ink-muted">{lang === 'fil' ? 'Wala pang naka-save.' : 'Nothing saved yet.'} <Link to="/dictionary" className="link">{t('nav_dictionary')}</Link></p>
        ) : (
          <ul className="mt-8 border-t border-line">
            <AnimatePresence>
              {items.map((w) => (
                <motion.li key={w.slug} layout exit={{ opacity: 0, x: 30 }} className="flex items-start gap-4 border-b border-line py-5">
                  <div className="flex-1">
                    <Link to={`/dictionary/${w.slug}`} className="word text-2xl hover:text-teal-ink">{w.term}</Link>
                    <p className="mt-1 text-ink-muted">{w.short}</p>
                  </div>
                  <button onClick={() => toggle({ slug: w.slug })} className="rounded-full p-2 text-ink-faint hover:bg-ink/5 hover:text-ink" aria-label={`Remove ${w.term}`}><Icon name="x" size={18} /></button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </Page>
  )
}
