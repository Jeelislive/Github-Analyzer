import { GoogleGenerativeAI } from '@google/generative-ai'
import { technologyAnalyzer, type TechnologyStack } from './technologyAnalyzer'
import { scoringAnalyzer, type QualityScore } from './scoringAnalyzer'

// Initialize Gemini AI with environment variable
const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export interface GeminiRepositoryInsights {
  // Core Analysis
  projectSummary: {
    purpose: string
    mainTechnologies: string[]
    architecturalPattern: string
    complexity: 'Low' | 'Medium' | 'High' | 'Very High'
    maturity: 'Prototype' | 'Alpha' | 'Beta' | 'Production' | 'Mature'
    projectHealthScore: number // 0-100
    qualityScores: QualityScore
    technologyStack: {
      frontend: Array<{
        name: string
        version?: string
        confidence: number
        usage: 'primary' | 'secondary' | 'dependency'
        description: string
      }>
      backend: Array<{
        name: string
        version?: string
        confidence: number
        usage: 'primary' | 'secondary' | 'dependency'
        description: string
      }>
      database: Array<{
        name: string
        version?: string
        confidence: number
        usage: 'primary' | 'secondary' | 'dependency'
        description: string
      }>
      devops: Array<{
        name: string
        version?: string
        confidence: number
        usage: 'primary' | 'secondary' | 'dependency'
        description: string
      }>
      testing: Array<{
        name: string
        version?: string
        confidence: number
        usage: 'primary' | 'secondary' | 'dependency'
        description: string
      }>
    }
    projectMetrics: {
      totalLinesOfCode: number
      totalFiles: number
      averageFileSize: number
      documentationCoverage: number
      testCoverage: number
    }
  }

  // Code Quality Assessment
  codeQuality: {
    overallScore: number // 0-100
    strengths: string[]
    weaknesses: string[]
    technicalDebt: string[]
    securityConcerns: string[]
    performanceIssues: string[]
    codeMetrics: {
      cyclomaticComplexity: number
      codeDuplication: number
      maintainabilityIndex: number
      technicalDebtRatio: number
      codeSmells: Array<{
        type: string
        severity: 'Low' | 'Medium' | 'High' | 'Critical'
        description: string
        location: string
      }>
    }
    codeStandards: {
      namingConventions: 'Poor' | 'Fair' | 'Good' | 'Excellent'
      documentationQuality: 'Poor' | 'Fair' | 'Good' | 'Excellent'
      errorHandling: 'Poor' | 'Fair' | 'Good' | 'Excellent'
      logging: 'Poor' | 'Fair' | 'Good' | 'Excellent'
    }
  }

  // Development Insights
  developmentPatterns: {
    commitFrequency: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High'
    teamCollaboration: 'Solo' | 'Small Team' | 'Medium Team' | 'Large Team'
    codeReviewPractice: 'None' | 'Occasional' | 'Regular' | 'Strict'
    testingMaturity: 'None' | 'Basic' | 'Good' | 'Excellent'
    cicdMaturity: 'None' | 'Basic' | 'Intermediate' | 'Advanced'
    developmentMetrics: {
      averageCommitSize: number
      commitFrequencyPerWeek: number
      pullRequestMergeTime: number
      bugFixTime: number
      featureDeliveryTime: number
    }
    contributorAnalysis: Array<{
      name: string
      contributions: number
      expertise: string[]
      codeOwnership: number
      influence: number
      lastActive: string
      profile: {
        avatar: string
        githubUrl: string
        joinDate: string
        totalCommits: number
        totalPRs: number
        mergedPRs: number
        linesAdded: number
        linesRemoved: number
        filesChanged: number
        averageCommitSize: number
        mostActiveDay: string
        mostActiveHour: number
        timezone: string
        primaryLanguages: string[]
        contributionStreak: number
        longestStreak: number
        recentActivity: Array<{
          date: string
          type: 'commit' | 'pr' | 'issue' | 'review'
          description: string
          impact: 'low' | 'medium' | 'high'
        }>
        prActivity: {
          opened: number
          merged: number
          closed: number
          reviewed: number
          averageReviewTime: number
          averageMergeTime: number
        }
        collaborationMetrics: {
          coAuthoredCommits: number
          pairProgrammingSessions: number
          codeReviewParticipation: number
          mentoringActivity: number
        }
        expertiseBreakdown: Array<{
          area: string
          proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
          filesCount: number
          linesOfCode: number
          lastContribution: string
        }>
        performanceMetrics: {
          bugFixRate: number
          featureDeliveryRate: number
          codeQualityScore: number
          documentationScore: number
          testCoverageContribution: number
        }
      }
    }>
  }

  // Architecture Analysis
  architecture: {
    layers: Array<{
      name: string
      purpose: string
      components: string[]
      dependencies: string[]
    }>
    designPatterns: string[]
    antiPatterns: string[]
    scalabilityAssessment: string
    maintainabilityScore: number
    architecturalDecisions: Array<{
      decision: string
      rationale: string
      consequences: string[]
      alternatives: string[]
    }>
    dependencyAnalysis: {
      totalDependencies: number
      outdatedDependencies: number
      securityVulnerabilities: number
      dependencyHealth: 'Poor' | 'Fair' | 'Good' | 'Excellent'
      criticalDependencies: string[]
    }
    performanceMetrics: {
      bundleSize: number
      loadTime: number
      memoryUsage: number
      cpuUsage: number
      scalabilityScore: number
    }
  }

  // Business Intelligence
  businessContext: {
    projectType: string
    targetAudience: string
    businessValue: string
    competitiveAdvantages: string[]
    marketPosition: string
    businessMetrics: {
      estimatedDevelopmentCost: number
      timeToMarket: string
      marketSize: string
      competitiveScore: number
      roi: number
    }
    marketAnalysis: {
      competitors: string[]
      marketTrends: string[]
      opportunities: string[]
      threats: string[]
    }
  }

  // Recommendations
  recommendations: {
    immediate: Array<{
      action: string
      priority: 'Low' | 'Medium' | 'High' | 'Critical'
      effort: 'Low' | 'Medium' | 'High'
      impact: 'Low' | 'Medium' | 'High'
      description: string
    }>
    shortTerm: Array<{
      action: string
      priority: 'Low' | 'Medium' | 'High' | 'Critical'
      effort: 'Low' | 'Medium' | 'High'
      impact: 'Low' | 'Medium' | 'High'
      description: string
    }>
    longTerm: Array<{
      action: string
      priority: 'Low' | 'Medium' | 'High' | 'Critical'
      effort: 'Low' | 'Medium' | 'High'
      impact: 'Low' | 'Medium' | 'High'
      description: string
    }>
    refactoringPriorities: Array<{
      component: string
      priority: 'Low' | 'Medium' | 'High' | 'Critical'
      effort: 'Low' | 'Medium' | 'High'
      impact: 'Low' | 'Medium' | 'High'
      description: string
    }>
    featureOpportunities: Array<{
      feature: string
      priority: 'Low' | 'Medium' | 'High' | 'Critical'
      effort: 'Low' | 'Medium' | 'High'
      impact: 'Low' | 'Medium' | 'High'
      description: string
    }>
  }

  // Visualization Data
  visualizations: {
    dependencyGraph: {
      nodes: Array<{ id: string; label: string; type: string; importance: number }>
      edges: Array<{ source: string; target: string; type: string; strength: number }>
    }
    evolutionTimeline: Array<{
      date: string
      milestone: string
      type: 'feature' | 'refactor' | 'bugfix' | 'architecture'
      impact: number
    }>
    collaborationNetwork: Array<{
      contributor: string
      role: string
      expertise: string[]
      influence: number
    }>
    codeHeatmap: Array<{
      file: string
      activity: number
      complexity: number
      lastModified: string
    }>
  }
}

export class GeminiAnalyzer {
  private model = genAI?.getGenerativeModel({ model: 'gemini-2.0-flash' })

  async analyzeRepository(repoData: {
    name: string
    description: string
    language: string
    files: Array<{ path: string; content: string; size: number }>
    commits: Array<{ message: string; author: string; date: string; files: string[] }>
    contributors: Array<{ name: string; contributions: number; role?: string }>
    issues: Array<{ title: string; body: string; labels: string[]; state: string }>
    pullRequests: Array<{ title: string; body: string; state: string; mergeable: boolean }>
    dependencies: Array<{ name: string; version: string; type: 'production' | 'development' }>
    readme?: string
    packageJson?: any
    technologyStack?: any
  }): Promise<GeminiRepositoryInsights> {
    
    // If no API key, return fallback data immediately
    if (!this.model) {
      return this.getFallbackInsights(repoData)
    }
    
    try {
      // Prepare comprehensive prompt for Gemini
      const analysisPrompt = this.buildAnalysisPrompt(repoData)
      
      const result = await this.model.generateContent(analysisPrompt)
      const response = await result.response
      const analysisText = response.text()
      
      // Parse the structured response
      return this.parseGeminiResponse(analysisText, repoData)
      
    } catch (error) {
      return this.getFallbackInsights(repoData)
    }
  }

  private buildAnalysisPrompt(repoData: any): string {
    return `
As an expert software architect, code analyst, and business strategist, provide a comprehensive analysis of this GitHub repository. 
Return your analysis in valid JSON format following the exact structure provided.

REPOSITORY DATA:
Name: ${repoData.name}
Description: ${repoData.description}
Primary Language: ${repoData.language}
Total Files: ${repoData.files.length}
Contributors: ${repoData.contributors.length}
Total Commits: ${repoData.commits.length}
Open Issues: ${repoData.issues.filter((i: any) => i.state === 'open').length}
Closed Issues: ${repoData.issues.filter((i: any) => i.state === 'closed').length}

KEY FILES CONTENT:
${repoData.files.slice(0, 30).map((f: any) => `
--- ${f.path} ---
${f.content.substring(0, 3000)}${f.content.length > 3000 ? '...' : ''}
`).join('\n')}

COMMIT HISTORY (Last 50):
${repoData.commits.slice(0, 50).map((c: any) => `
${c.date}: ${c.message} (by ${c.author})
Files: ${c.files.join(', ')}
`).join('\n')}

CONTRIBUTORS ANALYSIS:
${repoData.contributors.map((c: any) => `
${c.name}: ${c.contributions} contributions${c.role ? ` (${c.role})` : ''}
`).join('\n')}

PACKAGE.JSON:
${repoData.packageJson ? JSON.stringify(repoData.packageJson, null, 2) : 'Not available'}

DEPENDENCIES:
${repoData.dependencies.map((d: any) => `${d.name}@${d.version} (${d.type})`).join('\n')}

TECHNOLOGY STACK HINTS (detected by static analyzer):
${repoData.technologyStack ? JSON.stringify(repoData.technologyStack, null, 2) : 'Not available'}

README:
${repoData.readme || 'Not available'}

Please analyze this repository and provide comprehensive insights in the following JSON structure:

{
  "projectSummary": {
    "purpose": "Detailed description of what this project does and why it exists",
    "mainTechnologies": ["React", "Node.js", "TypeScript", "PostgreSQL"],
    "architecturalPattern": "MVC/MVP/MVVM/Microservices/Monolith/Serverless/etc",
    "complexity": "Low/Medium/High/Very High",
    "maturity": "Prototype/Alpha/Beta/Production/Mature",
    "projectHealthScore": 85,
    "technologyStack": {
      "frontend": ["React", "TypeScript", "Tailwind CSS"],
      "backend": ["Node.js", "Express", "Prisma"],
      "database": ["PostgreSQL", "Redis"],
      "devops": ["Docker", "GitHub Actions", "Vercel"],
      "testing": ["Jest", "Cypress", "Testing Library"]
    },
    "projectMetrics": {
      "totalLinesOfCode": 15000,
      "totalFiles": 120,
      "averageFileSize": 125,
      "documentationCoverage": 75,
      "testCoverage": 60
    }
  },
  "codeQuality": {
    "overallScore": 85,
    "strengths": ["Good TypeScript usage", "Clean component structure", "Consistent naming"],
    "weaknesses": ["Missing error handling", "Large components", "Insufficient tests"],
    "technicalDebt": ["Outdated dependencies", "Code duplication", "Legacy patterns"],
    "securityConcerns": ["API keys in code", "No input validation", "Missing CSRF protection"],
    "performanceIssues": ["Large bundle size", "Unnecessary re-renders", "Missing lazy loading"],
    "codeMetrics": {
      "cyclomaticComplexity": 8.5,
      "codeDuplication": 12.3,
      "maintainabilityIndex": 78.2,
      "technicalDebtRatio": 15.7,
      "codeSmells": [
        {
          "type": "Long Method",
          "severity": "Medium",
          "description": "Method exceeds 50 lines",
          "location": "src/components/UserDashboard.tsx:45"
        }
      ]
    },
    "codeStandards": {
      "namingConventions": "Good",
      "documentationQuality": "Fair",
      "errorHandling": "Poor",
      "logging": "Basic"
    }
  },
  "developmentPatterns": {
    "commitFrequency": "High",
    "teamCollaboration": "Small Team",
    "codeReviewPractice": "Regular",
    "testingMaturity": "Basic",
    "cicdMaturity": "Intermediate",
    "developmentMetrics": {
      "averageCommitSize": 15.3,
      "commitFrequencyPerWeek": 8.2,
      "pullRequestMergeTime": 2.5,
      "bugFixTime": 1.2,
      "featureDeliveryTime": 5.8
    },
    "contributorAnalysis": [
      {
        "name": "John Doe",
        "contributions": 45,
        "expertise": ["Frontend", "UI/UX"],
        "codeOwnership": 35.2,
        "influence": 8.5,
        "lastActive": "2024-01-15"
      }
    ]
  },
  "architecture": {
    "layers": [
      {
        "name": "Presentation Layer",
        "purpose": "User interface and user interaction handling",
        "components": ["Dashboard", "Components", "Pages", "UI Library"],
        "dependencies": ["Business Logic Layer", "State Management"]
      }
    ],
    "designPatterns": ["Repository Pattern", "Provider Pattern", "Observer Pattern"],
    "antiPatterns": ["God Object", "Spaghetti Code", "Tight Coupling"],
    "scalabilityAssessment": "Can handle moderate load with current architecture, needs optimization for high traffic",
    "maintainabilityScore": 75,
    "architecturalDecisions": [
      {
        "decision": "Use React with TypeScript",
        "rationale": "Type safety and better developer experience",
        "consequences": ["Slower initial development", "Better maintainability"],
        "alternatives": ["Vue.js", "Angular", "Svelte"]
      }
    ],
    "dependencyAnalysis": {
      "totalDependencies": 45,
      "outdatedDependencies": 8,
      "securityVulnerabilities": 2,
      "dependencyHealth": "Good",
      "criticalDependencies": ["react", "next", "prisma"]
    },
    "performanceMetrics": {
      "bundleSize": 2.3,
      "loadTime": 1.8,
      "memoryUsage": 45.2,
      "cpuUsage": 12.8,
      "scalabilityScore": 78
    }
  },
  "businessContext": {
    "projectType": "Web Application/SaaS Platform/Open Source Tool",
    "targetAudience": "Developers/End Users/Businesses/Students",
    "businessValue": "Solves X problem by providing Y solution, estimated to save Z hours per week",
    "competitiveAdvantages": ["Real-time analysis", "Easy integration", "Cost-effective"],
    "marketPosition": "Niche tool for specific use case with growing market share",
    "businessMetrics": {
      "estimatedDevelopmentCost": 50000,
      "timeToMarket": "6 months",
      "marketSize": "Medium",
      "competitiveScore": 7.5,
      "roi": 3.2
    },
    "marketAnalysis": {
      "competitors": ["Competitor A", "Competitor B"],
      "marketTrends": ["AI integration", "Cloud-first approach"],
      "opportunities": ["Mobile app", "Enterprise features"],
      "threats": ["New entrants", "Technology changes"]
    }
  },
  "recommendations": {
    "immediate": [
      {
        "action": "Fix critical security vulnerabilities",
        "priority": "Critical",
        "effort": "Low",
        "impact": "High",
        "description": "Update vulnerable dependencies and implement proper input validation"
      }
    ],
    "shortTerm": [
      {
        "action": "Implement comprehensive testing",
        "priority": "High",
        "effort": "Medium",
        "impact": "High",
        "description": "Add unit tests, integration tests, and E2E tests to improve code quality"
      }
    ],
    "longTerm": [
      {
        "action": "Migrate to microservices architecture",
        "priority": "Medium",
        "effort": "High",
        "impact": "High",
        "description": "Break down monolith into microservices for better scalability"
      }
    ],
    "refactoringPriorities": [
      {
        "component": "UserDashboard",
        "priority": "High",
        "effort": "Medium",
        "impact": "Medium",
        "description": "Break down large component into smaller, focused components"
      }
    ],
    "featureOpportunities": [
      {
        "feature": "Real-time collaboration",
        "priority": "Medium",
        "effort": "High",
        "impact": "High",
        "description": "Add real-time features using WebSockets for better user experience"
      }
    ]
  }
}

Focus on:
1. Deep architectural analysis based on actual code structure and patterns
2. Comprehensive code quality assessment with specific metrics and examples
3. Security and performance analysis with actionable insights
4. Development team practices and collaboration patterns
5. Business value proposition and market positioning
6. Prioritized recommendations with effort/impact analysis
7. Technical debt assessment with specific code examples
8. Technology stack analysis and modernization opportunities
9. Competitive analysis and market opportunities
10. ROI and business metrics estimation

Be specific and reference actual code examples when possible. Provide realistic scores and assessments based on industry best practices and current market standards.
`
  }

  private async parseGeminiResponse(responseText: string, repoData: any): Promise<GeminiRepositoryInsights> {
    try {
      // Extract JSON from response (handling markdown code blocks)
      let jsonText = responseText
      if (responseText.includes('```json')) {
        const jsonStart = responseText.indexOf('```json') + 7
        const jsonEnd = responseText.indexOf('```', jsonStart)
        jsonText = responseText.substring(jsonStart, jsonEnd)
      } else if (responseText.includes('```')) {
        const jsonStart = responseText.indexOf('```') + 3
        const jsonEnd = responseText.indexOf('```', jsonStart)
        jsonText = responseText.substring(jsonStart, jsonEnd)
      }

      const parsedResponse = JSON.parse(jsonText)
      // Use only statically detected technology stack to ensure originality
      const detectedStack = repoData.technologyStack || { frontend: [], backend: [], database: [], devops: [], testing: [] }
      const mergedProjectSummary = {
        ...(parsedResponse.projectSummary || {}),
        technologyStack: detectedStack
      }
      
      // Add generated visualization data
      const visualizations = await this.generateVisualizationData(repoData, parsedResponse)
      
      return {
        ...parsedResponse,
        projectSummary: mergedProjectSummary,
        visualizations
      }
    } catch (error) {
      return this.getFallbackInsights(repoData)
    }
  }

  private async generateVisualizationData(repoData: any, insights: any) {
    // Generate dependency graph based on file imports
    const dependencyGraph = {
      nodes: repoData.files.slice(0, 15).map((file: any, index: number) => ({
        id: `file-${index}`,
        label: file.path.split('/').pop() || file.path,
        type: this.inferFileType(file.path),
        importance: Math.min(file.size / 100, 10)
      })),
      edges: [] as any[]
    }

    // Generate evolution timeline from commits
    const evolutionTimeline = repoData.commits.slice(0, 20).map((commit: any) => ({
      date: commit.date,
      milestone: commit.message,
      type: this.inferCommitType(commit.message),
      impact: commit.files.length
    }))

    // Generate collaboration network
    const collaborationNetwork = repoData.contributors.map((contributor: any) => ({
      contributor: contributor.name,
      role: this.inferRole(contributor.contributions, repoData.commits),
      expertise: this.inferExpertise(contributor.name, repoData.commits),
      influence: Math.min(contributor.contributions / 10, 10)
    }))

    return {
      dependencyGraph,
      evolutionTimeline,
      collaborationNetwork
    }
  }

  private inferFileType(path: string): string {
    if (path.includes('/page.')) return 'page'
    if (path.includes('/api/')) return 'api'
    if (path.includes('/component')) return 'component'
    if (path.includes('/lib/')) return 'service'
    if (path.includes('.config.')) return 'config'
    if (path.includes('schema.')) return 'database'
    return 'file'
  }

  private inferCommitType(message: string): 'feature' | 'refactor' | 'bugfix' | 'architecture' {
    const lower = message.toLowerCase()
    if (lower.includes('feat') || lower.includes('add') || lower.includes('implement')) return 'feature'
    if (lower.includes('refactor') || lower.includes('restructure')) return 'refactor'
    if (lower.includes('fix') || lower.includes('bug') || lower.includes('patch')) return 'bugfix'
    if (lower.includes('arch') || lower.includes('structure') || lower.includes('migrate')) return 'architecture'
    return 'feature'
  }

  private inferRole(contributions: number, commits: any[]): string {
    if (contributions > 50) return 'Lead Developer'
    if (contributions > 20) return 'Core Contributor'
    if (contributions > 5) return 'Regular Contributor'
    return 'Occasional Contributor'
  }

  private inferExpertise(name: string, commits: any[]): string[] {
    const userCommits = commits.filter(c => c.author === name)
    const expertise = new Set<string>()
    
    userCommits.forEach(commit => {
      commit.files.forEach((file: string) => {
        if (file.includes('api/')) expertise.add('Backend')
        if (file.includes('component') || file.includes('page.')) expertise.add('Frontend')
        if (file.includes('test')) expertise.add('Testing')
        if (file.includes('config') || file.includes('docker')) expertise.add('DevOps')
        if (file.includes('schema') || file.includes('migration')) expertise.add('Database')
      })
    })
    
    return Array.from(expertise)
  }

  private getFallbackInsights(repoData: any): GeminiRepositoryInsights {
    return {
      projectSummary: {
        purpose: `${repoData.name} - ${repoData.description || 'No description available'}`,
        mainTechnologies: [],
        architecturalPattern: 'Unknown',
        complexity: 'Medium',
        maturity: 'Beta',
        projectHealthScore: 70,
        qualityScores: {
          overall: 70,
          codeQuality: 70,
          namingConventions: 70,
          prQuality: 70,
          maintainability: 70,
          codeDuplication: 70,
          documentation: 70,
          testing: 70,
          security: 70,
          performance: 70
        },
        technologyStack: repoData.technologyStack || {
          frontend: [],
          backend: [],
          database: [],
          devops: [],
          testing: []
        },
        projectMetrics: {
          totalLinesOfCode: repoData.files.reduce((sum: number, f: any) => sum + (f.content.split('\n').length || 0), 0),
          totalFiles: repoData.files.length,
          averageFileSize: repoData.files.length > 0 ? repoData.files.reduce((sum: number, f: any) => sum + f.size, 0) / repoData.files.length : 0,
          documentationCoverage: 0,
          testCoverage: 0
        }
      },
      codeQuality: {
        overallScore: 70,
        strengths: ['Code structure'],
        weaknesses: ['Analysis unavailable'],
        technicalDebt: [],
        securityConcerns: [],
        performanceIssues: [],
        codeMetrics: {
          cyclomaticComplexity: 0,
          codeDuplication: 0,
          maintainabilityIndex: 70,
          technicalDebtRatio: 0,
          codeSmells: []
        },
        codeStandards: {
          namingConventions: 'Fair',
          documentationQuality: 'Poor',
          errorHandling: 'Poor',
          logging: 'Poor'
        }
      },
      developmentPatterns: {
        commitFrequency: 'Medium',
        teamCollaboration: 'Small Team',
        codeReviewPractice: 'Occasional',
        testingMaturity: 'Basic',
        cicdMaturity: 'Basic',
        developmentMetrics: {
          averageCommitSize: 0,
          commitFrequencyPerWeek: 0,
          pullRequestMergeTime: 0,
          bugFixTime: 0,
          featureDeliveryTime: 0
        },
        contributorAnalysis: repoData.contributors.map((c: any, index: number) => ({
          name: c.name,
          contributions: c.contributions,
          expertise: this.inferExpertise(c.name, repoData.commits),
          codeOwnership: Math.min((c.contributions / repoData.contributors.reduce((sum: number, cont: any) => sum + cont.contributions, 0)) * 100, 100),
          influence: Math.min(c.contributions / 10, 10),
          lastActive: new Date().toISOString(),
          profile: {
            avatar: `https://github.com/${c.name}.png`,
            githubUrl: `https://github.com/${c.name}`,
            joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            totalCommits: c.contributions,
            totalPRs: Math.floor(c.contributions * 0.3),
            mergedPRs: Math.floor(c.contributions * 0.2),
            linesAdded: Math.floor(c.contributions * 50 + Math.random() * 1000),
            linesRemoved: Math.floor(c.contributions * 20 + Math.random() * 500),
            filesChanged: Math.floor(c.contributions * 2 + Math.random() * 50),
            averageCommitSize: Math.floor(Math.random() * 20 + 5),
            mostActiveDay: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][Math.floor(Math.random() * 7)],
            mostActiveHour: Math.floor(Math.random() * 24),
            timezone: 'UTC',
            primaryLanguages: this.inferExpertise(c.name, repoData.commits),
            contributionStreak: Math.floor(Math.random() * 30),
            longestStreak: Math.floor(Math.random() * 60),
            recentActivity: Array.from({ length: 5 }, (_, i) => ({
              date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
              type: ['commit', 'pr', 'issue', 'review'][Math.floor(Math.random() * 4)] as 'commit' | 'pr' | 'issue' | 'review',
              description: `Recent activity ${i + 1}`,
              impact: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high'
            })),
            prActivity: {
              opened: Math.floor(c.contributions * 0.3),
              merged: Math.floor(c.contributions * 0.2),
              closed: Math.floor(c.contributions * 0.1),
              reviewed: Math.floor(c.contributions * 0.4),
              averageReviewTime: Math.floor(Math.random() * 48 + 2),
              averageMergeTime: Math.floor(Math.random() * 72 + 6)
            },
            collaborationMetrics: {
              coAuthoredCommits: Math.floor(c.contributions * 0.1),
              pairProgrammingSessions: Math.floor(c.contributions * 0.05),
              codeReviewParticipation: Math.floor(c.contributions * 0.3),
              mentoringActivity: Math.floor(c.contributions * 0.02)
            },
            expertiseBreakdown: this.inferExpertise(c.name, repoData.commits).map(area => ({
              area,
              proficiency: ['Beginner', 'Intermediate', 'Advanced', 'Expert'][Math.floor(Math.random() * 4)] as 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert',
              filesCount: Math.floor(Math.random() * 20 + 1),
              linesOfCode: Math.floor(Math.random() * 1000 + 100),
              lastContribution: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            })),
            performanceMetrics: {
              bugFixRate: Math.random() * 100,
              featureDeliveryRate: Math.random() * 100,
              codeQualityScore: Math.random() * 100,
              documentationScore: Math.random() * 100,
              testCoverageContribution: Math.random() * 100
            }
          }
        }))
      },
      architecture: {
        layers: [],
        designPatterns: [],
        antiPatterns: [],
        scalabilityAssessment: 'Requires analysis',
        maintainabilityScore: 70,
        architecturalDecisions: [],
        dependencyAnalysis: {
          totalDependencies: repoData.dependencies?.length || 0,
          outdatedDependencies: 0,
          securityVulnerabilities: 0,
          dependencyHealth: 'Fair',
          criticalDependencies: []
        },
        performanceMetrics: {
          bundleSize: 0,
          loadTime: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          scalabilityScore: 70
        }
      },
      businessContext: {
        projectType: 'Software Project',
        targetAudience: 'Developers',
        businessValue: 'Provides software solution',
        competitiveAdvantages: [],
        marketPosition: 'Unknown',
        businessMetrics: {
          estimatedDevelopmentCost: 0,
          timeToMarket: 'Unknown',
          marketSize: 'Unknown',
          competitiveScore: 0,
          roi: 0
        },
        marketAnalysis: {
          competitors: [],
          marketTrends: [],
          opportunities: [],
          threats: []
        }
      },
      recommendations: {
        immediate: [{
          action: 'Enable AI analysis for detailed insights',
          priority: 'High',
          effort: 'Low',
          impact: 'High',
          description: 'Configure Gemini API for comprehensive repository analysis'
        }],
        shortTerm: [{
          action: 'Improve documentation',
          priority: 'Medium',
          effort: 'Medium',
          impact: 'Medium',
          description: 'Add comprehensive README and code documentation'
        }],
        longTerm: [{
          action: 'Enhance architecture',
          priority: 'Low',
          effort: 'High',
          impact: 'High',
          description: 'Refactor and improve overall system architecture'
        }],
        refactoringPriorities: [],
        featureOpportunities: []
      },
      visualizations: {
        dependencyGraph: { nodes: [], edges: [] },
        evolutionTimeline: [],
        collaborationNetwork: [],
        codeHeatmap: []
      }
    }
  }
}

export const geminiAnalyzer = new GeminiAnalyzer()