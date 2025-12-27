'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getCurrentVisualized } from '@/lib/github-data'
import { createClient } from '@/lib/supabase/client'

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const currentUser = getCurrentVisualized()
    setUsername(currentUser)
    
    if (currentUser) {
      loadStoredStats(currentUser)
    } else {
      setLoading(false)
    }
  }, [])

  const loadStoredStats = async (user: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('visualized_profiles')
        .select('stats')
        .eq('github_username', user)
        .single()

      if (!error && data) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!username) {
    return (
      <DashboardLayout>
        <h1 className="text-3xl font-bold mb-6">Analytics</h1>
        <Card className="p-6">
          <p className="text-muted-foreground">
            No profile visualized. Go to dashboard to fetch and visualize a GitHub profile.
          </p>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Viewing analytics for @{username}</p>
      </div>

      {stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="text-3xl font-bold mb-2">{stats.total_repos || 0}</div>
            <div className="text-sm text-muted-foreground">Total Repositories</div>
          </Card>
          <Card className="p-6">
            <div className="text-3xl font-bold mb-2">{stats.total_issues || 0}</div>
            <div className="text-sm text-muted-foreground">Total Issues</div>
          </Card>
          <Card className="p-6">
            <div className="text-3xl font-bold mb-2">{stats.total_prs || 0}</div>
            <div className="text-sm text-muted-foreground">Total Pull Requests</div>
          </Card>
          <Card className="p-6">
            <div className="text-3xl font-bold mb-2">{stats.total_contributions || 0}</div>
            <div className="text-sm text-muted-foreground">Total Contributions</div>
          </Card>
        </div>
      ) : (
        <Card className="p-6">
          <p className="text-muted-foreground">No analytics data available.</p>
        </Card>
      )}
    </DashboardLayout>
  )
}
