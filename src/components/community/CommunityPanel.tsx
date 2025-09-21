'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Github, Mail, MapPin, Briefcase, Link2, Users, GitPullRequest, Activity } from 'lucide-react'

interface GitHubUser {
  login: string
  name: string | null
  avatar_url: string
  html_url: string
  bio?: string | null
  company?: string | null
  location?: string | null
  blog?: string | null
  followers: number
  following: number
  public_repos: number
  created_at: string
  email?: string | null
}

interface GitHubEvent {
  id: string
  type: string
  repo: { name: string; url: string }
  created_at: string
}

interface PullRequestItem {
  id: number
  html_url: string
  title: string
  state: string
  repository_url: string
  created_at: string
  updated_at: string
}

export default function CommunityPanel() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<GitHubUser | null>(null)
  const [events, setEvents] = useState<GitHubEvent[]>([])
  const [prs, setPrs] = useState<PullRequestItem[]>([])

  useEffect(() => {
    const fetchMe = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/github/me')
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to load GitHub data')
        }
        const data = await res.json()
        setUser(data.user)
        setEvents(data.events || [])
        setPrs(data.prs || [])
      } catch (e: any) {
        setError(e.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchMe()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center min-h-[300px]">Loading community data…</div>
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-red-600">{error}</div>
        <div className="text-sm text-muted-foreground mt-2">
          Make sure you have granted GitHub access to your email and that you are signed in via GitHub.
        </div>
      </Card>
    )
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <Card className="p-12 text-center">
        <h3 className="text-2xl font-semibold mb-2">Community</h3>
        <p className="text-gray-600">Coming soon</p>
      </Card>
    </div>
  )
}
