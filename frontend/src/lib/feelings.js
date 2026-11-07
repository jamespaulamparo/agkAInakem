// Feeling words offered in check-ins. Stored as dictionary slugs so they work in any language.
export const FEELINGS = [
  { slug: 'mindfulness', en: 'calm', fil: 'payapa' },
  { slug: 'belonging', en: 'connected', fil: 'may kasama' },
  { slug: 'feeling-drained', en: 'tired', fil: 'pagod' },
  { slug: 'stress', en: 'stressed', fil: 'stressed' },
  { slug: 'anxiety', en: 'anxious', fil: 'kinakabahan' },
  { slug: 'overwhelm', en: 'overwhelmed', fil: 'sobra na' },
  { slug: 'sadness', en: 'sad', fil: 'malungkot' },
  { slug: 'loneliness', en: 'lonely', fil: 'nag-iisa' },
  { slug: 'frustration', en: 'frustrated', fil: 'naiinis' },
  { slug: 'emotional-numbness', en: 'numb', fil: 'manhid' },
  { slug: 'irritability', en: 'irritable', fil: 'mainitin ang ulo' },
  { slug: 'hopelessness', en: 'hopeless', fil: 'walang pag-asa' },
]
export const feelingLabel = (slug, lang) => {
  const f = FEELINGS.find((x) => x.slug === slug)
  return f ? (lang === 'fil' ? f.fil : f.en) : slug.replace(/-/g, ' ')
}

export const MOODS = {
  green: { fill: '#A9C8A5', ink: '#3F6B3B', soft: '#EBF3EA', label: 'mood_green' },
  yellow: { fill: '#E9D29B', ink: '#7A5B14', soft: '#FBF2E3', label: 'mood_yellow' },
  red: { fill: '#E6A994', ink: '#8A3A22', soft: '#FBEDE8', label: 'mood_red' },
}
