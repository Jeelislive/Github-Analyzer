"use client"

import React from 'react'

export default function RadialGauge({
  value, // 0..1
  size = 140,
  stroke = '#7c3aed',
  bg = '#e5e7eb',
  label,
}: {
  value: number
  size?: number
  stroke?: string
  bg?: string
  label?: string
}) {
  const r = (size / 2) - 10
  const cx = size / 2
  const cy = size / 2
  const circ = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(1, value))
  const dash = circ * clamped
  const gap = circ - dash

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} role="img" aria-label="Radial gauge">
        <circle cx={cx} cy={cy} r={r} stroke={bg} strokeWidth={10} fill="none" />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={stroke}
          strokeWidth={10}
          fill="none"
          strokeDasharray={`${dash} ${gap}`}
          transform={`rotate(-90 ${cx} ${cy})`}
          strokeLinecap="round"
        />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize={18} fontWeight={600} fill="#111827">
          {Math.round(clamped * 100)}%
        </text>
      </svg>
      {label && <div className="mt-2 text-sm text-gray-600">{label}</div>}
    </div>
  )
}
