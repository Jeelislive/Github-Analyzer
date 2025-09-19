import { EnhancedRepositoryData } from './enhanced-github-analyzer'

export interface QualityScore {
  overall: number
  codeQuality: number
  namingConventions: number
  prQuality: number
  maintainability: number
  codeDuplication: number
  documentation: number
  testing: number
  security: number
  performance: number
}

export interface ScoringFactors {
  codeQuality: {
    complexity: number
    structure: number
    patterns: number
    bestPractices: number
  }
  namingConventions: {
    consistency: number
    clarity: number
    conventions: number
  }
  prQuality: {
    description: number
    size: number
    review: number
    testing: number
  }
  maintainability: {
    modularity: number
    coupling: number
    cohesion: number
    documentation: number
  }
  codeDuplication: {
    duplication: number
    reusability: number
    abstraction: number
  }
  documentation: {
    readme: number
    comments: number
    apiDocs: number
    examples: number
  }
  testing: {
    coverage: number
    quality: number
    automation: number
  }
  security: {
    vulnerabilities: number
    practices: number
    dependencies: number
  }
  performance: {
    optimization: number
    efficiency: number
    monitoring: number
  }
}

export class ScoringAnalyzer {
  analyzeQualityScores(data: EnhancedRepositoryData): QualityScore {
    console.log('📊 Analyzing quality scores...')
    
    const factors = this.analyzeScoringFactors(data)
    
    const scores: QualityScore = {
      overall: this.calculateOverallScore(factors),
      codeQuality: this.calculateCodeQualityScore(factors.codeQuality),
      namingConventions: this.calculateNamingConventionsScore(factors.namingConventions),
      prQuality: this.calculatePRQualityScore(factors.prQuality),
      maintainability: this.calculateMaintainabilityScore(factors.maintainability),
      codeDuplication: this.calculateCodeDuplicationScore(factors.codeDuplication),
      documentation: this.calculateDocumentationScore(factors.documentation),
      testing: this.calculateTestingScore(factors.testing),
      security: this.calculateSecurityScore(factors.security),
      performance: this.calculatePerformanceScore(factors.performance)
    }

    console.log(`✅ Quality scoring complete: Overall score ${scores.overall}/100`)
    
    return scores
  }

  private analyzeScoringFactors(data: EnhancedRepositoryData): ScoringFactors {
    return {
      codeQuality: this.analyzeCodeQuality(data),
      namingConventions: this.analyzeNamingConventions(data),
      prQuality: this.analyzePRQuality(data),
      maintainability: this.analyzeMaintainability(data),
      codeDuplication: this.analyzeCodeDuplication(data),
      documentation: this.analyzeDocumentation(data),
      testing: this.analyzeTesting(data),
      security: this.analyzeSecurity(data),
      performance: this.analyzePerformance(data)
    }
  }

  private analyzeCodeQuality(data: EnhancedRepositoryData): ScoringFactors['codeQuality'] {
    const files = data.content.files || []
    const commits = data.activity.commits || []
    
    let complexity = 0
    let structure = 0
    let patterns = 0
    let bestPractices = 0

    // Analyze complexity
    const totalLines = files.reduce((sum, file) => sum + (file.size || 0), 0)
    const avgFileSize = totalLines / files.length
    complexity = Math.max(0, 100 - (avgFileSize / 100)) // Smaller files = better

    // Analyze structure
    const hasProperStructure = this.hasProperProjectStructure(files)
    const hasConfigFiles = this.hasConfigFiles(files)
    structure = (hasProperStructure ? 50 : 0) + (hasConfigFiles ? 50 : 0)

    // Analyze patterns
    const patternScore = this.analyzeDesignPatterns(files)
    patterns = patternScore

    // Analyze best practices
    const bestPracticesScore = this.analyzeBestPractices(files, commits)
    bestPractices = bestPracticesScore

    return { complexity, structure, patterns, bestPractices }
  }

  private analyzeNamingConventions(data: EnhancedRepositoryData): ScoringFactors['namingConventions'] {
    const files = data.content.files || []
    
    let consistency = 0
    let clarity = 0
    let conventions = 0

    // Analyze naming consistency
    const namingPatterns = this.extractNamingPatterns(files)
    consistency = this.calculateNamingConsistency(namingPatterns)

    // Analyze clarity
    clarity = this.calculateNamingClarity(files)

    // Analyze conventions
    conventions = this.calculateNamingConventions(files)

    return { consistency, clarity, conventions }
  }

  private analyzePRQuality(data: EnhancedRepositoryData): ScoringFactors['prQuality'] {
    const pullRequests = data.collaboration.pullRequests || []
    
    if (pullRequests.length === 0) {
      return { description: 50, size: 50, review: 50, testing: 50 }
    }

    let description = 0
    let size = 0
    let review = 0
    let testing = 0

    // Analyze PR descriptions
    const avgDescriptionLength = pullRequests.reduce((sum, pr) => 
      sum + (pr.body?.length || 0), 0) / pullRequests.length
    description = Math.min(100, avgDescriptionLength / 10) // 1000 chars = 100%

    // Analyze PR size
    const avgPRSize = pullRequests.reduce((sum, pr) => 
      sum + ((pr as any).additions || 0) + ((pr as any).deletions || 0), 0) / pullRequests.length
    size = Math.max(0, 100 - (avgPRSize / 50)) // Smaller PRs = better

    // Analyze review process (simplified)
    review = 70 // Assume good review process

    // Analyze testing in PRs
    const prsWithTests = pullRequests.filter(pr => 
      pr.body?.toLowerCase().includes('test') || 
      pr.title?.toLowerCase().includes('test')
    ).length
    testing = (prsWithTests / pullRequests.length) * 100

    return { description, size, review, testing }
  }

  private analyzeMaintainability(data: EnhancedRepositoryData): ScoringFactors['maintainability'] {
    const files = data.content.files || []
    const architecture = data.architecture
    
    let modularity = 0
    let coupling = 0
    let cohesion = 0
    let documentation = 0

    // Analyze modularity
    if (architecture) {
      const avgConnections = architecture.stats.averageConnections
      modularity = Math.max(0, 100 - (avgConnections * 10)) // Lower coupling = better
    } else {
      modularity = 50 // Default
    }

    // Analyze coupling
    coupling = this.calculateCoupling(files)

    // Analyze cohesion
    cohesion = this.calculateCohesion(files)

    // Analyze documentation
    documentation = this.calculateDocumentationScore(files)

    return { modularity, coupling, cohesion, documentation }
  }

  private analyzeCodeDuplication(data: EnhancedRepositoryData): ScoringFactors['codeDuplication'] {
    const files = data.content.files || []
    
    let duplication = 0
    let reusability = 0
    let abstraction = 0

    // Analyze duplication (simplified)
    duplication = this.calculateCodeDuplication(files)

    // Analyze reusability
    reusability = this.calculateReusability(files)

    // Analyze abstraction
    abstraction = this.calculateAbstraction(files)

    return { duplication, reusability, abstraction }
  }

  private analyzeDocumentation(data: EnhancedRepositoryData): ScoringFactors['documentation'] {
    const files = data.content.files || []
    const readme = data.content.readme
    
    let readmeScore = 0
    let comments = 0
    let apiDocs = 0
    let examples = 0

    // Analyze README
    if (readme?.content) {
      const readmeLength = readme.content.length
      readmeScore = Math.min(100, readmeLength / 50) // 5000 chars = 100%
    }

    // Analyze comments
    comments = this.calculateCommentDensity(files)

    // Analyze API docs
    apiDocs = this.calculateAPIDocumentation(files)

    // Analyze examples
    examples = this.calculateExamples(files)

    return { readme: readmeScore, comments, apiDocs, examples }
  }

  private analyzeTesting(data: EnhancedRepositoryData): ScoringFactors['testing'] {
    const files = data.content.files || []
    const dependencies = data.dependencies
    
    let coverage = 0
    let quality = 0
    let automation = 0

    // Analyze test coverage (simplified)
    const testFiles = files.filter(file => 
      file.name.includes('.test.') || 
      file.name.includes('.spec.') ||
      file.path.includes('/test/') ||
      file.path.includes('/tests/')
    ).length
    
    coverage = Math.min(100, (testFiles / files.length) * 200) // 50% test files = 100%

    // Analyze test quality
    quality = this.calculateTestQuality(files)

    // Analyze test automation
    automation = this.calculateTestAutomation(dependencies)

    return { coverage, quality, automation }
  }

  private analyzeSecurity(data: EnhancedRepositoryData): ScoringFactors['security'] {
    const dependencies = data.dependencies
    const files = data.content.files || []
    
    let vulnerabilities = 0
    let practices = 0
    let dependencyScore = 0

    // Analyze vulnerabilities (simplified)
    vulnerabilities = 80 // Assume good security practices

    // Analyze security practices
    practices = this.calculateSecurityPractices(files)

    // Analyze dependency security
    dependencyScore = this.calculateDependencySecurity(dependencies)

    return { vulnerabilities, practices, dependencies: dependencyScore }
  }

  private analyzePerformance(data: EnhancedRepositoryData): ScoringFactors['performance'] {
    const files = data.content.files || []
    
    let optimization = 0
    let efficiency = 0
    let monitoring = 0

    // Analyze optimization
    optimization = this.calculateOptimization(files)

    // Analyze efficiency
    efficiency = this.calculateEfficiency(files)

    // Analyze monitoring
    monitoring = this.calculateMonitoring(files)

    return { optimization, efficiency, monitoring }
  }

  // Helper methods for calculations
  private hasProperProjectStructure(files: any[]): boolean {
    const hasSrc = files.some(f => f.path.includes('/src/'))
    const hasConfig = files.some(f => f.name.includes('config'))
    const hasPackageJson = files.some(f => f.name === 'package.json')
    return hasSrc && hasConfig && hasPackageJson
  }

  private hasConfigFiles(files: any[]): boolean {
    const configFiles = ['package.json', 'tsconfig.json', 'next.config.js', 'tailwind.config.js']
    return configFiles.some(config => files.some(f => f.name === config))
  }

  private analyzeDesignPatterns(files: any[]): number {
    // Simplified pattern analysis
    let score = 0
    const patterns = ['factory', 'singleton', 'observer', 'strategy', 'decorator']
    
    for (const file of files) {
      if (file.content) {
        const content = file.content.toLowerCase()
        patterns.forEach(pattern => {
          if (content.includes(pattern)) score += 10
        })
      }
    }
    
    return Math.min(100, score)
  }

  private analyzeBestPractices(files: any[], commits: any[]): number {
    let score = 0
    
    // Check for TypeScript usage
    const hasTypeScript = files.some(f => f.name.endsWith('.ts') || f.name.endsWith('.tsx'))
    if (hasTypeScript) score += 20
    
    // Check for proper commit messages
    const goodCommits = commits.filter(c => c.message.length > 10).length
    if (commits.length > 0) {
      score += (goodCommits / commits.length) * 30
    }
    
    // Check for proper file organization
    const hasProperStructure = this.hasProperProjectStructure(files)
    if (hasProperStructure) score += 25
    
    // Check for configuration files
    const hasConfig = this.hasConfigFiles(files)
    if (hasConfig) score += 25
    
    return Math.min(100, score)
  }

  private extractNamingPatterns(files: any[]): string[] {
    const patterns: string[] = []
    
    for (const file of files) {
      if (file.content) {
        // Extract function names
        const functionMatches = file.content.match(/function\s+(\w+)/g)
        if (functionMatches) {
          patterns.push(...functionMatches.map(m => m.split(' ')[1]))
        }
        
        // Extract variable names
        const variableMatches = file.content.match(/const\s+(\w+)/g)
        if (variableMatches) {
          patterns.push(...variableMatches.map(m => m.split(' ')[1]))
        }
      }
    }
    
    return patterns
  }

  private calculateNamingConsistency(patterns: string[]): number {
    if (patterns.length === 0) return 50
    
    // Check for consistent naming conventions
    const camelCase = patterns.filter(p => /^[a-z][a-zA-Z0-9]*$/.test(p)).length
    const pascalCase = patterns.filter(p => /^[A-Z][a-zA-Z0-9]*$/.test(p)).length
    const snakeCase = patterns.filter(p => /^[a-z][a-z0-9_]*$/.test(p)).length
    
    const total = patterns.length
    const consistency = Math.max(camelCase, pascalCase, snakeCase) / total
    
    return consistency * 100
  }

  private calculateNamingClarity(files: any[]): number {
    // Simplified clarity analysis
    let score = 0
    
    for (const file of files) {
      if (file.content) {
        const content = file.content.toLowerCase()
        
        // Check for descriptive names
        if (content.includes('handle') || content.includes('process') || content.includes('calculate')) {
          score += 10
        }
        
        // Check for clear variable names
        if (content.includes('user') || content.includes('data') || content.includes('result')) {
          score += 5
        }
      }
    }
    
    return Math.min(100, score)
  }

  private calculateNamingConventions(files: any[]): number {
    // Check for common naming conventions
    let score = 0
    
    for (const file of files) {
      if (file.content) {
        const content = file.content
        
        // Check for proper file naming
        if (file.name.includes('-') || file.name.includes('_')) {
          score += 5
        }
        
        // Check for proper component naming
        if (content.includes('export default') && file.name.includes('.')) {
          score += 10
        }
      }
    }
    
    return Math.min(100, score)
  }

  private calculateCoupling(files: any[]): number {
    // Simplified coupling analysis
    let score = 50
    
    for (const file of files) {
      if (file.content) {
        const imports = (file.content.match(/import.*from/g) || []).length
        const exports = (file.content.match(/export/g) || []).length
        
        // Lower import/export ratio = better coupling
        if (imports > 0 && exports > 0) {
          const ratio = imports / exports
          score += ratio > 2 ? -10 : 10
        }
      }
    }
    
    return Math.max(0, Math.min(100, score))
  }

  private calculateCohesion(files: any[]): number {
    // Simplified cohesion analysis
    let score = 50
    
    for (const file of files) {
      if (file.content) {
        const lines = file.content.split('\n').length
        const functions = (file.content.match(/function|const.*=.*\(/g) || []).length
        
        // Good cohesion = reasonable functions per file
        if (functions > 0) {
          const ratio = lines / functions
          score += ratio > 20 ? -10 : 10
        }
      }
    }
    
    return Math.max(0, Math.min(100, score))
  }

  private calculateDocumentationScore(files: any[]): number {
    let score = 0
    
    for (const file of files) {
      if (file.content) {
        const content = file.content
        const lines = content.split('\n').length
        const comments = (content.match(/\/\*[\s\S]*?\*\/|\/\/.*$/gm) || []).length
        
        // Comment density
        if (lines > 0) {
          const commentRatio = comments / lines
          score += commentRatio * 100
        }
      }
    }
    
    return Math.min(100, score / files.length)
  }

  private calculateCodeDuplication(files: any[]): number {
    // Simplified duplication analysis
    let score = 50
    
    // Check for repeated code patterns
    const patterns = new Map<string, number>()
    
    for (const file of files) {
      if (file.content) {
        const lines = file.content.split('\n')
        for (const line of lines) {
          const trimmed = line.trim()
          if (trimmed.length > 20) {
            patterns.set(trimmed, (patterns.get(trimmed) || 0) + 1)
          }
        }
      }
    }
    
    // Calculate duplication score
    const duplicates = Array.from(patterns.values()).filter(count => count > 1).length
    const totalPatterns = patterns.size
    
    if (totalPatterns > 0) {
      const duplicationRatio = duplicates / totalPatterns
      score = Math.max(0, 100 - (duplicationRatio * 100))
    }
    
    return score
  }

  private calculateReusability(files: any[]): number {
    let score = 0
    
    for (const file of files) {
      if (file.content) {
        const content = file.content
        
        // Check for reusable patterns
        if (content.includes('export') && content.includes('function')) {
          score += 20
        }
        
        if (content.includes('export') && content.includes('const')) {
          score += 15
        }
        
        if (content.includes('export') && content.includes('class')) {
          score += 25
        }
      }
    }
    
    return Math.min(100, score)
  }

  private calculateAbstraction(files: any[]): number {
    let score = 0
    
    for (const file of files) {
      if (file.content) {
        const content = file.content
        
        // Check for abstraction patterns
        if (content.includes('interface') || content.includes('type')) {
          score += 20
        }
        
        if (content.includes('abstract') || content.includes('extends')) {
          score += 25
        }
        
        if (content.includes('implements')) {
          score += 15
        }
      }
    }
    
    return Math.min(100, score)
  }

  private calculateCommentDensity(files: any[]): number {
    let totalLines = 0
    let totalComments = 0
    
    for (const file of files) {
      if (file.content) {
        const lines = file.content.split('\n')
        totalLines += lines.length
        
        const comments = lines.filter(line => 
          line.trim().startsWith('//') || 
          line.trim().startsWith('/*') ||
          line.trim().startsWith('*')
        ).length
        
        totalComments += comments
      }
    }
    
    if (totalLines === 0) return 0
    
    return Math.min(100, (totalComments / totalLines) * 100)
  }

  private calculateAPIDocumentation(files: any[]): number {
    let score = 0
    
    for (const file of files) {
      if (file.content) {
        const content = file.content.toLowerCase()
        
        // Check for API documentation patterns
        if (content.includes('@api') || content.includes('@param') || content.includes('@return')) {
          score += 30
        }
        
        if (content.includes('swagger') || content.includes('openapi')) {
          score += 40
        }
        
        if (content.includes('jsdoc') || content.includes('tsdoc')) {
          score += 20
        }
      }
    }
    
    return Math.min(100, score)
  }

  private calculateExamples(files: any[]): number {
    let score = 0
    
    for (const file of files) {
      if (file.content) {
        const content = file.content.toLowerCase()
        
        // Check for example patterns
        if (content.includes('example') || content.includes('usage')) {
          score += 25
        }
        
        if (content.includes('demo') || content.includes('sample')) {
          score += 20
        }
      }
    }
    
    return Math.min(100, score)
  }

  private calculateTestQuality(files: any[]): number {
    let score = 0
    
    const testFiles = files.filter(file => 
      file.name.includes('.test.') || 
      file.name.includes('.spec.') ||
      file.path.includes('/test/') ||
      file.path.includes('/tests/')
    )
    
    for (const file of testFiles) {
      if (file.content) {
        const content = file.content
        
        // Check for test quality patterns
        if (content.includes('describe') && content.includes('it')) {
          score += 30
        }
        
        if (content.includes('expect') || content.includes('assert')) {
          score += 25
        }
        
        if (content.includes('beforeEach') || content.includes('afterEach')) {
          score += 20
        }
        
        if (content.includes('mock') || content.includes('stub')) {
          score += 25
        }
      }
    }
    
    return Math.min(100, score)
  }

  private calculateTestAutomation(dependencies: any): number {
    let score = 0
    
    const testTools = ['jest', 'mocha', 'cypress', 'playwright', 'vitest', 'pytest']
    
    for (const category of ['production', 'development']) {
      const deps = dependencies[category] || []
      for (const dep of deps) {
        if (testTools.some(tool => dep.name.toLowerCase().includes(tool))) {
          score += 20
        }
      }
    }
    
    return Math.min(100, score)
  }

  private calculateSecurityPractices(files: any[]): number {
    let score = 0
    
    for (const file of files) {
      if (file.content) {
        const content = file.content.toLowerCase()
        
        // Check for security practices
        if (content.includes('helmet') || content.includes('cors')) {
          score += 20
        }
        
        if (content.includes('bcrypt') || content.includes('hash')) {
          score += 25
        }
        
        if (content.includes('jwt') || content.includes('token')) {
          score += 15
        }
        
        if (content.includes('validate') || content.includes('sanitize')) {
          score += 20
        }
      }
    }
    
    return Math.min(100, score)
  }

  private calculateDependencySecurity(dependencies: any): number {
    let score = 50 // Base score
    
    // Check for security-related dependencies
    const securityDeps = ['helmet', 'cors', 'bcrypt', 'jsonwebtoken', 'express-rate-limit']
    
    for (const category of ['production', 'development']) {
      const deps = dependencies[category] || []
      for (const dep of deps) {
        if (securityDeps.some(sec => dep.name.toLowerCase().includes(sec))) {
          score += 10
        }
      }
    }
    
    return Math.min(100, score)
  }

  private calculateOptimization(files: any[]): number {
    let score = 0
    
    for (const file of files) {
      if (file.content) {
        const content = file.content.toLowerCase()
        
        // Check for optimization patterns
        if (content.includes('memo') || content.includes('useMemo')) {
          score += 20
        }
        
        if (content.includes('lazy') || content.includes('suspense')) {
          score += 25
        }
        
        if (content.includes('debounce') || content.includes('throttle')) {
          score += 15
        }
        
        if (content.includes('webpack') || content.includes('bundle')) {
          score += 10
        }
      }
    }
    
    return Math.min(100, score)
  }

  private calculateEfficiency(files: any[]): number {
    let score = 50 // Base score
    
    // Check for efficient patterns
    for (const file of files) {
      if (file.content) {
        const content = file.content
        
        // Check for efficient algorithms
        if (content.includes('map') || content.includes('filter') || content.includes('reduce')) {
          score += 5
        }
        
        // Check for async patterns
        if (content.includes('async') || content.includes('await')) {
          score += 10
        }
        
        // Check for proper error handling
        if (content.includes('try') && content.includes('catch')) {
          score += 5
        }
      }
    }
    
    return Math.min(100, score)
  }

  private calculateMonitoring(files: any[]): number {
    let score = 0
    
    for (const file of files) {
      if (file.content) {
        const content = file.content.toLowerCase()
        
        // Check for monitoring patterns
        if (content.includes('log') || content.includes('console')) {
          score += 10
        }
        
        if (content.includes('metric') || content.includes('analytics')) {
          score += 20
        }
        
        if (content.includes('monitor') || content.includes('track')) {
          score += 15
        }
      }
    }
    
    return Math.min(100, score)
  }

  // Score calculation methods
  private calculateOverallScore(factors: ScoringFactors): number {
    const weights = {
      codeQuality: 0.2,
      namingConventions: 0.1,
      prQuality: 0.15,
      maintainability: 0.2,
      codeDuplication: 0.1,
      documentation: 0.1,
      testing: 0.1,
      security: 0.05
    }

    let totalScore = 0
    let totalWeight = 0

    for (const [category, weight] of Object.entries(weights)) {
      const categoryScore = this.calculateCategoryScore(factors[category as keyof ScoringFactors])
      totalScore += categoryScore * weight
      totalWeight += weight
    }

    return Math.round(totalScore / totalWeight)
  }

  private calculateCategoryScore(factors: any): number {
    const values = Object.values(factors) as number[]
    return values.reduce((sum, value) => sum + value, 0) / values.length
  }

  private calculateCodeQualityScore(factors: ScoringFactors['codeQuality']): number {
    return this.calculateCategoryScore(factors)
  }

  private calculateNamingConventionsScore(factors: ScoringFactors['namingConventions']): number {
    return this.calculateCategoryScore(factors)
  }

  private calculatePRQualityScore(factors: ScoringFactors['prQuality']): number {
    return this.calculateCategoryScore(factors)
  }

  private calculateMaintainabilityScore(factors: ScoringFactors['maintainability']): number {
    return this.calculateCategoryScore(factors)
  }

  private calculateCodeDuplicationScore(factors: ScoringFactors['codeDuplication']): number {
    return this.calculateCategoryScore(factors)
  }

  private calculateDocumentationScore(factors: ScoringFactors['documentation']): number {
    return this.calculateCategoryScore(factors)
  }

  private calculateTestingScore(factors: ScoringFactors['testing']): number {
    return this.calculateCategoryScore(factors)
  }

  private calculateSecurityScore(factors: ScoringFactors['security']): number {
    return this.calculateCategoryScore(factors)
  }

  private calculatePerformanceScore(factors: ScoringFactors['performance']): number {
    return this.calculateCategoryScore(factors)
  }
}

export const scoringAnalyzer = new ScoringAnalyzer()


