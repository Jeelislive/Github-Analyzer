'use client'

import React, { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Clock } from 'lucide-react'
import AppShell from '@/components/dashboard/AppShell'
import LoadingState from '@/components/ui/LoadingState'
import { useApiCache } from '@/hooks/useApiCache'

interface IssueResponse {
  totals: { total: number; open: number; closed: number; avgFirstResponseMs: number | null }
  recent: Array<{ id: number; title: string; html_url: string; updated_at: string; labels: any[] }>
}

export default function IssuesPage() {
  const { data, loading, error } = useApiCache<IssueResponse>('/api/github/issues', {
    cacheKey: 'issues-summary'
  })

  if (loading || error || !data) {
    return (
      <AppShell>
        <div className="w-full px-6 py-6">
          {loading && <LoadingState variant="page" />}
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
            <div className="text-sm text-gray-500">Open</div>
            <div className="text-2xl font-semibold">{data.totals.open.toLocaleString()}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">Closed</div>
            <div className="text-2xl font-semibold">{data.totals.closed.toLocaleString()}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500 flex items-center gap-2">Avg First Response <Clock className="w-4 h-4"/></div>
            <div className="text-2xl font-semibold">{hours != null ? `${hours}h` : '—'}</div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="text-lg font-semibold mb-4">Recent Issues</div>
          <div className="space-y-3">
            {data.recent.map((issue) => (
              <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <a href={issue.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                    {issue.title}
                  </a>
                  <div className="text-sm text-gray-500 mt-1">
                    Updated {new Date(issue.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  )
}
