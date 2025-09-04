import { Octokit } from '@octokit/rest'
import { geminiAnalyzer, type GeminiRepositoryInsights } from './gemini-analyzer'

export interface EnhancedRepositoryData {
  // Basic repository info
  repository: {
    id: number
    name: string
    full_name: string
    description: string
    owner: {
      login: string
      type: string
      avatar_url: string
    }
    private: boolean
    html_url: string
    clone_url: string
    ssh_url: string
    homepage: string
    language: string
    created_at: string
    updated_at: string
    pushed_at: string
    size: number
    default_branch: string
  }

  // Engagement metrics
  metrics: {
    stargazers_count: number
    watchers_count: number
    forks_count: number
    subscribers_count: number
    open_issues_count: number
    network_count: number
  }

  // Repository structure and content
  content: {
    files: Array<{
      path: string
      name: string
      type: 'file' | 'dir'
      size: number
      content?: string
      download_url?: string
      sha: string
    }>
    readme?: {
      content: string
      encoding: string
    }
    packageJson?: any
    license?: {
      name: string
      spdx_id: string
      url: string
    }
  }

  // Development activity
  activity: {
    commits: Array<{
      sha: string
      message: string
      author: {
        name: string
        email: string
        date: string
      }
      committer: {
        name: string
        email: string
        date: string
      }
      stats?: {
        additions: number
        deletions: number
        total: number
      }
      files: Array<{
        filename: string
        status: string
        additions: number
        deletions: number
        changes: number
      }>
    }>
    contributors: Array<{
      login: string
      id: number
      avatar_url: string
      contributions: number
      type: string
    }>
    branches: Array<{
      name: string
      commit: {
        sha: string
        url: string
      }
      protected: boolean
    }>
  }

  // Issues and pull requests
  collaboration: {
    issues: Array<{
      id: number
      number: number
      title: string
      body: string
      state: 'open' | 'closed'
      created_at: string
      updated_at: string
      closed_at?: string
      labels: Array<{
        name: string
        color: string
        description: string
      }>
      assignees: Array<{
        login: string
        avatar_url: string
      }>
      milestone?: {
        title: string
        description: string
        state: string
        due_on?: string
      }
    }>
    pullRequests: Array<{
      id: number
      number: number
      title: string
      body: string
      state: 'open' | 'closed'
      created_at: string
      updated_at: string
      closed_at?: string
      merged_at?: string
      mergeable?: boolean
      base: {
        ref: string
        sha: string
      }
      head: {
        ref: string
        sha: string
      }
      additions: number
      deletions: number
      changed_files: number
    }>
  }

  // Releases and tags
  releases: {
    releases: Array<{
      id: number
      tag_name: string
      name: string
      body: string
      draft: boolean
      prerelease: boolean
      created_at: string
      published_at: string
      assets: Array<{
        name: string
        size: number
        download_count: number
      }>
    }>
    tags: Array<{
      name: string
      commit: {
        sha: string
        url: string
      }
    }>
  }

  // Dependencies (from package.json, requirements.txt, etc.)
  dependencies: {
    production: Array<{
      name: string
      version: string
      type: 'dependency' | 'devDependency' | 'peerDependency'
    }>
    development: Array<{
      name: string
      version: string
      type: 'dependency' | 'devDependency' | 'peerDependency'
    }>
  }

  // Security and quality metrics
  quality: {
    codeScanning?: Array<{
      state: string
      created_at: string
      tool: string
      category: string
      severity: string
    }>
    vulnerabilities?: Array<{
      severity: string
      summary: string
      description: string
      published_at: string
    }>
    languages: Record<string, number>
  }

  // AI-powered insights from Gemini
  geminiInsights?: GeminiRepositoryInsights
}

export class EnhancedGitHubAnalyzer {
  private octokit: Octokit

  constructor(token?: string) {
    this.octokit = new Octokit({
      auth: token || process.env.GITHUB_TOKEN,
    })
  }

  async analyzeRepository(owner: string, repo: string, options: {
    includeFileContent?: boolean
    includeCommitHistory?: boolean
    includeGeminiAnalysis?: boolean
    maxFiles?: number
    maxCommits?: number
  } = {}): Promise<EnhancedRepositoryData> {
    
    const {
      includeFileContent = true,
      includeCommitHistory = true,
      includeGeminiAnalysis = true,
      maxFiles = 50,
      maxCommits = 100
    } = options

    console.log(`🔍 Starting enhanced analysis of ${owner}/${repo}`)

    try {
      // 1. Fetch basic repository information
      console.log('📊 Fetching repository metadata...')
      const repository = await this.fetchRepositoryInfo(owner, repo)

      // 2. Fetch engagement metrics
      console.log('📈 Fetching engagement metrics...')
      const metrics = await this.fetchEngagementMetrics(owner, repo)

      // 3. Fetch repository content and structure
      console.log('📁 Fetching repository content...')
      const content = await this.fetchRepositoryContent(owner, repo, includeFileContent, maxFiles)

      // 4. Fetch development activity
      console.log('🔄 Fetching development activity...')
      const activity = await this.fetchDevelopmentActivity(owner, repo, includeCommitHistory, maxCommits)

      // 5. Fetch collaboration data
      console.log('👥 Fetching collaboration data...')
      const collaboration = await this.fetchCollaborationData(owner, repo)

      // 6. Fetch releases and tags
      console.log('🏷️ Fetching releases and tags...')
      const releases = await this.fetchReleasesAndTags(owner, repo)

      // 7. Extract dependencies
      console.log('📦 Extracting dependencies...')
      const dependencies = await this.extractDependencies(content)

      // 8. Fetch quality metrics
      console.log('🔍 Fetching quality metrics...')
      const quality = await this.fetchQualityMetrics(owner, repo)

      const enhancedData: EnhancedRepositoryData = {
        repository,
        metrics,
        content,
        activity,
        collaboration,
        releases,
        dependencies,
        quality
      }

      // 9. Generate Gemini AI insights
      if (includeGeminiAnalysis) {
        console.log('🤖 Generating AI-powered insights with Gemini...')
        try {
          const geminiInsights = await this.generateGeminiInsights(enhancedData)
          enhancedData.geminiInsights = geminiInsights
        } catch (error) {
          console.warn('Gemini analysis failed, continuing without AI insights:', error)
        }
      }

      console.log(`✅ Enhanced analysis complete for ${owner}/${repo}`)
      return enhancedData

    } catch (error) {
      console.error(`❌ Enhanced analysis failed for ${owner}/${repo}:`, error)
      throw error
    }
  }

  private async fetchRepositoryInfo(owner: string, repo: string) {
    const { data } = await this.octokit.rest.repos.get({ owner, repo })
    return {
      id: data.id,
      name: data.name,
      full_name: data.full_name,
      description: data.description || '',
      owner: {
        login: data.owner.login,
        type: data.owner.type,
        avatar_url: data.owner.avatar_url
      },
      private: data.private,
      html_url: data.html_url,
      clone_url: data.clone_url,
      ssh_url: data.ssh_url,
      homepage: data.homepage || '',
      language: data.language || '',
      created_at: data.created_at,
      updated_at: data.updated_at,
      pushed_at: data.pushed_at,
      size: data.size,
      default_branch: data.default_branch
    }
  }

  private async fetchEngagementMetrics(owner: string, repo: string) {
    const { data } = await this.octokit.rest.repos.get({ owner, repo })
    return {
      stargazers_count: data.stargazers_count,
      watchers_count: data.watchers_count,
      forks_count: data.forks_count,
      subscribers_count: data.subscribers_count || 0,
      open_issues_count: data.open_issues_count,
      network_count: data.network_count || 0
    }
  }

  private async fetchRepositoryContent(owner: string, repo: string, includeContent: boolean, maxFiles: number) {
    const files: any[] = []
    let readme: any = undefined
    let packageJson: any = undefined
    let license: any = undefined

    try {
      // Get repository contents (root level first)
      const { data: rootContents } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path: ''
      })

      // Recursively fetch file structure
      await this.fetchDirectoryContents(owner, repo, '', files, includeContent, maxFiles, 0, 3)

      // Fetch README
      try {
        const { data: readmeData } = await this.octokit.rest.repos.getReadme({ owner, repo })
        if ('content' in readmeData) {
          readme = {
            content: Buffer.from(readmeData.content, 'base64').toString('utf-8'),
            encoding: readmeData.encoding
          }
        }
      } catch (error) {
        console.log('No README found')
      }

      // Fetch package.json if it exists
      const packageJsonFile = files.find(f => f.name === 'package.json')
      if (packageJsonFile && packageJsonFile.content) {
        try {
          packageJson = JSON.parse(packageJsonFile.content)
        } catch (error) {
          console.warn('Failed to parse package.json:', error)
        }
      }

      // Fetch license
      try {
        const { data: licenseData } = await this.octokit.rest.repos.get({ owner, repo })
        if (licenseData.license) {
          license = {
            name: licenseData.license.name,
            spdx_id: licenseData.license.spdx_id,
            url: licenseData.license.url
          }
        }
      } catch (error) {
        console.log('No license found')
      }

    } catch (error) {
      console.warn('Failed to fetch repository content:', error)
    }

    return { files, readme, packageJson, license }
  }

  private async fetchDirectoryContents(
    owner: string, 
    repo: string, 
    path: string, 
    files: any[], 
    includeContent: boolean, 
    maxFiles: number,
    currentDepth: number,
    maxDepth: number
  ) {
    if (files.length >= maxFiles || currentDepth >= maxDepth) return

    try {
      const { data: contents } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path
      })

      if (Array.isArray(contents)) {
        for (const item of contents) {
          if (files.length >= maxFiles) break

          const fileInfo: any = {
            path: item.path,
            name: item.name,
            type: item.type,
            size: item.size || 0,
            sha: item.sha,
            download_url: item.download_url
          }

          if (item.type === 'file' && includeContent && item.size && item.size < 100000) { // Only fetch files < 100KB
            try {
              if (item.download_url) {
                const response = await fetch(item.download_url)
                fileInfo.content = await response.text()
              }
            } catch (error) {
              console.warn(`Failed to fetch content for ${item.path}:`, error)
            }
          }

          files.push(fileInfo)

          // Recursively fetch directory contents
          if (item.type === 'dir' && currentDepth < maxDepth) {
            await this.fetchDirectoryContents(owner, repo, item.path, files, includeContent, maxFiles, currentDepth + 1, maxDepth)
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch contents for path ${path}:`, error)
    }
  }

  private async fetchDevelopmentActivity(owner: string, repo: string, includeCommitHistory: boolean, maxCommits: number) {
    const activity: any = {
      commits: [],
      contributors: [],
      branches: []
    }

    try {
      // Fetch contributors
      const { data: contributors } = await this.octokit.rest.repos.listContributors({
        owner,
        repo,
        per_page: 50
      })
      activity.contributors = contributors

      // Fetch branches
      const { data: branches } = await this.octokit.rest.repos.listBranches({
        owner,
        repo,
        per_page: 20
      })
      activity.branches = branches

      // Fetch commit history
      if (includeCommitHistory) {
        const { data: commits } = await this.octokit.rest.repos.listCommits({
          owner,
          repo,
          per_page: Math.min(maxCommits, 100)
        })

        for (const commit of commits.slice(0, maxCommits)) {
          try {
            // Fetch detailed commit info
            const { data: detailedCommit } = await this.octokit.rest.repos.getCommit({
              owner,
              repo,
              ref: commit.sha
            })

            activity.commits.push({
              sha: commit.sha,
              message: commit.commit.message,
              author: {
                name: commit.commit.author?.name || 'Unknown',
                email: commit.commit.author?.email || '',
                date: commit.commit.author?.date || ''
              },
              committer: {
                name: commit.commit.committer?.name || 'Unknown',
                email: commit.commit.committer?.email || '',
                date: commit.commit.committer?.date || ''
              },
              stats: detailedCommit.stats,
              files: detailedCommit.files || []
            })
          } catch (error) {
            console.warn(`Failed to fetch detailed commit ${commit.sha}:`, error)
          }
        }
      }
    } catch (error) {
      console.warn('Failed to fetch development activity:', error)
    }

    return activity
  }

  private async fetchCollaborationData(owner: string, repo: string) {
    const collaboration: any = {
      issues: [],
      pullRequests: []
    }

    try {
      // Fetch issues
      const { data: issues } = await this.octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: 'all',
        per_page: 50
      })

      collaboration.issues = issues.filter(issue => !issue.pull_request).map(issue => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        body: issue.body || '',
        state: issue.state,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        closed_at: issue.closed_at,
        labels: issue.labels.map(label => 
          typeof label === 'string' ? label : label.name
        ),
        assignees: issue.assignees || [],
        milestone: issue.milestone
      }))

      // Fetch pull requests
      const { data: pullRequests } = await this.octokit.rest.pulls.list({
        owner,
        repo,
        state: 'all',
        per_page: 50
      })

      // Get detailed PR info for each pull request
      const detailedPRs = await Promise.all(
        pullRequests.slice(0, 20).map(async (pr) => {
          try {
            const { data: detailedPR } = await this.octokit.rest.pulls.get({
              owner,
              repo,
              pull_number: pr.number
            })
            return detailedPR
          } catch (error) {
            console.warn(`Failed to fetch detailed PR ${pr.number}:`, error)
            return pr
          }
        })
      )

      collaboration.pullRequests = detailedPRs.map(pr => ({
        id: pr.id,
        number: pr.number,
        title: pr.title,
        body: pr.body || '',
        state: pr.state,
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        closed_at: pr.closed_at,
        merged_at: pr.merged_at,
        mergeable: (pr as any).mergeable || null,
        base: pr.base,
        head: pr.head,
        additions: (pr as any).additions || 0,
        deletions: (pr as any).deletions || 0,
        changed_files: (pr as any).changed_files || 0
      }))

    } catch (error) {
      console.warn('Failed to fetch collaboration data:', error)
    }

    return collaboration
  }

  private async fetchReleasesAndTags(owner: string, repo: string) {
    const releases: any = {
      releases: [],
      tags: []
    }

    try {
      // Fetch releases
      const { data: releasesData } = await this.octokit.rest.repos.listReleases({
        owner,
        repo,
        per_page: 20
      })
      releases.releases = releasesData

      // Fetch tags
      const { data: tagsData } = await this.octokit.rest.repos.listTags({
        owner,
        repo,
        per_page: 20
      })
      releases.tags = tagsData

    } catch (error) {
      console.warn('Failed to fetch releases and tags:', error)
    }

    return releases
  }

  private async extractDependencies(content: any) {
    const dependencies: any = {
      production: [],
      development: []
    }

    try {
      // Extract from package.json
      if (content.packageJson) {
        const pkg = content.packageJson
        
        if (pkg.dependencies) {
          Object.entries(pkg.dependencies).forEach(([name, version]) => {
            dependencies.production.push({
              name,
              version: version as string,
              type: 'dependency'
            })
          })
        }

        if (pkg.devDependencies) {
          Object.entries(pkg.devDependencies).forEach(([name, version]) => {
            dependencies.development.push({
              name,
              version: version as string,
              type: 'devDependency'
            })
          })
        }

        if (pkg.peerDependencies) {
          Object.entries(pkg.peerDependencies).forEach(([name, version]) => {
            dependencies.production.push({
              name,
              version: version as string,
              type: 'peerDependency'
            })
          })
        }
      }

      // TODO: Add support for other dependency files (requirements.txt, Gemfile, etc.)

    } catch (error) {
      console.warn('Failed to extract dependencies:', error)
    }

    return dependencies
  }

  private async fetchQualityMetrics(owner: string, repo: string) {
    const quality: any = {
      languages: {}
    }

    try {
      // Fetch language statistics
      const { data: languages } = await this.octokit.rest.repos.listLanguages({
        owner,
        repo
      })
      quality.languages = languages

      // TODO: Fetch code scanning alerts (requires appropriate permissions)
      // TODO: Fetch vulnerability alerts (requires appropriate permissions)

    } catch (error) {
      console.warn('Failed to fetch quality metrics:', error)
    }

    return quality
  }

  private async generateGeminiInsights(enhancedData: EnhancedRepositoryData): Promise<GeminiRepositoryInsights> {
    // Prepare data for Gemini analysis - fix the data mapping to match expected types
    const repoData = {
      name: enhancedData.repository.name,
      description: enhancedData.repository.description,
      language: enhancedData.repository.language,
      files: enhancedData.content.files.map(f => ({
        path: f.path,
        content: f.content || '',
        size: f.size
      })),
      commits: enhancedData.activity.commits.map(c => ({
        message: c.message,
        author: c.author.name,
        date: c.author.date,
        files: c.files.map((f: any) => f.filename)
      })),
      contributors: enhancedData.activity.contributors.map(c => ({
        name: c.login,
        contributions: c.contributions
      })),
      issues: enhancedData.collaboration.issues.map(issue => ({
        title: issue.title,
        body: issue.body,
        labels: issue.labels.map(label => 
          typeof label === 'string' ? label : label.name
        ),
        state: issue.state
      })),
      pullRequests: enhancedData.collaboration.pullRequests.map(pr => ({
        title: pr.title,
        body: pr.body,
        state: pr.state,
        mergeable: pr.mergeable || false
      })),
      // Fix dependencies type mapping
      dependencies: [
        ...enhancedData.dependencies.production.map(dep => ({
          name: dep.name,
          version: dep.version,
          type: dep.type === 'peerDependency' ? 'production' : 'production' as 'production' | 'development'
        })),
        ...enhancedData.dependencies.development.map(dep => ({
          name: dep.name,
          version: dep.version,
          type: 'development' as 'production' | 'development'
        }))
      ],
      readme: enhancedData.content.readme?.content,
      packageJson: enhancedData.content.packageJson
    }

    return await geminiAnalyzer.analyzeRepository(repoData)
  }
}

export const enhancedGitHubAnalyzer = new EnhancedGitHubAnalyzer()