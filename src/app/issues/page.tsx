'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getCurrentVisualized } from '@/lib/github-data'
import { Github } from 'lucide-react'

interface Issue {
  id: number
  number: number
  title: string
  state: string
  html_url: string
  repository_url: string
  created_at: string
  updated_at: string
  pull_request?: any // To filter out PRs
}

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all')

  useEffect(() => {
    const currentUser = getCurrentVisualized()
    setUsername(currentUser)
    if (currentUser) {
      fetchUserIssues(currentUser)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserIssues = async (user: string) => {
    setLoading(true)
    setError(null)
    
    try {
      // Use GitHub's public API to search for issues by author
      const response = await fetch(
        `https://api.github.com/search/issues?q=author:${user}+type:issue&per_page=100&sort=updated&order=desc`
      )
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }
      
      const data = await response.json()
      // Filter out PRs (just to be safe, though type:issue should handle it)
      const actualIssues = (data.items || []).filter((item: Issue) => !item.pull_request)
      setIssues(actualIssues)
    } catch (err: any) {
      console.error('Failed to fetch issues:', err)
      setError(err.message || 'Failed to fetch issues')
      setIssues([])
    } finally {
      setLoading(false)
    }
  }

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      if (filter === 'open') return issue.state === 'open'
      if (filter === 'closed') return issue.state === 'closed'
      return true
    })
  }, [issues, filter])

  const stats = useMemo(() => ({
    total: issues.length,
    open: issues.filter(i => i.state === 'open').length,
    closed: issues.filter(i => i.state === 'closed').length
  }), [issues])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading issues...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error && !username) {
    return (
      <DashboardLayout>
        <h1 className="text-3xl font-bold mb-6">Issues</h1>
        <Card className="p-6">
          <p className="text-destructive">{error}</p>
        </Card>
      </DashboardLayout>
    )
  }

  if (!username) {
    return (
      <DashboardLayout>
        <h1 className="text-3xl font-bold mb-6">Issues</h1>
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
        <h1 className="text-3xl font-bold">Issues</h1>
        <p className="text-muted-foreground">
          Viewing {stats.total} issues for @{username}
        </p>
      </div>

      <div className="grid gap-4 mb-6">
        <Card className="p-4">
          <div className="flex gap-6">
            <div>
              <span className="text-2xl font-bold">{stats.total}</span>
              <span className="text-muted-foreground ml-2">Total</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-green-600">{stats.open}</span>
              <span className="text-muted-foreground ml-2">Open</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-600">{stats.closed}</span>
              <span className="text-muted-foreground ml-2">Closed</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setFilter('all')}
        >
          All ({stats.total})
        </Button>
        <Button 
          variant={filter === 'open' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setFilter('open')}
        >
          Open ({stats.open})
        </Button>
        <Button 
          variant={filter === 'closed' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setFilter('closed')}
        >
          Closed ({stats.closed})
        </Button>
      </div>

      {filteredIssues.length === 0 ? (
        <Card className="p-6">
          <p className="text-muted-foreground">No issues found matching the filter.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredIssues.map((issue) => (
            <Card key={issue.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{issue.title}</h3>
                    <a 
                      href={issue.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      issue.state === 'open' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {issue.state.toUpperCase()}
                    </span>
                    <span>#{issue.number}</span>
                    <span>
                      Updated {new Date(issue.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
