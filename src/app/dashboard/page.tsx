'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import LoadingState from '@/components/ui/LoadingState'
import CommunityPanel from '@/components/community/CommunityPanel'
import { Brain } from 'lucide-react'
import DotLottieIcon from '@/components/DotLottieIcon'
import ContributionHeatmap, { type HeatmapDay } from '@/components/github/ContributionHeatmap'
import { Calendar, Flame, GitCommit, GitPullRequest, MessageSquare, Sparkles, Star, GitFork, FolderGit2, Search } from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'
import RightProfilePanel from '@/components/dashboard/RightProfilePanel'
import MiniKPI from '@/components/charts/MiniKPI'
import { useMultiApiCache } from '@/hooks/useApiCache'

interface Repository {
  id: string
  owner: string
  repoName: string
  description: string
  language: string
  stars: number
  forks: number
  analysisStatus: 'pending' | 'completed' | 'failed'
  lastAnalyzed: string
  enhancedData?: any
}

type ContributionsData = {
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

type PRsData = {
  totals: { total: number; open: number; merged: number; reviewed: number; avgTimeToMergeMs: number | null }
  recent: any[]
}

type IssuesData = {
  totals: { total: number; open: number; closed: number; avgFirstResponseMs: number | null }
  recent: any[]
}

type ReposData = {
  totals: { repos: number; totalStars: number; totalForks: number; languages: Record<string, number> }
  topByStars: any[]
}

type DashboardData = {
  contributions: ContributionsData
  prs: PRsData
  issues: IssuesData
  repos: ReposData
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)

  // Memoize endpoints to prevent infinite re-renders
  const endpoints = useMemo(() => [
    { url: '/api/github/contributions?range=365d', key: 'contributions' as keyof DashboardData, cacheKey: 'dashboard-contributions', optional: true },
    { url: '/api/github/prs', key: 'prs' as keyof DashboardData, cacheKey: 'dashboard-prs', optional: true },
    { url: '/api/github/issues', key: 'issues' as keyof DashboardData, cacheKey: 'dashboard-issues', optional: true },
    { url: '/api/github/repos', key: 'repos' as keyof DashboardData, cacheKey: 'dashboard-repos', optional: true }
  ], [])

  // Consolidated API calls using existing hook with optional endpoints
  const { data, loading: apiLoading, error, partialData } = useMultiApiCache<DashboardData>(endpoints)

  // Deterministic formatters to avoid locale-based hydration mismatches
  const numberFormatter = useMemo(() => new Intl.NumberFormat('en-US'), [])
  const formatDateUTC = useCallback((iso: string) => new Date(iso).toLocaleDateString('en-US', { timeZone: 'UTC' }), [])

  useEffect(() => {
    if (session?.user) {
      setLoading(false)
    }
  }, [session])

  // Extract data from consolidated response (use partial data if available)
  const contriData = data?.contributions || partialData?.contributions
  const prs = data?.prs || partialData?.prs
  const issues = data?.issues || partialData?.issues
  const repos = data?.repos || partialData?.repos
  const contriLoading = apiLoading
  const contriError = error

  return (
    <div className="w-full px-6 py-6">
      <div className="flex gap-6">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back! Explore your GitHub impact.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 border rounded-md text-gray-500">
                <Search className="w-4 h-4" />
                <input className="outline-none text-sm w-56" placeholder="Search…" />
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <Brain className="w-3 h-3 mr-1" /> Powered by Gemini AI
              </Badge>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6 flex items-center gap-3 flex-wrap">
            <Button onClick={() => window.open('/analyzer', '_blank')} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              Open Repo Analyzer
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const el = document.getElementById('community')
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                else window.location.hash = 'community'
              }}
              className="gap-2"
            >
              <span className="relative inline-flex items-center justify-center h-5 w-5 overflow-hidden">
                <DotLottieIcon src="/icons/community.lottie" size={28 } className="scale-[1.8]" />
              </span>
              Community
            </Button>
          </div>

          {/* Show loading placeholder if session still initializing */}
          {loading && <LoadingState variant="dashboard" />}

          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
            {/* Contributions sparkline (last 30d) */}
            <MiniKPI
              title="Contributions (30d)"
              value={useMemo(() => {
                if (!contriData?.calendar?.days) return 0
                const days = [...contriData.calendar.days].sort((a,b)=>a.date.localeCompare(b.date))
                const last30 = days.slice(-30)
                return last30.reduce((s,d)=>s+d.contributionCount,0)
              }, [contriData?.calendar?.days])}
              delta={useMemo(() => {
                if (!contriData?.calendar?.days) return undefined
                const days = [...contriData.calendar.days].sort((a,b)=>a.date.localeCompare(b.date))
                const last30 = days.slice(-30)
                const prev30 = days.slice(-60,-30)
                const a = last30.reduce((s,d)=>s+d.contributionCount,0)
                const b = prev30.reduce((s,d)=>s+d.contributionCount,0)
                if (b === 0) return { value: 0, positive: true }
                const pct = Math.round(((a-b)/b)*100)
                return { value: Math.abs(pct), positive: pct >= 0 }
              }, [contriData?.calendar?.days])}
              series={useMemo(() => {
                if (!contriData?.calendar?.days) return []
                const days = [...contriData.calendar.days].sort((a,b)=>a.date.localeCompare(b.date))
                const last30 = days.slice(-30).map(d=>d.contributionCount)
                return last30
              }, [contriData?.calendar?.days])}
              stroke="#7c3aed"
              icon={<GitCommit className="w-4 h-4" />}
            />

            {/* PRs sparkline */}
            <MiniKPI
              title="Pull Requests"
              value={prs ? prs.totals.total : 0}
              delta={useMemo(() => 
                prs ? { value: Math.min(99, Math.round((prs.totals.merged / Math.max(1, prs.totals.total))*100)), positive: true } : undefined,
                [prs]
              )}
              series={useMemo(() => {
                if (!prs?.recent) return []
                const counts: Record<string, number> = {}
                prs.recent.forEach((p:any)=>{ const d = new Date(p.updated_at).toISOString().slice(0,10); counts[d]=(counts[d]||0)+1 })
                const keys = Object.keys(counts).sort()
                return keys.slice(-30).map(k=>counts[k] || 0)
              }, [prs?.recent])}
              stroke="#10b981"
              icon={<GitPullRequest className="w-4 h-4" />}
            />

            {/* Issues sparkline */}
            <MiniKPI
              title="Issues"
              value={issues ? issues.totals.total : 0}
              delta={useMemo(() => 
                issues ? { value: Math.min(99, Math.round((issues.totals.closed / Math.max(1, issues.totals.total))*100)), positive: true } : undefined,
                [issues]
              )}
              series={useMemo(() => {
                if (!issues?.recent) return []
                const counts: Record<string, number> = {}
                issues.recent.forEach((i:any)=>{ const d = new Date(i.updated_at).toISOString().slice(0,10); counts[d]=(counts[d]||0)+1 })
                const keys = Object.keys(counts).sort()
                return keys.slice(-30).map(k=>counts[k] || 0)
              }, [issues?.recent])}
              stroke="#6366f1"
              icon={<MessageSquare className="w-4 h-4" />}
            />
          </div>

          {/* Contributions Section */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold">Your Contributions</h2>
                <p className="text-gray-600">Live GitHub activity powered by GraphQL</p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <Sparkles className="w-3 h-3 mr-1" /> Real-time
              </Badge>
            </div>

            {contriLoading ? (
              <LoadingState variant="heatmap" />
            ) : contriError ? (
              <div className="p-6 text-red-600">{contriError}</div>
            ) : contriData ? (
              <>
                {/* KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  <Card className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-md bg-gray-100 text-gray-700"><Sparkles className="w-5 h-5" /></div>
                    <div>
                      <div className="text-sm text-gray-500">Total Contributions</div>
                      <div className="text-xl font-semibold">{numberFormatter.format(contriData.totals.totalContributions)}</div>
                    </div>
                  </Card>
                  <Card className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-md bg-gray-100 text-gray-700"><GitCommit className="w-5 h-5" /></div>
                    <div>
                      <div className="text-sm text-gray-500">Commits</div>
                      <div className="text-xl font-semibold">{numberFormatter.format(contriData.totals.totalCommits)}</div>
                    </div>
                  </Card>
                  <Card className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-md bg-gray-100 text-gray-700"><GitPullRequest className="w-5 h-5" /></div>
                    <div>
                      <div className="text-sm text-gray-500">Pull Requests</div>
                      <div className="text-xl font-semibold">{numberFormatter.format(contriData.totals.totalPRs)}</div>
                    </div>
                  </Card>
                  <Card className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-md bg-gray-100 text-gray-700"><MessageSquare className="w-5 h-5" /></div>
                    <div>
                      <div className="text-sm text-gray-500">Issues</div>
                      <div className="text-xl font-semibold">{numberFormatter.format(contriData.totals.totalIssues)}</div>
                    </div>
                  </Card>
                  <Card className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-md bg-gray-100 text-gray-700"><Calendar className="w-5 h-5" /></div>
                    <div>
                      <div className="text-sm text-gray-500">Reviews</div>
                      <div className="text-xl font-semibold">{numberFormatter.format(contriData.totals.totalReviews)}</div>
                    </div>
                  </Card>
                </div>

                {/* Streaks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card className="p-4">
                    <div className="text-sm text-gray-500 mb-1">Current Streak</div>
                    <div className="text-2xl font-bold flex items-center gap-2"><Flame className="w-5 h-5 text-orange-500" /> {contriData.streaks.currentStreak} days</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm text-gray-500 mb-1">Longest Streak</div>
                    <div className="text-2xl font-bold flex items-center gap-2"><Flame className="w-5 h-5 text-red-500" /> {contriData.streaks.longestStreak} days</div>
                  </Card>
                </div>

                {/* Heatmap */}
                <Card className="p-4 mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm text-gray-500">Contribution Calendar</div>
                      <div className="text-lg font-semibold">{formatDateUTC(contriData.range.from)} - {formatDateUTC(contriData.range.to)}</div>
                    </div>
                  </div>
                  <ContributionHeatmap days={contriData.calendar.days} />
                </Card>
              </>
            ) : null}
          </div>

          {/* PRs & Issues & Repos summaries — removed per request */}

          {/* Community section */}
          <div id="community">
            <CommunityPanel />
          </div>
        </div>

        {/* Right Profile */}
        <div className="hidden xl:block w-80 shrink-0">
          <RightProfilePanel />
        </div>
      </div>
    </div>
  )
}