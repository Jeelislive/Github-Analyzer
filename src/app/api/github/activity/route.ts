import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, getGitHubToken } from '@/lib/auth'
import { Octokit } from '@octokit/rest'
import { githubGraphQL } from '@/lib/githubGraphql'
import { ACTIVITY_QUERY } from '@/lib/githubActivity'
import { getCache, setCache } from '@/lib/serverCache'

function startOfDayISO(date: Date) {
  const d = new Date(date)
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString()
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setUTCDate(d.getUTCDate() + days)
  return d
}

async function fetchAllConnections<T>(accessToken: string, login: string, from: string, to: string) {
  let prCursor: string | undefined = undefined
  let issueCursor: string | undefined = undefined
  let reviewCursor: string | undefined = undefined

  const prs: string[] = []
  const issues: string[] = []
  const reviews: string[] = []
  const commits: string[] = []

  // We'll loop until all cursors are exhausted
  // Also gather commit contribution dates from up to 20 repos (API limit) with pagination on inner contribution list
  // For practicality, we only fetch max 500 nodes per type to avoid heavy loads
  let guard = 0
  while (guard++ < 20) {
    const data: any = await githubGraphQL<any>(accessToken, {
      query: ACTIVITY_QUERY,
      variables: { login, from, to, prCursor, issueCursor, reviewCursor },
    })

    const cc: any = data.user?.contributionsCollection
    if (!cc) break

    cc.pullRequestContributions?.nodes?.forEach((n: any) => prs.push(n.occurredAt))
    cc.issueContributions?.nodes?.forEach((n: any) => issues.push(n.occurredAt))
    cc.pullRequestReviewContributions?.nodes?.forEach((n: any) => reviews.push(n.occurredAt))

    // commits nested pagination
    const repos = cc.commitContributionsByRepository || []
    for (const r of repos) {
      r.contributions?.nodes?.forEach((n: any) => commits.push(n.occurredAt))
    }

    const prInfo: any = cc.pullRequestContributions?.pageInfo
    const isInfo: any = cc.issueContributions?.pageInfo
    const rvInfo: any = cc.pullRequestReviewContributions?.pageInfo

    const hasNext = !!(prInfo?.hasNextPage || isInfo?.hasNextPage || rvInfo?.hasNextPage)
    prCursor = prInfo?.endCursor
    issueCursor = isInfo?.endCursor
    reviewCursor = rvInfo?.endCursor
    if (!hasNext) break
  }

  return { prs, issues, reviews, commits }
}

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url)
    const range = searchParams.get('range') || '90d'
    const now = new Date()
    const to = startOfDayISO(now)
    const match = range.match(/(\d+)d/)
    const days = match ? Math.max(1, parseInt(match[1], 10)) : 90
    const from = startOfDayISO(addDays(now, -days))

    const octokit = new Octokit({ auth: accessToken })
    const { data: me } = await octokit.rest.users.getAuthenticated()
    const login = me.login

    const cacheKey = `activity:${login}:${from}:${to}`
    const cached = getCache<any>(cacheKey)
    if (cached && Date.now() - cached.fetchedAt < 15 * 60 * 1000) {
      return NextResponse.json(cached.data)
    }

    const { prs, issues, reviews, commits } = await fetchAllConnections(accessToken, login, from, to)

    // Aggregate per-day counts
    const byDay = (arr: string[]) => {
      const m: Record<string, number> = {}
      arr.forEach((iso) => {
        const d = new Date(iso).toISOString().slice(0, 10)
        m[d] = (m[d] || 0) + 1
      })
      return m
    }

    const prM = byDay(prs)
    const isM = byDay(issues)
    const rvM = byDay(reviews)
    const cmM = byDay(commits)

    const allKeys = Array.from(new Set([...Object.keys(prM), ...Object.keys(isM), ...Object.keys(rvM), ...Object.keys(cmM)])).sort()

    const daily = allKeys.map((d) => ({
      date: d,
      prs: prM[d] || 0,
      issues: isM[d] || 0,
      reviews: rvM[d] || 0,
      commits: cmM[d] || 0,
    }))

    const response = {
      user: { login },
      range: { from, to },
      totals: {
        prs: prs.length,
        issues: issues.length,
        reviews: reviews.length,
        commits: commits.length,
      },
      daily,
    }

    // Hash by last date and totals to detect changes
    const last = daily[daily.length - 1]
    const hash = `${daily.length}:${last?.date}:${last?.prs}:${last?.issues}:${last?.reviews}:${last?.commits}`
    setCache(cacheKey, { data: response, etag: hash, fetchedAt: Date.now(), ttlMs: 60 * 60 * 1000 })
    return NextResponse.json(response)
  } catch (e: any) {
    console.error('Activity API error:', e?.message || e)
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 })
  }
}
