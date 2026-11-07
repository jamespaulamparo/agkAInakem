import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { trackPage } from '../lib/track'
import { AnimatePresence, motion } from 'framer-motion'
import { BrandMark, BrandName } from './Brand'
import Icon from './Icon'
import EmergencyButton from './HelpNow'
import FollowUpBanner from './FollowUp'
import ReminderBanner from './Reminder'
import InstallLink from './InstallLink'
import { useI18n, LANGS } from '../lib/i18n'
import { useAuth } from '../lib/auth'

function LangToggle() {
  const { lang, setLang } = useI18n()
  const other = LANGS.find(([l]) => l !== lang)
  return (<>
    {/* phones: one compact button that switches language */}
    <button type="button" onClick={() => setLang(other[0])} aria-label={`Language: ${lang.toUpperCase()}. Switch to ${other[2]}`}
      className="flex h-8 w-9 items-center justify-center rounded-full text-[0.7rem] font-bold uppercase text-ink-muted ring-1 ring-line hover:text-ink sm:hidden">
      {lang}
    </button>
    <div className="hidden items-center rounded-full border border-line bg-surface/70 p-0.5 text-[0.7rem] font-bold sm:flex" role="group" aria-label="Language">
      {LANGS.map(([l]) => (
        <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l}
          className={`relative rounded-full px-2.5 py-1 uppercase transition-colors ${lang === l ? 'text-paper' : 'text-ink-muted hover:text-ink'}`}>
          {lang === l && <motion.span layoutId="lang-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} />}
          <span className="relative">{l}</span>
        </button>
      ))}
    </div>
  </>)
}

function DisplayMenu() {
  const { t, simple, setSimple, theme, setTheme } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc) }
  }, [open])
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="true" title={t('display')}
        className={`flex h-8 items-center gap-1 rounded-full px-2 text-sm font-bold ring-1 ring-line sm:px-2.5 transition ${open ? 'bg-ink text-paper ring-ink' : 'text-ink-muted hover:text-ink'}`}>
        Aa<span className="sr-only"> {t('display')}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="absolute right-0 top-10 z-50 w-56 rounded-lg bg-surface p-3 shadow-lift ring-1 ring-line">
            <p className="eyebrow mb-2">{t('theme')}</p>
            <div className="flex rounded-full bg-ink/5 p-1 text-xs font-semibold" role="group" aria-label={t('theme')}>
              {[['system', t('theme_system'), 'sparkle'], ['light', t('theme_light'), 'sun'], ['dark', t('theme_dark'), 'moon']].map(([k, label, icon]) => (
                <button key={k} onClick={() => setTheme(k)} aria-pressed={theme === k}
                  className={`flex flex-1 items-center justify-center gap-1 rounded-full py-1.5 ${theme === k ? 'bg-surface shadow-soft text-ink' : 'text-ink-muted'}`}>
                  <Icon name={icon} size={13} />{label}
                </button>
              ))}
            </div>
            <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold">
              {t('simple_view')}
              <span className={`relative h-6 w-11 rounded-full transition ${simple ? 'bg-teal-ink' : 'bg-line'}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface shadow transition-all ${simple ? 'left-[22px]' : 'left-0.5'}`} />
              </span>
              <input type="checkbox" className="sr-only" checked={simple} onChange={(e) => setSimple(e.target.checked)} />
            </label>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Nav() {
  const { t } = useI18n()
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  const { user } = useAuth()
  const links = [
    { to: '/help', label: t('nav_help') },
    { to: '/journal', label: t('nav_journal') },
    { to: '/dictionary', label: t('nav_dictionary') },
  ]
  return (
    <header className={`sticky top-0 z-40 transition-[background,box-shadow] duration-300 ${scrolled || pathname !== '/' ? 'bg-paper/85 backdrop-blur-md shadow-[0_1px_0_#E4E9E5]' : ''}`}>
      <nav className="mx-auto flex h-16 max-w-page items-center gap-2 px-3 sm:gap-4 sm:px-6" aria-label="Main">
        <Link to="/" className="flex items-center gap-2 text-[1.05rem] max-[339px]:hidden" aria-label="agkAInakem home">
          <BrandMark size={26} /><BrandName className="hidden min-[400px]:inline" />
        </Link>
        <div className="ml-auto flex items-center gap-0.5 sm:gap-2">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) =>
              `relative whitespace-nowrap rounded-full px-1 py-2 text-[0.8rem] font-semibold min-[360px]:px-1.5 sm:px-3 sm:text-sm transition-colors ${isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'}`}>
              {({ isActive }) => (<>
                {l.label}
                {isActive && <motion.span layoutId="nav-dot" className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-teal" />}
              </>)}
            </NavLink>
          ))}
          <span className="mx-1 hidden h-5 w-px bg-line sm:block" />
          <DisplayMenu />
          <LangToggle />
          <Link to={user ? '/account' : '/login'} title={user ? user.name : t('log_in')} aria-label={user ? t('account') : t('log_in')}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${user ? 'bg-teal-ink text-paper' : 'text-ink-muted ring-1 ring-line hover:text-ink'}`}>
            {user ? user.name.slice(0, 1).toUpperCase() : <Icon name="user" size={16} />}
          </Link>
        </div>
      </nav>
    </header>
  )
}

function Footer() {
  const { t } = useI18n()
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-page flex-col gap-4 px-4 py-10 text-sm text-ink-muted sm:flex-row sm:items-center sm:px-6">
        <div className="flex items-center gap-2 text-ink"><BrandMark size={20} /><BrandName /></div>
        <div className="max-w-lg text-xs leading-relaxed">
          <p className="font-semibold text-ink">{t('first_aid')}</p>
          <p className="mt-1">{t('data_plain')}</p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 whitespace-nowrap text-xs font-semibold sm:ml-auto sm:max-w-sm sm:justify-end">
          <Link className="hover:text-ink" to="/about">{t('about_link')}</Link>
          <Link className="hover:text-ink" to="/privacy">{t('privacy_link')}</Link>
          <Link className="hover:text-ink" to="/help/plan">{t('my_plan')}</Link>
          <Link className="hover:text-ink" to="/saved">{t('saved_link')}</Link>
          <Link className="hover:text-ink" to="/extension">{t('ext_link')}</Link>
          <Link className="hover:text-ink" to="/credits">{t('credits_link')}</Link>
          <InstallLink />
          <Link className="flex items-center gap-1 hover:text-ink" to="/share"><Icon name="qr" size={14} />{t('open_phone')}</Link>
        </div>
      </div>
    </footer>
  )
}

export default function Layout() {
  const location = useLocation()
  useEffect(() => { window.scrollTo(0, 0); trackPage(location.pathname) }, [location.pathname])
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">Skip to content</a>
      <Nav />
      <AnimatePresence mode="wait">
        <motion.main id="main" key={location.pathname.split('/').slice(0, 2).join('/')} className="flex-1"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
      <FollowUpBanner />
      <ReminderBanner />
      <EmergencyButton />
    </div>
  )
}

export function Page({ children, className = '' }) {
  return <div className={`mx-auto w-full max-w-page px-4 sm:px-6 ${className}`}>{children}</div>
}

export function Spinner() {
  return (
    <div className="flex justify-center py-20" role="status" aria-label="Loading">
      <motion.span className="h-2.5 w-2.5 rounded-full bg-teal" animate={{ scale: [1, 1.8, 1], opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} />
    </div>
  )
}

export function ErrorNote({ error }) {
  return <p className="py-16 text-center text-ink-muted">{error?.status === 404 ? 'Not found.' : 'Something went wrong loading this. Please try again.'}</p>
}

export { Icon }
