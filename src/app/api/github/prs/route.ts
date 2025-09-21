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

    // Cache key per-user
    const cacheKey = `prs:${login}`
    const cached = getCache<any>(cacheKey)
    // Serve fresh cache directly (TTL 5 min)
    if (cached && Date.now() - cached.fetchedAt < 5 * 60 * 1000) {
      return NextResponse.json(cached.data)
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
    const { data: mergedList } = await octokit.rest.search.issuesAndPullRequests({
      q: `type:pr author:${login} is:merged is:public`, per_page: 20, sort: 'updated', order: 'desc'
    })

    let avgTimeToMergeMs: number | null = null
    if (mergedList.items?.length) {
      const durations: number[] = []
      for (const item of mergedList.items) {
        const repoFullName = item.repository_url?.split('/repos/')[1]
        if (!repoFullName) continue
        const [owner, repo] = repoFullName.split('/')
        const number = item.number
        try {
          const { data: pr } = await octokit.rest.pulls.get({ owner, repo, pull_number: number })
          if (pr.merged_at && pr.created_at) {
            durations.push(new Date(pr.merged_at).getTime() - new Date(pr.created_at).getTime())
          }
        } catch {}
      }
      if (durations.length) avgTimeToMergeMs = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    }

    const response = {
      totals: {
        total: total.data.total_count,
        open: open.data.total_count,
        merged: merged.data.total_count,
        reviewed: reviewed.data.total_count,
        avgTimeToMergeMs,
      },
      recent: recent.data.items.map((i) => ({
        id: i.id,
        number: i.number,
        title: i.title,
        state: i.state,
        html_url: i.html_url,
        repository_url: i.repository_url,
        updated_at: i.updated_at,
      })),
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
