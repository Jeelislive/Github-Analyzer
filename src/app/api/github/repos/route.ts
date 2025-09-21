import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Octokit } from '@octokit/rest'
import { getCache, setCache } from '@/lib/server-cache'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // @ts-expect-error injected by session callback
    const accessToken: string | undefined = session.accessToken
    if (!accessToken) return NextResponse.json({ error: 'Missing GitHub access token' }, { status: 400 })

    const octokit = new Octokit({ auth: accessToken })
    const { data: me } = await octokit.rest.users.getAuthenticated()
    const login = me.login

    const cacheKey = `repos:${login}`
    const cached = getCache<any>(cacheKey)
    if (cached && Date.now() - cached.fetchedAt < 10 * 60 * 1000) {
      return NextResponse.json(cached.data, { headers: cached.etag ? { ETag: cached.etag } : undefined })
    }

    // Collect public repos owned by the user (paginate up to 200)
    const repos: any[] = []
    let page = 1
    while (page <= 4) { // 4 * 50 = 200
      const { data } = await octokit.rest.repos.listForUser({ username: login, per_page: 50, page, sort: 'updated' })
      if (!data.length) break
      repos.push(...data)
      page += 1
    }

    // Aggregations
    let totalStars = 0
    let totalForks = 0
    const languages: Record<string, number> = {}

    for (const r of repos) {
      totalStars += r.stargazers_count || 0
      totalForks += r.forks_count || 0
      const lang = r.language || 'Other'
      languages[lang] = (languages[lang] || 0) + 1
    }

    // Top repos by stars
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
    const etag = undefined // aggregate endpoint; could hash payload if needed
    setCache(cacheKey, { data: response, etag, fetchedAt: Date.now(), ttlMs: 60 * 60 * 1000 })
    return NextResponse.json(response)
  } catch (e: any) {
    console.error('Repos API error:', e?.message || e)
    return NextResponse.json({ error: 'Failed to fetch repos' }, { status: 500 })
  }
}
