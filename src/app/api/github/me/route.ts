import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Octokit } from '@octokit/rest'
import { getCache, setCache } from '@/lib/server-cache'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // @ts-expect-error added in session callbacks
    const accessToken: string | undefined = session.accessToken
    if (!accessToken) {
      return NextResponse.json({ error: 'Missing GitHub access token' }, { status: 400 })
    }

    const octokit = new Octokit({ auth: accessToken })

    // Use cached profile if available (10 min TTL)
    const cacheKey = 'me'
    const cached = getCache<any>(cacheKey)
    if (cached && Date.now() - cached.fetchedAt < 10 * 60 * 1000) {
      return NextResponse.json(cached.data)
    }

    const [{ data: user }, { data: emails }] = await Promise.all([
      octokit.rest.users.getAuthenticated(),
      octokit.rest.users.listEmailsForAuthenticatedUser(),
    ])

    const primaryEmail = Array.isArray(emails) ? emails.find((e: any) => e.primary)?.email : undefined

    // Recent events (limited)
    const { data: events } = await octokit.rest.activity.listEventsForAuthenticatedUser({
      username: user.login,
      per_page: 20,
    })

    // Pull requests by user (recent)
    const { data: prs } = await octokit.rest.search.issuesAndPullRequests({
      q: `type:pr author:${user.login} is:public`,
      per_page: 10,
      sort: 'updated',
      order: 'desc',
    })

    const response = {
      user: {
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url,
        html_url: user.html_url,
        bio: user.bio,
        company: user.company,
        location: user.location,
        blog: user.blog,
        followers: user.followers,
        following: user.following,
        public_repos: user.public_repos,
        created_at: user.created_at,
        email: primaryEmail,
      },
      events,
      prs: prs.items,
    }

    setCache(cacheKey, { data: response, fetchedAt: Date.now(), ttlMs: 10 * 60 * 1000 })
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('GitHub profile fetch failed:', error?.message || error)
    return NextResponse.json({ error: 'Failed to fetch GitHub data' }, { status: 500 })
  }
}
