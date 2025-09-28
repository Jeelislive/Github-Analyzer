import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Octokit } from '@octokit/rest'
import { getCache, setCache } from '@/lib/serverCache'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // @ts-expect-error injected by session callback
    const accessToken: string | undefined = session.accessToken
    if (!accessToken) return NextResponse.json({ error: 'Missing GitHub access token' }, { status: 400 })

    const octokit = new Octokit({ auth: accessToken })
    const { data: me } = await octokit.rest.users.getAuthenticated()
    const login = me.login

    // Parse query for sectional listing
    const url = new URL(req.url)
    const section = url.searchParams.get('section') as 'all' | 'open' | 'merged' | 'closed' | null
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
    const per_page = Math.min(50, Math.max(1, parseInt(url.searchParams.get('per_page') || '20', 10)))

    // Cache key per-user
    const cacheKey = `prs:${login}`
    const cached = getCache<any>(cacheKey)
    // Serve fresh cache directly (TTL 5 min) only for summary requests
    if (!section && cached && Date.now() - cached.fetchedAt < 5 * 60 * 1000) {
      return NextResponse.json(cached.data)
    }

    // Helper utilities for clarity
    const buildQuery = (sec: 'all' | 'open' | 'merged' | 'closed') => {
      const base = `type:pr author:${login} is:public`
      if (sec === 'open') return `${base} is:open`
      if (sec === 'merged') return `${base} is:merged`
      if (sec === 'closed') return `${base} is:closed -is:merged`
      return base
    }

    const searchAll = async (query: string) => {
      const perPage = 100
      let pageIndex = 1
      const items: any[] = []
      let totalCount = 0
      // Loop until fewer than perPage items returned or hitting GitHub 1000 cap
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { data } = await octokit.rest.search.issuesAndPullRequests({ q: query, page: pageIndex, per_page: perPage, sort: 'updated', order: 'desc' })
        totalCount = data.total_count
        items.push(...data.items)
        if (data.items.length < perPage) break
        if (items.length >= Math.min(1000, totalCount)) break
        pageIndex += 1
      }
      return { items, totalCount }
    }

    const mapItem = (i: any, merged: boolean) => ({
      id: i.id,
      number: i.number,
      title: i.title,
      state: i.state,
      merged,
      html_url: i.html_url,
      repository_url: i.repository_url,
      updated_at: i.updated_at,
    })

    // Sectional response: return full list for the requested section
    if (section) {
      if (section === 'all') {
        const base = `type:pr author:${login} is:public`
        const [openRes, mergedRes, closedRes] = await Promise.all([
          searchAll(`${base} is:open`),
          searchAll(`${base} is:merged`),
          searchAll(`${base} is:closed -is:merged`),
        ])
        const labeled = [
          ...openRes.items.map((i) => mapItem(i, false)),
          ...mergedRes.items.map((i) => mapItem(i, true)),
          ...closedRes.items.map((i) => mapItem(i, false)),
        ]
        labeled.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        const total = Math.min(1000, openRes.totalCount) + Math.min(1000, mergedRes.totalCount) + Math.min(1000, closedRes.totalCount)
        return NextResponse.json({ section, total, items: labeled })
      }

      const q = buildQuery(section)
      const { items, totalCount } = await searchAll(q)
      const out = items.map((i) => mapItem(i, section === 'merged'))
      return NextResponse.json({ section, total: Math.min(totalCount, 1000), items: out })
    }

    // Try conditional requests using ETag when available
    const headersTotal = cached?.etag ? { 'if-none-match': cached.etag } : undefined
    let total, open, merged, reviewed, recent
    try {
      ;[total, open, merged, reviewed, recent] = await Promise.all([
        octokit.rest.search.issuesAndPullRequests({ q: `type:pr author:${login} is:public`, per_page: 1, headers: headersTotal }),
        octokit.rest.search.issuesAndPullRequests({ q: `type:pr author:${login} is:open is:public`, per_page: 1 }),
        octokit.rest.search.issuesAndPullRequests({ q: `type:pr author:${login} is:merged is:public`, per_page: 1 }),
        octokit.rest.search.issuesAndPullRequests({ q: `type:pr reviewed-by:${login} is:public`, per_page: 1 }),
        octokit.rest.search.issuesAndPullRequests({ q: `type:pr author:${login} is:public`, per_page: 10, sort: 'updated', order: 'desc' }),
      ])
    } catch (err: any) {
      // If GitHub returns 304 for conditional request, use cache
      if (err.status === 304 && cached?.data) {
        return NextResponse.json(cached.data)
      }
      throw err
    }

    // Compute avg time to merge from last up to 20 merged PRs
    const computeAvgTimeToMerge = async (): Promise<number | null> => {
      const { data } = await octokit.rest.search.issuesAndPullRequests({
        q: `type:pr author:${login} is:merged is:public`, per_page: 20, sort: 'updated', order: 'desc'
      })
      if (!data.items?.length) return null
      const pullFetches = data.items.map((item) => {
        const repoFullName = item.repository_url?.split('/repos/')[1]
        if (!repoFullName) return Promise.resolve<null>(null)
        const [owner, repo] = repoFullName.split('/')
        return octokit.rest.pulls.get({ owner, repo, pull_number: item.number })
          .then(r => r.data)
          .catch(() => null as any)
      })
      const settled = await Promise.allSettled(pullFetches)
      const durations: number[] = []
      for (const s of settled) {
        if (s.status === 'fulfilled' && s.value && s.value.merged_at && s.value.created_at) {
          durations.push(new Date(s.value.merged_at).getTime() - new Date(s.value.created_at).getTime())
        }
      }
      if (!durations.length) return null
      return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    }
    const avgTimeToMergeMs = await computeAvgTimeToMerge()

    // Enrich recent with merged flag
    const recentBasic = recent.data.items.map((i) => ({
      id: i.id,
      number: i.number,
      title: i.title,
      state: i.state,
      html_url: i.html_url,
      repository_url: i.repository_url,
      updated_at: i.updated_at,
    }))

    const enrichRecentMerged = async (items: typeof recentBasic) => {
      const fetches = items.map((item) => {
        const repoFullName = item.repository_url?.split('/repos/')[1]
        if (!repoFullName) return Promise.resolve({ ...item, merged: false })
        const [owner, repo] = repoFullName.split('/')
        return octokit.rest.pulls.get({ owner, repo, pull_number: item.number })
          .then(({ data }) => ({ ...item, merged: Boolean(data.merged_at) }))
          .catch(() => ({ ...item, merged: false }))
      })
      const results = await Promise.all(fetches)
      return results
    }
    const recentEnriched = await enrichRecentMerged(recentBasic)

    const response = {
      totals: {
        total: total.data.total_count,
        open: open.data.total_count,
        merged: merged.data.total_count,
        reviewed: reviewed.data.total_count,
        avgTimeToMergeMs,
      },
      recent: recentEnriched,
    }

    // Save cache with ETag from first search if present
    const etag = (total as any)?.headers?.etag as string | undefined
    setCache(cacheKey, { data: response, etag, fetchedAt: Date.now(), ttlMs: 30 * 60 * 1000 })
    return NextResponse.json(response)
  } catch (e: any) {
    console.error('PRs API error:', e?.message || e)
    return NextResponse.json({ error: 'Failed to fetch PRs' }, { status: 500 })
  }
}
