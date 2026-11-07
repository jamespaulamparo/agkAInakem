import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { motion } from 'framer-motion'
import Icon from '../components/Icon'
import { Page } from '../components/Layout'
import { useI18n } from '../lib/i18n'

// The public demo address (dev tunnel). Change it here if the tunnel link changes.
export const PUBLIC_URL = 'https://hbjhw4bn-8000.asse.devtunnels.ms/'

export default function Share() {
  const { t } = useI18n()
  const [svg, setSvg] = useState('')
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    QRCode.toString(PUBLIC_URL, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#263A38', light: '#FFFFFF' } }).then(setSvg)
  }, [])
  const copy = async () => { try { await navigator.clipboard.writeText(PUBLIC_URL); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* ignore */ } }
  return (
    <Page className="pt-14 sm:pt-20">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-4xl font-extrabold">{t('share_title')}</h1>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="mx-auto mt-10 w-[min(80vw,340px)] rounded-xl bg-white p-4 shadow-lift [&_svg]:h-auto [&_svg]:w-full" role="img" aria-label={`QR code for ${PUBLIC_URL}`}
          dangerouslySetInnerHTML={{ __html: svg }} />
        <p className="mt-6 break-all font-mono text-base font-semibold">{PUBLIC_URL}</p>
        <div className="mt-3 flex justify-center gap-2">
          <button onClick={copy} className="btn-ghost ring-1 ring-line"><Icon name={copied ? 'check' : 'link'} size={16} />{copied ? t('copied') : t('copy_link')}</button>
          <a href={PUBLIC_URL} target="_blank" rel="noreferrer" className="btn-ghost ring-1 ring-line"><Icon name="globe" size={16} />Open</a>
        </div>
      </div>
    </Page>
  )
}
