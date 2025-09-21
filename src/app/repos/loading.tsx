'use client'

import React from 'react'
import AppShell from '@/components/dashboard/AppShell'
import { Card } from '@/components/ui/card'

export default function ReposLoading() {
  return (
    <AppShell>
      <div className="w-full px-6 py-6 space-y-4">
        <div className="h-8 w-60 bg-gray-100 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="h-5 w-2/3 bg-gray-100 rounded animate-pulse mb-3" />
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse mb-2" />
              <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
