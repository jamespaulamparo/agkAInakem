import { createContext, useContext, useEffect, useState } from 'react'
import { load, save } from './storage'

// Interface strings: [English, Filipino]. Filipino help-flow wording must be reviewed before launch.
import { HELP_STRINGS, JOURNAL_STRINGS, CONTACT_STRINGS } from './helpText'
const S = {
  nav_help: ['Get help', 'Humingi ng tulong', 'Agkiddaw iti tulong'],
  nav_dictionary: ['Dictionary', 'Diksiyonaryo'],
  nav_reach: ['Reach Out', 'Humingi ng Tulong'],
  help_now: ['Help now', 'Tulong ngayon'],
  help_now_title: ['Talk to someone now', 'Makipag-usap ngayon'],
  help_now_sub: ['Free, and you don’t need an account.', 'Libre, at hindi kailangan ng account.'],
  more_options: ['More ways to get support', 'Iba pang paraan ng suporta'],
  close: ['Close', 'Isara'],

  hero_lead: ['Find the words for', 'Hanapin ang salita para sa'],
  hero_words: [
    ['overwhelmed', 'drained', 'on edge', 'lonely', 'numb', 'stuck', 'not okay'],
    ['sobra na', 'pagod na pagod', 'kinakabahan', 'nag-iisa', 'manhid', 'naiipit', 'hindi okay'],
  ],
  hero_placeholder: ['Describe it in your own words…', 'Ilarawan sa sarili mong salita…'],
  hero_browse: ['or browse the dictionary', 'o tingnan ang diksiyonaryo'],
  map_title: ['Words, connected.', 'Mga salitang magkakaugnay.'],
  map_sub: ['Every feeling sits near others. Drag, hover, open.', 'Bawat damdamin ay may kalapit. I-drag, i-hover, buksan.'],
  reach_title: ['When it’s heavy, reach out.', 'Kapag mabigat, lumapit ka.'],
  reach_me: ['I need help', 'Kailangan ko ng tulong'],
  reach_other: ['Someone I know needs help', 'May kakilala akong nahihirapan'],
  ext_title: ['Look up feelings anywhere on the web.', 'Hanapin ang kahulugan saanman sa web.'],
  ext_cta: ['Get the browser extension', 'Kunin ang browser extension'],

  dict_title: ['Dictionary', 'Diksiyonaryo'],
  dict_search: ['Search a word or feeling', 'Maghanap ng salita o damdamin'],
  dict_all: ['All', 'Lahat'],
  dict_entries: ['entries', 'salita'],
  dict_none: ['No entries match. Try describing the feeling instead.', 'Walang tugma. Subukang ilarawan ang damdamin.'],
  dict_describe: ['Describe it instead', 'Ilarawan na lang'],
  see_also: ['See also', 'Tingnan din'],
  type_everyday: ['everyday', 'pang-araw-araw'],
  type_psychological: ['psychological', 'sikolohikal'],
  type_clinical: ['clinical', 'klinikal'],

  simpler: ['In simpler terms', 'Sa mas simpleng salita'],
  not_same: ['Not the same as', 'Hindi kapareho ng'],
  connected: ['Connected words', 'Kaugnay na salita'],
  examples: ['In everyday life', 'Sa pang-araw-araw'],
  reflect: ['To reflect on', 'Pagnilayan'],
  references: ['References', 'Sanggunian'],
  also: ['also', 'gayundin'],
  save: ['Save', 'I-save'],
  saved: ['Saved', 'Naka-save'],
  clinical_note: ['Clinical term. Only a qualified professional can assess or diagnose this.', 'Klinikal na termino. Propesyonal lamang ang maaaring sumuri o mag-diagnose nito.'],
  review_note: ['Editorial draft — awaiting review by a qualified professional.', 'Editoryal na draft — hinihintay pang suriin ng propesyonal.'],
  back_dict: ['Dictionary', 'Diksiyonaryo'],

  explore_title: ['Say it however it comes out.', 'Sabihin kahit paano ito lumabas.'],
  explore_placeholder: ['e.g. I feel tired and everything is becoming too much', 'hal. Pagod na pagod na ako at sobra na ang lahat'],
  explore_go: ['Find words', 'Hanapin'],
  explore_note: ['Possibilities, not a diagnosis. You decide what fits. Nothing you type is saved.', 'Mga posibilidad, hindi diagnosis. Ikaw ang magpapasya. Walang sine-save.'],
  explore_none: ['Nothing close yet. Try other words, or browse the dictionary.', 'Wala pang malapit. Subukan ang ibang salita, o tingnan ang diksiyonaryo.'],
  fit_closer: ['closer fit', 'mas malapit'],
  fit_possible: ['possible', 'posible'],
  not_quite: ['Not quite', 'Hindi ito'],
  open_word: ['Open', 'Buksan'],
  support_flag: ['You don’t have to carry this alone. If you might hurt yourself, please reach out now.', 'Hindi mo kailangang pasanin ito mag-isa. Kung maaari mong saktan ang sarili, lumapit ka ngayon.'],

  reach_q: ['What do you need right now?', 'Ano ang kailangan mo ngayon?'],
  tab_me: ['I need help', 'Ako ang nangangailangan'],
  tab_other: ['Someone else', 'Ibang tao'],
  tab_check: ['Check in', 'Mag-check in'],
  danger: ['In danger right now?', 'Nasa panganib ngayon?'],
  calm_title: ['Steady your body', 'Pakalmahin ang katawan'],
  calm_sub: ['Optional. Skip straight to people if you prefer.', 'Opsyonal. Maaari kang dumiretso sa mga tao.'],
  breathe: ['Breathe', 'Huminga'],
  ground: ['5-4-3-2-1', '5-4-3-2-1'],
  start: ['Start', 'Simulan'],
  stop: ['Stop', 'Itigil'],
  breathe_in: ['Breathe in', 'Huminga papasok'],
  hold: ['Hold', 'Pigilan'],
  breathe_out: ['Breathe out', 'Huminga palabas'],
  next: ['Next', 'Susunod'],
  back: ['Back', 'Bumalik'],
  done: ['Done', 'Tapos'],
  people_title: ['People who can help', 'Mga taong makatutulong'],
  lines_title: ['Call or text', 'Tumawag o mag-text'],
  responders_title: ['Ask someone to reach out to you', 'Magpa-kontak sa isang tao'],
  demo: ['Demo profile', 'Demo na profile'],
  verified: ['Verified', 'Beripikado'],
  not_verified: ['Not yet verified', 'Hindi pa beripikado'],
  request_contact: ['Request contact', 'Humiling ng kontak'],
  responds: ['Usually responds', 'Karaniwang tumutugon'],

  check_title: ['How are you, honestly?', 'Kumusta ka, totoo?'],
  check_note: ['Just for you. Anonymous, and not a measure of how serious things are.', 'Para sa iyo lang. Anonymous, at hindi sukatan ng bigat ng sitwasyon.'],
  mood_green: ['Doing okay', 'Ayos lang'],
  mood_yellow: ['Stretched', 'Medyo hirap'],
  mood_red: ['Struggling', 'Nahihirapan'],
  feeling_word: ['A word for it? (optional)', 'May salita ba para dito? (opsyonal)'],
  save_check: ['Save check-in', 'I-save'],

  about_title: ['What this is, and isn’t.', 'Ano ito, at ano ang hindi.'],
  footer_line: ['A mental health literacy and early-support project. Not a diagnostic tool or emergency service.', 'Proyekto para sa kaalaman sa kalusugang pangkaisipan at maagang suporta. Hindi ito diagnosis o emergency service.'],
  about_link: ['About & safety', 'Tungkol at kaligtasan'],
  saved_link: ['Saved words', 'Naka-save na salita'],
  ext_link: ['Extension', 'Extension'],
}

Object.assign(S, HELP_STRINGS, JOURNAL_STRINGS, CONTACT_STRINGS)
export const LANGS = [['en', 'EN', 'English'], ['fil', 'FIL', 'Tagalog']]
const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => { const l = load('agk_lang', 'en'); return l === 'fil' ? 'fil' : 'en' })
  useEffect(() => {
    save('agk_lang', lang)
    document.documentElement.lang = lang === 'en' ? 'en' : lang
  }, [lang])
  const [simple, setSimple] = useState(() => load('agk_simple', false))
  useEffect(() => {
    save('agk_simple', simple)
    document.documentElement.classList.toggle('simple', simple)
  }, [simple])
  const i = lang === 'fil' ? 1 : 0
  const t = (key) => (S[key] ? S[key][i] ?? S[key][0] : key)
  // pick(obj, 'short_definition') → obj.short_definition_fil when in Filipino and present
  const pick = (obj, field) => (obj ? (lang === 'fil' && obj[`${field}_fil`]) || obj[field] : '')
  return <I18nContext.Provider value={{ lang, setLang, t, pick, simple, setSimple }}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)
