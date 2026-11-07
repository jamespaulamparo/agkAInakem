import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from '../../components/Icon'
import { api } from '../../lib/api'
import { useI18n } from '../../lib/i18n'

export default function RequestForm({ responder, onDone }) {
  const { lang } = useI18n()
  const [form, setForm] = useState({ first_name: '', preferred_contact: responder.contact_methods.includes('In person') ? 'in_person' : 'message', contact_detail: '', message: '' })
  const [state, setState] = useState({ busy: false, error: null, result: null })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const submit = async (e) => {
    e.preventDefault()
    setState({ busy: true, error: null, result: null })
    try {
      const result = await api.supportRequest({ ...form, responder: responder.id })
      setState({ busy: false, error: null, result })
    } catch (err) {
      const d = err.data || {}
      setState({ busy: false, result: null, error: d.contact_detail?.[0] || d.non_field_errors?.[0] || (err.status === 429 ? 'Too many requests. Please try again later.' : 'Could not send. Please try again.') })
    }
  }
  if (state.result) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 border-l-2 border-sage pl-4 text-sm">
        <p className="font-semibold">{lang === 'fil' ? 'Naipadala ang iyong kahilingan.' : 'Your request was sent.'}</p>
        <p className="mt-1 text-ink-muted">{state.result.note} {lang === 'fil' ? 'Karaniwang tugon:' : 'Usual response time:'} {state.result.expected_response}.</p>
        <p className="mt-1 text-ink-muted">{lang === 'fil' ? 'Kung hindi ka makapaghintay, tumawag sa 1553.' : 'If you can’t wait, call 1553.'}</p>
        <button onClick={onDone} className="mt-2 font-semibold text-teal-ink">OK</button>
      </motion.div>
    )
  }
  return (
    <motion.form onSubmit={submit} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <p className="text-sm text-ink-muted sm:col-span-2">
          {lang === 'fil' ? 'Si' : 'Only'} <strong>{responder.display_name}</strong> {lang === 'fil' ? 'lamang ang makakakita nito. Karaniwang tugon:' : 'will see this. They usually respond'} {responder.expected_response.toLowerCase()}.
          {responder.is_demo && <span className="text-amber"> {lang === 'fil' ? 'Demo ito — walang totoong tao ang tatanggap.' : 'Demo profile — no real person receives it.'}</span>}
        </p>
        <input className="field" placeholder={lang === 'fil' ? 'Pangalan o palayaw (opsyonal)' : 'Name or nickname (optional)'} value={form.first_name} onChange={set('first_name')} maxLength={60} />
        <select className="field" value={form.preferred_contact} onChange={set('preferred_contact')} aria-label="Preferred contact">
          <option value="in_person">{lang === 'fil' ? 'Personal na pagkikita' : 'Meet in person'}</option>
          <option value="message">{lang === 'fil' ? 'Mensahe' : 'Message me'}</option>
          <option value="call">{lang === 'fil' ? 'Tawag' : 'Call me'}</option>
        </select>
        {form.preferred_contact !== 'in_person' && (
          <input className="field sm:col-span-2" placeholder={lang === 'fil' ? 'Paano ka makokontak' : 'How they can reach you'} value={form.contact_detail} onChange={set('contact_detail')} maxLength={150} required />
        )}
        <textarea className="field sm:col-span-2" rows={3} placeholder={lang === 'fil' ? 'Mensahe (opsyonal)' : 'Anything you want them to know (optional)'} value={form.message} onChange={set('message')} maxLength={1000} />
      </div>
      {state.error && <p className="mt-2 text-sm text-amber">{state.error}</p>}
      <div className="mt-3 flex gap-2">
        <button className="btn-primary" disabled={state.busy}>{lang === 'fil' ? 'Ipadala' : 'Send request'}</button>
        <button type="button" onClick={onDone} className="btn-ghost">{lang === 'fil' ? 'Kanselahin' : 'Cancel'}</button>
      </div>
    </motion.form>
  )
}

