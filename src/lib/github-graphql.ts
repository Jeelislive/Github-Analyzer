export const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql'

export type GraphQLRequest = {
  query: string
  variables?: Record<string, any>
}

export class GitHubGraphQLError extends Error {
  public status: number
  public errors?: any
  constructor(message: string, status = 500, errors?: any) {
    super(message)
    this.name = 'GitHubGraphQLError'
    this.status = status
    this.errors = errors
  }
}

export async function githubGraphQL<T>(accessToken: string, body: GraphQLRequest): Promise<T> {
  const res = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    // Important for Next.js route handlers to avoid caching sensitive data
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new GitHubGraphQLError(`GitHub GraphQL request failed (${res.status}): ${text || res.statusText}`,
      res.status)
  }

  const json = await res.json() as { data?: T; errors?: any }
  if (json.errors) {
    throw new GitHubGraphQLError('GitHub GraphQL returned errors', 200, json.errors)
  }
  if (!json.data) {
    throw new GitHubGraphQLError('GitHub GraphQL returned empty data')
  }
  return json.data
}

// Query strings
export const CONTRIBUTIONS_QUERY = /* GraphQL */ `
  query Contributions($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      login
      name
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              color
              contributionCount
              date
              weekday
            }
            firstDay
          }
        }
        contributionYears
        totalCommitContributions
        totalIssueContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        restrictedContributionsCount
        startedAt
        endedAt
      }
    }
  }
`
