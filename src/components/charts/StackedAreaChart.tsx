"use client"

import React, { useMemo } from 'react'

type Series = { name: string; color: string; values: number[] }

export default function StackedAreaChart({
  labels,
  series,
  width = 640,
  height = 220,
}: {
  labels: string[]
  series: Series[]
  width?: number
  height?: number
}) {
  const pad = 32
  const w = width - pad * 2
  const h = height - pad * 2

  const stacks = useMemo(() => {
    if (!labels.length || !series.length) return { paths: [], max: 0 }
    const sums = labels.map((_, i) => series.reduce((s, ser) => s + (ser.values[i] || 0), 0))
    const max = Math.max(1, ...sums)
    const dx = w / Math.max(1, labels.length - 1)
    const sx = (i: number) => pad + i * dx
    const sy = (v: number) => pad + (h - (v / max) * h)

    // cumulative stack
    let acc = labels.map(() => 0)
    const paths: { name: string; color: string; d: string }[] = []

    for (let s = 0; s < series.length; s++) {
      const ser = series[s]
      const top = labels.map((_, i) => acc[i] + (ser.values[i] || 0))
      const bottom = [...acc]
      acc = top
      const up = top.map((v, i) => `${i === 0 ? 'M' : 'L'} ${sx(i)} ${sy(v)}`).join(' ')
      const down = bottom.map((v, i) => `${i === 0 ? 'L' : ''} ${sx(labels.length - 1 - i)} ${sy(bottom[labels.length - 1 - i])}`).join(' ')
      const d = `${up} ${down} Z`
      paths.push({ name: ser.name, color: ser.color, d })
    }
    return { paths, max }
  }, [labels, series, w, h, pad])

  return (
    <svg width={width} height={height} role="img" aria-label="Stacked area chart">
      <defs>
        {series.map((s, i) => (
          <linearGradient key={i} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity={0.7} />
            <stop offset="100%" stopColor={s.color} stopOpacity={0.2} />
          </linearGradient>
        ))}
      </defs>
      <line x1={pad} y1={height-pad} x2={width-pad} y2={height-pad} stroke="#e5e7eb"/>
      <line x1={pad} y1={pad} x2={pad} y2={height-pad} stroke="#e5e7eb"/>
      {stacks.paths.map((p, i) => (
        <path key={i} d={p.d} fill={`url(#grad-${i})`} stroke={p.color} strokeOpacity={0.7} />
      ))}
    </svg>
  )
}
