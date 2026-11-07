import { useCallback, useEffect, useState } from 'react'
import { load, save } from './storage'

const KEY = 'agk_saved_words'
const listeners = new Set()

export function useSaved() {
  const [items, setItems] = useState(() => load(KEY, []))
  useEffect(() => {
    const fn = (next) => setItems(next)
    listeners.add(fn)
    return () => listeners.delete(fn)
  }, [])
  const toggle = useCallback((term) => {
    const cur = load(KEY, [])
    const next = cur.some((t) => t.slug === term.slug)
      ? cur.filter((t) => t.slug !== term.slug)
      : [{ slug: term.slug, term: term.term, short: term.short_definition, at: Date.now() }, ...cur]
    save(KEY, next)
    listeners.forEach((l) => l(next))
  }, [])
  const has = useCallback((slug) => items.some((t) => t.slug === slug), [items])
  return { items, toggle, has }
}
