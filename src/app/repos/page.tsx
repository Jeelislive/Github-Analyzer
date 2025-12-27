'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getCurrentVisualized } from '@/lib/github-data'
import { Octokit } from '@octokit/rest'
import { Github } from 'lucide-react'

interface Repo {
  id: number
  name: string
  full_name: string
  description: string
  html_url: string
  language: string
  stargazers_count: number
  forks_count: number
  fork: boolean
  archived: boolean
}

export default function ReposPage() {
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'sources' | 'forks' | 'archived'>('all')

  useEffect(() => {
    const currentUser = getCurrentVisualized()
    setUsername(currentUser)
    if (currentUser) {
      fetchAllRepos(currentUser)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchAllRepos = async (user: string) => {
    setLoading(true)
    try {
      const octokit = new Octokit()
      const allRepos: Repo[] = []
      let page = 1
      
      while (true) {
        const { data } = await octokit.repos.listForUser({ username: user, per_page: 100, page, sort: 'updated' })
        if (data.length === 0) break
        allRepos.push(...data.map((r: any) => ({
          id: r.id,
          name: r.name,
          full_name: r.full_name,
          description: r.description || '',
          html_url: r.html_url,
          language: r.language || '',
          stargazers_count: r.stargazers_count || 0,
          forks_count: r.forks_count || 0,
          fork: r.fork || false,
          archived: r.archived || false,
        })))
        if (data.length < 100) break
        page++
      }
      
      setRepos(allRepos)
    } catch (error) {
      console.error('Failed to fetch repos:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRepos = repos.filter(repo => {
    if (filter === 'sources') return !repo.fork && !repo.archived
    if (filter === 'forks') return repo.fork
    if (filter === 'archived') return repo.archived
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading repositories...</p>
        </div>
      </div>
    )
  }

  if (!username) {
    return (
      <>
        <h1 className="text-3xl font-bold mb-6">Repositories</h1>
        <Card className="p-6">
          <p className="text-muted-foreground">
            No profile visualized. Go to dashboard to fetch and visualize a GitHub profile.
          </p>
        </Card>
      </>
    )
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Repositories</h1>
        <p className="text-muted-foreground">Viewing {repos.length} repositories for @{username}</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>
          All ({repos.length})
        </Button>
        <Button variant={filter === 'sources' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('sources')}>
          Sources ({repos.filter(r => !r.fork && !r.archived).length})
        </Button>
        <Button variant={filter === 'forks' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('forks')}>
          Forks ({repos.filter(r => r.fork).length})
        </Button>
        <Button variant={filter === 'archived' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('archived')}>
          Archived ({repos.filter(r => r.archived).length})
        </Button>
      </div>

      {filteredRepos.length === 0 ? (
        <Card className="p-6">
          <p className="text-muted-foreground">No repositories found.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredRepos.map((repo) => (
            <Card key={repo.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{repo.name}</h3>
                    <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                      <Github className="h-4 w-4" />
                    </a>
                    {repo.fork && <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">Fork</span>}
                    {repo.archived && <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">Archived</span>}
                  </div>
                  {repo.description && (
                    <p className="text-sm text-muted-foreground mb-3">{repo.description}</p>
                  )}
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {repo.language && (
                      <span className="px-2 py-1 bg-muted rounded">{repo.language}</span>
                    )}
                    <span>⭐ {repo.stargazers_count}</span>
                    <span>🍴 {repo.forks_count}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
