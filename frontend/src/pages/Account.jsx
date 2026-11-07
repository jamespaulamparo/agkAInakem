import { track } from '../lib/track'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { Page, Spinner } from '../components/Layout'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { useI18n } from '../lib/i18n'
import ClearDeviceData from '../components/ClearDeviceData'
import { ResearchToggle } from '../components/StatsToggle'
import { DPO } from '../lib/privacy'

export default function Account() {
  const { t } = useI18n()
  const { user, ready, logout, forget } = useAuth()
  const navigate = useNavigate()
  const [del, setDel] = useState(false)
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(null)
  if (!ready) return <Spinner />
  if (!user) return <Navigate to="/login" replace />

  const download = async () => {
    const data = await api.exportData()
    track('data_export')
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: 'agkainakem-my-data.json' })
    a.click(); URL.revokeObjectURL(url)
  }
  const remove = async (e) => {
    e.preventDefault()
    try { await api.deleteAccount(pw); track('account_deleted'); forget(); navigate('/') } catch (x) { setErr(x.data?.detail || 'Could not delete.') }
  }
  return (
    <Page className="pt-14">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{user.name}</h1>
        <p className="mt-1 text-ink-muted">{user.email}</p>
        <h2 className="eyebrow mt-10">{t('your_rights')}</h2>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          <li><Link to="/journal" className="flex items-center gap-3 py-4 font-semibold hover:text-teal-ink"><Icon name="book" size={18} />{t('nav_journal')}</Link></li>
          <li><button onClick={download} className="flex w-full items-center gap-3 py-4 font-semibold hover:text-teal-ink"><Icon name="download" size={18} />{t('export')}</button></li>
          <li><Link to="/journal" className="flex items-center gap-3 py-4 font-semibold hover:text-teal-ink"><Icon name="check" size={18} />{t('rights_edit')}</Link></li>
          <li><a href={DPO.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 py-4 font-semibold hover:text-teal-ink"><Icon name="message" size={18} />{t('rights_contact')} · {DPO.handle}</a></li>
          <li><Link to="/privacy" className="flex items-center gap-3 py-4 font-semibold hover:text-teal-ink"><Icon name="lock" size={18} />Privacy Notice</Link></li>
          <li><button onClick={async () => { await logout(); navigate('/') }} className="flex w-full items-center gap-3 py-4 font-semibold hover:text-teal-ink"><Icon name="arrowLeft" size={18} />{t('log_out')}</button></li>
        </ul>
        <div className="mt-10"><ResearchToggle /></div>
        {user?.is_staff && <Link to="/dashboard" className="mt-6 inline-flex items-center gap-2 font-semibold text-teal-ink"><Icon name="pulse" size={18} />Dashboard</Link>}
        <div className="mt-10"><ClearDeviceData /></div>
        <div className="mt-6">
          {!del ? <button onClick={() => setDel(true)} className="text-sm font-semibold text-ink-faint underline underline-offset-4 hover:text-ink">{t('delete_account')}</button> : (
            <form onSubmit={remove} className="space-y-3">
              <p className="text-sm">{t('delete_confirm')}</p>
              <input className="field" type="password" required value={pw} onChange={(e) => setPw(e.target.value)} placeholder={t('password')} aria-label={t('password')} />
              {err && <p className="text-sm text-amber">{err}</p>}
              <div className="flex gap-2"><button className="btn bg-ink text-paper">{t('delete_account')}</button><button type="button" onClick={() => setDel(false)} className="btn-ghost">{t('cancel')}</button></div>
            </form>
          )}
        </div>
      </div>
    </Page>
  )
}
