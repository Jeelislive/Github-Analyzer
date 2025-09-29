import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getOctokit } from '@/lib/octokit'
import { getCache, setCache } from '@/lib/serverCache'

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

    const octokit = getOctokit(accessToken)

    // Try conditional user fetch using ETag if cached
    const cacheKeySeed = 'me'
    const seedCache = getCache<any>(cacheKeySeed) // for first run without user login
    let userResp
    try {
      userResp = await octokit.rest.users.getAuthenticated({
        headers: seedCache?.etag ? { 'if-none-match': seedCache.etag } : undefined,
      } as any)
    } catch (e: any) {
      // If conditional request yields 304 or any error AND we have cache, serve cached
      const status = e?.status
      if (seedCache && (status === 304 || status >= 400)) {
        return NextResponse.json(seedCache.data)
      }
      throw e
    }

    // If we got a 304 (not modified), serve seed cache
    // Note: octokit throws on 304 normally; the above catch handles it. If we are here, we have 200 OK.
    const user = userResp.data

    // Use per-user cache key from now on
    const cacheKey = `me:${user.login}`
    const cached = getCache<any>(cacheKey)

    // Non-critical calls in parallel; tolerate failures
    const [emailsRes, orgsRes, eventsRes, prsRes] = await Promise.allSettled([
      octokit.rest.users.listEmailsForAuthenticatedUser(),
      octokit.rest.orgs.listForAuthenticatedUser({ per_page: 50 }),
      octokit.rest.activity.listEventsForAuthenticatedUser({ username: user.login, per_page: 20 }),
      octokit.rest.search.issuesAndPullRequests({ q: `type:pr author:${user.login} is:public`, per_page: 20, sort: 'updated', order: 'desc' }),
    ])

    const emails = emailsRes.status === 'fulfilled' ? emailsRes.value.data as any[] : []
    const orgs = orgsRes.status === 'fulfilled' ? orgsRes.value.data as any[] : []
    const events = eventsRes.status === 'fulfilled' ? eventsRes.value.data : []
    const prs = prsRes.status === 'fulfilled' ? prsRes.value.data : { items: [] as any[] }

    const primaryEmail = Array.isArray(emails) ? emails.find((e: any) => e.primary)?.email : undefined

    // Non-critical calls handled above

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

    // Prefer updating per-user cache with latest ETag
    const etag = (userResp as any)?.headers?.etag as string | undefined
    setCache(cacheKey, { data: response, etag, fetchedAt: Date.now(), ttlMs: 10 * 60 * 1000 })
    // Also seed generic key for early conditional use
    setCache(cacheKeySeed, { data: response, etag, fetchedAt: Date.now(), ttlMs: 10 * 60 * 1000 })
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('GitHub profile fetch failed:', error?.message || error)
    // If we have any cache for profile, serve it as a fallback
    const anyCache = getCache<any>('me')
    if (anyCache?.data) {
      return NextResponse.json(anyCache.data)
    }
    return NextResponse.json({ error: 'Failed to fetch GitHub data' }, { status: 500 })
  }
}
