"use client"

import React, { useMemo } from 'react'

type Props = {
  data: number[]
  width?: number
  height?: number
  stroke?: string
  fill?: string
  showGradient?: boolean
  showDots?: boolean
}

export default function Sparkline({ 
  data, 
  width = 140, 
  height = 40, 
  stroke = '#6d28d9', 
  fill = 'none',
  showGradient = true,
  showDots = false
}: Props) {
  const { path, areaPath, points } = useMemo(() => {
    if (!data || data.length === 0) return { path: '', areaPath: '', points: [] }
    
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min
    const dx = width / Math.max(1, data.length - 1)
    
    const scaleY = (v: number) => {
      if (range === 0) return height / 2
      return height - ((v - min) / range) * height
    }
    
    const pathPoints = data.map((v, i) => ({ x: i * dx, y: scaleY(v) }))
    const linePath = pathPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ')
    
    // Create area path for gradient fill
    const areaPath = pathPoints.length > 0 
      ? `M ${pathPoints[0].x},${height} L ${pathPoints.map(p => `${p.x},${p.y}`).join(' L ')} L ${pathPoints[pathPoints.length - 1].x},${height} Z`
      : ''
    
    return { 
      path: linePath, 
      areaPath,
      points: pathPoints 
    }
  }, [data, width, height])

  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        {showGradient && (
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.3" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0.05" />
          </linearGradient>
        )}
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Gradient area fill */}
      {showGradient && areaPath && (
        <path 
          d={areaPath} 
          fill={`url(#${gradientId})`} 
          stroke="none"
        />
      )}
      
      {/* Main line */}
      <path 
        d={path} 
        stroke={stroke} 
        fill="none" 
        strokeWidth={2.5} 
        strokeLinecap="round" 
        strokeLinejoin="round"
        filter="url(#glow)"
        className="drop-shadow-sm"
      />
      
      {/* Data points */}
      {showDots && points.map((point, i) => (
        <circle
          key={i}
          cx={point.x}
          cy={point.y}
          r={2}
          fill={stroke}
          className="drop-shadow-sm"
        />
      ))}
    </svg>
  )
}
