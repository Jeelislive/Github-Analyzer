import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyBxpthMpKv3no8iypYeLcVHxjSEclV1Guo')

export interface GeminiRepositoryInsights {
  // Core Analysis
  projectSummary: {
    purpose: string
    mainTechnologies: string[]
    architecturalPattern: string
    complexity: 'Low' | 'Medium' | 'High' | 'Very High'
    maturity: 'Prototype' | 'Alpha' | 'Beta' | 'Production' | 'Mature'
  }

  // Code Quality Assessment
  codeQuality: {
    overallScore: number // 0-100
    strengths: string[]
    weaknesses: string[]
    technicalDebt: string[]
    securityConcerns: string[]
    performanceIssues: string[]
  }

  // Development Insights
  developmentPatterns: {
    commitFrequency: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High'
    teamCollaboration: 'Solo' | 'Small Team' | 'Medium Team' | 'Large Team'
    codeReviewPractice: 'None' | 'Occasional' | 'Regular' | 'Strict'
    testingMaturity: 'None' | 'Basic' | 'Good' | 'Excellent'
    cicdMaturity: 'None' | 'Basic' | 'Intermediate' | 'Advanced'
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
  }

  // Business Intelligence
  businessContext: {
    projectType: string
    targetAudience: string
    businessValue: string
    competitiveAdvantages: string[]
    marketPosition: string
  }

  // Recommendations
  recommendations: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
    refactoringPriorities: string[]
    featureOpportunities: string[]
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
  }
}

export class GeminiAnalyzer {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

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
  }): Promise<GeminiRepositoryInsights> {
    
    try {
      // Prepare comprehensive prompt for Gemini
      const analysisPrompt = this.buildAnalysisPrompt(repoData)
      
      const result = await this.model.generateContent(analysisPrompt)
      const response = await result.response
      const analysisText = response.text()
      
      // Parse the structured response
      return this.parseGeminiResponse(analysisText, repoData)
      
    } catch (error) {
      console.error('Gemini analysis failed:', error)
      return this.getFallbackInsights(repoData)
    }
  }

  private buildAnalysisPrompt(repoData: any): string {
    return `
As an expert software architect and code analyst, provide a comprehensive analysis of this GitHub repository. 
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
${repoData.files.slice(0, 20).map((f: any) => `
--- ${f.path} ---
${f.content.substring(0, 2000)}${f.content.length > 2000 ? '...' : ''}
`).join('\n')}

COMMIT HISTORY (Last 20):
${repoData.commits.slice(0, 20).map((c: any) => `
${c.date}: ${c.message} (by ${c.author})
Files: ${c.files.join(', ')}
`).join('\n')}

PACKAGE.JSON:
${repoData.packageJson ? JSON.stringify(repoData.packageJson, null, 2) : 'Not available'}

README:
${repoData.readme || 'Not available'}

Please analyze this repository and provide insights in the following JSON structure:

{
  "projectSummary": {
    "purpose": "What this project does and why it exists",
    "mainTechnologies": ["React", "Node.js", "TypeScript"],
    "architecturalPattern": "MVC/MVP/MVVM/Microservices/Monolith/etc",
    "complexity": "Low/Medium/High/Very High",
    "maturity": "Prototype/Alpha/Beta/Production/Mature"
  },
  "codeQuality": {
    "overallScore": 85,
    "strengths": ["Good TypeScript usage", "Clean component structure"],
    "weaknesses": ["Missing error handling", "Large components"],
    "technicalDebt": ["Outdated dependencies", "Code duplication"],
    "securityConcerns": ["API keys in code", "No input validation"],
    "performanceIssues": ["Large bundle size", "Unnecessary re-renders"]
  },
  "developmentPatterns": {
    "commitFrequency": "High",
    "teamCollaboration": "Small Team",
    "codeReviewPractice": "Regular",
    "testingMaturity": "Basic",
    "cicdMaturity": "Intermediate"
  },
  "architecture": {
    "layers": [
      {
        "name": "Presentation Layer",
        "purpose": "User interface and user interaction",
        "components": ["Dashboard", "Components", "Pages"],
        "dependencies": ["Business Logic Layer"]
      }
    ],
    "designPatterns": ["Repository Pattern", "Provider Pattern"],
    "antiPatterns": ["God Object", "Spaghetti Code"],
    "scalabilityAssessment": "Can handle moderate load with current architecture",
    "maintainabilityScore": 75
  },
  "businessContext": {
    "projectType": "Web Application/Library/Tool/etc",
    "targetAudience": "Developers/End Users/Businesses",
    "businessValue": "Solves X problem by providing Y solution",
    "competitiveAdvantages": ["Real-time analysis", "Easy integration"],
    "marketPosition": "Niche tool for specific use case"
  },
  "recommendations": {
    "immediate": ["Fix critical security issues", "Add error boundaries"],
    "shortTerm": ["Implement testing", "Optimize performance"],
    "longTerm": ["Migrate to microservices", "Add monitoring"],
    "refactoringPriorities": ["Break down large components", "Extract common logic"],
    "featureOpportunities": ["Real-time collaboration", "Mobile app"]
  }
}

Focus on:
1. Deep architectural analysis based on actual code structure
2. Identification of design patterns and anti-patterns
3. Security and performance assessment
4. Development team practices based on commit patterns
5. Business value and market positioning
6. Actionable recommendations prioritized by impact
7. Technical debt assessment with specific examples

Be specific and reference actual code examples when possible. Provide scores and assessments based on industry best practices.
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
      
      // Add generated visualization data
      const visualizations = await this.generateVisualizationData(repoData, parsedResponse)
      
      return {
        ...parsedResponse,
        visualizations
      }
    } catch (error) {
      console.error('Failed to parse Gemini response:', error)
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
        mainTechnologies: [repoData.language || 'Unknown'],
        architecturalPattern: 'Unknown',
        complexity: 'Medium',
        maturity: 'Beta'
      },
      codeQuality: {
        overallScore: 70,
        strengths: ['Code structure'],
        weaknesses: ['Analysis unavailable'],
        technicalDebt: [],
        securityConcerns: [],
        performanceIssues: []
      },
      developmentPatterns: {
        commitFrequency: 'Medium',
        teamCollaboration: 'Small Team',
        codeReviewPractice: 'Occasional',
        testingMaturity: 'Basic',
        cicdMaturity: 'Basic'
      },
      architecture: {
        layers: [],
        designPatterns: [],
        antiPatterns: [],
        scalabilityAssessment: 'Requires analysis',
        maintainabilityScore: 70
      },
      businessContext: {
        projectType: 'Software Project',
        targetAudience: 'Developers',
        businessValue: 'Provides software solution',
        competitiveAdvantages: [],
        marketPosition: 'Unknown'
      },
      recommendations: {
        immediate: ['Enable AI analysis for detailed insights'],
        shortTerm: ['Improve documentation'],
        longTerm: ['Enhance architecture'],
        refactoringPriorities: [],
        featureOpportunities: []
      },
      visualizations: {
        dependencyGraph: { nodes: [], edges: [] },
        evolutionTimeline: [],
        collaborationNetwork: []
      }
    }
  }
}

export const geminiAnalyzer = new GeminiAnalyzer()