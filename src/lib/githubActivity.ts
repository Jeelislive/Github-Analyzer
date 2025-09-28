export const ACTIVITY_QUERY = /* GraphQL */ `
  query Activity(
    $login: String!,
    $from: DateTime!,
    $to: DateTime!,
    $prCursor: String,
    $issueCursor: String,
    $reviewCursor: String
  ) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        pullRequestContributions(first: 100, after: $prCursor) {
          nodes { occurredAt }
          pageInfo { hasNextPage endCursor }
        }
        issueContributions(first: 100, after: $issueCursor) {
          nodes { occurredAt }
          pageInfo { hasNextPage endCursor }
        }
        pullRequestReviewContributions(first: 100, after: $reviewCursor) {
          nodes { occurredAt }
          pageInfo { hasNextPage endCursor }
        }
        commitContributionsByRepository(maxRepositories: 20) {
          repository { nameWithOwner }
          contributions(first: 100) {
            nodes { occurredAt }
            pageInfo { hasNextPage endCursor }
          }
        }
      }
    }
  }
`
