"use client"

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

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
    created_at: string
    email?: string | null
  }
  events: any[]
  prs: any[]
}

export default function RightProfilePanel() {
  const [data, setData] = useState<MeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch('/api/github/me')
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        return res.json()
      })
      .then((json) => !cancelled && setData(json))
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
          {u.location && <Badge variant="outline">{u.location}</Badge>}
          {u.company && <Badge variant="outline">{u.company}</Badge>}
          {u.blog && <a href={u.blog} target="_blank" className="underline">Website</a>}
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
        </div>
      </Card>

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
