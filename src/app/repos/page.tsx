'use client'

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, GitFork, Archive, ExternalLink, FolderGit2 } from 'lucide-react'
import LoadingState from '@/components/ui/LoadingState'
import { useApiCache } from '@/hooks/useApiCache'
import { useSectionCache } from '@/hooks/useSectionCache'
import { timeAgo } from '@/lib/format'

interface ReposResponse {
  totals: { repos: number; totalStars: number; totalForks: number; languages: Record<string, number> }
  topByStars: Array<{ id: number; full_name: string; html_url: string; stargazers_count: number }>
}

export default function ReposPage() {
  const { data, loading, error } = useApiCache<ReposResponse>('/api/github/repos', {
    cacheKey: 'repos-summary'
  })
  type Section = 'all' | 'sources' | 'forks' | 'archived'
  type Item = {
    id: number
    name: string
    full_name: string
    description: string | null
    html_url: string
    language: string | null
    stargazers_count: number
    forks_count: number
    pushed_at: string
    archived?: boolean
    fork?: boolean
  }
  const [sections, setSections] = useState<Record<Section, { items: Item[]; loaded: boolean; loading: boolean }>>({
    all: { items: [], loaded: false, loading: false },
    sources: { items: [], loaded: false, loading: false },
    forks: { items: [], loaded: false, loading: false },
    archived: { items: [], loaded: false, loading: false },
  })
  const [activeTab, setActiveTab] = useState<Section>('all')

  const { loadSection } = useSectionCache(sections, setSections, '/api/github/repos')
  useEffect(() => {
    loadSection('all')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    loadSection(activeTab)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  if (loading) return <div className="p-6"><LoadingState variant="cards" count={6} /></div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!data) return null

  return (
    <div className="w-full px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Repositories</h1>
          <p className="text-gray-600">Your public repositories and languages</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-md bg-gray-100 text-gray-700"><FolderGit2 className="w-5 h-5"/></div>
          <div>
            <div className="text-sm text-gray-500">Total Repos</div>
            <div className="text-2xl font-semibold">{data.totals.repos.toLocaleString()}</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-md bg-gray-100 text-gray-700"><Star className="w-5 h-5"/></div>
          <div>
            <div className="text-sm text-gray-500">Total Stars</div>
            <div className="text-2xl font-semibold">{data.totals.totalStars.toLocaleString()}</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-md bg-gray-100 text-gray-700"><GitFork className="w-5 h-5"/></div>
          <div>
            <div className="text-sm text-gray-500">Total Forks</div>
            <div className="text-2xl font-semibold">{data.totals.totalForks.toLocaleString()}</div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-3 flex items-center gap-2 text-xs">
        <button className={`px-2.5 py-1 rounded-md border ${activeTab==='all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 hover:bg-gray-50'}`} onClick={()=>setActiveTab('all')}>All</button>
        <button className={`px-2.5 py-1 rounded-md border ${activeTab==='sources' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`} onClick={()=>setActiveTab('sources')}>Sources</button>
        <button className={`px-2.5 py-1 rounded-md border ${activeTab==='forks' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`} onClick={()=>setActiveTab('forks')}>Forks</button>
        <button className={`px-2.5 py-1 rounded-md border ${activeTab==='archived' ? 'bg-gray-600 text-white border-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`} onClick={()=>setActiveTab('archived')}>Archived</button>
      </div>

      {/* Active Section List */}
      <Card className="p-0 overflow-hidden">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <div className="text-sm font-medium">
            {activeTab === 'all' && 'All Repositories'}
            {activeTab === 'sources' && 'Source Repositories'}
            {activeTab === 'forks' && 'Forked Repositories'}
            {activeTab === 'archived' && 'Archived Repositories'}
          </div>
        </div>
        <div className="divide-y">
          {sections[activeTab].items.map((r) => (
            <a key={r.id} href={r.html_url} target="_blank" rel="noopener noreferrer" className="group block px-4 py-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex items-center justify-center rounded-md p-1.5 bg-gray-50 text-gray-700">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm text-gray-900 truncate group-hover:underline">{r.full_name}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-600 flex-wrap">
                    {r.language && <Badge variant="outline" className="px-1.5 py-0.5 text-xs">{r.language}</Badge>}
                    {typeof r.stargazers_count === 'number' && (
                      <span className="inline-flex items-center gap-1"><Star className="w-3 h-3"/> {r.stargazers_count}</span>
                    )}
                    {typeof r.forks_count === 'number' && (
                      <span className="inline-flex items-center gap-1"><GitFork className="w-3 h-3"/> {r.forks_count}</span>
                    )}
                    {r.fork && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border bg-amber-50 text-amber-700 border-amber-200">fork</span>}
                    {r.archived && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border bg-gray-100 text-gray-700 border-gray-200">archived</span>}
                    <span>Pushed {timeAgo(r.pushed_at)}</span>
                  </div>
                  {r.description && <div className="mt-1 text-xs text-gray-700 line-clamp-2">{r.description}</div>}
                </div>
              </div>
            </a>
          ))}
          {sections[activeTab].items.length === 0 && !sections[activeTab].loading && (
            <div className="px-4 py-8 text-sm text-gray-600">No repositories found.</div>
          )}
          {sections[activeTab].loading && (
            <div className="px-4 py-8 text-sm text-gray-600">Loading…</div>
          )}
        </div>
      </Card>
    </div>
  )
}
