export function BrandMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="bm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4FA8A0" /><stop offset="1" stopColor="#8EC5E8" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill="url(#bm)" />
      <path d="M18 34c4 6 10 6 14 0s10-6 14 0" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

export function BrandName({ className = '' }) {
  return (
    <span className={`font-extrabold tracking-tight ${className}`}>
      agk<span className="text-teal-ink">AI</span>nakem
    </span>
  )
}

// Static fallback for Simple view / no WebGL.
export function HeartStatic({ size = 160 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs><linearGradient id="hs" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4FA8A0" /><stop offset="1" stopColor="#8EC5E8" /></linearGradient></defs>
      <path d="M32 56S6 41 6 22a12 12 0 0 1 26-6 12 12 0 0 1 26 6c0 19-26 34-26 34z" fill="url(#hs)" />
    </svg>
  )
}
