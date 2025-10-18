'use client'

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GitPullRequest, Clock, ExternalLink, GitMerge } from 'lucide-react'
import AppShell from '@/components/dashboard/AppShell'
import LoadingState from '@/components/ui/LoadingState'
import { useApiCache } from '@/hooks/useApiCache'
import { useSectionCache } from '@/hooks/useSectionCache'
import { repoFrom, timeAgo } from '@/lib/format'
import PRStatus from '@/components/github/PRStatus'

interface PRResponse {
  totals: { total: number; open: number; merged: number; reviewed: number; avgTimeToMergeMs: number | null }
  recent: Array<{ id: number; number: number; title: string; state: 'open' | 'closed'; merged: boolean; html_url: string; repository_url: string; updated_at: string }>
}

export default function PRsPage() {
  const { data, loading, error } = useApiCache<PRResponse>('/api/github/prs', {
    cacheKey: 'prs-summary'
  })
  
  type Section = 'all' | 'open' | 'merged' | 'closed'
  type Item = { id: number; number: number; title: string; state: 'open' | 'closed'; merged: boolean; html_url: string; repository_url: string; updated_at: string }
  const [sections, setSections] = useState<Record<Section, { items: Item[]; page?: number; total?: number; loaded?: boolean; loading: boolean }>>({
    all: { items: [], page: 0, total: 0, loaded: false, loading: false },
    open: { items: [], page: 0, total: 0, loaded: false, loading: false },
    merged: { items: [], page: 0, total: 0, loaded: false, loading: false },
    closed: { items: [], page: 0, total: 0, loaded: false, loading: false },
  })
  const [activeTab, setActiveTab] = useState<Section>('all')

  const { loadSection } = useSectionCache(sections, setSections, '/api/github/prs')

  // Initial load only for default tab
  useEffect(() => {
    loadSection('all')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load on tab change if not yet loaded
  useEffect(() => {
    const s = sections[activeTab]
    if (!s.loaded && !s.loading) {
      loadSection(activeTab)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

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

  const days = data.totals.avgTimeToMergeMs != null ? Math.round(data.totals.avgTimeToMergeMs / (1000*60*60*24)) : null

  // Helpers moved to src/lib/format

  const closedCount = Math.max(0, data.totals.total - data.totals.open - data.totals.merged)

  return (
    <AppShell>
      <div className="w-full px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Pull Requests</h1>
            <p className="text-gray-600">Your PR activity across public repositories</p>
          </div>
          <Badge variant="outline" className="bg-gray-50 text-gray-700"><GitPullRequest className="w-4 h-4 mr-1"/> Live</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="text-sm text-gray-500">Total PRs</div>
            <div className="text-2xl font-semibold">{data.totals.total.toLocaleString()}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">Merged</div>
            <div className="text-2xl font-semibold">{data.totals.merged.toLocaleString()}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">Open</div>
            <div className="text-2xl font-semibold">{data.totals.open.toLocaleString()}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500 flex items-center gap-2">Avg Time to Merge <Clock className="w-4 h-4"/></div>
            <div className="text-2xl font-semibold">{days != null ? `${days}d` : '—'}</div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-3 flex items-center gap-2 text-xs">
          <button className={`px-2.5 py-1 rounded-md border ${activeTab==='all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 hover:bg-gray-50'}`} onClick={()=>setActiveTab('all')}>All ({data.totals.total.toLocaleString()})</button>
          <button className={`px-2.5 py-1 rounded-md border ${activeTab==='open' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`} onClick={()=>setActiveTab('open')}>Open ({data.totals.open.toLocaleString()})</button>
          <button className={`px-2.5 py-1 rounded-md border ${activeTab==='merged' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`} onClick={()=>setActiveTab('merged')}>Merged ({data.totals.merged.toLocaleString()})</button>
          <button className={`px-2.5 py-1 rounded-md border ${activeTab==='closed' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`} onClick={()=>setActiveTab('closed')}>Closed ({closedCount.toLocaleString()})</button>
        </div>

        {/* Active Section List */}
        <Card className="p-0 overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <div className="text-sm font-medium">
              {activeTab === 'all' && 'All PRs'}
              {activeTab === 'open' && 'Open PRs'}
              {activeTab === 'merged' && 'Merged PRs'}
              {activeTab === 'closed' && 'Closed PRs'}
            </div>
          </div>
          <div className="divide-y">
            {sections[activeTab].items.map((p) => (
              <a key={p.id} href={p.html_url} target="_blank" rel="noopener noreferrer" className="group block px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 inline-flex items-center justify-center rounded-md p-1.5 ${p.state==='open' ? 'bg-green-50 text-green-700' : (p.merged ? 'bg-purple-50 text-purple-700' : 'bg-red-50 text-red-700')}`}>
                    {p.state === 'open' ? <GitPullRequest className="w-4 h-4" /> : (p.merged ? <GitMerge className="w-4 h-4" /> : <GitPullRequest className="w-4 h-4" />)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm text-gray-900 truncate group-hover:underline">{p.title}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-600 flex-wrap">
                      <Badge variant="outline" className="px-1.5 py-0.5 text-xs">{repoFrom(p.repository_url)}#{p.number}</Badge>
                      <PRStatus state={p.state} merged={p.merged} />
                      <span>Updated {timeAgo(p.updated_at)}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 shrink-0 mt-0.5" />
                </div>
              </a>
            ))}
            {sections[activeTab].items.length === 0 && !sections[activeTab].loading && (
              <div className="px-4 py-8 text-sm text-gray-600">No PRs found.</div>
            )}
            {sections[activeTab].loading && (
              <div className="px-4 py-8 text-sm text-gray-600">Loading…</div>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  )
}

