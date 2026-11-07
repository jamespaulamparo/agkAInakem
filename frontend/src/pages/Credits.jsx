import { useState } from 'react'
import { motion } from 'framer-motion'
import { Page } from '../components/Layout'
import { CREDITS } from '../lib/credits'
import { useI18n } from '../lib/i18n'

// Open-source brand icons (Simple Icons, CC0) from the jsDelivr CDN — not bundled.
// Anything without a published icon, or that fails to load, gets a monogram placeholder.
const ICONS = 'https://cdn.jsdelivr.net/npm/simple-icons@16.36.0/icons/'

function Logo({ slug, name }) {
  const [failed, setFailed] = useState(false)
  if (slug && !failed) return (
    <img src={`${ICONS}${slug}.svg`} alt="" width="22" height="22" loading="lazy" referrerPolicy="no-referrer"
      onError={() => setFailed(true)} className="h-[22px] w-[22px] shrink-0 opacity-80 dark:invert" />
  )
  const initials = name.replace(/\(.*?\)/g, '').split(/[\s·.\-]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  return (
    <span aria-hidden className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full bg-teal-soft text-[9px] font-extrabold tracking-tight text-teal-ink">{initials}</span>
  )
}

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
              {section.items.map(([name, what, slug]) => (
                <div key={name} className="grid gap-1 py-3.5 sm:grid-cols-[minmax(0,15rem)_1fr] sm:gap-6">
                  <dt className="flex items-center gap-3 font-semibold">{section.logos && <Logo slug={slug} name={name} />}{name}</dt>
                  <dd className="text-sm leading-relaxed text-ink-muted">{what}</dd>
                </div>
              ))}
            </dl>
          </motion.section>
        ))}
        <p className="mt-10 text-xs text-ink-faint">Logos: <a className="underline" href="https://simpleicons.org" target="_blank" rel="noreferrer">Simple Icons</a> (CC0), served by jsDelivr. Trademarks belong to their owners; shown only to credit the tools used.</p>
      </div>
    </Page>
  )
}
