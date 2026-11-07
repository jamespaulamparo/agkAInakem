import { useState } from 'react'
import Icon from './Icon'
import { useTrusted, tel, sms } from '../lib/local'
import { useI18n } from '../lib/i18n'

// A friend or family member saved in advance. Messages open the person's own SMS app to review and send.
export default function TrustedPerson({ big = false }) {
  const { t } = useI18n()
  const [trusted, setTrusted] = useTrusted()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(trusted || { name: '', phone: '', message: '' })

  if (!trusted || editing) {
    return (
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (form.name && form.phone) { setTrusted(form); setEditing(false) } }}>
        <p className="text-sm text-ink-muted">{t('trusted_setup')}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="field" placeholder={t('name')} aria-label={t('name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={40} required />
          <input className="field" type="tel" placeholder={t('phone')} aria-label={t('phone')} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={20} required />
        </div>
        <textarea className="field" rows={2} aria-label={t('message')} placeholder={t('trusted_default')} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={300} />
        <div className="flex gap-2">
          <button className="btn-primary">{t('save')}</button>
          {trusted && <button type="button" onClick={() => setEditing(false)} className="btn-ghost">{t('cancel')}</button>}
        </div>
      </form>
    )
  }
  const message = trusted.message || t('trusted_default')
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sage-soft text-sage-ink"><Icon name="heart" /></span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{trusted.name}</p>
          <p className="truncate text-sm italic text-ink-muted">&ldquo;{message}&rdquo;</p>
        </div>
        <button onClick={() => { setForm(trusted); setEditing(true) }} className="text-sm font-semibold text-ink-faint hover:text-ink">{t('edit')}</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <a href={sms(trusted.phone, message)} className={`inline-flex items-center gap-2 rounded-full bg-teal-ink font-bold text-white hover:bg-[#245d58] ${big ? 'px-6 py-3' : 'px-4 py-2 text-sm'}`}>
          <Icon name="message" size={16} />{t('send_msg_to')} {trusted.name}
        </a>
        <a href={tel(trusted.phone)} className={`inline-flex items-center gap-2 rounded-full font-bold ring-1 ring-line hover:ring-teal ${big ? 'px-6 py-3' : 'px-4 py-2 text-sm'}`}>
          <Icon name="phone" size={16} />{t('call')}
        </a>
      </div>
      <p className="mt-2 text-xs text-ink-faint">{t('opens_sms')}</p>
    </div>
  )
}
