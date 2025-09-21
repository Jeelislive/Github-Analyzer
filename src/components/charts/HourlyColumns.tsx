"use client"

import React from 'react'

export default function HourlyColumns({
  data,
  width = 520,
  height = 180,
  color = '#7c3aed',
}: {
  data: number[] // length 24
  width?: number
  height?: number
  color?: string
}) {
  const pad = 28
  const w = width - pad * 2
  const h = height - pad * 2
  const max = Math.max(1, ...data)
  const bw = w / 24

  return (
    <svg width={width} height={height} role="img" aria-label="Hourly columns">
      <defs>
        <linearGradient id="hourGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.9}/>
          <stop offset="100%" stopColor={color} stopOpacity={0.4}/>
        </linearGradient>
      </defs>
      <line x1={pad} y1={height-pad} x2={width-pad} y2={height-pad} stroke="#e5e7eb"/>
      <line x1={pad} y1={pad} x2={pad} y2={height-pad} stroke="#e5e7eb"/>
      {data.map((v, i) => {
        const x = pad + i * bw + 2
        const bh = (v / max) * h
        const y = height - pad - bh
        return <rect key={i} x={x} y={y} width={Math.max(2, bw - 4)} height={bh} rx={2} fill="url(#hourGrad)" />
      })}
      {/* ticks */}
      {[0,6,12,18,23].map((t, i) => (
        <text key={i} x={pad + t * bw} y={height-8} fontSize={10} textAnchor="middle" fill="#6b7280">{t}</text>
      ))}
    </svg>
  )}
