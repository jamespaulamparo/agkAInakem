import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import App from './App'
import { I18nProvider, useI18n } from './lib/i18n'
import { AuthProvider } from './lib/auth'
import './index.css'

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
