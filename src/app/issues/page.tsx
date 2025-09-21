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
    fetch('/api/github/issues')
      .then(async (r) => { if (!r.ok) throw new Error(await r.text()); return r.json() })
      .then((j) => !cancelled && setData(j))
      .catch((e) => !cancelled && setError(e?.message || 'Failed to load issues'))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [])

  if (loading || error || !data) {
    return (
      <AppShell>
        <div className="w-full px-6 py-6">
          {loading && <div className="text-gray-600">Loading…</div>}
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
