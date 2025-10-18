'use client'

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare } from 'lucide-react'
import AppShell from '@/components/dashboard/AppShell'

interface IssueResponse {
  totals: { total: number; open: number; closed: number; avgFirstResponseMs: number | null }
  recent: Array<{ id: number; title: string; html_url: string; updated_at: string; labels: any[] }>
}

export default function IssuesPage() {
  const [data, setData] = useState<IssueResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    
    // Check cache first
    const cacheKey = 'issues-summary'
    const cached = sessionStorage.getItem(cacheKey)
    const cacheTimestamp = sessionStorage.getItem(`${cacheKey}-timestamp`)
    const cacheExpiry = 5 * 60 * 1000 // 5 minutes
    
    if (cached && cacheTimestamp && Date.now() - parseInt(cacheTimestamp) < cacheExpiry) {
      try {
        const cachedData = JSON.parse(cached)
        if (!cancelled) {
          setData(cachedData)
          setLoading(false)
        }
        return
      } catch (e) {
        // Clear invalid cache
        sessionStorage.removeItem(cacheKey)
        sessionStorage.removeItem(`${cacheKey}-timestamp`)
      }
    }
    
    fetch('/api/github/issues')
      .then(async (r) => { if (!r.ok) throw new Error(await r.text()); return r.json() })
      .then((j) => {
        if (!cancelled) {
          setData(j)
          // Cache the response
          sessionStorage.setItem(cacheKey, JSON.stringify(j))
          sessionStorage.setItem(`${cacheKey}-timestamp`, Date.now().toString())
        }
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : 'Failed to load issues'))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [])

  if (loading || error || !data) {
    return (
      <AppShell>
        <div className="w-full px-6 py-6">
          {loading && (
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
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {error && <div className="text-red-600">{error}</div>}
        </div>
      </AppShell>
    )
  }

  const hours = data.totals.avgFirstResponseMs != null ? Math.round(data.totals.avgFirstResponseMs / (1000*60*60)) : null

  return (
    <AppShell>
      <div className="w-full px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Issues</h1>
            <p className="text-gray-600">Your created issues across public repositories</p>
          </div>
          <Badge variant="outline" className="bg-gray-50 text-gray-700"><MessageSquare className="w-4 h-4 mr-1"/> Live</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="text-sm text-gray-500">Total Issues</div>
            <div className="text-2xl font-semibold">{data.totals.total.toLocaleString()}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">Closed</div>
            <div className="text-2xl font-semibold">{data.totals.closed.toLocaleString()}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">Open</div>
            <div className="text-2xl font-semibold">{data.totals.open.toLocaleString()}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">Avg First Response</div>
            <div className="text-2xl font-semibold">{hours != null ? `${hours}h` : '—'}</div>
          </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Closed</div>
          <div className="text-2xl font-semibold">{data.totals.closed.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Open</div>
          <div className="text-2xl font-semibold">{data.totals.open.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Avg First Response</div>
          <div className="text-2xl font-semibold">{hours != null ? `${hours}h` : '—'}</div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="text-sm font-medium mb-3">Recent Issues</div>
        <div className="space-y-2 max-h-[70vh] overflow-auto">
          {data.recent.map((i) => (
            <a key={i.id} href={i.html_url} target="_blank" className="block text-sm text-blue-700 hover:underline truncate">
              {i.title}
              <span className="text-gray-500"> • {new Date(i.updated_at).toLocaleString()}</span>
            </a>
          ))}
        </div>
      </Card>
      </div>
    </AppShell>
  )
}
