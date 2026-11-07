/*
 * Small, dependency-free SVG charts for the staff dashboard. Thin marks, 4px rounded data-ends,
 * hairline grid, hover tooltips (also on keyboard focus), and a table view for every chart.
 * Colours come from CSS variables in index.css (validated for light and dark).
 */
import { useId, useMemo, useRef, useState } from 'react'

export const fmt = (n) => (n >= 10000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}K` : (n ?? 0).toLocaleString())
const niceMax = (v) => {
  if (v <= 4) return 4
  const p = 10 ** Math.floor(Math.log10(v)), f = v / p
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p
}
const shortDate = (iso) => new Date(iso + 'T00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

function Tip({ tip }) {
  if (!tip) return null
  return (
    <div role="status" className="pointer-events-none absolute z-10 min-w-[8rem] -translate-x-1/2 -translate-y-full rounded-md bg-surface px-3 py-2 text-xs shadow-lift ring-1 ring-line"
      style={{ left: tip.x, top: tip.y - 10 }}>
      {tip.rows.map((r, i) => (
        <div key={i} className="flex items-center gap-2 whitespace-nowrap">
          {r.color && <span className="h-0.5 w-3 rounded-full" style={{ background: r.color }} />}
          <span className="font-semibold tabular-nums text-ink">{fmt(r.value)}</span>
          <span className="text-ink-muted">{r.label}</span>
        </div>
      ))}
      {tip.title && <div className="mt-1 text-ink-faint">{tip.title}</div>}
    </div>
  )
}

export function TableView({ columns, rows }) {
  return (
    <div className="max-h-72 overflow-auto rounded-md ring-1 ring-line">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-surface text-left text-xs text-ink-muted">
          <tr>{columns.map((c, i) => <th key={c} className={`px-3 py-2 font-semibold ${i ? 'text-right' : ''}`}>{c}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r, i) => <tr key={i}>{r.map((v, j) => <td key={j} className={`px-3 py-1.5 ${j ? 'text-right tabular-nums' : ''}`}>{typeof v === 'number' ? v.toLocaleString() : v}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  )
}

// Wrapper: title, optional subtitle and legend, and a chart/table toggle.
export function ChartCard({ title, sub, legend, table, children, className = '' }) {
  const [asTable, setAsTable] = useState(false)
  return (
    <section className={`min-w-0 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold">{title}</h3>
          {sub && <p className="text-xs text-ink-faint">{sub}</p>}
        </div>
        {table && <button onClick={() => setAsTable(!asTable)} className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold text-ink-muted ring-1 ring-line hover:text-ink">{asTable ? 'Chart' : 'Table'}</button>}
      </div>
      {legend && !asTable && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
          {legend.map(([label, color, kind]) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={kind === 'line' ? 'h-0.5 w-3 rounded-full' : 'h-2.5 w-2.5 rounded-sm'} style={{ background: color }} />{label}
            </span>
          ))}
        </div>
      )}
      <div className="mt-3">{asTable ? <TableView {...table} /> : children}</div>
    </section>
  )
}

// Line + area over time, with a snapping crosshair. series: [{ label, color, data: [{date, n}] }]
export function LineChart({ series, height = 180 }) {
  const ref = useRef(null)
  const id = useId()
  const [hover, setHover] = useState(null)
  const W = 640, H = height, L = 36, R = 12, T = 10, B = 24
  const n = series[0]?.data.length || 0
  const max = niceMax(Math.max(1, ...series.flatMap((s) => s.data.map((d) => d.n))))
  const x = (i) => L + (n <= 1 ? 0 : (i / (n - 1)) * (W - L - R))
  const y = (v) => T + (1 - v / max) * (H - T - B)
  const ticks = [0, max / 2, max]
  const labelEvery = Math.max(1, Math.ceil(n / 6))
  const move = (ev) => {
    const box = ref.current.getBoundingClientRect()
    const px = ((ev.clientX - box.left) / box.width) * W
    const i = Math.max(0, Math.min(n - 1, Math.round(((px - L) / (W - L - R)) * (n - 1))))
    setHover(i)
  }
  const tip = hover === null ? null : (() => {
    const box = ref.current?.getBoundingClientRect()
    const scale = box ? box.width / W : 1
    return { x: x(hover) * scale, y: Math.min(...series.map((s) => y(s.data[hover].n))) * scale, title: shortDate(series[0].data[hover].date),
      rows: series.map((s) => ({ value: s.data[hover].n, label: s.label, color: s.color })) }
  })()
  return (
    <div className="relative">
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="block w-full touch-none" role="img" aria-label={`${series.map((s) => s.label).join(', ')} per day`}
        onPointerMove={move} onPointerLeave={() => setHover(null)} tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'ArrowRight') setHover((h) => Math.min(n - 1, (h ?? -1) + 1)); if (e.key === 'ArrowLeft') setHover((h) => Math.max(0, (h ?? n) - 1)) }}
        onBlur={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="var(--viz-grid)" strokeWidth="1" />
            <text x={L - 6} y={y(t) + 4} textAnchor="end" className="fill-ink-faint text-[10px] tabular-nums">{fmt(t)}</text>
          </g>
        ))}
        {series[0]?.data.map((d, i) => (i % labelEvery === 0 || i === n - 1) && (
          <text key={d.date} x={x(i)} y={H - 6} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} className="fill-ink-faint text-[10px]">{shortDate(d.date)}</text>
        ))}
        {series.map((s, si) => {
          const pts = s.data.map((d, i) => `${x(i)},${y(d.n)}`).join(' ')
          return (
            <g key={s.label}>
              {si === 0 && <polygon points={`${x(0)},${y(0)} ${pts} ${x(n - 1)},${y(0)}`} fill={s.color} opacity="0.1" />}
              <polyline points={pts} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              {n > 0 && <circle cx={x(n - 1)} cy={y(s.data[n - 1].n)} r="4" fill={s.color} stroke="rgb(var(--surface))" strokeWidth="2" />}
            </g>
          )
        })}
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={T} y2={H - B} stroke="var(--viz-axis)" strokeWidth="1" />
            {series.map((s) => <circle key={s.label} cx={x(hover)} cy={y(s.data[hover].n)} r="4" fill={s.color} stroke="rgb(var(--surface))" strokeWidth="2" />)}
          </g>
        )}
        <title id={id}>{series.map((s) => `${s.label}: ${s.data.reduce((a, d) => a + d.n, 0)} total`).join('; ')}</title>
      </svg>
      <Tip tip={tip} />
    </div>
  )
}

// Horizontal bars, value at the tip. items: [{ label, n }]
export function BarList({ items, color = 'rgb(var(--teal-ink))', max: maxIn, format = (l) => l }) {
  const max = maxIn || Math.max(1, ...items.map((i) => i.n))
  const [hover, setHover] = useState(null)
  if (!items.length) return <p className="py-6 text-sm text-ink-faint">No data yet.</p>
  return (
    <ul className="space-y-2.5">
      {items.map((it, i) => (
        <li key={it.label} tabIndex={0} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
          className="grid grid-cols-[minmax(0,11.5rem)_1fr] items-center gap-3 text-sm outline-none">
          <span className="truncate text-ink-muted" title={format(it.label)}>{format(it.label)}</span>
          <span className="flex items-center gap-2">
            <span className="h-3 rounded-r-[4px] transition-opacity" style={{ width: `${Math.max(it.n ? 1.5 : 0, (it.n / max) * 85)}%`, background: color, opacity: hover === null || hover === i ? 1 : 0.55 }} />
            <span className="tabular-nums text-xs font-semibold text-ink">{fmt(it.n)}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

// One whole split into parts (tall segmented bar, labels inside when they fit). parts: [{label, n, color}]
export function SegmentedBar({ parts }) {
  const total = parts.reduce((a, p) => a + p.n, 0)
  const [hover, setHover] = useState(null)
  if (!total) return <p className="py-3 text-sm text-ink-faint">No data yet.</p>
  return (
    <div>
      <div className="flex h-7 gap-[2px]" role="img" aria-label={parts.map((p) => `${p.label} ${p.n} (${Math.round((p.n / total) * 100)}%)`).join(', ')}>
        {parts.filter((p) => p.n > 0).map((p, i) => {
          const pct = Math.round((p.n / total) * 100)
          return (
            <div key={p.label} tabIndex={0} title={`${p.label}: ${p.n} (${pct}%)`} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}
              className="flex items-center overflow-visible rounded-[4px] px-2 text-xs font-semibold text-white transition-opacity"
              style={{ width: `${(p.n / total) * 100}%`, background: p.color, opacity: hover === null || hover === i ? 1 : 0.6 }}>
              {pct >= 12 && <span>{pct}%</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Stacked columns (e.g. moods by weekday). groups: [{ label, values: {key: n} }], keys: [[key, label, color]]
export function StackedColumns({ groups, keys, height = 160 }) {
  const [tip, setTip] = useState(null)
  const max = niceMax(Math.max(1, ...groups.map((g) => keys.reduce((a, [k]) => a + (g.values[k] || 0), 0))))
  return (
    <div className="relative">
      <div className="flex items-end gap-2 border-b" style={{ height, borderColor: 'var(--viz-axis)' }}>
        {groups.map((g) => {
          const total = keys.reduce((a, [k]) => a + (g.values[k] || 0), 0)
          return (
            <div key={g.label} tabIndex={0} className="flex h-full flex-1 flex-col items-center justify-end outline-none"
              onPointerEnter={(e) => setTip({ x: e.currentTarget.offsetLeft + e.currentTarget.offsetWidth / 2, y: height - (total / max) * height, title: g.label, rows: keys.map(([k, l, c]) => ({ value: g.values[k] || 0, label: l, color: c })) })}
              onFocus={(e) => setTip({ x: e.currentTarget.offsetLeft + e.currentTarget.offsetWidth / 2, y: height - (total / max) * height, title: g.label, rows: keys.map(([k, l, c]) => ({ value: g.values[k] || 0, label: l, color: c })) })}
              onPointerLeave={() => setTip(null)} onBlur={() => setTip(null)}>
              <div className="flex w-full max-w-[24px] flex-col-reverse gap-[2px]">
                {keys.map(([k, , c], i) => (g.values[k] ? (
                  <div key={k} style={{ height: ((g.values[k] || 0) / max) * height - 2, background: c }}
                    className={i === keys.length - 1 || !keys.slice(i + 1).some(([k2]) => g.values[k2]) ? 'rounded-t-[4px]' : ''} />
                ) : null))}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-1.5 flex gap-2">{groups.map((g) => <span key={g.label} className="flex-1 text-center text-[10px] text-ink-faint">{g.label}</span>)}</div>
      <Tip tip={tip} />
    </div>
  )
}

export function StatTile({ label, value, prev, hint }) {
  const delta = prev === undefined ? null : value - prev
  return (
    <div>
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold">{fmt(value)}</p>
      {delta !== null && (
        <p className="mt-0.5 text-xs text-ink-faint">
          <span className="font-semibold text-ink-muted">{delta > 0 ? '▲' : delta < 0 ? '▼' : '–'} {fmt(Math.abs(delta))}</span> vs previous period
        </p>
      )}
      {hint && <p className="mt-0.5 text-xs text-ink-faint">{hint}</p>}
    </div>
  )
}
