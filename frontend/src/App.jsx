import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout, { Spinner } from './components/Layout'

const Home = lazy(() => import('./pages/Home'))
const Dictionary = lazy(() => import('./pages/Dictionary'))
const Word = lazy(() => import('./pages/Word'))
const Explore = lazy(() => import('./pages/Explore'))
const Help = lazy(() => import('./pages/Help'))
const About = lazy(() => import('./pages/About'))
const Saved = lazy(() => import('./pages/Saved'))
const Extension = lazy(() => import('./pages/Extension'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Journal = lazy(() => import('./pages/Journal'))
const Auth = lazy(() => import('./pages/Auth'))
const Account = lazy(() => import('./pages/Account'))
const Credits = lazy(() => import('./pages/Credits'))

export default function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="dictionary" element={<Dictionary />} />
          <Route path="dictionary/:slug" element={<Word />} />
          <Route path="explore" element={<Explore />} />
          <Route path="help/*" element={<Help />} />
          <Route path="reach-out/*" element={<Navigate to="/help" replace />} />
          <Route path="journal" element={<Journal />} />
          <Route path="login" element={<Auth mode="login" />} />
          <Route path="register" element={<Auth mode="register" />} />
          <Route path="account" element={<Account />} />
          <Route path="about" element={<About />} />
          <Route path="credits" element={<Credits />} />
          <Route path="saved" element={<Saved />} />
          <Route path="extension" element={<Extension />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
