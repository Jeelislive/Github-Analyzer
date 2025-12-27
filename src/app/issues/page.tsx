'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getCurrentVisualized } from '@/lib/github-data'
import { Octokit } from '@octokit/rest'
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
}

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all')

  useEffect(() => {
    const currentUser = getCurrentVisualized()
    setUsername(currentUser)
    if (currentUser) {
      fetchAllIssues(currentUser)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchAllIssues = async (user: string) => {
    setLoading(true)
    try {
      const octokit = new Octokit()
      const allIssues: Issue[] = []
      let page = 1
      
      while (true) {
        const { data } = await octokit.search.issuesAndPullRequests({
          q: `author:${user} type:issue is:public`,
          per_page: 100,
          page,
          sort: 'updated',
          order: 'desc'
        })
        if (!data.items || data.items.length === 0) break
        allIssues.push(...data.items.map((item: any) => ({
          id: item.id,
          number: item.number,
          title: item.title,
          state: item.state,
          html_url: item.html_url,
          repository_url: item.repository_url,
          created_at: item.created_at,
          updated_at: item.updated_at,
        })))
        if (data.items.length < 100 || allIssues.length >= 1000) break
        page++
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      setIssues(allIssues)
    } catch (error) {
      console.error('Failed to fetch issues:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredIssues = issues.filter(issue => {
    if (filter === 'open') return issue.state === 'open'
    if (filter === 'closed') return issue.state === 'closed'
    return true
  })

  const openIssues = issues.filter(i => i.state === 'open')
  const closedIssues = issues.filter(i => i.state === 'closed')

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
        <p className="text-muted-foreground">Viewing {issues.length} issues for @{username}</p>
      </div>

      <div className="grid gap-4 mb-6">
        <Card className="p-4">
          <div className="flex gap-6">
            <div>
              <span className="text-2xl font-bold">{issues.length}</span>
              <span className="text-muted-foreground ml-2">Total</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-green-600">{openIssues.length}</span>
              <span className="text-muted-foreground ml-2">Open</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-600">{closedIssues.length}</span>
              <span className="text-muted-foreground ml-2">Closed</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>
          All ({issues.length})
        </Button>
        <Button variant={filter === 'open' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('open')}>
          Open ({openIssues.length})
        </Button>
        <Button variant={filter === 'closed' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('closed')}>
          Closed ({closedIssues.length})
        </Button>
      </div>

      {filteredIssues.length === 0 ? (
        <Card className="p-6">
          <p className="text-muted-foreground">No issues found.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredIssues.map((issue) => (
            <Card key={issue.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{issue.title}</h3>
                    <a href={issue.html_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                      <Github className="h-4 w-4" />
                    </a>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className={`px-2 py-1 rounded ${issue.state === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {issue.state}
                    </span>
                    <span>#{issue.number}</span>
                    <span>Updated {new Date(issue.updated_at).toLocaleDateString()}</span>
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
