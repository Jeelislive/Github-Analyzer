"use client"

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Mail, Link as LinkIcon, Twitter, Github, MapPin, Building2, Globe, Calendar } from 'lucide-react'
import { getProfile, setProfile } from '@/lib/profileStore'
 

interface MeResponse {
  user: {
    login: string
    name?: string | null
    avatar_url: string
    html_url: string
    bio?: string | null
    company?: string | null
    location?: string | null
    blog?: string | null
    followers: number
    following: number
    public_repos: number
    public_gists?: number
    created_at: string
    email?: string | null
    twitter_username?: string | null
  }
  events: any[]
  prs: Array<{ id: number; title: string; html_url: string; number?: number; repository_url?: string; state?: 'open'|'closed'; merged_at?: string; updated_at?: string }>
  organizations?: Array<{ login: string; avatar_url: string; description?: string | null; html_url: string }>
}

export default function RightProfilePanel() {
  const [data, setData] = useState<MeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    // Try client-side cache first
    const cached = getProfile()
    if (cached) {
      setData(cached as MeResponse)
      setLoading(false)
      return () => { cancelled = true }
    }
    setLoading(true)
    fetch('/api/github/me')
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        return res.json()
      })
      .then((json) => {
        if (cancelled) return
        setData(json)
        setProfile(json)
      })
      .catch((e) => !cancelled && setError(e?.message || 'Failed to load profile'))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return <div className="hidden xl:block w-full"><Card className="p-4">Loading profile…</Card></div>
  }
  if (error || !data) {
    return <div className="hidden xl:block w-full"><Card className="p-4 text-red-600">{error || 'No data'}</Card></div>
  }

  const u = data.user
  const initials = (u.name || u.login || 'U').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()

  return (
    <div className="hidden xl:block w-full">
      <Card className="p-4 mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={u.avatar_url} alt={u.login} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{u.name || u.login}</div>
            <a href={u.html_url} target="_blank" className="text-sm text-blue-600">@{u.login}</a>
          </div>
        </div>
        {u.bio && <p className="mt-3 text-sm text-gray-600">{u.bio}</p>}
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
          {u.location && (
            <Badge variant="outline" className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{u.location}</Badge>
          )}
          {u.company && (
            <Badge variant="outline" className="inline-flex items-center gap-1"><Building2 className="w-3 h-3" />{u.company}</Badge>
          )}
          {u.blog && (
            <a href={u.blog} target="_blank" className="inline-flex items-center gap-1 underline"><Globe className="w-3 h-3" />Website</a>
          )}
        </div>
      </Card>

      <Card className="p-4 mb-4">
        <div className="text-sm text-gray-500 mb-2">Contact & Links</div>
        <div className="space-y-2 text-sm">
          {u.email && (
            <a href={`mailto:${u.email}`} className="flex items-center gap-2 text-blue-700 hover:underline">
              <Mail className="w-4 h-4" /> {u.email}
            </a>
          )}
          {u.blog && (
            <a href={u.blog} target="_blank" className="flex items-center gap-2 text-blue-700 hover:underline">
              <LinkIcon className="w-4 h-4" /> {u.blog}
            </a>
          )}
          {u.twitter_username && (
            <a href={`https://twitter.com/${u.twitter_username}`} target="_blank" className="flex items-center gap-2 text-blue-700 hover:underline">
              <Twitter className="w-4 h-4" /> @{u.twitter_username}
            </a>
          )}
          <a href={u.html_url} target="_blank" className="flex items-center gap-2 text-blue-700 hover:underline">
            <Github className="w-4 h-4" /> {u.html_url}
          </a>
        </div>
      </Card>

      <Card className="p-4 mb-4">
        <div className="text-sm text-gray-500 mb-2">Stats</div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="text-xs text-gray-500">Followers</div>
            <div className="text-lg font-semibold">{u.followers}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Following</div>
            <div className="text-lg font-semibold">{u.following}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Public Repos</div>
            <div className="text-lg font-semibold">{u.public_repos}</div>
          </div>
          {typeof u.public_gists === 'number' && (
            <div>
              <div className="text-xs text-gray-500">Public Gists</div>
              <div className="text-lg font-semibold">{u.public_gists}</div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4 mb-4">
        <div className="text-sm text-gray-500 mb-2">Details</div>
        <div className="space-y-1 text-sm text-gray-700">
          {u.email && (
            <div>
              <span className="text-gray-500">Email:</span> {u.email}
            </div>
          )}
          <div>
            <span className="text-gray-500 inline-flex items-center gap-1"><Calendar className="w-3 h-3" />Joined:</span> {new Date(u.created_at).toLocaleDateString()}
          </div>
        </div>
      </Card>

      {Array.isArray(data.organizations) && data.organizations.length > 0 && (
        <Card className="p-4 mb-4">
          <div className="text-sm text-gray-500 mb-2">Organizations</div>
          <div className="grid grid-cols-2 gap-3">
            {data.organizations.slice(0,8).map((o) => (
              <a key={o.login} href={o.html_url} target="_blank" className="flex items-center gap-2 rounded-md p-2 hover:bg-gray-50 transition">
                <img src={o.avatar_url} alt={o.login} className="h-6 w-6 rounded"/>
                <div>
                  <div className="text-xs font-medium text-gray-800">{o.login}</div>
                  {o.description && <div className="text-[11px] text-gray-500 truncate max-w-[120px]">{o.description}</div>}
                </div>
              </a>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-4">
        <div className="text-sm font-medium mb-2">Recent Pull Requests</div>
        <div className="space-y-2">
          {data.prs.slice(0,5).map((pr: any) => (
            <a key={pr.id} href={pr.html_url} target="_blank" className="block text-sm truncate text-blue-700 hover:underline">
              {pr.title}
            </a>
          ))}
        </div>
      </Card>
    </div>
  )
}

