"use client"

import React from 'react'
import { Card } from '@/components/ui/card'

interface LoadingStateProps {
  variant?: 'page' | 'cards' | 'dashboard' | 'analytics' | 'heatmap'
  count?: number
  className?: string
}

const LoadingSkeletons = {
  page: () => (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </Card>
        ))}
      </div>
    </div>
  ),

  cards: ({ count = 6 }: { count?: number }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-4 animate-pulse">
          <div className="h-5 w-2/3 bg-gray-200 rounded mb-3" />
          <div className="h-4 w-full bg-gray-200 rounded mb-2" />
          <div className="h-4 w-5/6 bg-gray-200 rounded" />
        </Card>
      ))}
    </div>
  ),

  dashboard: () => (
    <div className="mb-8 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-5 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
              <div className="h-8 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-end justify-between">
              <div className="flex items-baseline gap-3">
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
                <div className="h-6 w-12 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-4 w-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),

  analytics: () => (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
      <Card className="p-4">
        <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="h-32 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    </div>
  ),

  heatmap: () => (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-200 rounded-md"></div>
              <div>
                <div className="h-3 w-20 bg-gray-200 rounded mb-1"></div>
                <div className="h-5 w-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
            <div className="h-6 w-16 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-3 w-32 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-48 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </Card>
    </div>
  )
}

export default function LoadingState({ variant = 'page', count, className = '' }: LoadingStateProps) {
  const SkeletonComponent = LoadingSkeletons[variant]
  
  return (
    <div className={className}>
      <SkeletonComponent count={count} />
    </div>
  )
}
