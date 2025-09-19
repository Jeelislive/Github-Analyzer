import { EnhancedRepositoryData } from './enhanced-github-analyzer'

export interface TechnologyInfo {
  name: string
  version?: string
  confidence: number
  usage: 'primary' | 'secondary' | 'dependency'
  description: string
}

export interface TechnologyStack {
  frontend: TechnologyInfo[]
  backend: TechnologyInfo[]
  database: TechnologyInfo[]
  devops: TechnologyInfo[]
  testing: TechnologyInfo[]
}

export class TechnologyAnalyzer {
  private technologyPatterns = {
    frontend: {
      'React': {
        patterns: [
          /import.*from\s+['"]react['"]/i,
          /import.*from\s+['"]@?react/,
          /\.tsx?$/,
          /\.jsx$/,
          /useState|useEffect|useContext/i,
          /<[A-Z][a-zA-Z]*\s*\/?>/,
          /export\s+(default\s+)?function\s+[A-Z]/,
          /export\s+(default\s+)?const\s+[A-Z]/
        ],
        versionPatterns: [
          /"react":\s*"([^"]+)"/,
          /react@([^\s]+)/
        ],
        description: 'A JavaScript library for building user interfaces'
      },
      'Next.js': {
        patterns: [
          /import.*from\s+['"]next/,
          /pages\/|app\//,
          /getServerSideProps|getStaticProps|getStaticPaths/i,
          /useRouter|usePathname|useSearchParams/i,
          /middleware\.ts$/,
          /next\.config\./
        ],
        versionPatterns: [
          /"next":\s*"([^"]+)"/,
          /next@([^\s]+)/
        ],
        description: 'The React framework for production'
      },
      'Vue.js': {
        patterns: [
          /import.*from\s+['"]vue['"]/i,
          /import.*from\s+['"]@vue/,
          /\.vue$/,
          /<template>|<script>|<style>/,
          /export\s+default\s*{/,
          /defineComponent|createApp/i
        ],
        versionPatterns: [
          /"vue":\s*"([^"]+)"/,
          /vue@([^\s]+)/
        ],
        description: 'Progressive JavaScript framework'
      },
      'Angular': {
        patterns: [
          /import.*from\s+['"]@angular/,
          /\.component\.ts$/,
          /@Component|@Injectable|@NgModule/i,
          /selector:|templateUrl:|styleUrls:/,
          /ngOnInit|ngOnDestroy/i
        ],
        versionPatterns: [
          /"@angular\/core":\s*"([^"]+)"/,
          /angular@([^\s]+)/
        ],
        description: 'Platform for building mobile and desktop web applications'
      },
      'Svelte': {
        patterns: [
          /\.svelte$/,
          /<script>|<style>|<svelte:/,
          /export\s+let\s+/,
          /onMount|onDestroy/i
        ],
        versionPatterns: [
          /"svelte":\s*"([^"]+)"/,
          /svelte@([^\s]+)/
        ],
        description: 'Cybernetically enhanced web apps'
      },
      'TypeScript': {
        patterns: [
          /\.tsx?$/,
          /interface\s+\w+/,
          /type\s+\w+/,
          /:\s*\w+\[\]/,
          /:\s*Promise<\w+>/,
          /:\s*React\.FC/
        ],
        versionPatterns: [
          /"typescript":\s*"([^"]+)"/,
          /typescript@([^\s]+)/
        ],
        description: 'Typed superset of JavaScript'
      },
      'Tailwind CSS': {
        patterns: [
          /@tailwind/,
          /class="[^"]*bg-\w+[^"]*"/,
          /class="[^"]*text-\w+[^"]*"/,
          /class="[^"]*flex[^"]*"/,
          /tailwind\.config/
        ],
        versionPatterns: [
          /"tailwindcss":\s*"([^"]+)"/,
          /tailwindcss@([^\s]+)/
        ],
        description: 'Utility-first CSS framework'
      },
      'Material-UI': {
        patterns: [
          /import.*from\s+['"]@mui/,
          /import.*from\s+['"]@material-ui/,
          /<Button|<TextField|<Card/,
          /makeStyles|withStyles/
        ],
        versionPatterns: [
          /"@mui\/material":\s*"([^"]+)"/,
          /"@material-ui\/core":\s*"([^"]+)"/
        ],
        description: 'React components implementing Material Design'
      }
    },
    backend: {
      'Node.js': {
        patterns: [
          /import.*from\s+['"]node:/,
          /process\.env/,
          /require\('fs'\)/,
          /require\('path'\)/,
          /require\('http'\)/,
          /\.js$/,
          /\.ts$/,
          /node_modules/
        ],
        versionPatterns: [
          /"node":\s*"([^"]+)"/,
          /"engines":\s*{\s*"node":\s*"([^"]+)"/
        ],
        description: 'JavaScript runtime built on Chrome V8 engine'
      },
      'Next.js API Routes': {
        patterns: [
          /src\/(app|pages)\/api\//,
          /pages\/api\//,
          /\/api\//,
          /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(/i,
          /Request\s*:\s*Request|Response\s*:\s*Response/,
          /route\.(ts|js)$/,
          /NextRequest|NextResponse/
        ],
        versionPatterns: [
          /"next":\s*"([^"]+)"/,
          /next@([^\s]+)/
        ],
        description: 'API route handlers implemented with Next.js (App/Pages router)'
      },
      'NextAuth.js': {
        patterns: [
          /next-auth/i,
          /import\s+.*from\s+['"]next-auth['"]/i,
          /handlers?\s*:\s*NextAuth|NextAuth\(/,
          /auth\.ts|\[(\.\.\.nextauth)]|nextauth/i
        ],
        versionPatterns: [
          /"next-auth":\s*"([^"]+)"/
        ],
        description: 'Authentication for Next.js applications'
      },
      'Express.js': {
        patterns: [
          /import.*from\s+['"]express['"]/i,
          /app\.get|app\.post|app\.put|app\.delete/i,
          /router\.|express\.Router/i,
          /middleware|req\.|res\./
        ],
        versionPatterns: [
          /"express":\s*"([^"]+)"/,
          /express@([^\s]+)/
        ],
        description: 'Fast, unopinionated web framework for Node.js'
      },
      'FastAPI': {
        patterns: [
          /from\s+fastapi\s+import/i,
          /@app\.|@router\./,
          /FastAPI\(/,
          /APIRouter/,
          /Depends\(/
        ],
        versionPatterns: [
          /"fastapi":\s*"([^"]+)"/,
          /fastapi==([^\s]+)/
        ],
        description: 'Modern, fast web framework for building APIs with Python'
      },
      'Django': {
        patterns: [
          /from\s+django/,
          /class\s+\w+View/,
          /urlpatterns\s*=/,
          /models\.Model/,
          /def\s+\w+\(request\)/
        ],
        versionPatterns: [
          /"django":\s*"([^"]+)"/,
          /django==([^\s]+)/
        ],
        description: 'High-level Python web framework'
      },
      'Laravel': {
        patterns: [
          /use\s+Illuminate/,
          /Route::/,
          /class\s+\w+\s+extends\s+Controller/,
          /Eloquent/,
          /Artisan/
        ],
        versionPatterns: [
          /"laravel\/framework":\s*"([^"]+)"/,
          /laravel==([^\s]+)/
        ],
        description: 'PHP web application framework'
      },
      'Spring Boot': {
        patterns: [
          /@SpringBootApplication/,
          /@RestController/,
          /@Service/,
          /@Repository/,
          /@Autowired/
        ],
        versionPatterns: [
          /"spring-boot":\s*"([^"]+)"/,
          /spring-boot-starter/
        ],
        description: 'Java framework for building microservices'
      },
      'Go': {
        patterns: [
          /package\s+main/,
          /func\s+main\(\)/,
          /import\s+"fmt"/,
          /import\s+"net\/http"/,
          /\.go$/
        ],
        versionPatterns: [
          /go\s+([0-9.]+)/
        ],
        description: 'Open source programming language'
      },
      'Rust': {
        patterns: [
          /fn\s+main\(\)/,
          /use\s+std::/,
          /let\s+mut/,
          /\.rs$/,
          /Cargo\.toml/
        ],
        versionPatterns: [
          /edition\s*=\s*"([^"]+)"/
        ],
        description: 'Systems programming language'
      }
    },
    database: {
      'PostgreSQL': {
        patterns: [
          /postgresql|postgres/i,
          /psycopg2/,
          /pg\./,
          /postgres:\/\//,
          /prisma.*postgresql/i
        ],
        versionPatterns: [
          /"pg":\s*"([^"]+)"/,
          /"psycopg2":\s*"([^"]+)"/
        ],
        description: 'Advanced open source relational database'
      },
      'MySQL': {
        patterns: [
          /mysql/i,
          /mysql2/,
          /mysqldb/,
          /mysql:\/\//,
          /prisma.*mysql/i
        ],
        versionPatterns: [
          /"mysql2":\s*"([^"]+)"/,
          /"mysqldb":\s*"([^"]+)"/
        ],
        description: 'Popular open source database'
      },
      'MongoDB': {
        patterns: [
          /mongodb/i,
          /mongoose/,
          /mongo/,
          /mongodb:\/\//,
          /prisma.*mongodb/i
        ],
        versionPatterns: [
          /"mongodb":\s*"([^"]+)"/,
          /"mongoose":\s*"([^"]+)"/
        ],
        description: 'Document-oriented NoSQL database'
      },
      'Redis': {
        patterns: [
          /redis/i,
          /ioredis/,
          /redis:\/\//,
          /@redis/
        ],
        versionPatterns: [
          /"redis":\s*"([^"]+)"/,
          /"ioredis":\s*"([^"]+)"/
        ],
        description: 'In-memory data structure store'
      },
      'SQLite': {
        patterns: [
          /sqlite/i,
          /\.db$/,
          /sqlite3/,
          /better-sqlite3/
        ],
        versionPatterns: [
          /"sqlite3":\s*"([^"]+)"/,
          /"better-sqlite3":\s*"([^"]+)"/
        ],
        description: 'Lightweight SQL database engine'
      },
      'Prisma': {
        patterns: [
          /prisma/i,
          /@prisma/,
          /prisma\/client/,
          /schema\.prisma/
        ],
        versionPatterns: [
          /"prisma":\s*"([^"]+)"/,
          /"@prisma\/client":\s*"([^"]+)"/
        ],
        description: 'Next-generation ORM for Node.js and TypeScript'
      }
    },
    devops: {
      'Docker': {
        patterns: [
          /Dockerfile/,
          /docker-compose/,
          /FROM\s+\w+/,
          /docker run/,
          /\.dockerignore/
        ],
        versionPatterns: [
          /FROM\s+\w+:([0-9.]+)/
        ],
        description: 'Containerization platform'
      },
      'Kubernetes': {
        patterns: [
          /kubectl/,
          /k8s/,
          /apiVersion:\s*v1/,
          /kind:\s*Deployment/,
          /\.yaml$|\.yml$/
        ],
        versionPatterns: [
          /apiVersion:\s*v([0-9.]+)/
        ],
        description: 'Container orchestration platform'
      },
      'GitHub Actions': {
        patterns: [
          /\.github\/workflows/,
          /uses:\s*actions/,
          /on:\s*push/,
          /on:\s*pull_request/
        ],
        versionPatterns: [
          /uses:\s*actions\/[^@]+@([^\s]+)/
        ],
        description: 'CI/CD platform integrated with GitHub'
      },
      'Jenkins': {
        patterns: [
          /Jenkinsfile/,
          /jenkins/,
          /pipeline\s*{/,
          /stage\s*\(/
        ],
        versionPatterns: [
          /jenkins@([^\s]+)/
        ],
        description: 'Open source automation server'
      },
      'AWS': {
        patterns: [
          /aws-sdk/,
          /@aws-sdk/,
          /amazonaws/,
          /s3\./,
          /lambda/
        ],
        versionPatterns: [
          /"aws-sdk":\s*"([^"]+)"/,
          /"@aws-sdk\/":\s*"([^"]+)"/
        ],
        description: 'Amazon Web Services cloud platform'
      },
      'Vercel': {
        patterns: [
          /vercel/,
          /vercel\.json/,
          /@vercel/,
          /vercel deploy/
        ],
        versionPatterns: [
          /"vercel":\s*"([^"]+)"/,
          /"@vercel\/":\s*"([^"]+)"/
        ],
        description: 'Cloud platform for frontend developers'
      },
      'Netlify': {
        patterns: [
          /netlify/,
          /netlify\.toml/,
          /_redirects/,
          /netlify deploy/
        ],
        versionPatterns: [
          /"netlify":\s*"([^"]+)"/,
          /"@netlify\/":\s*"([^"]+)"/
        ],
        description: 'Web development platform'
      }
    },
    testing: {
      'Jest': {
        patterns: [
          /jest/i,
          /describe\(/,
          /it\(|test\(/,
          /expect\(/,
          /\.test\./,
          /\.spec\./
        ],
        versionPatterns: [
          /"jest":\s*"([^"]+)"/,
          /jest@([^\s]+)/
        ],
        description: 'JavaScript testing framework'
      },
      'Cypress': {
        patterns: [
          /cypress/i,
          /cy\./,
          /cy\.get\(/,
          /cy\.click\(/,
          /cypress\.json/
        ],
        versionPatterns: [
          /"cypress":\s*"([^"]+)"/,
          /cypress@([^\s]+)/
        ],
        description: 'End-to-end testing framework'
      },
      'Playwright': {
        patterns: [
          /playwright/i,
          /@playwright/,
          /page\./,
          /test\./,
          /playwright\.config/
        ],
        versionPatterns: [
          /"playwright":\s*"([^"]+)"/,
          /"@playwright\/":\s*"([^"]+)"/
        ],
        description: 'End-to-end testing framework'
      },
      'Vitest': {
        patterns: [
          /vitest/i,
          /@vitest/,
          /vi\./,
          /vitest\.config/
        ],
        versionPatterns: [
          /"vitest":\s*"([^"]+)"/,
          /"@vitest\/":\s*"([^"]+)"/
        ],
        description: 'Fast unit testing framework'
      },
      'Pytest': {
        patterns: [
          /pytest/i,
          /def\s+test_/,
          /assert\s+/,
          /conftest\.py/
        ],
        versionPatterns: [
          /"pytest":\s*"([^"]+)"/,
          /pytest==([^\s]+)/
        ],
        description: 'Python testing framework'
      },
      'Mocha': {
        patterns: [
          /mocha/i,
          /describe\(/,
          /it\(/,
          /before\(/,
          /after\(/
        ],
        versionPatterns: [
          /"mocha":\s*"([^"]+)"/,
          /mocha@([^\s]+)/
        ],
        description: 'JavaScript test framework'
      },
      'Testing Library': {
        patterns: [
          /@testing-library/,
          /render\(/,
          /screen\./,
          /fireEvent/,
          /userEvent/
        ],
        versionPatterns: [
          /"@testing-library\/":\s*"([^"]+)"/
        ],
        description: 'Simple and complete testing utilities'
      }
    }
  }

  analyzeTechnologyStack(data: EnhancedRepositoryData): TechnologyStack {
    console.log('🔍 Analyzing technology stack...')
    
    const stack: TechnologyStack = {
      frontend: [],
      backend: [],
      database: [],
      devops: [],
      testing: []
    }

    // Analyze package.json dependencies
    if (data.content.packageJson) {
      this.analyzePackageJson(data.content.packageJson, stack)
    }

    // Analyze file content for patterns
    this.analyzeFileContent(data.content.files, stack)

    // Analyze configuration files
    this.analyzeConfigFiles(data.content.files, stack)

    console.log(`✅ Technology stack analysis complete: ${this.getTotalTechnologies(stack)} technologies detected`)
    
    return stack
  }

  private analyzePackageJson(packageJson: any, stack: TechnologyStack): void {
    const dependencies = {
      ...packageJson.dependencies || {},
      ...packageJson.devDependencies || {},
      ...packageJson.peerDependencies || {}
    }

    for (const [packageName, version] of Object.entries(dependencies)) {
      const versionStr = version as string
      
      // Check each category
      for (const [category, technologies] of Object.entries(this.technologyPatterns)) {
        for (const [techName, techInfo] of Object.entries(technologies)) {
          if (this.matchesPackageName(packageName, techName, techInfo)) {
            const confidence = this.calculateConfidence(packageName, techName, versionStr)
            const detectedVersion = this.extractVersion(versionStr, techInfo.versionPatterns)
            
            const technology: TechnologyInfo = {
              name: techName,
              version: detectedVersion,
              confidence,
              usage: this.determineUsage(packageName, techName),
              description: techInfo.description
            }

            stack[category as keyof TechnologyStack].push(technology)
          }
        }
      }
    }
  }

  private analyzeFileContent(files: any[], stack: TechnologyStack): void {
    for (const file of files) {
      if (!file.content || file.type === 'dir') continue

      const content = file.content
      const filePath = file.path

      // Check each category
      for (const [category, technologies] of Object.entries(this.technologyPatterns)) {
        for (const [techName, techInfo] of Object.entries(technologies)) {
          if (this.matchesFileContent(content, filePath, techInfo)) {
            // Check if already added
            const existing = stack[category as keyof TechnologyStack].find(t => t.name === techName)
            if (!existing) {
              const confidence = this.calculateFileConfidence(content, filePath, techInfo)
              const detectedVersion = this.extractVersionFromContent(content, techInfo.versionPatterns)
              
              const technology: TechnologyInfo = {
                name: techName,
                version: detectedVersion,
                confidence,
                usage: 'primary',
                description: techInfo.description
              }

              stack[category as keyof TechnologyStack].push(technology)
            }
          }
        }
      }
    }
  }

  private analyzeConfigFiles(files: any[], stack: TechnologyStack): void {
    const configFiles = files.filter(file => 
      file.name.includes('config') || 
      file.name.includes('docker') ||
      file.name.includes('github') ||
      file.name.includes('vercel') ||
      file.name.includes('netlify')
    )

    for (const file of configFiles) {
      if (!file.content) continue

      const content = file.content
      const fileName = file.name

      // Check for DevOps technologies
      for (const [techName, techInfo] of Object.entries(this.technologyPatterns.devops)) {
        if (this.matchesFileContent(content, fileName, techInfo)) {
          const existing = stack.devops.find(t => t.name === techName)
          if (!existing) {
            const confidence = this.calculateFileConfidence(content, fileName, techInfo)
            
            const technology: TechnologyInfo = {
              name: techName,
              version: undefined,
              confidence,
              usage: 'primary',
              description: techInfo.description
            }

            stack.devops.push(technology)
          }
        }

      }
    }
  }

  private matchesPackageName(packageName: string, techName: string, techInfo: any): boolean {
    const nameLower = packageName.toLowerCase()
    const techLower = techName.toLowerCase()
    
    // Direct name match
    if (nameLower.includes(techLower)) return true
    
    // Check for common package name variations
    const variations = [
      techLower,
      `@${techLower}`,
      `${techLower}-js`,
      `${techLower}js`,
      `@${techLower}/`,
      `@${techLower}-`
    ]
    
    return variations.some(variation => nameLower.includes(variation))
  }

  private matchesFileContent(content: string, filePath: string, techInfo: any): boolean {
    return techInfo.patterns.some((pattern: RegExp) => 
      pattern.test(content) || pattern.test(filePath)
    )
  }

  private calculateConfidence(packageName: string, techName: string, version: string): number {
    let confidence = 50 // Base confidence

    // Higher confidence for exact matches
    if (packageName.toLowerCase().includes(techName.toLowerCase())) {
      confidence += 30
    }

    // Higher confidence for stable versions
    if (version && !version.includes('alpha') && !version.includes('beta') && !version.includes('rc')) {
      confidence += 10
    }

    // Higher confidence for recent versions
    if (version && this.isRecentVersion(version)) {
      confidence += 10
    }

    return Math.min(confidence, 100)
  }

  private calculateFileConfidence(content: string, filePath: string, techInfo: any): number {
    let confidence = 30 // Base confidence for file detection

    // Count pattern matches
    const matches = techInfo.patterns.filter((pattern: RegExp) => 
      pattern.test(content) || pattern.test(filePath)
    ).length

    confidence += matches * 15

    // Higher confidence for multiple patterns
    if (matches > 2) {
      confidence += 20
    }

    return Math.min(confidence, 100)
  }

  private extractVersion(versionStr: string, versionPatterns: RegExp[]): string | undefined {
    for (const pattern of versionPatterns) {
      const match = versionStr.match(pattern)
      if (match) {
        return match[1]
      }
    }
    return undefined
  }

  private extractVersionFromContent(content: string, versionPatterns: RegExp[]): string | undefined {
    for (const pattern of versionPatterns) {
      const match = content.match(pattern)
      if (match) {
        return match[1]
      }
    }
    return undefined
  }

  private determineUsage(packageName: string, techName: string): 'primary' | 'secondary' | 'dependency' {
    // Primary technologies are usually main frameworks
    const primaryTechs = ['React', 'Vue.js', 'Angular', 'Next.js', 'Express.js', 'Django', 'Laravel']
    
    if (primaryTechs.includes(techName)) {
      return 'primary'
    }

    // Secondary technologies are supporting libraries
    const secondaryTechs = ['TypeScript', 'Tailwind CSS', 'Material-UI', 'Jest', 'Cypress']
    
    if (secondaryTechs.includes(techName)) {
      return 'secondary'
    }

    return 'dependency'
  }

  private isRecentVersion(version: string): boolean {
    // Simple check for recent versions (2020+)
    const year = new Date().getFullYear()
    return version.includes(year.toString()) || 
           version.includes((year - 1).toString()) ||
           version.includes((year - 2).toString())
  }

  private getTotalTechnologies(stack: TechnologyStack): number {
    return Object.values(stack).reduce((total, category) => total + category.length, 0)
  }
}

export const technologyAnalyzer = new TechnologyAnalyzer()

