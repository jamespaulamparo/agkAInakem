import Icon from '../../components/Icon'
import MyContacts from '../../components/MyContacts'
import { TalkArt } from '../../components/Illustrations'
import { useResources } from '../../components/HelpNow'
import { tel } from '../../lib/local'
import { useI18n } from '../../lib/i18n'

function Step({ n, title, children }) {
  return (
    <li className="relative grid grid-cols-[2.5rem_1fr] gap-4 pb-12 last:pb-0">
      <span className="word z-10 flex h-10 w-10 items-center justify-center rounded-full bg-teal-ink text-lg text-white">{n}</span>
      <div className="min-w-0 pt-1.5">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="mt-4">{children}</div>
      </div>
    </li>
  )
}

export function Phones({ phones, primary }) {
  return (
    <div className="flex flex-wrap gap-2">
      {phones.map((p, i) => (
        <a key={p.number} href={tel(p.number)} className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full font-bold ${i === 0 && primary ? 'bg-teal-ink px-5 py-2.5 text-white hover:bg-[#245d58]' : 'px-4 py-2 text-sm ring-1 ring-line hover:ring-teal'}`}>
          <Icon name="phone" size={15} />{p.number}{p.label && i > 0 ? <span className="font-medium text-ink-faint">{p.label}</span> : null}
        </a>
      ))}
    </div>
  )
}

export function Lines({ list }) {
  const { pick } = useI18n()
  return list.map((r) => (
    <div key={r.id} className="mb-6 last:mb-0">
      <p className="font-semibold">{r.name}</p>
      <p className="mb-3 text-sm text-ink-muted">{[pick(r, 'description'), r.location, r.hours].filter(Boolean).join(' · ')}</p>
      <Phones phones={r.phones} primary={r.is_24_7} />
    </div>
  ))
}

export default function Talk() {
  const { t } = useI18n()
  const resources = useResources()
  const lines = resources.filter((r) => r.kind === 'crisis_line')
  const clinics = resources.filter((r) => r.kind === 'hospital' || r.kind === 'government')
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold sm:text-5xl">{t('talk_title')}</h1>
          <p className="mt-2 text-ink-muted">{t('talk_sub')}</p>
        </div>
        <div className="w-32 shrink-0 sm:w-44"><TalkArt /></div>
      </div>
      <ol className="relative mt-12 before:absolute before:bottom-6 before:left-5 before:top-6 before:w-px before:bg-line">
        <Step n="1" title={t('my_contacts')}><MyContacts /></Step>
        <Step n="2" title={t('hotlines')}><Lines list={lines} /></Step>
        <Step n="3" title={t('clinic')}><Lines list={clinics} /></Step>
      </ol>
    </div>
  )
}
