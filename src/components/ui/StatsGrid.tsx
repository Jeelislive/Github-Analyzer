"use client"

import React from 'react'
import { Card } from '@/components/ui/card'

interface StatItem {
  label: string
  value: string | number
  icon?: React.ReactNode
  className?: string
}

interface StatsGridProps {
  stats: StatItem[]
  columns?: 2 | 3 | 4 | 5
  className?: string
}

export default function StatsGrid({ 
  stats, 
  columns = 4, 
  className = '' 
}: StatsGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <Card key={index} className={`p-4 ${stat.className || ''}`}>
          {stat.icon ? (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-gray-100 text-gray-700">
                {stat.icon}
              </div>
              <div>
                <div className="text-sm text-gray-500">{stat.label}</div>
                <div className="text-xl font-semibold">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-500">{stat.label}</div>
              <div className="text-2xl font-semibold">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
            </>
          )}
        </Card>
      ))}
    </div>
  )
}
