import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { BrandMark, BrandName } from './Brand'
import Icon from './Icon'
import EmergencyButton from './HelpNow'
import FollowUpBanner from './FollowUp'
import { useI18n, LANGS } from '../lib/i18n'
import { useAuth } from '../lib/auth'

function LangToggle() {
  const { lang, setLang } = useI18n()
  return (
    <div className="flex items-center rounded-full border border-line bg-surface/70 p-0.5 text-[0.7rem] font-bold" role="group" aria-label="Language">
      {LANGS.map(([l]) => (
        <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l}
          className={`relative rounded-full px-2.5 py-1 uppercase transition-colors ${lang === l ? 'text-white' : 'text-ink-muted hover:text-ink'}`}>
          {lang === l && <motion.span layoutId="lang-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} />}
          <span className="relative">{l}</span>
        </button>
      ))}
    </div>
  )
}

function SimpleToggle() {
  const { t, simple, setSimple } = useI18n()
  return (
    <button type="button" onClick={() => setSimple(!simple)} aria-pressed={simple} title={t('simple_view')}
      className={`hidden h-8 items-center rounded-full px-2.5 text-sm font-bold sm:flex ${simple ? 'bg-ink text-white' : 'text-ink-muted ring-1 ring-line hover:text-ink'}`}>
      Aa<span className="sr-only"> {t('simple_view')}</span>
    </button>
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
      <nav className="mx-auto flex h-16 max-w-page items-center gap-4 px-4 sm:px-6" aria-label="Main">
        <Link to="/" className="flex items-center gap-2 text-[1.05rem]" aria-label="agkAInakem home">
          <BrandMark size={26} /><BrandName className="hidden min-[400px]:inline" />
        </Link>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) =>
              `relative whitespace-nowrap rounded-full px-1.5 py-2 text-[0.8rem] font-semibold sm:px-3 sm:text-sm transition-colors ${isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'}`}>
              {({ isActive }) => (<>
                {l.label}
                {isActive && <motion.span layoutId="nav-dot" className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-teal" />}
              </>)}
            </NavLink>
          ))}
          <span className="mx-1 hidden h-5 w-px bg-line sm:block" />
          <SimpleToggle />
          <LangToggle />
          <Link to={user ? '/account' : '/login'} title={user ? user.name : t('log_in')} aria-label={user ? t('account') : t('log_in')}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${user ? 'bg-teal-ink text-white' : 'text-ink-muted ring-1 ring-line hover:text-ink'}`}>
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
        <div className="flex gap-5 text-xs font-semibold sm:ml-auto">
          <Link className="hover:text-ink" to="/about">{t('about_link')}</Link>
          <Link className="hover:text-ink" to="/help/plan">{t('my_plan')}</Link>
          <Link className="hover:text-ink" to="/saved">{t('saved_link')}</Link>
          <Link className="hover:text-ink" to="/extension">{t('ext_link')}</Link>
          <Link className="hover:text-ink" to="/credits">{t('credits_link')}</Link>
        </div>
      </div>
    </footer>
  )
}

export default function Layout() {
  const location = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-white">Skip to content</a>
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
