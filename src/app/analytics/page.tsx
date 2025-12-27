'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getCurrentVisualized } from '@/lib/github-data'
import { createClient } from '@/lib/supabase/client'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { TrendingUp, GitBranch, GitPullRequest, GitCommit, Star, Users } from 'lucide-react'

interface GitHubEvent {
  type: string
  created_at: string
  repo?: { name: string }
}

interface RepositoryData {
  language: string
  stargazers_count: number
  created_at: string
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null)
  const [repositories, setRepositories] = useState<RepositoryData[]>([])
  const [events, setEvents] = useState<GitHubEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const currentUser = getCurrentVisualized()
    setUsername(currentUser)

    if (currentUser) {
      loadGitHubData(currentUser)
    } else {
      setLoading(false)
    }
  }, [])

  const loadGitHubData = async (user: string) => {
    setLoading(true)
    try {
      // Load stored stats from database
      const { data: profileData, error: dbError } = await supabase
        .from('visualized_profiles')
        .select('stats, repositories')
        .eq('github_username', user)
        .single()

      if (!dbError && profileData) {
        setStats(profileData.stats)
        setRepositories(profileData.repositories || [])
      }

      // Fetch real GitHub events for activity timeline
      const eventsRes = await fetch(`https://api.github.com/users/${user}/events/public?per_page=100`)
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        setEvents(eventsData)
      }
    } catch (error) {
      console.error('Failed to load GitHub data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate real monthly data from GitHub events
  const generateMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = new Date().getMonth()
    const monthlyStats: Record<string, any> = {}

    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      const monthName = months[monthIndex]
      monthlyStats[monthName] = {
        month: monthName,
        contributions: 0,
        commits: 0,
        prs: 0,
        issues: 0,
      }
    }

    // Process GitHub events
    events.forEach(event => {
      const eventDate = new Date(event.created_at)
      const monthName = months[eventDate.getMonth()]

      if (monthlyStats[monthName]) {
        monthlyStats[monthName].contributions++

        if (event.type === 'PushEvent') {
          monthlyStats[monthName].commits++
        } else if (event.type === 'PullRequestEvent') {
          monthlyStats[monthName].prs++
        } else if (event.type === 'IssuesEvent') {
          monthlyStats[monthName].issues++
        }
      }
    })

    return Object.values(monthlyStats)
  }

  const generateActivityData = () => {
    return [
      { name: 'Repositories', value: stats?.total_repos || 0, color: '#8b5cf6' },
      { name: 'Issues', value: stats?.total_issues || 0, color: '#ec4899' },
      { name: 'Pull Requests', value: stats?.total_prs || 0, color: '#06b6d4' },
      { name: 'Events', value: events.length, color: '#10b981' },
    ]
  }

  const generateRadialData = () => {
    return [
      { name: 'Repos', value: stats?.total_repos || 0, fill: '#8b5cf6' },
      { name: 'Issues', value: stats?.total_issues || 0, fill: '#ec4899' },
      { name: 'PRs', value: stats?.total_prs || 0, fill: '#06b6d4' },
    ]
  }

  // Generate language distribution from repositories
  const generateLanguageData = () => {
    const languageCounts: Record<string, number> = {}

    repositories.forEach(repo => {
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1
      }
    })

    return Object.entries(languageCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) // Top 5 languages
  }

  // Custom tooltip component with better styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black border border-gray-600 rounded-lg p-3 shadow-xl">
          <p className="text-gray-200 font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-gray-300">
              {entry.name}: <span className="font-bold text-white">{entry.value}</span>
            </p>

          ))}
        </div>
      )
    }
    return null
  }

  const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b']

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

  const monthlyData = generateMonthlyData()
  const activityData = stats ? generateActivityData() : []
  const radialData = stats ? generateRadialData() : []
  const languageData = generateLanguageData()

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">Viewing analytics for @{username}</p>
      </div>

      {stats ? (
        <div className="space-y-6">
          {/* Stats Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <div className="flex items-center justify-between mb-4">
                <GitBranch className="h-5 w-5 text-purple-500" />
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </div>
              <div className="text-3xl font-bold mb-2">{stats.total_repos || 0}</div>
              <div className="text-sm text-muted-foreground">Total Repositories</div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-pink-500/10 to-pink-500/5 border-pink-500/20">
              <div className="flex items-center justify-between mb-4">
                <GitCommit className="h-5 w-5 text-pink-500" />
                <TrendingUp className="h-4 w-4 text-pink-500" />
              </div>
              <div className="text-3xl font-bold mb-2">{stats.total_issues || 0}</div>
              <div className="text-sm text-muted-foreground">Total Issues</div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20">
              <div className="flex items-center justify-between mb-4">
                <GitPullRequest className="h-5 w-5 text-cyan-500" />
                <TrendingUp className="h-4 w-4 text-cyan-500" />
              </div>
              <div className="text-3xl font-bold mb-2">{stats.total_prs || 0}</div>
              <div className="text-sm text-muted-foreground">Total Pull Requests</div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <div className="flex items-center justify-between mb-4">
                <Star className="h-5 w-5 text-green-500" />
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-3xl font-bold mb-2">{events.length}</div>
              <div className="text-sm text-muted-foreground">Recent Events</div>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Area Chart - Monthly Activity */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Activity Overview
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorContributions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                  <XAxis dataKey="month" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="contributions"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorContributions)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="commits"
                    stroke="#06b6d4"
                    fillOpacity={1}
                    fill="url(#colorCommits)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Bar Chart - Activity Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Activity Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                  <XAxis dataKey="month" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="prs" fill="#ec4899" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="issues" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Pie Chart - Language Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Languages Used
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={languageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {languageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Radial Bar Chart - Performance Metrics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5" />
                Performance Metrics
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="10%"
                  outerRadius="90%"
                  barSize={20}
                  data={radialData}
                >
                  <RadialBar
                    label={{ position: 'insideStart', fill: '#fff', fontSize: 14 }}
                    background
                    dataKey="value"
                  />
                  <Legend
                    iconSize={12}
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadialBarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Line Chart - Contribution Trends (Full Width) */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <GitCommit className="h-5 w-5" />
              Contribution Trends
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                <XAxis dataKey="month" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="contributions"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#8b5cf6' }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="commits"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#06b6d4' }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="prs"
                  stroke="#ec4899"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#ec4899' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
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
