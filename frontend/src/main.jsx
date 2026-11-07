import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import App from './App'
import { I18nProvider, useI18n } from './lib/i18n'
import { AuthProvider } from './lib/auth'
// Fonts are bundled with the site (no request to Google Fonts): Open Font License.
import '@fontsource/plus-jakarta-sans/latin-400.css'
import '@fontsource/plus-jakarta-sans/latin-500.css'
import '@fontsource/plus-jakarta-sans/latin-600.css'
import '@fontsource/plus-jakarta-sans/latin-700.css'
import '@fontsource/plus-jakarta-sans/latin-800.css'
import '@fontsource/newsreader/latin-400.css'
import '@fontsource/newsreader/latin-400-italic.css'
import '@fontsource/newsreader/latin-500.css'
import '@fontsource/newsreader/latin-500-italic.css'
import '@fontsource/newsreader/latin-600.css'
import './index.css'
import { installTracking } from './lib/track'
installTracking()

function Motion({ children }) {
  const { simple } = useI18n()
  return <MotionConfig reducedMotion={simple ? 'always' : 'user'}>{children}</MotionConfig>
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <AuthProvider><Motion><App /></Motion></AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

// Offline support for the help screens (production build only).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
}
