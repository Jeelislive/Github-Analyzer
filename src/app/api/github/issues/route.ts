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

    const cacheKey = `issues:${login}`
    const cached = getCache<any>(cacheKey)
    if (cached && Date.now() - cached.fetchedAt < 5 * 60 * 1000) {
      return NextResponse.json(cached.data)
    }

    const headersTotal = cached?.etag ? { 'if-none-match': cached.etag } : undefined
    let total, open, closed, recent
    try {
      ;[total, open, closed, recent] = await Promise.all([
        octokit.rest.search.issuesAndPullRequests({ q: `type:issue author:${login} is:public`, per_page: 1, headers: headersTotal }),
        octokit.rest.search.issuesAndPullRequests({ q: `type:issue author:${login} is:open is:public`, per_page: 1 }),
        octokit.rest.search.issuesAndPullRequests({ q: `type:issue author:${login} is:closed is:public`, per_page: 1 }),
        octokit.rest.search.issuesAndPullRequests({ q: `type:issue author:${login} is:public`, per_page: 10, sort: 'updated', order: 'desc' }),
      ])
    } catch (err: any) {
      if (err.status === 304 && cached?.data) {
        return NextResponse.json(cached.data)
      }
      throw err
    }

    // Compute average first response time for up to 20 recent issues
    const { data: recentIssues } = await octokit.rest.search.issuesAndPullRequests({
      q: `type:issue author:${login} is:public`, per_page: 20, sort: 'created', order: 'desc'
    })

    let avgFirstResponseMs: number | null = null
    if (recentIssues.items?.length) {
      const durations: number[] = []
      for (const item of recentIssues.items) {
        const repoFull = item.repository_url?.split('/repos/')[1]
        if (!repoFull) continue
        const [owner, repo] = repoFull.split('/')
        const number = item.number
        try {
          const { data: comments } = await octokit.rest.issues.listComments({ owner, repo, issue_number: number, per_page: 10 })
          const firstOther = comments.find((c: any) => c.user?.login && c.user.login !== login)
          if (firstOther) {
            durations.push(new Date(firstOther.created_at).getTime() - new Date(item.created_at!).getTime())
          }
        } catch {}
      }
      if (durations.length) avgFirstResponseMs = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    }

    const response = {
      totals: {
        total: total.data.total_count,
        open: open.data.total_count,
        closed: closed.data.total_count,
        avgFirstResponseMs,
      },
      recent: recent.data.items.map((i) => ({
        id: i.id,
        number: i.number,
        title: i.title,
        state: i.state,
        html_url: i.html_url,
        repository_url: i.repository_url,
        updated_at: i.updated_at,
        labels: i.labels,
      })),
    }

    const etag = (total as any)?.headers?.etag as string | undefined
    setCache(cacheKey, { data: response, etag, fetchedAt: Date.now(), ttlMs: 30 * 60 * 1000 })
    return NextResponse.json(response)
  } catch (e: any) {
    console.error('Issues API error:', e?.message || e)
    return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 })
  }
}
