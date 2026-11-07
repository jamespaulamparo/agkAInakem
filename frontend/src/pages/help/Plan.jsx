import { track } from '../../lib/track'
import { PlanArt } from '../../components/Illustrations'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Icon from '../../components/Icon'
import { usePlan, useContacts } from '../../lib/local'
import { useResources } from '../../components/HelpNow'
import { useI18n } from '../../lib/i18n'

const FIELDS = [
  ['signs', 'plan_signs', 'plan_signs_hint', 'eye'],
  ['helps', 'plan_helps', 'plan_helps_hint', 'heart'],
  ['people', 'plan_people', null, 'users'],
  ['places', 'plan_places', null, 'map'],
  ['reasons', 'plan_reasons', null, 'sparkle'],
]

// A personal safety plan, filled in when calm and opened in one tap from the Emergency screen.
export default function Plan() {
  const { t } = useI18n()
  const [plan, setPlan] = usePlan()
  const [contacts] = useContacts()
  const lines = useResources().filter((r) => r.kind === 'emergency' || r.kind === 'crisis_line')
  const [editing, setEditing] = useState(!plan)
  const [form, setForm] = useState(plan || {})
  const [saved, setSaved] = useState(false)

  const save = (e) => {
    e.preventDefault()
    setPlan({ ...form, updated: Date.now() }); track('plan_saved')
    setEditing(false); setSaved(true)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div className="hidden w-28 shrink-0 sm:block"><PlanArt /></div>
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold sm:text-5xl">{t('plan_title')}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-muted"><Icon name="lock" size={14} />{t('plan_sub')}</p>
        </div>
        {plan && !editing && (
          <div className="no-print flex shrink-0 flex-col gap-2 sm:flex-row">
            <button onClick={() => { track('plan_printed'); window.print() }} className="btn-ghost ring-1 ring-line"><Icon name="printer" size={16} />{t('print_plan')}</button>
            <button onClick={() => { setForm(plan); setEditing(true); setSaved(false) }} className="btn-ghost ring-1 ring-line">{t('edit')}</button>
          </div>
        )}
      </div>

      {editing ? (
        <form onSubmit={save} className="mt-10 space-y-8">
          {FIELDS.map(([k, label, hint, icon]) => (
            <label key={k} className="block">
              <span className="flex items-center gap-2 text-lg font-bold"><Icon name={icon} size={18} className="text-teal-ink" />{t(label)}</span>
              {hint && <span className="mt-1 block text-sm text-ink-muted">{t(hint)}</span>}
              <textarea rows={3} className="field mt-3" value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} maxLength={1000} />
            </label>
          ))}
          <button className="btn-primary px-8 py-3 text-base">{t('save')}</button>
        </form>
      ) : (
        <motion.dl initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 divide-y divide-line border-y border-line">
          {saved && <p className="py-3 text-sm text-sage-ink">{t('plan_saved')}</p>}
          {FIELDS.filter(([k]) => plan?.[k]).map(([k, label, , icon]) => (
            <div key={k} className="py-5">
              <dt className="flex items-center gap-2 text-sm font-bold text-ink-muted"><Icon name={icon} size={16} className="text-teal-ink" />{t(label)}</dt>
              <dd className="mt-2 whitespace-pre-line text-lg">{plan[k]}</dd>
            </div>
          ))}
        </motion.dl>
      )}
      {plan && !editing && (
        <div className="print-only mt-8">
          {contacts.length > 0 && (<>
            <h2 className="text-lg font-bold">{t('my_contacts')}</h2>
            <ul className="mt-2">{contacts.map((c) => <li key={c.id}>{c.name}{c.role ? ` (${c.role})` : ''}: {c.phone}</li>)}</ul>
          </>)}
          <h2 className="mt-6 text-lg font-bold">{t('hotlines')}</h2>
          <ul className="mt-2">{lines.map((r) => <li key={r.id}>{r.name}: {r.phones.map((p) => p.number).join(' / ')}{r.hours ? ` · ${r.hours}` : ''}</li>)}</ul>
        </div>
      )}
      <Link to="/help/emergency" className="no-print mt-8 inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink"><Icon name="phone" size={15} />{t('emergency')}</Link>
    </div>
  )
}
