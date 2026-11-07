import { track } from '../lib/track'
import { useState } from 'react'
import Icon from './Icon'
import { clearDeviceData } from '../lib/privacy'
import { useI18n } from '../lib/i18n'

export default function ClearDeviceData() {
  const { lang } = useI18n()
  const fil = lang === 'fil'
  const [step, setStep] = useState('idle')
  if (step === 'done') return <p className="text-sm text-sage-ink">{fil ? 'Nabura na ang lahat ng data sa device na ito.' : 'Everything on this device has been erased.'}</p>
  if (step === 'confirm') return (
    <div className="rounded-md bg-surface p-4 text-sm ring-1 ring-line">
      <p>{fil ? 'Buburahin nito ang journal (kung walang account), safety plan, mga contact, paalala, naka-save na salita at settings sa browser na ito. Hindi na ito maibabalik.' : 'This erases the journal (if you don’t use an account), safety plan, contacts, reminders, saved words and settings in this browser. It can’t be undone.'}</p>
      <div className="mt-3 flex gap-2">
        <button onClick={async () => { track('device_erased'); await clearDeviceData(); setStep('done'); setTimeout(() => window.location.reload(), 1200) }} className="btn bg-ink text-paper">{fil ? 'Burahin' : 'Erase'}</button>
        <button onClick={() => setStep('idle')} className="btn-ghost">{fil ? 'Kanselahin' : 'Cancel'}</button>
      </div>
    </div>
  )
  return (
    <button onClick={() => setStep('confirm')} className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted underline underline-offset-4 hover:text-ink">
      <Icon name="x" size={14} />{fil ? 'Burahin ang lahat ng data sa device na ito' : 'Erase all agkAInakem data on this device'}
    </button>
  )
}
