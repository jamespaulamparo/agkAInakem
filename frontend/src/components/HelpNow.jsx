import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Icon from './Icon'
import { api } from '../lib/api'
import { useI18n } from '../lib/i18n'

// Shown even offline or if the API is down: emergency access never depends on the backend.
const FALLBACK = [
  { id: 'f1', short_name: '911', name: 'National Emergency Hotline', phones: [{ label: 'Emergency', number: '911' }], kind: 'emergency' },
  { id: 'f2', short_name: 'NCMH', name: 'NCMH Crisis Hotline', phones: [{ label: 'Nationwide', number: '1553' }, { label: 'Toll-free', number: '1800-1888-1553' }], kind: 'crisis_line', is_24_7: true, hours: '24/7' },
  { id: 'f3', short_name: 'DOH CHD I', name: 'Department of Health – Center for Health Development I', phones: [{ label: 'Smart', number: '0961-815-1416' }, { label: 'Globe', number: '0945-491-4447' }], kind: 'crisis_line', is_24_7: false, hours: 'Mon–Fri, 8:00–17:00' },
]
export { tel } from '../lib/local'

export function useResources() {
  const [list, setList] = useState(FALLBACK)
  useEffect(() => { api.resources().then((r) => r.length && setList(r)).catch(() => {}) }, [])
  return list
}

// The only red element on the site. Visible on every screen, one tap to the emergency screen.
export default function EmergencyButton() {
  const { t } = useI18n()
  const { pathname } = useLocation()
  if (pathname === '/help/emergency') return null
  return (
    <motion.div className="no-print fixed bottom-5 right-5 z-40" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
      <Link to="/help/emergency" className="flex items-center gap-2 rounded-full bg-alert py-3 pl-3.5 pr-5 text-sm font-bold text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-alert-hover">
        <span className="relative flex h-5 w-5 items-center justify-center">
          <motion.span className="absolute inset-0 rounded-full bg-white/40" animate={{ scale: [1, 1.9], opacity: [0.6, 0] }} transition={{ repeat: Infinity, duration: 2.4 }} />
          <Icon name="phone" size={17} />
        </span>
        {t('emergency')}
      </Link>
    </motion.div>
  )
}
