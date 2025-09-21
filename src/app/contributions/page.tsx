'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ContributionHeatmap, { HeatmapDay } from '@/components/github/ContributionHeatmap'
import { Brain, Calendar, Flame, GitCommit, GitPullRequest, MessageSquare, Sparkles } from 'lucide-react'

interface ContributionsResponse {
  user: { login: string; name?: string | null }
  range: { from: string; to: string }
  totals: {
    totalContributions: number
    totalCommits: number
    totalIssues: number
    totalPRs: number
    totalReviews: number
    restricted: number
    startedAt: string
    endedAt: string
    years: number[]
  }
  streaks: { currentStreak: number; longestStreak: number }
  calendar: { total: number; days: HeatmapDay[] }
}

export default function ContributionsPage() {
  const { data: session, status } = useSession()
  const [data, setData] = useState<ContributionsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      setLoading(true)
      fetch('/api/github/contributions?range=365d')
        .then(async (res) => {
          if (!res.ok) throw new Error(await res.text())
          return res.json()
        })
        .then((json) => setData(json))
        .catch((e) => setError(e?.message || 'Failed to load'))
        .finally(() => setLoading(false))
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

  const kpis = useMemo(() => {
    if (!data) return []
    return [
      { label: 'Total Contributions', value: data.totals.totalContributions, icon: Sparkles },
      { label: 'Commits', value: data.totals.totalCommits, icon: GitCommit },
      { label: 'Pull Requests', value: data.totals.totalPRs, icon: GitPullRequest },
      { label: 'Issues', value: data.totals.totalIssues, icon: MessageSquare },
      { label: 'Reviews', value: data.totals.totalReviews, icon: Calendar },
    ]
  }, [data])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-semibold">Sign in with GitHub to view your contributions</h1>
        <Button onClick={() => signIn('github')}>Sign in</Button>
      </div>
    )
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contributions Dashboard</h1>
          <p className="text-gray-600">Real-time GitHub activity for {data?.user.name || data?.user.login}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Brain className="w-3 h-3 mr-1" />
            Powered by GitHub GraphQL
          </Badge>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {kpis.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-md bg-gray-100 text-gray-700"><Icon className="w-5 h-5" /></div>
            <div>
              <div className="text-sm text-gray-500">{label}</div>
              <div className="text-xl font-semibold">{value.toLocaleString()}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Streaks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="p-4">
          <div className="text-sm text-gray-500 mb-1">Current Streak</div>
          <div className="text-2xl font-bold flex items-center gap-2"><Flame className="w-5 h-5 text-orange-500" /> {data?.streaks.currentStreak} days</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500 mb-1">Longest Streak</div>
          <div className="text-2xl font-bold flex items-center gap-2"><Flame className="w-5 h-5 text-red-500" /> {data?.streaks.longestStreak} days</div>
        </Card>
      </div>

      {/* Heatmap */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-gray-500">Contribution Calendar</div>
            <div className="text-lg font-semibold">{new Date(data!.range.from).toLocaleDateString()} - {new Date(data!.range.to).toLocaleDateString()}</div>
          </div>
        </div>
        <ContributionHeatmap days={data!.calendar.days} />
      </Card>
    </div>
  )
}
