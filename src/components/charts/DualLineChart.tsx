"use client"

import React, { useMemo } from 'react'

type Point = { x: string; a: number; b: number }

export default function DualLineChart({
  data,
  width = 520,
  height = 180,
  strokeA = '#7c3aed',
  strokeB = '#ef4444',
}: {
  data: Point[]
  width?: number
  height?: number
  strokeA?: string
  strokeB?: string
}) {
  const { pathA, pathB, xTicks, yTicks, max } = useMemo(() => {
    if (!data || data.length === 0) return { pathA: '', pathB: '', xTicks: [], yTicks: [], max: 0 }
    const max = Math.max(
      1,
      ...data.map(d => Math.max(d.a, d.b))
    )
    const pad = 28
    const w = width - pad * 2
    const h = height - pad * 2
    const dx = w / Math.max(1, data.length - 1)
    const sy = (v: number) => pad + (h - (v / max) * h)
    const sx = (i: number) => pad + i * dx

    const pA = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${sx(i)},${sy(d.a)}`).join(' ')
    const pB = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${sx(i)},${sy(d.b)}`).join(' ')

    const every = Math.ceil(data.length / 6)
    const xTicks = data.map((d, i) => (i % every === 0 ? { x: sx(i), label: d.x } : null)).filter(Boolean) as any[]
    const yTicks = [0, max].map(v => ({ y: sy(v), label: String(v) }))

    return { pathA: pA, pathB: pB, xTicks, yTicks, max }
  }, [data, width, height])

  return (
    <svg width={width} height={height} role="img" aria-label="Dual line chart">
      {/* axes */}
      <line x1={28} y1={height-28} x2={width-28} y2={height-28} stroke="#e5e7eb"/>
      <line x1={28} y1={28} x2={28} y2={height-28} stroke="#e5e7eb"/>
      {/* lines */}
      <path d={pathA} stroke={strokeA} fill="none" strokeWidth={2} strokeLinecap="round"/>
      <path d={pathB} stroke={strokeB} fill="none" strokeWidth={2} strokeLinecap="round"/>
      {/* ticks */}
      {xTicks.map((t, i) => (
        <text key={i} x={t.x} y={height-10} fontSize={10} textAnchor="middle" fill="#6b7280">{t.label.slice(5)}</text>
      ))}
      {yTicks.map((t, i) => (
        <text key={i} x={8} y={t.y+3} fontSize={10} textAnchor="start" fill="#6b7280">{t.label}</text>
      ))}
    </svg>
  )
}
