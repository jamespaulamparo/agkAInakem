/*
 * Suggested next steps from journal patterns. Fixed, pre-written rules — no AI, no scores shown,
 * no diagnosis. Each rule looks at recent entries and may suggest one gentle action.
 */
import { addDays, iso, parse } from './dates'
import { analyse } from './patterns'
import { feelingLabel } from './feelings'

const VALUE = { green: 2, yellow: 1, red: 0 }
const WEEKDAYS = {
  en: ['Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays', 'Sundays'],
  fil: ['tuwing Lunes', 'tuwing Martes', 'tuwing Miyerkules', 'tuwing Huwebes', 'tuwing Biyernes', 'tuwing Sabado', 'tuwing Linggo'],
}
// What to suggest when a feeling keeps coming up.
const FEELING_ACTIONS = {
  'feeling-drained': { to: '/dictionary/burnout', en: ['“Tired” came up {n} times in two weeks. See how ordinary tiredness differs from burnout.', 'Read'], fil: ['Lumabas ang “pagod” nang {n} beses sa dalawang linggo. Alamin ang pagkakaiba ng pagod at burnout.', 'Basahin'] },
  anxiety: { to: '/help/calm', en: ['“Anxious” came up {n} times. A 5-4-3-2-1 grounding exercise can help in the moment.', 'Try grounding'], fil: ['Lumabas ang “kinakabahan” nang {n} beses. Makatutulong ang 5-4-3-2-1 grounding.', 'Subukan'] },
  stress: { to: '/help/calm', en: ['“Stressed” came up {n} times. One minute of slow breathing is a small reset.', 'Breathe'], fil: ['Lumabas ang “stressed” nang {n} beses. Isang minutong mabagal na paghinga ay maliit na pahinga.', 'Huminga'] },
  overwhelm: { to: '/help/calm', en: ['“Overwhelmed” came up {n} times. Try one slow breathing round, then pick just one small task.', 'Breathe'], fil: ['Lumabas ang “sobra na” nang {n} beses. Huminga muna, saka pumili ng isang maliit na gawain.', 'Huminga'] },
  loneliness: { to: '/help/talk', en: ['“Lonely” came up {n} times. Reaching out to one person on your list could help.', 'My contacts'], fil: ['Lumabas ang “nag-iisa” nang {n} beses. Makatutulong ang paglapit sa isang tao sa listahan mo.', 'Mga contact'] },
  sadness: { to: '/help/talk', en: ['“Sad” came up {n} times. You don’t have to carry it alone.', 'Talk to someone'], fil: ['Lumabas ang “malungkot” nang {n} beses. Hindi mo kailangang pasanin ito mag-isa.', 'Makipag-usap'] },
  hopelessness: { to: '/help/talk', en: ['“Hopeless” came up {n} times. Please talk to someone today.', 'Talk to someone'], fil: ['Lumabas ang “walang pag-asa” nang {n} beses. Makipag-usap sa isang tao ngayong araw.', 'Makipag-usap'] },
  frustration: { to: '/help/calm', en: ['“Frustrated” came up {n} times. A short breathing break can take the edge off.', 'Breathe'], fil: ['Lumabas ang “naiinis” nang {n} beses. Makatutulong ang maikling paghinga.', 'Huminga'] },
  irritability: { to: '/help/calm', en: ['“Irritable” came up {n} times. Often a sign of being stretched thin: rest counts.', 'Breathe'], fil: ['Lumabas ang “mainitin ang ulo” nang {n} beses. Kadalasang senyales ng pagod: mahalaga ang pahinga.', 'Huminga'] },
  'emotional-numbness': { to: '/help/calm', en: ['“Numb” came up {n} times. Grounding can help you feel more present.', 'Try grounding'], fil: ['Lumabas ang “manhid” nang {n} beses. Makatutulong ang grounding.', 'Subukan'] },
}

// Feelings that often come up together (2+ times in 30 days).
const PAIRS = {
  'anxiety|overwhelm': { to: '/dictionary/worry', en: ['“Anxious” and “overwhelmed” often come together for you. Writing worries down, then choosing just one to act on, can make them smaller.', 'About worry'], fil: ['Madalas magkasama ang “kinakabahan” at “sobra na.” Isulat ang mga alalahanin, saka pumili ng isa lang na aaksyunan.', 'Tungkol sa pag-aalala'] },
  'emotional-numbness|feeling-drained': { to: '/dictionary/emotional-exhaustion', en: ['“Tired” and “numb” keep showing up together. That mix can be a sign of running on empty for a while.', 'Read'], fil: ['Madalas magkasama ang “pagod” at “manhid.” Maaaring senyales ito ng matagal nang pagod.', 'Basahin'] },
  'loneliness|sadness': { to: '/help/talk', en: ['“Lonely” and “sad” often show up together. Even a short message to someone can help.', 'My contacts'], fil: ['Madalas magkasama ang “nag-iisa” at “malungkot.” Kahit maikling mensahe sa isang tao ay makatutulong.', 'Mga contact'] },
  'frustration|irritability': { to: '/dictionary/anger', en: ['“Frustrated” and “irritable” keep coming up together, often a sign of being stretched thin.', 'About anger'], fil: ['Madalas magkasama ang “naiinis” at “mainitin ang ulo,” kadalasang senyales ng sobrang pagod.', 'Tungkol sa galit'] },
  'feeling-drained|stress': { to: '/dictionary/burnout', en: ['“Stressed” and “tired” keep coming up together. See how stress can turn into burnout, and what helps.', 'Read'], fil: ['Madalas magkasama ang “stressed” at “pagod.” Alamin kung paano nagiging burnout ang stress.', 'Basahin'] },
  'anxiety|stress': { to: '/help/calm', en: ['“Stressed” and “anxious” often come together for you. A minute of slow breathing calms the body first.', 'Breathe'], fil: ['Madalas magkasama ang “stressed” at “kinakabahan.” Isang minutong mabagal na paghinga ang unang hakbang.', 'Huminga'] },
}

export function suggestions(entries, { today = new Date(), hasPlan = false, contactCount = 0 } = {}) {
  const day = (n) => entries[iso(addDays(today, -n))]
  const lastN = (n) => Array.from({ length: n }, (_, i) => day(i)).filter(Boolean)
  const avg = (l) => (l.length ? l.reduce((s, e) => s + VALUE[e.mood], 0) / l.length : null)
  const out = []
  const push = (priority, key, en, fil, to, cta) => out.push({ priority, key, en, fil, to, cta })

  const recent = Object.values(entries).sort((a, b) => (a.date < b.date ? 1 : -1))
  if (!recent.length) return []

  // 1. Several hard days close together
  const last3 = recent.slice(0, 3)
  const recentRed = last3.filter((e) => e.mood === 'red' && e.date >= iso(addDays(today, -6))).length
  if (recentRed >= 2) push(1, 'red', 'A few hard days in a row. You don’t have to get through this alone.', 'Ilang magkakasunod na mahirap na araw. Hindi mo kailangang mag-isa dito.', '/help/talk', ['Talk to someone', 'Makipag-usap'])

  // 2. Trend: last 14 days vs the 14 before
  const a = lastN(14), b = Array.from({ length: 14 }, (_, i) => day(i + 14)).filter(Boolean)
  if (a.length >= 3 && b.length >= 3) {
    const d = avg(a) - avg(b)
    if (d <= -0.4) push(2, 'down', 'The last two weeks have felt heavier than the two before.', 'Mas mabigat ang huling dalawang linggo kaysa sa nauna.', '/help/talk', ['Reach out', 'Lumapit'])
    if (d >= 0.4) push(5, 'up', 'Lighter lately. Write down what’s been helping, so it’s there on harder days.', 'Mas magaan nitong mga araw. Isulat ang nakatulong para magamit sa mahihirap na araw.', '/help/plan', ['My safety plan', 'Safety plan ko'])
  }

  // 3. A weekday that tends to be harder (last 8 weeks, at least 3 entries on that weekday)
  const byDay = Array.from({ length: 7 }, () => [])
  for (let i = 0; i < 56; i++) { const e = day(i); if (e) byDay[(addDays(today, -i).getDay() + 6) % 7].push(e) }
  const hard = byDay.map((l, i) => ({ i, n: l.length, v: avg(l) })).filter((x) => x.n >= 3 && x.v !== null && x.v <= 0.7).sort((x, y) => x.v - y.v)[0]
  if (hard) push(3, 'weekday', `${WEEKDAYS.en[hard.i]} tend to be harder for you. Plan one small thing that helps on that day.`, `Mas mahirap ${WEEKDAYS.fil[hard.i]}. Magplano ng isang maliit na bagay na nakatutulong sa araw na iyon.`, '/help/plan', ['Plan it', 'Planuhin'])

  // 4. A feeling that keeps coming up (last 14 days, 3+ times)
  const counts = {}
  a.forEach((e) => (e.feelings || []).forEach((f) => { counts[f] = (counts[f] || 0) + 1 }))
  const top = Object.entries(counts).filter(([f, n]) => n >= 3 && FEELING_ACTIONS[f]).sort((x, y) => y[1] - x[1])[0]
  if (top) {
    const [f, n] = top, act = FEELING_ACTIONS[f]
    push(f === 'hopelessness' ? 1 : 4, `feel-${f}`, act.en[0].replace('{n}', n), act.fil[0].replace('{n}', n), act.to, [act.en[1], act.fil[1]])
  }

  // 5. Preparation while things are steady
  const anyHard = lastN(28).some((e) => e.mood === 'red')
  if (anyHard && !hasPlan) push(6, 'plan', 'Make a safety plan on a steadier day, so it’s ready when you need it.', 'Gumawa ng safety plan sa mas maayos na araw para handa ito kapag kailangan.', '/help/plan', ['Make my plan', 'Gawin ang plano'])
  if (anyHard && contactCount === 0) push(6, 'contacts', 'Add one or two people you’d reach out to.', 'Magdagdag ng isa o dalawang taong lalapitan mo.', '/help/talk', ['Add contacts', 'Magdagdag'])

  // 6. Gap in check-ins
  const gap = Math.round((new Date(today.getFullYear(), today.getMonth(), today.getDate()) - parse(recent[0].date)) / 864e5)
  if (gap >= 4) push(7, 'gap', `Your last check-in was ${gap} days ago. A quick one today keeps your calendar useful.`, `${gap} araw na mula sa huli mong check-in. Isang mabilis na check-in ngayon ay nakatutulong.`, null, null)

  const P = analyse(entries, today)

  // 7. A steady stretch: notice what's helping
  if (P.greenRuns[0]?.daysAgo <= 2 && P.greenRuns[0].length >= 5) push(5, 'green-run', `${P.greenRuns[0].length} steady days in a row. Notice what’s been different, and add it to your plan.`, `${P.greenRuns[0].length} magkakasunod na maayos na araw. Pansinin kung ano ang naiba, at idagdag sa plano mo.`, '/help/plan', ['My plan', 'Plano ko'])

  // 8. Bouncing back after hard days
  if (P.bounces >= 2) push(5, 'bounce', `After hard days, you’ve bounced back within a few days ${P.bounces} times this month. Remember that on the next hard day.`, `${P.bounces} beses ngayong buwan na nakabawi ka sa loob ng ilang araw matapos ang mahirap na araw. Tandaan ito sa susunod.`, '/dictionary/resilience', ['About resilience', 'Tungkol sa resilience'])

  // 9. Ups and downs
  if (P.seqLength >= 8 && (P.bigSwings >= 3 || P.changes / (P.seqLength - 1) >= 0.7)) push(3, 'swings', 'Your days have been going up and down a lot. Regular sleep, meals and small routines can make things steadier.', 'Pataas-pababa ang mga araw mo. Makatutulong ang regular na tulog, pagkain at maliliit na routine.', '/dictionary/emotional-regulation', ['Read', 'Basahin'])

  // 10. Weekdays vs weekends
  if (P.weekday !== null && P.weekend !== null) {
    if (P.weekend - P.weekday >= 0.6) push(4, 'weekdays', 'Weekdays feel heavier than weekends. School or work load may be part of it. Small breaks during the day count.', 'Mas mabigat ang mga araw ng pasok kaysa sa weekend. Maaaring bahagi nito ang trabaho o pag-aaral. Mahalaga ang maiikling pahinga.', '/dictionary/chronic-stress', ['About stress', 'Tungkol sa stress'])
    if (P.weekday - P.weekend >= 0.6) push(4, 'weekends', 'Weekends feel heavier than weekdays. Planning time with someone could help.', 'Mas mabigat ang weekend kaysa sa ibang araw. Makatutulong ang pagpaplano ng oras kasama ang isang tao.', '/help/talk', ['My contacts', 'Mga contact'])
  }

  // 11. Feelings that go with your steadier days
  const good = P.feelings.find((f) => f.n >= 3 && P.overall !== null && f.mean - P.overall >= 0.3 && f.mean >= 1.5)
  if (good) push(5, `good-${good.slug}`, `Days you feel “${feelingLabel(good.slug, 'en')}” tend to be your steadier ones. Make room for more of that.`, `Ang mga araw na “${feelingLabel(good.slug, 'fil')}” ka ay kadalasang mas maayos. Bigyan pa ito ng puwang.`, `/dictionary/${good.slug}`, ['Read', 'Basahin'])

  // 12. Feelings that come together
  const pair = Object.entries(P.pairs).filter(([k, n]) => n >= 2 && PAIRS[k]).sort((x, y) => y[1] - x[1])[0]
  if (pair) { const act = PAIRS[pair[0]]; push(4, `pair-${pair[0]}`, act.en[0], act.fil[0], act.to, [act.en[1], act.fil[1]]) }

  // De-duplicate by destination so the list stays varied.
  const seen = new Set()
  return out.sort((x, y) => x.priority - y.priority).filter((s) => (s.to && seen.has(s.to) ? false : (seen.add(s.to), true))).slice(0, 4)
}
