// Things the person sets up for themselves. Stored only in this browser, never sent anywhere.
import { useCallback, useEffect, useState } from 'react'
import { load, save } from './storage'

const listeners = {}
export function useLocal(key, initial) {
  const [value, setValue] = useState(() => load(key, initial))
  useEffect(() => {
    const fn = (v) => setValue(v)
    ;(listeners[key] ||= new Set()).add(fn)
    return () => listeners[key].delete(fn)
  }, [key])
  const set = useCallback((v) => {
    save(key, v)
    listeners[key]?.forEach((l) => l(v))
  }, [key])
  return [value, set]
}

// People the person adds themselves: [{id, name, phone, role, message}].
// Migrates the earlier single "trusted person" if one was saved.
export function useContacts() {
  const legacy = load('agk_trusted', null)
  const [list, setList] = useLocal('agk_contacts', legacy ? [{ id: 'c1', role: '', ...legacy }] : [])
  return [list || [], setList]
}
export const usePlan = () => useLocal('agk_safety_plan', null)          // {signs, helps, people, places, reasons, updated}
export const useFollowUp = () => useLocal('agk_followup', null)         // {at: epoch ms}

export const digits = (n) => (n || '').replace(/[^\d+]/g, '')
export const tel = (n) => `tel:${digits(n)}`
// "?&body=" works on both Android and iOS messaging apps.
export const sms = (n, body) => `sms:${digits(n)}?&body=${encodeURIComponent(body)}`
