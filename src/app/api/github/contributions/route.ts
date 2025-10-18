import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, getGitHubToken } from '@/lib/auth'
import { Octokit } from '@octokit/rest'
import { githubGraphQL, CONTRIBUTIONS_QUERY } from '@/lib/githubGraphql'
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

function computeStreaks(days: { date: string; contributionCount: number }[]) {
  let current = 0
  let longest = 0
  let temp = 0

  // Sort by date asc just in case
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date))

  for (const day of sorted) {
    if (day.contributionCount > 0) {
      temp += 1
      current = temp
      if (temp > longest) longest = temp
    } else {
      temp = 0
    }
  }
  return { currentStreak: current, longestStreak: longest }
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
    const loginParam = searchParams.get('login') || undefined
    const range = searchParams.get('range') || '365d'

    const now = new Date()
    const to = startOfDayISO(now)
    let days = 365
    const match = range.match(/(\d+)d/)
    if (match) days = Math.max(1, parseInt(match[1], 10))
    const from = startOfDayISO(addDays(now, -days))

    let login = loginParam
    if (!login) {
      const octokit = new Octokit({ auth: accessToken })
      const { data: me } = await octokit.rest.users.getAuthenticated()
      login = me.login
    }

    const cacheKey = `contrib:${login}:${from}:${to}`
    const cached = getCache<any>(cacheKey)
    if (cached && Date.now() - cached.fetchedAt < 15 * 60 * 1000) {
      return NextResponse.json(cached.data)
    }

    const data = await githubGraphQL<any>(accessToken, {
      query: CONTRIBUTIONS_QUERY,
      variables: { login, from, to },
    })

    const collection = data.user?.contributionsCollection
    const calendar = collection?.contributionCalendar
    if (!calendar) {
      return NextResponse.json({ error: 'No contributions found' }, { status: 404 })
    }

    // Flatten days
    const daysFlat: { date: string; contributionCount: number; color: string; weekday: number }[] = []
    for (const w of calendar.weeks || []) {
      for (const d of w.contributionDays || []) {
        daysFlat.push({
          date: d.date,
          contributionCount: d.contributionCount,
          color: d.color,
          weekday: d.weekday,
        })
      }
    }

    const totals = {
      totalContributions: calendar.totalContributions,
      totalCommits: collection.totalCommitContributions,
      totalIssues: collection.totalIssueContributions,
      totalPRs: collection.totalPullRequestContributions,
      totalReviews: collection.totalPullRequestReviewContributions,
      restricted: collection.restrictedContributionsCount,
      startedAt: collection.startedAt,
      endedAt: collection.endedAt,
      years: collection.contributionYears,
    }

    const { currentStreak, longestStreak } = computeStreaks(daysFlat)

    const response = {
      user: { login: data.user?.login, name: data.user?.name },
      range: { from, to },
      totals,
      streaks: { currentStreak, longestStreak },
      calendar: {
        weeks: calendar.weeks,
        total: calendar.totalContributions,
        days: daysFlat,
      },
    }

    // Simple change detection: hash total contributions + last day entry
    const lastDay = daysFlat[daysFlat.length - 1]
    const hash = `${totals.totalContributions}:${lastDay?.date}:${lastDay?.contributionCount}`
    setCache(cacheKey, { data: response, etag: hash, fetchedAt: Date.now(), ttlMs: 60 * 60 * 1000 })
    return NextResponse.json(response)
  } catch (err: any) {
    console.error('Contributions API error:', err?.message || err)
    return NextResponse.json({ error: 'Failed to fetch contributions' }, { status: 500 })
  }
}
