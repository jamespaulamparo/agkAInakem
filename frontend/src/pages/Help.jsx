import { lazy, Suspense } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import Icon from '../components/Icon'
import HelpChoices from '../components/HelpChoices'
import { Page, Spinner } from '../components/Layout'
import { useI18n } from '../lib/i18n'

const Calm = lazy(() => import('./help/Calm'))
const Talk = lazy(() => import('./help/Talk'))
const Emergency = lazy(() => import('./help/Emergency'))
const Plan = lazy(() => import('./help/Plan'))
const Someone = lazy(() => import('./help/Someone'))
const CheckIn = lazy(() => import('./help/CheckIn'))

function Hub() {
  const { t } = useI18n()
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-center text-4xl font-extrabold sm:text-6xl">{t('need_q')}</h1>
      <div className="mt-10"><HelpChoices size="lg" /></div>
      <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-semibold text-ink-muted">
        <Link to="/help/plan" className="flex items-center gap-2 hover:text-ink"><Icon name="shield" size={16} />{t('my_plan')}</Link>
        <Link to="/help/someone" className="flex items-center gap-2 hover:text-ink"><Icon name="users" size={16} />{t('help_someone')}</Link>
        <Link to="/journal" className="flex items-center gap-2 hover:text-ink"><Icon name="pulse" size={16} />{t('nav_journal')}</Link>
      </div>
    </div>
  )
}

export default function Help() {
  const { t } = useI18n()
  const { pathname } = useLocation()
  const sub = pathname.replace(/\/$/, '') !== '/help'
  return (
    <Page className="pt-8 sm:pt-12">
      {sub && <Link to="/help" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink"><Icon name="arrowLeft" size={16} />{t('back_home')}</Link>}
      <Suspense fallback={<Spinner />}>
      <Routes>
        <Route index element={<Hub />} />
        <Route path="calm" element={<Calm />} />
        <Route path="talk" element={<Talk />} />
        <Route path="emergency" element={<Emergency />} />
        <Route path="plan" element={<Plan />} />
        <Route path="someone" element={<Someone />} />
        <Route path="check-in" element={<CheckIn />} />
      </Routes>
      </Suspense>
      <p className="mx-auto mt-20 max-w-xl text-center text-xs leading-relaxed text-ink-faint">{t('first_aid')}</p>
    </Page>
  )
}
