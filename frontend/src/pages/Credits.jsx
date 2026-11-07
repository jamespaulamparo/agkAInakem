import { motion } from 'framer-motion'
import { Page } from '../components/Layout'
import { CREDITS } from '../lib/credits'
import { useI18n } from '../lib/i18n'

export default function Credits() {
  const { t } = useI18n()
  return (
    <Page className="pt-14 sm:pt-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-extrabold sm:text-5xl">{t('credits_link')}</h1>
        {CREDITS.map((section, i) => (
          <motion.section key={section.title} className="mt-14" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(i, 2) * 0.05 }}>
            <h2 className="eyebrow">{section.title}</h2>
            {section.note && <p className="mt-3 text-sm text-ink-muted">{section.note}</p>}
            <dl className="mt-4 divide-y divide-line border-y border-line">
              {section.items.map(([name, what]) => (
                <div key={name} className="grid gap-1 py-3.5 sm:grid-cols-[minmax(0,15rem)_1fr] sm:gap-6">
                  <dt className="font-semibold">{name}</dt>
                  <dd className="text-sm leading-relaxed text-ink-muted">{what}</dd>
                </div>
              ))}
            </dl>
          </motion.section>
        ))}
      </div>
    </Page>
  )
}
