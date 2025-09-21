"use client"

import React, { useMemo } from 'react'

type Props = {
  data: number[]
  width?: number
  height?: number
  stroke?: string
  fill?: string
}

export default function Sparkline({ data, width = 140, height = 40, stroke = '#6d28d9', fill = 'none' }: Props) {
  const path = useMemo(() => {
    if (!data || data.length === 0) return ''
    const max = Math.max(...data)
    const min = Math.min(...data)
    const dx = width / Math.max(1, data.length - 1)
    const scaleY = (v: number) => {
      if (max === min) return height / 2
      return height - ((v - min) / (max - min)) * height
    }
    return data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * dx},${scaleY(v)}`).join(' ')
  }, [data, width, height])

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <path d={path} stroke={stroke} fill={fill} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
