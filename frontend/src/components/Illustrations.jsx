/*
 * House illustration set: flat shapes on a soft blob, brand colours only, no people.
 * Same 240×180 canvas, same blob, same ink detail weight, so they read as one family.
 */
const C = { teal: '#4FA8A0', tealInk: '#2B6F69', sky: '#8EC5E8', sage: '#A9C8A5', paper: '#F7F4EF', white: '#FFFFFF', ink: '#263A38', sand: '#E9D29B', coral: '#E6A994' }
const BLOB = 'M38 96c-6-34 22-66 62-72 30-5 52 6 72 4 34-3 56 22 52 56-3 30-24 40-30 62-7 26-38 36-74 30-30-5-44-18-62-28C42 140 41 116 38 96z'

function Frame({ tint, title, children, className = '' }) {
  return (
    <svg viewBox="0 0 240 180" className={`illus ${className}`} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <path d={BLOB} fill={tint} />
      {children}
      <g fill={C.ink} opacity=".25"><circle cx="44" cy="40" r="2" /><circle cx="206" cy="132" r="2.5" /><circle cx="196" cy="30" r="1.6" /></g>
    </svg>
  )
}

export function CalmArt(p) {
  return (
    <Frame tint="#E6F2FA" {...p}>
      <rect x="128" y="34" width="62" height="56" rx="10" fill={C.white} />
      <path d="M159 34v56M128 62h62" stroke={C.paper} strokeWidth="4" />
      <path d="M176 44a9 9 0 1 0 6 15 11 11 0 0 1-6-15z" fill={C.sand} />
      <rect x="56" y="104" width="34" height="34" rx="6" fill={C.sage} />
      <path d="M73 104c-2-18-14-24-22-26 4 10 10 20 22 26zM73 104c2-22 12-30 22-34-2 14-8 26-22 34zM73 104c0-16-2-28 0-38 4 10 4 24 0 38z" fill={C.teal} />
      <rect x="112" y="104" width="44" height="38" rx="9" fill={C.teal} />
      <path d="M156 114h6a8 8 0 0 1 0 16h-6" stroke={C.teal} strokeWidth="6" fill="none" />
      <path className="illus-steam" d="M124 96c-4-6 4-8 0-14M134 94c-4-6 4-8 0-14M144 96c-4-6 4-8 0-14" stroke={C.tealInk} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".5" />
      <rect x="40" y="140" width="160" height="5" rx="2.5" fill={C.ink} opacity=".12" />
    </Frame>
  )
}

export function TalkArt(p) {
  return (
    <Frame tint="#E3F1EF" {...p}>
      <path d="M52 52h86a14 14 0 0 1 14 14v34a14 14 0 0 1-14 14H84l-18 16v-16H52a14 14 0 0 1-14-14V66a14 14 0 0 1 14-14z" fill={C.sky} />
      <g fill={C.white}><circle cx="76" cy="83" r="5" /><circle cx="95" cy="83" r="5" /><circle cx="114" cy="83" r="5" /></g>
      <path d="M118 92h68a14 14 0 0 1 14 14v26a14 14 0 0 1-14 14h-8v14l-16-14h-44a14 14 0 0 1-14-14v-26a14 14 0 0 1 14-14z" fill={C.sage} />
      <path className="illus-float" d="M152 128s-14-8-14-17a7 7 0 0 1 14-2 7 7 0 0 1 14 2c0 9-14 17-14 17z" fill={C.white} />
    </Frame>
  )
}

export function JournalArt(p) {
  const moods = [C.sage, C.sage, C.sand, C.sage, C.coral, C.sand, C.sage, C.sage, C.sage, C.sand, null, null]
  return (
    <Frame tint="#EBF3EA" {...p}>
      <path d="M120 48c-20-10-44-10-66-4v96c22-6 46-6 66 4z" fill={C.white} />
      <path d="M120 48c20-10 44-10 66-4v96c-22-6-46-6-66 4z" fill={C.white} />
      <path d="M120 48v96" stroke={C.paper} strokeWidth="4" />
      <g stroke={C.ink} strokeWidth="3" strokeLinecap="round" opacity=".18"><path d="M66 66h40M66 80h44M66 94h34M66 108h42" /></g>
      {moods.map((m, i) => (
        <circle key={i} cx={138 + (i % 4) * 13} cy={70 + Math.floor(i / 4) * 16} r="5" fill={m || 'none'} stroke={m ? 'none' : C.line || '#E4E9E5'} strokeWidth="2" />
      ))}
      <g className="illus-float"><rect x="150" y="112" width="44" height="9" rx="4.5" transform="rotate(-32 172 116)" fill={C.teal} /><path d="M151 131l4-9 6 4z" fill={C.ink} opacity=".6" /></g>
    </Frame>
  )
}

export function WordsArt(p) {
  return (
    <Frame tint="#E6F2FA" {...p}>
      <path d="M120 82c-18-8-40-8-60-3v62c20-5 42-5 60 3z" fill={C.teal} />
      <path d="M120 82c18-8 40-8 60-3v62c-20-5-42-5-60 3z" fill={C.tealInk} />
      <g className="illus-float">
        <rect x="66" y="34" width="54" height="22" rx="11" fill={C.white} />
        <text x="93" y="50" textAnchor="middle" fontFamily="Newsreader, Georgia, serif" fontStyle="italic" fontSize="14" fill={C.ink}>calm</text>
      </g>
      <g className="illus-float-slow">
        <rect x="128" y="44" width="66" height="22" rx="11" fill={C.sage} />
        <text x="161" y="60" textAnchor="middle" fontFamily="Newsreader, Georgia, serif" fontStyle="italic" fontSize="14" fill={C.ink}>drained</text>
      </g>
      <text x="120" y="122" textAnchor="middle" fontFamily="Newsreader, Georgia, serif" fontSize="26" fill={C.white}>Aa</text>
    </Frame>
  )
}

export function PlanArt(p) {
  return (
    <Frame tint="#E3F1EF" {...p}>
      <path d="M120 30l48 18v34c0 32-22 52-48 64-26-12-48-32-48-64V48z" fill={C.teal} />
      <path d="M120 44l34 13v25c0 23-15 38-34 47z" fill={C.tealInk} opacity=".35" />
      <path d="M100 88l14 14 26-30" stroke={C.white} strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path className="illus-float" d="M182 112c10-14 26-14 30-12-4 12-16 22-30 12z" fill={C.sage} />
      <path className="illus-float-slow" d="M58 116c-10-14-26-14-30-12 4 12 16 22 30 12z" fill={C.sky} />
    </Frame>
  )
}

export function TogetherArt(p) {
  return (
    <Frame tint="#FBF2E3" {...p}>
      <rect x="62" y="96" width="44" height="40" rx="9" fill={C.teal} />
      <path d="M106 106h6a8 8 0 0 1 0 16h-6" stroke={C.teal} strokeWidth="6" fill="none" />
      <rect x="134" y="96" width="44" height="40" rx="9" fill={C.sky} />
      <path d="M178 106h6a8 8 0 0 1 0 16h-6" stroke={C.sky} strokeWidth="6" fill="none" />
      <path className="illus-float" d="M120 80s-18-10-18-22a9 9 0 0 1 18-3 9 9 0 0 1 18 3c0 12-18 22-18 22z" fill={C.coral} />
      <rect x="40" y="136" width="160" height="5" rx="2.5" fill={C.ink} opacity=".12" />
    </Frame>
  )
}

export function BrowserArt(p) {
  return (
    <Frame tint="#E6F2FA" {...p}>
      <rect x="44" y="40" width="152" height="104" rx="12" fill={C.white} />
      <path d="M44 52a12 12 0 0 1 12-12h128a12 12 0 0 1 12 12v8H44z" fill={C.paper} />
      <g fill={C.ink} opacity=".2"><circle cx="58" cy="50" r="3" /><circle cx="68" cy="50" r="3" /><circle cx="78" cy="50" r="3" /></g>
      <g fill={C.ink} opacity=".12"><rect x="58" y="74" width="90" height="7" rx="3.5" /><rect x="58" y="112" width="70" height="7" rx="3.5" /><rect x="58" y="126" width="100" height="7" rx="3.5" /></g>
      <rect x="58" y="92" width="56" height="10" rx="3" fill={C.sky} />
      <g className="illus-float"><circle cx="160" cy="98" r="18" fill="none" stroke={C.teal} strokeWidth="7" /><path d="M173 111l14 14" stroke={C.teal} strokeWidth="8" strokeLinecap="round" /></g>
    </Frame>
  )
}
