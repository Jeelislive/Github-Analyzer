export interface VisualizedProfile {
  id: string
  user_id: string
  github_username: string
  profile_data: {
    login: string
    name: string
    bio: string
    avatar_url: string
    html_url: string
    location: string
    company: string
    blog: string
    followers: number
    following: number
    public_repos: number
    created_at: string
  }
  repositories: Array<{
    id: number
    name: string
    full_name: string
    description: string
    html_url: string
    language: string
    stargazers_count: number
    forks_count: number
  }>
  stats: {
    total_repos: number
    total_issues: number
    total_prs: number
    total_contributions: number
  }
  created_at: string
  updated_at: string
}

