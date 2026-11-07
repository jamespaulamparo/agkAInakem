import { useEffect, useState } from 'react'
import Icon from './Icon'
import { useI18n } from '../lib/i18n'

// Shows "Install app" only when the browser offers installation (https or localhost).
let deferred = null
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; window.dispatchEvent(new Event('agk-installable')) })
}

export default function InstallLink() {
  const { t } = useI18n()
  const [ready, setReady] = useState(!!deferred)
  useEffect(() => {
    const on = () => setReady(true)
    window.addEventListener('agk-installable', on)
    return () => window.removeEventListener('agk-installable', on)
  }, [])
  if (!ready) return null
  const install = async () => { deferred.prompt(); await deferred.userChoice.catch(() => {}); deferred = null; setReady(false) }
  return <button onClick={install} className="flex items-center gap-1 hover:text-ink"><Icon name="download" size={14} />{t('install_app')}</button>
}
