/*
 * Journal storage. Guests: this browser only (localStorage). Signed in: the account (API).
 * The same hook serves both so the UI doesn't care where entries live.
 */
import { useCallback, useEffect, useState } from 'react'
import { api } from './api'
import { useAuth } from './auth'
import { useLocal } from './local'

const LOCAL_KEY = 'agk_journal'   // { 'YYYY-MM-DD': {date, mood, feelings, note, updated_at} }

export function useJournal() {
  const { user, ready } = useAuth()
  const [local, setLocal] = useLocal(LOCAL_KEY, {})
  const [remote, setRemote] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(() => {
    if (!user) return setRemote(null)
    api.journal().then((list) => setRemote(Object.fromEntries(list.map((e) => [e.date, e])))).catch(setError)
  }, [user])
  useEffect(() => { if (ready) load() }, [ready, load])

  const mode = user ? 'account' : 'local'
  const entries = (user ? remote : local) || {}

  const save = async (date, data) => {
    const entry = { date, mood: data.mood, feelings: data.feelings || [], note: data.note || '' }
    if (user) {
      const saved = await api.saveEntry(date, entry)
      setRemote((r) => ({ ...(r || {}), [date]: saved }))
    } else {
      setLocal({ ...local, [date]: { ...entry, updated_at: new Date().toISOString() } })
    }
  }
  const remove = async (date) => {
    if (user) {
      await api.deleteEntry(date)
      setRemote((r) => { const n = { ...r }; delete n[date]; return n })
    } else {
      const n = { ...local }; delete n[date]; setLocal(n)
    }
  }
  const localCount = Object.keys(local || {}).length
  const moveLocal = async () => {
    const r = await api.importEntries(Object.values(local))
    setLocal({})
    load()
    return r
  }
  return { entries, mode, loading: !ready || (user && remote === null && !error), error, save, remove, localCount, moveLocal }
}
