"use client"

import React, { useMemo } from 'react'

type Slice = { label: string; value: number; color?: string }

export default function DonutChart({
  data,
  size = 200,
  thickness = 24,
  colors,
}: {
  data: Slice[]
  size?: number
  thickness?: number
  colors?: string[]
}) {
  const { arcs, total } = useMemo(() => {
    const total = Math.max(1, data.reduce((s, d) => s + (d.value || 0), 0))
    let start = -Math.PI / 2
    const arcs = data.map((d, i) => {
      const angle = (d.value / total) * Math.PI * 2
      const a0 = start
      const a1 = start + angle
      start = a1
      return { a0, a1, label: d.label, value: d.value, color: d.color || (colors?.[i] ?? palette[i % palette.length]) }
    })
    return { arcs, total }
  }, [data, colors])

  const r = size / 2
  const r0 = r - thickness
  const cx = r
  const cy = r

  const largeArc = (a: number) => (a % (Math.PI * 2)) > Math.PI ? 1 : 0
  const polar = (ang: number, rad: number) => [cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad]

  return (
    <svg width={size} height={size} role="img" aria-label="Donut chart">
      {arcs.map((arc, i) => {
        const [x0, y0] = polar(arc.a0, r)
        const [x1, y1] = polar(arc.a1, r)
        const [x2, y2] = polar(arc.a1, r0)
        const [x3, y3] = polar(arc.a0, r0)
        const a = arc.a1 - arc.a0
        const d = `M ${x0} ${y0} A ${r} ${r} 0 ${largeArc(a)} 1 ${x1} ${y1} L ${x2} ${y2} A ${r0} ${r0} 0 ${largeArc(a)} 0 ${x3} ${y3} Z`
        return <path key={i} d={d} fill={arc.color} opacity={0.9} />
      })}
      <circle cx={cx} cy={cy} r={r0-1} fill="white" />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" className="fill-gray-900" fontSize={16} fontWeight={600}>
        {data.length ? `${Math.round((data[0].value / total) * 100)}%` : ''}
      </text>
    </svg>
  )
}

const palette = ['#7c3aed','#10b981','#6366f1','#f59e0b','#ef4444','#14b8a6','#8b5cf6']
