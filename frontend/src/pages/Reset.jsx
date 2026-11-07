import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Page } from '../components/Layout'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { useI18n } from '../lib/i18n'

// /forgot — ask for a link.  /reset/:uid/:token — choose a new password.
export function Forgot() {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [state, setState] = useState(null)   // null | 'sent' | 'error'
  const submit = async (e) => {
    e.preventDefault()
    try { await api.passwordReset(email); setState('sent') } catch (x) { setState(x.status === 429 ? 'slow' : 'error') }
  }
  return (
    <Page className="pt-16 sm:pt-24">
      <form onSubmit={submit} className="mx-auto max-w-sm">
        <h1 className="text-3xl font-extrabold">{t('forgot_title')}</h1>
        <p className="mt-2 text-sm text-ink-muted">{t('forgot_sub')}</p>
        {state === 'sent' ? <p className="mt-8 rounded-md bg-sage-soft px-4 py-3 text-sm">{t('forgot_sent')}</p> : (<>
          <input className="field mt-8" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('email')} aria-label={t('email')} autoComplete="email" />
          {state && <p className="mt-2 text-sm text-amber">{state === 'slow' ? 'Too many attempts. Wait a minute.' : 'Something went wrong.'}</p>}
          <button className="btn-primary mt-4 w-full py-3">{t('forgot_send')}</button>
        </>)}
        <p className="mt-6 text-center text-sm"><Link to="/login" className="font-semibold text-teal-ink">{t('log_in')}</Link></p>
      </form>
    </Page>
  )
}

export function Reset() {
  const { t } = useI18n()
  const { uid, token } = useParams()
  const { refresh } = useAuth()
  const navigate = useNavigate()
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(null)
  const submit = async (e) => {
    e.preventDefault(); setErr(null)
    try { await api.passwordResetConfirm({ uid, token, password: pw }); await refresh(); navigate('/journal') }
    catch (x) { setErr(x.data?.detail || x.data?.password?.join(' ') || 'Something went wrong.') }
  }
  return (
    <Page className="pt-16 sm:pt-24">
      <form onSubmit={submit} className="mx-auto max-w-sm">
        <h1 className="text-3xl font-extrabold">{t('set_password')}</h1>
        <input className="field mt-8" type="password" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} placeholder={t('new_password')} aria-label={t('new_password')} autoComplete="new-password" />
        <p className="mt-2 text-xs text-ink-faint">{t('pw_hint')}</p>
        {err && <p className="mt-2 text-sm text-amber" role="alert">{err} {err.includes('expired') && <Link to="/forgot" className="font-semibold text-teal-ink">{t('forgot_send')}</Link>}</p>}
        <button className="btn-primary mt-4 w-full py-3">{t('set_password')}</button>
      </form>
    </Page>
  )
}
