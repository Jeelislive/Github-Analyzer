'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getCurrentVisualized } from '@/lib/github-data'
import { Octokit } from '@octokit/rest'
import { Github } from 'lucide-react'

interface PR {
  id: number
  number: number
  title: string
  state: string
  html_url: string
  repository_url: string
  created_at: string
  updated_at: string
  pull_request?: { merged_at: string | null }
}

export default function PRsPage() {
  const [prs, setPrs] = useState<PR[]>([])
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'open' | 'merged' | 'closed'>('all')

  useEffect(() => {
    const currentUser = getCurrentVisualized()
    setUsername(currentUser)
    if (currentUser) {
      fetchAllPRs(currentUser)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchAllPRs = async (user: string) => {
    setLoading(true)
    try {
      const octokit = new Octokit()
      const allPRs: PR[] = []
      let page = 1
      
      while (true) {
        const { data } = await octokit.search.issuesAndPullRequests({
          q: `author:${user} type:pr is:public`,
          per_page: 100,
          page,
          sort: 'updated',
          order: 'desc'
        })
        if (!data.items || data.items.length === 0) break
        allPRs.push(...data.items.map((item: any) => ({
          id: item.id,
          number: item.number,
          title: item.title,
          state: item.state,
          html_url: item.html_url,
          repository_url: item.repository_url,
          created_at: item.created_at,
          updated_at: item.updated_at,
          pull_request: item.pull_request,
        })))
        if (data.items.length < 100 || allPRs.length >= 1000) break
        page++
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      setPrs(allPRs)
    } catch (error) {
      console.error('Failed to fetch PRs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPRs = prs.filter(pr => {
    if (filter === 'open') return pr.state === 'open'
    if (filter === 'merged') return pr.pull_request?.merged_at
    if (filter === 'closed') return pr.state === 'closed' && !pr.pull_request?.merged_at
    return true
  })

  const openPRs = prs.filter(pr => pr.state === 'open')
  const mergedPRs = prs.filter(pr => pr.pull_request?.merged_at)
  const closedPRs = prs.filter(pr => pr.state === 'closed' && !pr.pull_request?.merged_at)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading pull requests...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!username) {
    return (
      <DashboardLayout>
        <h1 className="text-3xl font-bold mb-6">Pull Requests</h1>
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
        <h1 className="text-3xl font-bold">Pull Requests</h1>
        <p className="text-muted-foreground">Viewing {prs.length} pull requests for @{username}</p>
      </div>

      <div className="grid gap-4 mb-6">
        <Card className="p-4">
          <div className="flex gap-6">
            <div>
              <span className="text-2xl font-bold">{prs.length}</span>
              <span className="text-muted-foreground ml-2">Total</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-green-600">{openPRs.length}</span>
              <span className="text-muted-foreground ml-2">Open</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-purple-600">{mergedPRs.length}</span>
              <span className="text-muted-foreground ml-2">Merged</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-600">{closedPRs.length}</span>
              <span className="text-muted-foreground ml-2">Closed</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>
          All ({prs.length})
        </Button>
        <Button variant={filter === 'open' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('open')}>
          Open ({openPRs.length})
        </Button>
        <Button variant={filter === 'merged' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('merged')}>
          Merged ({mergedPRs.length})
        </Button>
        <Button variant={filter === 'closed' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('closed')}>
          Closed ({closedPRs.length})
        </Button>
      </div>

      {filteredPRs.length === 0 ? (
        <Card className="p-6">
          <p className="text-muted-foreground">No pull requests found.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPRs.map((pr) => (
            <Card key={pr.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{pr.title}</h3>
                    <a href={pr.html_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                      <Github className="h-4 w-4" />
                    </a>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {pr.pull_request?.merged_at ? (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">merged</span>
                    ) : (
                      <span className={`px-2 py-1 rounded ${pr.state === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {pr.state}
                      </span>
                    )}
                    <span>#{pr.number}</span>
                    <span>Updated {new Date(pr.updated_at).toLocaleDateString()}</span>
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
