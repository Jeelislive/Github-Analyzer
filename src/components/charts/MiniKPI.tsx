"use client"

import React from 'react'
import Sparkline from './Sparkline'

export default function MiniKPI({
  title,
  value,
  delta,
  stroke = '#6d28d9',
  series,
}: {
  title: string
  value: string | number
  delta?: { value: number; positive?: boolean }
  stroke?: string
  series: number[]
}) {
  return (
    <div className="p-4 rounded-lg border bg-white">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">{title}</div>
        <Sparkline data={series} stroke={stroke} />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-2xl font-semibold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
        {delta && (
          <div className={`text-sm ${delta.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {delta.positive ? '+' : ''}{delta.value}%
          </div>
        )}
      </div>
    </div>
  )
}
