import { track } from '../lib/track'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from './Icon'
import { useContacts, tel, sms } from '../lib/local'
import { useI18n } from '../lib/i18n'

const blank = { name: '', phone: '', role: '', message: '' }

function ContactForm({ initial, onSave, onCancel }) {
  const { t } = useI18n()
  const [f, setF] = useState(initial || blank)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  return (
    <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden"
      onSubmit={(e) => { e.preventDefault(); if (f.name.trim() && f.phone.trim()) onSave({ ...f, name: f.name.trim(), phone: f.phone.trim() }) }}>
      <div className="grid gap-3 py-4 sm:grid-cols-2">
        <input className="field" placeholder={t('name')} aria-label={t('name')} value={f.name} onChange={set('name')} maxLength={40} required />
        <input className="field" type="tel" placeholder={t('phone')} aria-label={t('phone')} value={f.phone} onChange={set('phone')} maxLength={20} required />
        <input className="field sm:col-span-2" placeholder={t('contact_role')} aria-label={t('contact_role')} value={f.role} onChange={set('role')} maxLength={60} />
        <textarea className="field sm:col-span-2" rows={2} placeholder={`${t('contact_msg')} — “${t('trusted_default')}”`} aria-label={t('contact_msg')} value={f.message} onChange={set('message')} maxLength={300} />
        <div className="flex gap-2 sm:col-span-2">
          <button className="btn-primary">{t('save')}</button>
          <button type="button" onClick={onCancel} className="btn-ghost">{t('cancel')}</button>
        </div>
      </div>
    </motion.form>
  )
}

// The person's own list: they decide who, what role, and what message.
export default function MyContacts() {
  const { t } = useI18n()
  const [contacts, setContacts] = useContacts()
  const [editing, setEditing] = useState(null)   // contact id | 'new' | null

  const save = (c) => {
    if (editing === 'new') { setContacts([...contacts, { ...c, id: `c${Date.now()}` }]); track('contact_added') }
    else setContacts(contacts.map((x) => (x.id === editing ? { ...x, ...c } : x)))
    setEditing(null)
  }
  const remove = (id) => { setContacts(contacts.filter((x) => x.id !== id)); setEditing(null) }

  return (
    <div>
      <p className="text-sm text-ink-muted">{t('contacts_hint')}</p>
      <ul className="mt-4 divide-y divide-line">
        {contacts.map((c) => (
          <li key={c.id} className="py-4">
            {editing === c.id ? (
              <AnimatePresence><ContactForm initial={c} onSave={save} onCancel={() => setEditing(null)} /></AnimatePresence>
            ) : (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-soft text-lg font-bold text-teal-ink">{c.name.slice(0, 1).toUpperCase()}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{c.name}{c.role && <span className="font-normal text-ink-muted"> · {c.role}</span>}</p>
                  <p className="text-sm text-ink-faint">{c.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a href={tel(c.phone)} className="inline-flex items-center gap-1.5 rounded-full bg-teal-ink px-4 py-2 text-sm font-bold text-paper hover:bg-teal-ink/90"><Icon name="phone" size={14} />{t('call')}</a>
                  <a href={sms(c.phone, c.message || t('trusted_default'))} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold ring-1 ring-line hover:ring-teal"><Icon name="message" size={14} />{t('text')}</a>
                  <button onClick={() => setEditing(c.id)} className="px-2 text-sm font-semibold text-ink-faint hover:text-ink">{t('edit')}</button>
                  <button onClick={() => remove(c.id)} aria-label={`${t('remove')} ${c.name}`} className="rounded-full p-1.5 text-ink-faint hover:bg-ink/5 hover:text-ink"><Icon name="x" size={16} /></button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      <AnimatePresence>
        {editing === 'new'
          ? <ContactForm key="new" onSave={save} onCancel={() => setEditing(null)} />
          : <button onClick={() => setEditing('new')} className="mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-teal-ink ring-1 ring-line hover:ring-teal">+ {t('add_contact')}</button>}
      </AnimatePresence>
      {contacts.length > 0 && <p className="mt-3 text-xs text-ink-faint">{t('opens_sms')}</p>}
    </div>
  )
}
