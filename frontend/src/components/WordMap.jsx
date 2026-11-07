import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import * as d3 from 'd3'
import { colorFor } from '../lib/palette'
import { useI18n } from '../lib/i18n'

/*
 * Force-directed map of the dictionary. D3 computes positions; React renders SVG.
 * - drag nodes (d3-drag), hover to light up neighbours, click/Enter to open.
 * - `center` mode pins one term in the middle (used on word pages).
 */
export default function WordMap({ nodes, edges, height = 520, center = null, labelAll = false, onOpen }) {
  const { name } = useI18n()
  const wrap = useRef(null)
  const svgRef = useRef(null)
  const navigate = useNavigate()
  const [width, setWidth] = useState(800)
  const [, setTick] = useState(0)
  const [hover, setHover] = useState(null)
  const simRef = useRef(null)

  const data = useMemo(() => {
    const ns = nodes.map((n) => ({ ...n }))
    const ids = new Set(ns.map((n) => n.id))
    const es = edges.filter((e) => ids.has(e.source) && ids.has(e.target)).map((e) => ({ ...e }))
    const degree = {}
    es.forEach((e) => { degree[e.source] = (degree[e.source] || 0) + 1; degree[e.target] = (degree[e.target] || 0) + 1 })
    ns.forEach((n) => { n.degree = degree[n.id] || 0 })
    const adj = new Map(ns.map((n) => [n.id, new Set([n.id])]))
    es.forEach((e) => { adj.get(e.source).add(e.target); adj.get(e.target).add(e.source) })
    return { ns, es, adj }
  }, [nodes, edges])

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(320, e.contentRect.width)))
    ro.observe(wrap.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const { ns, es } = data
    const small = width < 640
    if (center) {
      const c = ns.find((n) => n.id === center)
      if (c) { c.fx = width / 2; c.fy = height / 2 }
    }
    const sim = d3.forceSimulation(ns)
      .force('link', d3.forceLink(es).id((d) => d.id).distance(center ? (small ? 95 : 130) : (small ? 46 : 84)).strength(0.5))
      .force('charge', d3.forceManyBody().strength(center ? -420 : small ? -80 : -190))
      .force('x', d3.forceX(width / 2).strength(small ? 0.06 : 0.025))
      .force('y', d3.forceY(height / 2).strength(small ? 0.1 : 0.08))
      .force('collide', d3.forceCollide().radius((d) => r(d) + (center ? 34 : 8)))
      .on('tick', () => {
        ns.forEach((n) => {
          n.x = Math.max(24, Math.min(width - 24, n.x))
          n.y = Math.max(24, Math.min(height - 24, n.y))
        })
        setTick((t) => t + 1)
      })
    simRef.current = sim

    const drag = d3.drag()
      .on('start', (ev, d) => { if (!ev.active) sim.alphaTarget(0.25).restart(); d.fx = d.x; d.fy = d.y })
      .on('drag', (ev, d) => { d.fx = ev.x; d.fy = ev.y })
      .on('end', (ev, d) => { if (!ev.active) sim.alphaTarget(0); if (d.id !== center) { d.fx = null; d.fy = null } })
    d3.select(svgRef.current).selectAll('g.node').data(ns).call(drag)
    return () => sim.stop()
  }, [data, width, height, center])

  const r = (d) => (d.id === center ? 12 : 4 + Math.min(d.degree, 8) * 0.9)
  const active = hover ? data.adj.get(hover) : null
  const hovered = hover && data.ns.find((n) => n.id === hover)
  const open = (id) => (onOpen ? onOpen(id) : navigate(`/dictionary/${id}`))

  return (
    <div ref={wrap} className="relative w-full select-none" style={{ height }}>
      <svg ref={svgRef} width={width} height={height} className="block overflow-visible" role="img" aria-label="Map of connected words. Use the list for keyboard access.">
        <g>
          {data.es.map((e, i) => {
            const on = active && active.has(e.source.id) && active.has(e.target.id) && (e.source.id === hover || e.target.id === hover)
            return (
              <line key={i} x1={e.source.x} y1={e.source.y} x2={e.target.x} y2={e.target.y}
                className={on ? 'stroke-teal-ink' : 'stroke-ink'} strokeOpacity={on ? 0.55 : active ? 0.04 : 0.11}
                strokeWidth={on ? 1.4 : 1} strokeDasharray={e.type === 'different_from' || e.type === 'often_confused_with' ? '3 4' : undefined} />
            )
          })}
        </g>
        {data.ns.map((n) => {
          const dim = active && !active.has(n.id)
          const showLabel = labelAll || n.id === center || n.degree >= (labelAll ? 0 : 3) || (active && active.has(n.id))
          return (
            <g key={n.id} className="node cursor-pointer" transform={`translate(${n.x || 0},${n.y || 0})`}
              tabIndex={0} role="link" aria-label={name(n)}
              onMouseEnter={() => setHover(n.id)} onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(n.id)} onBlur={() => setHover(null)}
              onClick={() => open(n.id)} onKeyDown={(e) => e.key === 'Enter' && open(n.id)}
              style={{ opacity: dim ? 0.18 : 1, transition: 'opacity .25s' }}>
              <circle r={r(n) + 6} fill="transparent" />
              <circle r={r(n)} fill={colorFor(n.category)} className="stroke-paper" strokeWidth={2} />
              {showLabel && (
                <text y={-r(n) - 7} textAnchor="middle" fontSize={n.id === center ? 19 : 14}
                  className="word fill-ink" style={{ paintOrder: 'stroke', stroke: 'rgb(var(--paper))', strokeWidth: 4, fontStyle: n.id === center ? 'normal' : 'italic' }}>
                  {name(n)}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <AnimatePresence>
        {hovered && !center && (
          <motion.div key={hovered.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="pointer-events-none absolute z-10 max-w-[260px] rounded-md bg-ink px-3.5 py-2.5 text-paper shadow-lift"
            style={{ left: Math.min(width - 270, Math.max(8, hovered.x + 14)), top: Math.max(8, hovered.y + 14) }}>
            <p className="word text-lg leading-tight">{name(hovered)}</p>
            <p className="mt-1 text-xs leading-snug text-paper/80">{hovered.short}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
