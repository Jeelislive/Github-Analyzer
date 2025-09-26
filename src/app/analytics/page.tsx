'use client'

import React, { useEffect, useMemo, useState } from 'react'
import AppShell from '@/components/dashboard/AppShell'
import { Card } from '@/components/ui/card'
import LineChartJS from '@/components/charts/LineChartJS'
import GaugeChartJS from '@/components/charts/GaugeChartJS'
import BarChartJS from '@/components/charts/BarChartJS'
import DoughnutChartJS from '@/components/charts/DoughnutChartJS'
import HourlyChartJS from '@/components/charts/HourlyChartJS'
import StackedAreaChartJS from '@/components/charts/StackedAreaChartJS'

interface ContributionsResponse { calendar: { days: { date: string; contributionCount: number }[] } }
interface PRResponse { totals: { total: number; merged: number }, recent: Array<{ updated_at: string }> }
interface IssueResponse { totals: { total: number; closed: number }, recent: Array<{ updated_at: string }> }
interface ActivityResponse { daily: Array<{ date: string; prs: number; issues: number; reviews: number; commits: number }>, totals: { prs: number; issues: number; reviews: number; commits: number } }
interface ReposResponse { totals: { languages: Record<string, number> } }

export default function AnalyticsPage() {
  const [contrib, setContrib] = useState<ContributionsResponse | null>(null)
  const [prs, setPrs] = useState<PRResponse | null>(null)
  const [issues, setIssues] = useState<IssueResponse | null>(null)
  const [repos, setRepos] = useState<ReposResponse | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activity, setActivity] = useState<ActivityResponse | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const okJson = async (res: Response) => {
          if (!res.ok) throw new Error(await res.text())
          return res.json()
        }
        const [c, p, i, r, a] = await Promise.all([
          fetch('/api/github/contributions?range=180d').then(okJson),
          fetch('/api/github/prs').then(okJson),
          fetch('/api/github/issues').then(okJson),
          fetch('/api/github/repos').then(okJson),
          fetch('/api/github/activity?range=180d').then(okJson),
        ])
        if (!cancelled) {
          setContrib(c)
          setPrs(p)
          setIssues(i)
          setRepos(r)
          setActivity(a)
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load analytics')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Build PR vs Issue daily series (last 30d) from real activity
  const dualSeries = useMemo(() => {
    const days = activity?.daily || []
    const last = days.slice(-30)
    return last.map((d) => ({ x: d.date, a: d.prs, b: d.issues }))
  }, [activity])

  // Gauges
  const mergeRate = useMemo(() => {
    const merged = prs?.totals?.merged ?? 0
    const total = prs?.totals?.total ?? 0
    return Math.min(1, merged / Math.max(1, total))
  }, [prs])
  const closeRate = useMemo(() => {
    const closed = issues?.totals?.closed ?? 0
    const total = issues?.totals?.total ?? 0
    return Math.min(1, closed / Math.max(1, total))
  }, [issues])

  // Weekday bars from contributions
  const weekdayBars = useMemo(() => {
    if (!contrib?.calendar?.days) return { values: [], labels: [] as string[] }
    const days = contrib.calendar.days
    const buckets = new Array(7).fill(0)
    days.forEach((d) => {
      const day = new Date(d.date).getUTCDay()
      buckets[day] += d.contributionCount
    })
    const labels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    return { values: buckets, labels }
  }, [contrib])

  // Languages composition (for donut)
  const languages = useMemo(() => {
    const map = repos?.totals?.languages || {}
    const entries = Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,8)
    return { values: entries.map(([,v])=>v), labels: entries.map(([k])=>k) }
  }, [repos])

  // Hour-of-day distribution from PRs/Issues updated_at (proxy for activity)
  const hourly = useMemo(() => {
    const arr = new Array(24).fill(0)
    const bump = (iso?: string) => {
      if (!iso) return
      const d = new Date(iso)
      const h = d.getUTCHours()
      arr[h] = (arr[h] || 0) + 1
    }
    prs?.recent?.forEach(p => bump(p.updated_at))
    issues?.recent?.forEach(i => bump(i.updated_at))
    return arr
  }, [prs, issues])

  // Stacked area (real): commits, PRs, Issues, Reviews per day (30d)
  const stacked = useMemo(() => {
    const days = activity?.daily || []
    const last = days.slice(-30)
    const labels = last.map((d) => d.date)
    return {
      labels,
      series: [
        { name: 'Commits', color: '#7c3aed', values: last.map(d => d.commits) },
        { name: 'PRs', color: '#10b981', values: last.map(d => d.prs) },
        { name: 'Issues', color: '#6366f1', values: last.map(d => d.issues) },
        { name: 'Reviews', color: '#f59e0b', values: last.map(d => d.reviews) },
      ]
    }
  }, [activity])

  if (loading || error) {
    return (
      <AppShell>
        <div className="w-full px-6 py-6">
          {loading && <div className="text-gray-600">Loading…</div>}
          {error && <div className="text-red-600">{error}</div>}
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="w-full px-6 py-6 space-y-6">
        {/* PRs vs Issues (30d) */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">PRs vs Issues (30d)</div>
            <div className="text-xs text-gray-500">Daily updates</div>
          </div>
          <LineChartJS
            labels={dualSeries.map(d => d.x)}
            series={[
              { label: 'PRs', color: '#10b981', data: dualSeries.map(d => d.a) },
              { label: 'Issues', color: '#ef4444', data: dualSeries.map(d => d.b) },
            ]}
          />
        </Card>

        {/* Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4 flex items-center justify-center"><GaugeChartJS value={mergeRate} label="PR Merge Rate" color="#10b981" /></Card>
          <Card className="p-4 flex items-center justify-center"><GaugeChartJS value={closeRate} label="Issue Close Rate" color="#6366f1" /></Card>
        </div>

        {/* Weekday contributions and Languages Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-4">
            <div className="font-semibold mb-2">Contributions by Weekday</div>
            <BarChartJS labels={weekdayBars.labels} values={weekdayBars.values} />
          </Card>
          <Card className="p-4">
            <div className="font-semibold mb-2">Languages Composition</div>
            <DoughnutChartJS labels={languages.labels} values={languages.values} />
          </Card>
        </div>

        {/* Hour-of-day and Stacked Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-4">
            <div className="font-semibold mb-2">Activity by Hour (UTC)</div>
            <HourlyChartJS data={hourly} />
          </Card>
          <Card className="p-4">
            <div className="font-semibold mb-2">PRs & Issues (Stacked, 30d)</div>
            <StackedAreaChartJS
              labels={stacked.labels}
              series={stacked.series.map((s: any) => ({ label: s.name, color: s.color, data: s.values }))}
            />
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
