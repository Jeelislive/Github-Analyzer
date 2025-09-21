'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sparkles, GitPullRequest, MessageSquare, Trophy } from 'lucide-react'
import AppShell from '@/components/dashboard/AppShell'

interface ContributionsResponse { totals: { totalContributions: number } }
interface PRResponse { totals: { total: number; merged: number } }
interface IssueResponse { totals: { total: number; closed: number } }

type Goals = {
  dailyContrib: number
  monthlyPRs: number
  monthlyIssues: number
}

const DEFAULT_GOALS: Goals = { dailyContrib: 1, monthlyPRs: 4, monthlyIssues: 4 }

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goals>(DEFAULT_GOALS)
  const [saved, setSaved] = useState(false)

  // Live stats
  const [contrib, setContrib] = useState<number | null>(null)
  const [prs, setPrs] = useState<{ total: number; merged: number } | null>(null)
  const [issues, setIssues] = useState<{ total: number; closed: number } | null>(null)

  useEffect(() => {
    // load goals
    try {
      const raw = localStorage.getItem('gh_analyzer_goals')
      if (raw) setGoals(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    let cancelled = false
    // contributions for last 30 days
    fetch('/api/github/contributions?range=30d')
      .then(async (r) => { if (!r.ok) throw new Error(await r.text()); return r.json() })
      .then((j) => !cancelled && setContrib(j?.totals?.totalContributions ?? null))
      .catch(() => !cancelled && setContrib(null))

    fetch('/api/github/prs')
      .then(async (r) => { if (!r.ok) throw new Error(await r.text()); return r.json() })
      .then((j) => !cancelled && setPrs({ total: j.totals.total, merged: j.totals.merged }))
      .catch(() => !cancelled && setPrs(null))

    fetch('/api/github/issues')
      .then(async (r) => { if (!r.ok) throw new Error(await r.text()); return r.json() })
      .then((j) => !cancelled && setIssues({ total: j.totals.total, closed: j.totals.closed }))
      .catch(() => !cancelled && setIssues(null))

    return () => { cancelled = true }
  }, [])

  const monthDays = useMemo(() => new Date(new Date().getFullYear(), new Date().getMonth()+1, 0).getDate(), [])
  const avgDailyFrom30d = useMemo(() => contrib != null ? Math.round(contrib / 30) : null, [contrib])

  const saveGoals = () => {
    localStorage.setItem('gh_analyzer_goals', JSON.stringify(goals))
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const ProgressBar = ({ value, target }: { value: number; target: number }) => {
    const pct = Math.max(0, Math.min(100, Math.round((value / Math.max(1, target)) * 100)))
    return (
      <div className="w-full h-2 bg-gray-100 rounded">
        <div className="h-2 rounded bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
    )
  }

  return (
    <AppShell>
      <div className="w-full px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Goals</h1>
            <p className="text-gray-600">Set contribution goals and track your progress</p>
          </div>
          <Badge variant="outline" className="bg-gray-50 text-gray-700"><Trophy className="w-4 h-4 mr-1"/> Focus</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Goals Form */}
          <Card className="p-5">
            <div className="text-sm font-medium mb-4">Set your goals</div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Daily Contributions</label>
                <div className="flex items-center gap-3 mt-1">
                  <Input type="number" min={0} value={goals.dailyContrib} onChange={(e) => setGoals({ ...goals, dailyContrib: Number(e.target.value) })} className="max-w-[140px]"/>
                  <span className="text-xs text-gray-500">Avg last 30d: {avgDailyFrom30d ?? '—'}/day</span>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Monthly PRs</label>
                <Input type="number" min={0} value={goals.monthlyPRs} onChange={(e) => setGoals({ ...goals, monthlyPRs: Number(e.target.value) })} className="max-w-[140px] mt-1"/>
              </div>
              <div>
                <label className="text-sm text-gray-600">Monthly Issues</label>
                <Input type="number" min={0} value={goals.monthlyIssues} onChange={(e) => setGoals({ ...goals, monthlyIssues: Number(e.target.value) })} className="max-w-[140px] mt-1"/>
              </div>
              <div className="pt-2">
                <Button onClick={saveGoals}>Save</Button>
                {saved && <span className="ml-3 text-sm text-green-600">Saved</span>}
              </div>
            </div>
          </Card>

          {/* Progress */}
          <Card className="p-5">
            <div className="text-sm font-medium mb-4">Progress this month</div>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600"><Sparkles className="w-4 h-4"/> Contributions</div>
                  <div className="text-sm">{avgDailyFrom30d ?? '—'}/day • Goal {goals.dailyContrib}/day</div>
                </div>
                <ProgressBar value={(avgDailyFrom30d ?? 0)} target={goals.dailyContrib} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600"><GitPullRequest className="w-4 h-4"/> Pull Requests</div>
                  <div className="text-sm">{prs?.total ?? '—'} • Goal {goals.monthlyPRs}</div>
                </div>
                <ProgressBar value={prs?.total ?? 0} target={goals.monthlyPRs} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600"><MessageSquare className="w-4 h-4"/> Issues</div>
                  <div className="text-sm">{issues?.total ?? '—'} • Goal {goals.monthlyIssues}</div>
                </div>
                <ProgressBar value={issues?.total ?? 0} target={goals.monthlyIssues} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
