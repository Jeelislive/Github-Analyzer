"use client"

import React from 'react'
import Sparkline from './Sparkline'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function MiniKPI({
  title,
  value,
  delta,
  stroke = '#6d28d9',
  series,
  icon,
}: {
  title: string
  value: string | number
  delta?: { value: number; positive?: boolean }
  stroke?: string
  series: number[]
  icon?: React.ReactNode
}) {
  const hasData = series && series.length > 0 && series.some(v => v > 0)
  
  return (
    <div className="group relative p-5 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 hover:border-gray-300">
      {/* Header with title and sparkline */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="p-1.5 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-gray-200 transition-colors">
              {icon}
            </div>
          )}
          <div className="text-sm font-medium text-gray-600">{title}</div>
        </div>
        {hasData && (
          <div className="flex-shrink-0">
            <Sparkline 
              data={series} 
              stroke={stroke} 
              width={100} 
              height={32}
              showGradient={true}
              showDots={false}
            />
          </div>
        )}
      </div>
      
      {/* Value and delta */}
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-3">
          <div className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {delta && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              delta.positive 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {delta.positive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {delta.value}%
            </div>
          )}
        </div>
        
        {/* Subtle trend indicator */}
        {hasData && (
          <div className="text-xs text-gray-400 font-medium">
            {series.length} days
          </div>
        )}
      </div>
      
      {/* Empty state for no data */}
      {!hasData && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 rounded-xl">
          <div className="text-xs text-gray-400">No data available</div>
        </div>
      )}
    </div>
  )
}
