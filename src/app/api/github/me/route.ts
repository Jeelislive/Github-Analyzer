import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, getGitHubToken } from '@/lib/auth'
import { getOctokit } from '@/lib/octokit'
import { getCache, setCache } from '@/lib/serverCache'

export async function GET() {
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

    const octokit = getOctokit(accessToken)

    const cacheKeySeed = 'me'
    const seedCache = getCache<any>(cacheKeySeed)
    let userResp
    try {
      userResp = await octokit.rest.users.getAuthenticated({
        headers: seedCache?.etag ? { 'if-none-match': seedCache.etag } : undefined,
      } as any)
    } catch (e: any) {
      const status = e?.status
      if (seedCache && (status === 304 || status >= 400)) {
        return NextResponse.json(seedCache.data)
      }
      throw e
    }

    const user = userResp.data
    const cacheKey = `me:${user.login}`
    const cached = getCache<any>(cacheKey)
    const [emailsRes, orgsRes, eventsRes, prsRes] = await Promise.allSettled([
      octokit.rest.users.listEmailsForAuthenticatedUser().catch(() => ({ data: [] })),
      octokit.rest.orgs.listForAuthenticatedUser({ per_page: 50 }).catch(() => ({ data: [] })),
      octokit.rest.activity.listEventsForAuthenticatedUser({ username: user.login, per_page: 20 }).catch(() => ({ data: [] })),
      octokit.rest.search.issuesAndPullRequests({ q: `type:pr author:${user.login} is:public`, per_page: 20, sort: 'updated', order: 'desc' }).catch(() => ({ data: { items: [] } })),
    ])

    const emails = emailsRes.status === 'fulfilled' ? emailsRes.value.data as any[] : []
    const orgs = orgsRes.status === 'fulfilled' ? orgsRes.value.data as any[] : []
    const events = eventsRes.status === 'fulfilled' ? eventsRes.value.data : []
    const prs = prsRes.status === 'fulfilled' ? prsRes.value.data : { items: [] as any[] }

    const primaryEmail = Array.isArray(emails) ? emails.find((e: any) => e.primary)?.email : undefined

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
          public_gists: (user as any).public_gists ?? 0,
        created_at: user.created_at,
        email: primaryEmail,
        twitter_username: (user as any).twitter_username || null,
      },
      events,
      prs: prs.items,
      organizations: (Array.isArray(orgs) ? orgs : []).map((o: any) => ({
        login: o.login,
        avatar_url: o.avatar_url,
        description: o.description,
        html_url: `https://github.com/${o.login}`,
      })),
    }

    const etag = (userResp as any)?.headers?.etag as string | undefined
    setCache(cacheKey, { data: response, etag, fetchedAt: Date.now(), ttlMs: 10 * 60 * 1000 })
    setCache(cacheKeySeed, { data: response, etag, fetchedAt: Date.now(), ttlMs: 10 * 60 * 1000 })
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('GitHub profile fetch failed:', error?.message || error)
    const anyCache = getCache<any>('me')
    if (anyCache?.data) {
      return NextResponse.json(anyCache.data)
    }
    return NextResponse.json({ error: 'Failed to fetch GitHub data' }, { status: 500 })
  }
}
