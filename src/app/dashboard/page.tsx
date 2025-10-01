'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import CommunityPanel from '@/components/community/CommunityPanel'
import { Brain } from 'lucide-react'
import DotLottieIcon from '@/components/DotLottieIcon'
import ContributionHeatmap, { type HeatmapDay } from '@/components/github/ContributionHeatmap'
import { Calendar, Flame, GitCommit, GitPullRequest, MessageSquare, Sparkles, Star, GitFork, FolderGit2, Search } from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'
import RightProfilePanel from '@/components/dashboard/RightProfilePanel'
import MiniKPI from '@/components/charts/MiniKPI'

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

export default function DashboardPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [contriLoading, setContriLoading] = useState(true)
  const [contriError, setContriError] = useState<string | null>(null)
  const [contriData, setContriData] = useState<null | {
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
  }>(null)

  // Deterministic formatters to avoid locale-based hydration mismatches
  const numberFormatter = new Intl.NumberFormat('en-US')
  const formatDateUTC = (iso: string) => new Date(iso).toLocaleDateString('en-US', { timeZone: 'UTC' })

  // PRs
  const [prs, setPrs] = useState<null | { totals: { total: number; open: number; merged: number; reviewed: number; avgTimeToMergeMs: number | null }, recent: any[] }>(null)
  const [prsErr, setPrsErr] = useState<string | null>(null)
  // Issues
  const [issues, setIssues] = useState<null | { totals: { total: number; open: number; closed: number; avgFirstResponseMs: number | null }, recent: any[] }>(null)
  const [issuesErr, setIssuesErr] = useState<string | null>(null)
  // Repos
  const [repos, setRepos] = useState<null | { totals: { repos: number; totalStars: number; totalForks: number; languages: Record<string, number> }, topByStars: any[] }>(null)
  const [reposErr, setReposErr] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user) {
      // Minimal loading to avoid flash
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    let cancelled = false
    if (session?.user) {
      setContriLoading(true)
      fetch('/api/github/contributions?range=365d')
        .then(async (res) => {
          if (!res.ok) throw new Error(await res.text())
          return res.json()
        })
        .then((json) => {
          if (!cancelled) setContriData(json)
        })
        .catch((e) => {
          if (!cancelled) setContriError(e?.message || 'Failed to load contributions')
        })
        .finally(() => {
          if (!cancelled) setContriLoading(false)
        })
      // PRs
      fetch('/api/github/prs')
        .then(async (r) => { if (!r.ok) throw new Error(await r.text()); return r.json() })
        .then((j) => !cancelled && setPrs(j))
        .catch((e) => !cancelled && setPrsErr(e?.message || 'Failed to load PRs'))
      // Issues
      fetch('/api/github/issues')
        .then(async (r) => { if (!r.ok) throw new Error(await r.text()); return r.json() })
        .then((j) => !cancelled && setIssues(j))
        .catch((e) => !cancelled && setIssuesErr(e?.message || 'Failed to load issues'))
      // Repos
      fetch('/api/github/repos')
        .then(async (r) => { if (!r.ok) throw new Error(await r.text()); return r.json() })
        .then((j) => !cancelled && setRepos(j))
        .catch((e) => !cancelled && setReposErr(e?.message || 'Failed to load repos'))
    }
    return () => {
      cancelled = true
    }
  }, [session])

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
                <DotLottieIcon src="/icons/community.lottie" size={28} className="scale-[1.8]" />
              </span>
              Community
            </Button>
          </div>

          {/* Show loading placeholder if session still initializing */}
          {loading && (
            <div className="mb-8 text-gray-600">Loading…</div>
          )}

          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
            {/* Contributions sparkline (last 30d) */}
            <MiniKPI
              title="Contributions (30d)"
              value={(() => {
                if (!contriData?.calendar?.days) return '—'
                const days = [...contriData.calendar.days].sort((a,b)=>a.date.localeCompare(b.date))
                const last30 = days.slice(-30)
                return last30.reduce((s,d)=>s+d.contributionCount,0)
              })()}
              delta={(() => {
                if (!contriData?.calendar?.days) return undefined
                const days = [...contriData.calendar.days].sort((a,b)=>a.date.localeCompare(b.date))
                const last30 = days.slice(-30)
                const prev30 = days.slice(-60,-30)
                const a = last30.reduce((s,d)=>s+d.contributionCount,0)
                const b = prev30.reduce((s,d)=>s+d.contributionCount,0)
                if (b === 0) return { value: 0, positive: true }
                const pct = Math.round(((a-b)/b)*100)
                return { value: Math.abs(pct), positive: pct >= 0 }
              })()}
              series={(() => {
                if (!contriData?.calendar?.days) return []
                const days = [...contriData.calendar.days].sort((a,b)=>a.date.localeCompare(b.date))
                const last30 = days.slice(-30).map(d=>d.contributionCount)
                return last30
              })()}
              stroke="#7c3aed"
            />

            {/* PRs sparkline (approx from recent updates) */}
            <MiniKPI
              title="PRs updated (sample)"
              value={prs ? prs.totals.total : '—'}
              delta={prs ? { value: Math.min(99, Math.round((prs.totals.merged / Math.max(1, prs.totals.total))*100)), positive: true } : undefined}
              series={(() => {
                if (!prs?.recent) return []
                const counts: Record<string, number> = {}
                prs.recent.forEach((p:any)=>{ const d = new Date(p.updated_at).toISOString().slice(0,10); counts[d]=(counts[d]||0)+1 })
                const keys = Object.keys(counts).sort()
                return keys.slice(-30).map(k=>counts[k])
              })()}
              stroke="#10b981"
            />

            {/* Issues sparkline (approx from recent updates) */}
            <MiniKPI
              title="Issues updated (sample)"
              value={issues ? issues.totals.total : '—'}
              delta={issues ? { value: Math.min(99, Math.round((issues.totals.closed / Math.max(1, issues.totals.total))*100)), positive: true } : undefined}
              series={(() => {
                if (!issues?.recent) return []
                const counts: Record<string, number> = {}
                issues.recent.forEach((i:any)=>{ const d = new Date(i.updated_at).toISOString().slice(0,10); counts[d]=(counts[d]||0)+1 })
                const keys = Object.keys(counts).sort()
                return keys.slice(-30).map(k=>counts[k])
              })()}
              stroke="#6366f1"
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
              <div className="p-6 text-gray-600">Loading contributions…</div>
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