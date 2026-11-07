import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { JournalArt } from '../components/Illustrations'
import { Page } from '../components/Layout'
import { useAuth } from '../lib/auth'
import { useI18n } from '../lib/i18n'

export default function Auth({ mode }) {
  const { t } = useI18n()
  const auth = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr(null)
    try {
      await (mode === 'register' ? auth.register(form) : auth.login(form))
      navigate('/journal')
    } catch (x) {
      const d = x.data || {}
      setErr(d.detail || d.email?.[0] || d.password?.join(' ') || (x.status === 429 ? 'Too many attempts. Wait a minute.' : 'Something went wrong.'))
    } finally { setBusy(false) }
  }
  return (
    <Page className="pt-12 sm:pt-20">
      <div className="mx-auto grid max-w-4xl items-center gap-12 md:grid-cols-2">
        <div className="hidden md:block"><JournalArt /></div>
        <motion.form onSubmit={submit} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
          <h1 className="text-3xl font-extrabold sm:text-4xl">{mode === 'register' ? t('register') : t('log_in')}</h1>
          <p className="mt-2 text-sm text-ink-muted">{t('auth_why')}</p>
          <div className="mt-8 space-y-3">
            {mode === 'register' && <input className="field" placeholder={t('your_name')} aria-label={t('your_name')} value={form.name} onChange={set('name')} maxLength={60} autoComplete="nickname" />}
            <input className="field" type="email" required placeholder={t('email')} aria-label={t('email')} value={form.email} onChange={set('email')} autoComplete="email" />
            <input className="field" type="password" required minLength={mode === 'register' ? 8 : undefined} placeholder={t('password')} aria-label={t('password')} value={form.password} onChange={set('password')}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
            {mode === 'register' && <p className="text-xs text-ink-faint">{t('pw_hint')}</p>}
          </div>
          {err && <p className="mt-3 text-sm text-amber" role="alert">{err}</p>}
          <button className="btn-primary mt-6 w-full py-3 text-base" disabled={busy}>{mode === 'register' ? t('register') : t('log_in')}</button>
          <p className="mt-5 text-center text-sm text-ink-muted">
            {mode === 'register' ? <>{t('have_account')} <Link to="/login" className="font-semibold text-teal-ink">{t('log_in')}</Link></>
              : <>{t('no_account')} <Link to="/register" className="font-semibold text-teal-ink">{t('register')}</Link></>}
          </p>
        </motion.form>
      </div>
    </Page>
  )
}
