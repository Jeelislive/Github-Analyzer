import { Octokit } from '@octokit/rest'
import { retry } from '@octokit/plugin-retry'
import { throttling } from '@octokit/plugin-throttling'

// Compose Octokit with retry and throttling plugins
const MyOctokit = Octokit.plugin(retry, throttling)

export function getOctokit(auth: string) {
  return new MyOctokit({
    auth,
    userAgent: 'github-analyzer/0.1.0',
    request: {
      // Set a soft timeout to fail fast when rate limited
      timeout: 10_000,
    },
    retry: {
      doNotRetry: ['429'],
      maxRetries: 2,
    },
    throttle: {
      onRateLimit: (retryAfter: number, options: any, _octokit: any, retryCount: number) => {
        if (retryCount <= 2) {
          // Retry a couple of times
          return true
        }
        return false
      },
      onSecondaryRateLimit: (_retryAfter: number, _options: any, _octokit: any) => {
        // Do not retry aggressively on secondary limits; allow caller to degrade gracefully
        return false
      },
    },
  })
}

export async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
