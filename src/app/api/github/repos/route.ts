import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, getGitHubToken } from '@/lib/auth'
import { Octokit } from '@octokit/rest'
import { getCache, setCache } from '@/lib/serverCache'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accessToken = await getGitHubToken(session.user.id)
    if (!accessToken) {
      return NextResponse.json({
        error: 'GitHub access token not found or expired. Please sign in again.'
      }, { status: 401 })
    }

    const octokit = new Octokit({ auth: accessToken })
    const { data: me } = await octokit.rest.users.getAuthenticated()
    const login = me.login

    const url = new URL(req.url)
    const section = url.searchParams.get('section') as 'all' | 'sources' | 'forks' | 'archived' | null

    const cacheKey = `repos:${login}`
    const cached = getCache<any>(cacheKey)
    if (!section && cached && Date.now() - cached.fetchedAt < 10 * 60 * 1000) {
      return NextResponse.json(cached.data, { headers: cached.etag ? { ETag: cached.etag } : undefined })
    }

    const repos: any[] = []
    let page = 1
    while (page <= 4) {
      const { data } = await octokit.rest.repos.listForUser({ username: login, per_page: 50, page, sort: 'updated' })
      if (!data.length) break
      repos.push(...data)
      page += 1
    }

    if (section) {
      let filtered = repos
      if (section === 'sources') filtered = repos.filter((r) => !r.fork && !r.archived)
      if (section === 'forks') filtered = repos.filter((r) => r.fork)
      if (section === 'archived') filtered = repos.filter((r) => r.archived)
      const items = filtered
        .map((r) => ({
          id: r.id,
          name: r.name,
          full_name: r.full_name,
          description: r.description,
          html_url: r.html_url,
          language: r.language,
          stargazers_count: r.stargazers_count,
          forks_count: r.forks_count,
          pushed_at: r.pushed_at,
          archived: r.archived,
          fork: r.fork,
        }))
        .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
      return NextResponse.json({ section, total: items.length, items })
    }

    let totalStars = 0
    let totalForks = 0
    const languages: Record<string, number> = {}

    for (const r of repos) {
      totalStars += r.stargazers_count || 0
      totalForks += r.forks_count || 0
      const lang = r.language || 'Other'
      languages[lang] = (languages[lang] || 0) + 1
    }
    const topByStars = [...repos]
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
      .slice(0, 10)
      .map((r) => ({
        id: r.id,
        name: r.name,
        full_name: r.full_name,
        description: r.description,
        html_url: r.html_url,
        language: r.language,
        stargazers_count: r.stargazers_count,
        forks_count: r.forks_count,
        pushed_at: r.pushed_at,
      }))

    const response = {
      totals: {
        repos: repos.length,
        totalStars,
        totalForks,
        languages,
      },
      topByStars,
    }
    const etag = undefined
    setCache(cacheKey, { data: response, etag, fetchedAt: Date.now(), ttlMs: 60 * 60 * 1000 })
    return NextResponse.json(response)
  } catch (e: any) {
    console.error('Repos API error:', e?.message || e)
    return NextResponse.json({ error: 'Failed to fetch repos' }, { status: 500 })
  }
}
