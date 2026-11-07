// Phrases that trigger the fixed emergency message immediately (client-side, nothing is sent).
// This is not a classifier and never labels the person; it only puts help one tap away.
const PHRASES = [
  'kill myself', 'killing myself', 'end my life', 'end it all', 'suicide', 'suicidal', 'want to die', 'wanna die',
  "don't want to live", 'do not want to live', "don't want to be alive", 'better off without me', 'hurt myself',
  'hurting myself', 'self harm', 'self-harm', 'cut myself', 'no reason to live', 'not worth living',
  'magpakamatay', 'mamatay na', 'ayoko nang mabuhay', 'ayaw ko nang mabuhay', 'gusto ko nang mamatay',
  'saktan ang sarili', 'wakasan ang buhay', 'tapusin ang buhay',
]
export const hasCrisisWords = (text) => {
  const t = (text || '').toLowerCase().replace(/[’‘]/g, "'")
  return PHRASES.some((p) => t.includes(p))
}
