import { useState } from 'react'
import { browserOptedOut, setStatsEnabled, statsEnabled } from '../lib/track'
import { useAuth } from '../lib/auth'
import { api } from '../lib/api'
import { useI18n } from '../lib/i18n'

function Switch({ on, onChange, label, disabled }) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 text-sm ${disabled ? 'opacity-60' : ''}`}>
      <span className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-teal-ink' : 'bg-line'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
      <input type="checkbox" className="sr-only" checked={on} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="text-ink-muted">{label}</span>
    </label>
  )
}

// Anonymous usage counts: on unless turned off here or by the browser (GPC / Do Not Track).
export function UsageToggle() {
  const { lang } = useI18n()
  const [on, setOn] = useState(statsEnabled())
  const blocked = browserOptedOut()
  return (
    <Switch on={on && !blocked} disabled={blocked} onChange={(v) => { setStatsEnabled(v); setOn(v) }}
      label={blocked
        ? (lang === 'fil' ? 'Naka-off: may “Do Not Track / Global Privacy Control” ang browser mo.' : 'Off: your browser sends Do Not Track / Global Privacy Control.')
        : (lang === 'fil' ? 'Magpadala ng hindi nagpapakilalang bilang ng paggamit mula sa browser na ito' : 'Send anonymous usage counts from this browser')} />
  )
}

// Separate, optional research consent for account holders.
export function ResearchToggle() {
  const { user, refresh } = useAuth()
  const { lang } = useI18n()
  const [busy, setBusy] = useState(false)
  if (!user) return null
  const set = async (v) => { setBusy(true); try { await api.research(v); await refresh() } finally { setBusy(false) } }
  return (
    <Switch on={!!user.research_opt_in} disabled={busy} onChange={set}
      label={lang === 'fil'
        ? 'Isama ang journal ko sa hindi nagpapakilalang istatistika para sa pananaliksik (bilang lang ng kulay, araw at salitang damdamin; hindi kailanman ang mga tala). Puwedeng i-off kahit kailan.'
        : 'Include my journal in anonymous research statistics (counts of colours, days and feeling words only; never notes). You can turn this off any time.'} />
  )
}
