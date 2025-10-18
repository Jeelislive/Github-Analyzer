"use client"

import React from 'react'
import AppShell from '@/components/dashboard/AppShell'
import LoadingState from '@/components/ui/LoadingState'
import { Badge } from '@/components/ui/badge'

interface PageLayoutProps {
  title: string
  subtitle?: string
  badge?: {
    text: string
    variant?: 'default' | 'outline'
    className?: string
    icon?: React.ReactNode
  }
  loading?: boolean
  error?: string | null
  loadingVariant?: 'page' | 'cards' | 'dashboard' | 'analytics' | 'heatmap'
  children: React.ReactNode
  className?: string
}

export default function PageLayout({
  title,
  subtitle,
  badge,
  loading = false,
  error = null,
  loadingVariant = 'page',
  children,
  className = 'w-full px-6 py-6'
}: PageLayoutProps) {
  return (
    <AppShell>
      <div className={className}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            {subtitle && <p className="text-gray-600">{subtitle}</p>}
          </div>
          {badge && (
            <Badge variant={badge.variant || 'outline'} className={badge.className}>
              {badge.icon}
              {badge.text}
            </Badge>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <LoadingState variant={loadingVariant} />
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          children
        )}
      </div>
    </AppShell>
  )
}
