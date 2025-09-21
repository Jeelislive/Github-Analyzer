"use client"

import React from 'react'

export default function BarsVertical({
  data,
  width = 520,
  height = 180,
  color = '#7c3aed',
  labels = [],
}: {
  data: number[]
  width?: number
  height?: number
  color?: string
  labels?: string[]
}) {
  const pad = 28
  const w = width - pad * 2
  const h = height - pad * 2
  const max = Math.max(1, ...data)
  const bw = w / Math.max(1, data.length)

  return (
    <svg width={width} height={height} role="img" aria-label="Bar chart">
      <line x1={pad} y1={height-pad} x2={width-pad} y2={height-pad} stroke="#e5e7eb"/>
      <line x1={pad} y1={pad} x2={pad} y2={height-pad} stroke="#e5e7eb"/>
      {data.map((v, i) => {
        const x = pad + i * bw + 4
        const bh = (v / max) * h
        const y = height - pad - bh
        return <rect key={i} x={x} y={y} width={Math.max(2, bw - 8)} height={bh} rx={3} fill={color} />
      })}
      {labels.length ? labels.map((l, i) => (
        <text key={i} x={pad + i * bw + bw/2} y={height-8} fontSize={10} textAnchor="middle" fill="#6b7280">{l}</text>
      )) : null}
    </svg>
  )
}
