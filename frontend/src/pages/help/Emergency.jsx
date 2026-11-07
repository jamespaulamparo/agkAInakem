import { track } from '../../lib/track'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from '../../components/Icon'
import { useResources } from '../../components/HelpNow'
import { useContacts, usePlan, tel, sms } from '../../lib/local'
import { useI18n } from '../../lib/i18n'

// No questions, no forms. Fixed wording only.
function ShareLocation({ contacts }) {
  const { t } = useI18n()
  const [step, setStep] = useState('idle')   // idle | confirm | locating | error
  const [who, setWho] = useState(contacts[0]?.id)
  const trusted = contacts.find((c) => c.id === who) || contacts[0]
  const go = () => {
    setStep('locating')
    track('location_share')
    if (!navigator.geolocation) return setStep('error')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const link = `https://maps.google.com/?q=${coords.latitude.toFixed(5)},${coords.longitude.toFixed(5)}`
        window.location.href = sms(trusted.phone, `${trusted.message || t('trusted_default')} ${link}`)
        setStep('idle')
      },
      () => setStep('error'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }
  return (
    <div>
      {step === 'idle' && (
        <button onClick={() => setStep('confirm')} className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-bold ring-1 ring-line hover:ring-teal">
          <Icon name="map" size={18} />{t('share_with')}
        </button>
      )}
      <AnimatePresence>
        {step === 'confirm' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg bg-surface p-4 ring-1 ring-line">
            {contacts.length > 1 && (
              <select className="field mb-3" value={who} onChange={(e) => setWho(e.target.value)} aria-label={t('my_contacts')}>
                {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}{c.role ? ` · ${c.role}` : ''}</option>)}
              </select>
            )}
            <p className="text-sm">{contacts.length === 1 && <strong>{trusted.name}: </strong>}{t('share_confirm')}</p>
            <div className="mt-3 flex gap-2">
              <button onClick={go} className="btn-primary">{t('share_go')}</button>
              <button onClick={() => setStep('idle')} className="btn-ghost">{t('cancel')}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {step === 'locating' && <p className="text-sm text-ink-muted">…</p>}
      {step === 'error' && <p className="text-sm text-ink-muted">{t('loc_fail')}</p>}
    </div>
  )
}

export default function Emergency() {
  const { t } = useI18n()
  const [contacts] = useContacts()
  const [plan] = usePlan()
  const lines = useResources().filter((r) => r.kind === 'crisis_line')
  const crisis = lines.find((r) => r.is_24_7) || lines[0]
  const others = lines.filter((r) => r !== crisis)
  return (
    <div className="mx-auto max-w-xl text-center">
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-extrabold leading-tight sm:text-5xl">
        {t('fixed_msg')}
      </motion.p>

      <div className="mt-10 space-y-3">
        <a href={tel('911')} className="flex w-full items-center justify-center gap-3 rounded-xl bg-alert px-6 py-6 text-2xl font-extrabold text-white shadow-lift transition hover:bg-alert-hover">
          <Icon name="phone" size={26} />{t('call_911')}
        </a>
        <a href={tel(crisis?.phones[0].number || '1553')} className="flex w-full items-center justify-center gap-3 rounded-xl bg-teal-ink px-6 py-5 text-xl font-bold text-paper shadow-soft transition hover:bg-teal-ink/90">
          <Icon name="phone" size={22} />{t('call_1553')}
        </a>
        {crisis?.phones.length > 1 && (
          <p className="text-sm text-ink-muted">
            {t('crisis_line_note')}{' '}
            {crisis.phones.slice(1).map((p, i) => <a key={i} href={tel(p.number)} className="ml-2 whitespace-nowrap font-semibold text-teal-ink underline underline-offset-4">{p.number}</a>)}
          </p>
        )}
        {others.map((r) => (
          <div key={r.id} className="pt-3 text-sm">
            <p className="font-semibold">{r.short_name || r.name}{r.hours ? <span className="font-normal text-ink-muted"> · {r.hours}</span> : null}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {r.phones.map((p) => <a key={p.number} href={tel(p.number)} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 font-bold ring-1 ring-line hover:ring-teal"><Icon name="phone" size={14} />{p.number}<span className="font-medium text-ink-faint">{p.label}</span></a>)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center gap-4 border-t border-line pt-8">
        {contacts.length > 0 ? (<>
          <div className="flex flex-wrap justify-center gap-2">
            {contacts.slice(0, 4).map((c) => (
              <a key={c.id} href={sms(c.phone, c.message || t('trusted_default'))} className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-bold ring-1 ring-line hover:ring-teal">
                <Icon name="message" size={18} />{t('send_msg_to')} {c.name}
              </a>
            ))}
          </div>
          <ShareLocation contacts={contacts} />
        </>) : (
          <Link to="/help/talk" className="text-sm font-semibold text-ink-muted hover:text-ink">{t('add_contact')} →</Link>
        )}
        <Link to="/help/plan" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-ink">
          <Icon name="shield" size={16} />{t('my_plan')}{plan ? '' : ' →'}
        </Link>
      </div>
    </div>
  )
}
