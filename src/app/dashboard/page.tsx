'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { getVisualizedHistory, addToHistory, setCurrentVisualized as setCurrentVisualizedStorage } from '@/lib/github-data'
import { Github, MapPin, Link as LinkIcon, Building2, Calendar, Eye, History } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface GitHubProfile {
  login: string
  name: string
  bio: string
  avatar_url: string
  html_url: string
  location: string
  blog: string
  company: string
  followers: number
  following: number
  public_repos: number
  created_at: string
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [username, setUsername] = useState('')
  const [githubProfile, setGithubProfile] = useState<GitHubProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [visualizing, setVisualizing] = useState(false)
  const [error, setError] = useState('')
  const [currentVisualized, setCurrentVisualized] = useState<string | null>(null)
  const [history, setHistory] = useState<string[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
    const stored = localStorage.getItem('currentVisualized')
    if (stored) setCurrentVisualized(stored)
    setHistory(getVisualizedHistory())
  }, [user, loading, router])

  const fetchGitHubProfile = async () => {
    if (!username.trim()) {
      setError('Please enter a GitHub username')
      return
    }

    setLoadingProfile(true)
    setError('')
    try {
      const response = await fetch(`https://api.github.com/users/${username.trim()}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found')
        }
        throw new Error('Failed to fetch profile')
      }
      const data = await response.json()
      setGithubProfile(data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch GitHub profile')
      setGithubProfile(null)
    } finally {
      setLoadingProfile(false)
    }
  }

  const visualizeProfile = async () => {
    if (!githubProfile || !user) return

    setVisualizing(true)
    setError('')
    try {
      // Fetch all data
      const [reposRes, issuesRes, prsRes, contributionsRes] = await Promise.all([
        fetch(`https://api.github.com/users/${githubProfile.login}/repos?per_page=100&sort=updated`),
        fetch(`https://api.github.com/search/issues?q=author:${githubProfile.login}+type:issue+is:public&per_page=100`),
        fetch(`https://api.github.com/search/issues?q=author:${githubProfile.login}+type:pr+is:public&per_page=100`),
        fetch(`https://api.github.com/users/${githubProfile.login}/events/public?per_page=100`)
      ])

      const repos = reposRes.ok ? await reposRes.json() : []
      const issues = issuesRes.ok ? (await issuesRes.json()).items || [] : []
      const prs = prsRes.ok ? (await prsRes.json()).items || [] : []
      const contributions = contributionsRes.ok ? await contributionsRes.json() : []

      // Prepare repository list (only important fields)
      const repoList = repos.slice(0, 100).map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description || '',
        html_url: repo.html_url,
        language: repo.language || '',
        stargazers_count: repo.stargazers_count || 0,
        forks_count: repo.forks_count || 0,
      }))

      // Store in database
      const { error: dbError } = await supabase
        .from('visualized_profiles')
        .upsert({
          user_id: user.id,
          github_username: githubProfile.login,
          profile_data: githubProfile,
          repositories: repoList,
          stats: {
            total_repos: repos.length,
            total_issues: issues.length,
            total_prs: prs.length,
            total_contributions: contributions.length,
          },
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,github_username'
        })

      if (dbError) throw dbError

      setCurrentVisualized(githubProfile.login)
      setCurrentVisualizedStorage(githubProfile.login)
      addToHistory(githubProfile.login)
      setHistory(getVisualizedHistory())
      
      router.push('/repos')
    } catch (err: any) {
      setError(err.message || 'Failed to visualize profile')
    } finally {
      setVisualizing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          {currentVisualized ? `Visualizing: @${currentVisualized}` : 'Fetch and visualize GitHub profiles'}
        </p>
      </div>
      
      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">GitHub Profile Fetcher</h2>
          <div className="flex gap-3 mb-4">
            <Input
              type="text"
              placeholder="Enter GitHub username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchGitHubProfile()}
              className="flex-1"
            />
            <Button onClick={fetchGitHubProfile} disabled={loadingProfile}>
              {loadingProfile ? 'Loading...' : 'Fetch Profile'}
            </Button>
          </div>
          {error && (
            <p className="text-sm text-red-600 mb-4">{error}</p>
          )}
        </Card>

        {githubProfile && (
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={githubProfile.avatar_url} alt={githubProfile.login} />
                  <AvatarFallback className="text-2xl">
                    {githubProfile.login[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    {githubProfile.name || githubProfile.login}
                    <a
                      href={githubProfile.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  </h3>
                  <p className="text-muted-foreground">@{githubProfile.login}</p>
                </div>

                {githubProfile.bio && (
                  <p className="text-sm">{githubProfile.bio}</p>
                )}

                <div className="flex flex-wrap gap-4 text-sm">
                  {githubProfile.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{githubProfile.location}</span>
                    </div>
                  )}
                  {githubProfile.company && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span>{githubProfile.company}</span>
                    </div>
                  )}
                  {githubProfile.blog && (
                    <a
                      href={githubProfile.blog}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                    >
                      <LinkIcon className="h-4 w-4" />
                      <span>{githubProfile.blog}</span>
                    </a>
                  )}
                </div>

                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="font-semibold">{githubProfile.followers}</span>
                    <span className="text-muted-foreground ml-1">followers</span>
                  </div>
                  <div>
                    <span className="font-semibold">{githubProfile.following}</span>
                    <span className="text-muted-foreground ml-1">following</span>
                  </div>
                  <div>
                    <span className="font-semibold">{githubProfile.public_repos}</span>
                    <span className="text-muted-foreground ml-1">repositories</span>
                  </div>
                </div>

                {githubProfile.created_at && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Joined {new Date(githubProfile.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}

                <div className="pt-4">
                  <Button 
                    onClick={visualizeProfile} 
                    disabled={visualizing}
                    size="lg"
                    className="w-full md:w-auto"
                  >
                    {visualizing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Visualizing...
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Visualize Profile
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {history.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <History className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Visualization History</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {history.map((username) => (
                <Button
                  key={username}
                  variant={currentVisualized === username ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setCurrentVisualized(username)
                    setCurrentVisualizedStorage(username)
                    router.push('/repos')
                  }}
                >
                  @{username}
                </Button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
