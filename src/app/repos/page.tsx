'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { FolderGit2, Star, GitFork } from 'lucide-react'

interface ReposResponse {
  totals: { repos: number; totalStars: number; totalForks: number; languages: Record<string, number> }
  topByStars: Array<{ id: number; full_name: string; html_url: string; stargazers_count: number }>
}

export default function ReposPage() {
  const [data, setData] = useState<ReposResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch('/api/github/repos')
      .then(async (r) => { if (!r.ok) throw new Error(await r.text()); return r.json() })
      .then((j) => !cancelled && setData(j))
      .catch((e) => !cancelled && setError(e?.message || 'Failed to load repos'))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [])

  const languageList = useMemo(() => {
    if (!data) return []
    const entries = Object.entries(data.totals.languages)
    const total = entries.reduce((a, [, v]) => a + v, 0)
    return entries
      .sort((a, b) => b[1] - a[1])
      .map(([lang, count]) => ({ lang, count, pct: Math.round((count / total) * 100) }))
  }, [data])

  if (loading) return <div className="p-6">Loading…</div>
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

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4">
          <div className="text-sm font-medium mb-3">Top by Stars</div>
          <div className="space-y-2 max-h-[70vh] overflow-auto">
            {data.topByStars.map((r) => (
              <a key={r.id} href={r.html_url} target="_blank" className="block text-sm text-blue-700 hover:underline truncate">
                {r.full_name} <span className="text-gray-500">★ {r.stargazers_count}</span>
              </a>
            ))}
          </div>
        </Card>
        <Card className="p-4 lg:col-span-2">
          <div className="text-sm font-medium mb-3">Languages</div>
          <div className="space-y-3">
            {languageList.map((l) => (
              <div key={l.lang} className="flex items-center gap-3">
                <div className="w-28 text-sm text-gray-600 shrink-0">{l.lang}</div>
                <div className="flex-1 h-2 bg-gray-100 rounded">
                  <div className="h-2 rounded bg-purple-500" style={{ width: `${l.pct}%` }} />
                </div>
                <div className="w-10 text-right text-sm">{l.pct}%</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
