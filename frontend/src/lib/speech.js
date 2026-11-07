// Read-aloud using the device's own speech voices (works offline when the voice is installed).
// If no matching voice is installed the UI says so instead of using a wrong-language voice.
import { useEffect, useState } from 'react'

const CODES = { en: ['en'], fil: ['fil', 'tl'] }

export function useSpeech(lang) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [voice, setVoice] = useState(null)
  useEffect(() => {
    if (!supported) return
    const pick = () => {
      const vs = window.speechSynthesis.getVoices()
      setVoice(vs.find((v) => CODES[lang].some((c) => v.lang.toLowerCase().startsWith(c))) || null)
    }
    pick()
    window.speechSynthesis.addEventListener('voiceschanged', pick)
    return () => { window.speechSynthesis.removeEventListener('voiceschanged', pick); window.speechSynthesis.cancel() }
  }, [lang, supported])
  const speak = (text) => {
    if (!voice) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.voice = voice; u.lang = voice.lang; u.rate = 0.85
    window.speechSynthesis.speak(u)
  }
  const stop = () => supported && window.speechSynthesis.cancel()
  return { available: !!voice, speak, stop }
}
