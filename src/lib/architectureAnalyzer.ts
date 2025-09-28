import { EnhancedRepositoryData } from './enhancedGithubAnalyzer'

// Lightweight debug logger gated by env
const debugArch = (...args: any[]) => {
  if (process.env.DEBUG_ANALYZER === '1') {
    // eslint-disable-next-line no-console
    console.log(...args)
  }
}

export interface ComponentNode {
  id: string
  label: string
  path: string
  type: 'page' | 'component' | 'api' | 'service' | 'database' | 'auth' | 'utility' | 'config'
  size: number
  complexity: number
  layer?: string
  isDirectory?: boolean
  cleanName?: string
  dependencies?: string[]
  exports?: string[]
  imports?: string[]
  framework?: string
  language?: string
}

export interface ComponentEdge {
  source: string | ComponentNode
  target: string | ComponentNode
  type: 'renders' | 'calls' | 'uses' | 'imports' | 'exports' | 'depends'
  label: string
  isDependency?: boolean
  strength?: number
}

export interface ArchitectureData {
  nodes: ComponentNode[]
  edges: ComponentEdge[]
  stats: {
    totalNodes: number
    totalEdges: number
    averageConnections: number
    layers: Record<string, number>
    frameworks: Record<string, number>
    languages: Record<string, number>
  }
  insights: {
    highComplexityComponents: ComponentNode[]
    isolatedComponents: ComponentNode[]
    criticalComponents: ComponentNode[]
    architecturalPatterns: string[]
    recommendations: string[]
  }
}

export class ArchitectureAnalyzer {
  private frameworkPatterns = {
    react: [
      /import.*from\s+['"]react['"]/i,
      /import.*from\s+['"]@?react/,
      /\.tsx?$/,
      /\.jsx$/,
      /useState|useEffect|useContext/i,
      /<[A-Z][a-zA-Z]*\s*\/?>/,
      /export\s+(default\s+)?function\s+[A-Z]/,
      /export\s+(default\s+)?const\s+[A-Z]/
    ],
    nextjs: [
      /import.*from\s+['"]next/,
      /pages\/|app\//,
      /getServerSideProps|getStaticProps|getStaticPaths/i,
      /useRouter|usePathname|useSearchParams/i,
      /middleware\.ts$/,
      /next\.config\./
    ],
    vue: [
      /import.*from\s+['"]vue['"]/i,
      /import.*from\s+['"]@vue/,
      /\.vue$/,
      /<template>|<script>|<style>/,
      /export\s+default\s*{/,
      /defineComponent|createApp/i
    ],
    angular: [
      /import.*from\s+['"]@angular/,
      /\.component\.ts$/,
      /@Component|@Injectable|@NgModule/i,
      /selector:|templateUrl:|styleUrls:/,
      /ngOnInit|ngOnDestroy/i
    ],
    svelte: [
      /\.svelte$/,
      /<script>|<style>|<svelte:/,
      /export\s+let\s+/,
      /onMount|onDestroy/i
    ],
    express: [
      /import.*from\s+['"]express['"]/i,
      /app\.get|app\.post|app\.put|app\.delete/i,
      /router\.|express\.Router/i,
      /middleware|req\.|res\./
    ],
    fastapi: [
      /from\s+fastapi\s+import/i,
      /@app\.|@router\./,
      /FastAPI\(/,
      /APIRouter/,
      /Depends\(/
    ],
    django: [
      /from\s+django/,
      /class\s+\w+View/,
      /urlpatterns\s*=/,
      /models\.Model/,
      /def\s+\w+\(request\)/
    ],
    laravel: [
      /use\s+Illuminate/,
      /Route::/,
      /class\s+\w+\s+extends\s+Controller/,
      /Eloquent/,
      /Artisan/
    ]
  }

  private componentPatterns = {
    page: [
      /pages\/.*\.(tsx?|jsx?|vue|svelte)$/,
      /app\/.*page\.(tsx?|jsx?)$/,
      /routes\/.*\.(tsx?|jsx?)$/,
      /views\/.*\.(tsx?|jsx?|vue)$/
    ],
    component: [
      /components\/.*\.(tsx?|jsx?|vue|svelte)$/,
      /ui\/.*\.(tsx?|jsx?)$/,
      /widgets\/.*\.(tsx?|jsx?)$/,
      /blocks\/.*\.(tsx?|jsx?)$/
    ],
    api: [
      /api\/.*\.(ts|js|py|php|java)$/,
      /routes\/.*\.(ts|js)$/,
      /controllers\/.*\.(ts|js|py|php)$/,
      /handlers\/.*\.(ts|js)$/
    ],
    service: [
      /services\/.*\.(ts|js|py|php|java)$/,
      /lib\/.*\.(ts|js|py)$/,
      /utils\/.*\.(ts|js|py)$/,
      /helpers\/.*\.(ts|js|py)$/
    ],
    database: [
      /models\/.*\.(ts|js|py|php|java)$/,
      /schemas\/.*\.(ts|js|py)$/,
      /migrations\/.*\.(ts|js|py|sql)$/,
      /prisma\/.*\.(ts|js)$/,
      /\.sql$/
    ],
    auth: [
      /auth\/.*\.(ts|js|py|php)$/,
      /middleware\/.*auth.*\.(ts|js|py|php)$/,
      /guards\/.*\.(ts|js|py|php)$/,
      /jwt|oauth|passport/i
    ],
    config: [
      /config\/.*\.(ts|js|py|php|yaml|yml|json)$/,
      /\.config\.(ts|js|py|php)$/,
      /\.env/,
      /package\.json$/,
      /tsconfig\.json$/,
      /webpack\.config\./,
      /vite\.config\./
    ]
  }

  analyzeArchitecture(data: EnhancedRepositoryData): ArchitectureData {
    debugArch('🏗️ Starting architecture analysis...')
    
    const nodes: ComponentNode[] = []
    const edges: ComponentEdge[] = []
    
    // Analyze files and create nodes
    this.analyzeFiles(data, nodes)
    
    // Analyze dependencies and create edges
    this.analyzeDependencies(data, nodes, edges)
    
    // Calculate complexity and connections
    this.calculateComplexity(nodes, edges)
    
    // Generate insights
    const insights = this.generateInsights(nodes, edges)
    
    // Calculate statistics
    const stats = this.calculateStats(nodes, edges)
    
    debugArch(`✅ Architecture analysis complete: ${nodes.length} components, ${edges.length} connections`)
    
    return {
      nodes,
      edges,
      stats,
      insights
    }
  }

  private analyzeFiles(data: EnhancedRepositoryData, nodes: ComponentNode[]): void {
    const files = data.content.files || []
    
    for (const file of files) {
      if (file.type === 'dir') continue
      
      const component = this.createComponentNode(file, data)
      if (component) {
        nodes.push(component)
      }
    }
  }

  private createComponentNode(file: any, data: EnhancedRepositoryData): ComponentNode | null {
    const path = file.path
    const name = file.name
    const content = file.content || ''
    
    // Determine component type
    const type = this.detectComponentType(path, content)
    if (!type) return null
    
    // Detect framework
    const framework = this.detectFramework(content, path)
    
    // Detect language
    const language = this.detectLanguage(path)
    
    // Calculate complexity
    const complexity = this.calculateFileComplexity(content, type)
    
    // Extract imports and exports
    const imports = this.extractImports(content)
    const exports = this.extractExports(content)
    
    // Generate unique ID
    const id = this.generateNodeId(path)
    
    return {
      id,
      label: name,
      path,
      type,
      size: file.size || 0,
      complexity,
      cleanName: this.cleanNodeName(name),
      dependencies: [],
      exports,
      imports,
      framework,
      language,
      isDirectory: file.type === 'dir'
    }
  }

  private detectComponentType(path: string, content: string): ComponentNode['type'] | null {
    const pathLower = path.toLowerCase()
    
    for (const [type, patterns] of Object.entries(this.componentPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(path)) {
          return type as ComponentNode['type']
        }
      }
    }
    
    // Fallback detection based on content
    if (content.includes('export default') || content.includes('export {')) {
      if (pathLower.includes('component') || pathLower.includes('ui')) {
        return 'component'
      }
      if (pathLower.includes('api') || pathLower.includes('route')) {
        return 'api'
      }
      if (pathLower.includes('service') || pathLower.includes('lib') || pathLower.includes('util')) {
        return 'service'
      }
    }
    
    // Default to utility for unrecognized files
    return 'utility'
  }

  private detectFramework(content: string, path: string): string | undefined {
    for (const [framework, patterns] of Object.entries(this.frameworkPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(content) || pattern.test(path)) {
          return framework
        }
      }
    }
    return undefined
  }

  private detectLanguage(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase()
    const languageMap: Record<string, string> = {
      'ts': 'TypeScript',
      'tsx': 'TypeScript',
      'js': 'JavaScript',
      'jsx': 'JavaScript',
      'vue': 'Vue',
      'svelte': 'Svelte',
      'py': 'Python',
      'php': 'PHP',
      'java': 'Java',
      'cs': 'C#',
      'go': 'Go',
      'rs': 'Rust',
      'rb': 'Ruby',
      'sql': 'SQL',
      'yaml': 'YAML',
      'yml': 'YAML',
      'json': 'JSON',
      'md': 'Markdown',
      'css': 'CSS',
      'scss': 'SCSS',
      'sass': 'Sass',
      'html': 'HTML',
      'xml': 'XML'
    }
    return languageMap[ext || ''] || 'Unknown'
  }

  private calculateFileComplexity(content: string, type: ComponentNode['type']): number {
    if (!content) return 0
    
    let complexity = 0
    
    // Base complexity by file size
    complexity += Math.min(content.length / 1000, 50)
    
    // Add complexity based on file type
    const typeComplexity = {
      'page': 10,
      'component': 15,
      'api': 20,
      'service': 25,
      'database': 30,
      'auth': 35,
      'utility': 5,
      'config': 2
    }
    complexity += typeComplexity[type] || 5
    
    // Add complexity based on code patterns
    const patterns = [
      { regex: /if\s*\(/g, weight: 2 },
      { regex: /for\s*\(/g, weight: 3 },
      { regex: /while\s*\(/g, weight: 3 },
      { regex: /switch\s*\(/g, weight: 4 },
      { regex: /try\s*{/g, weight: 3 },
      { regex: /catch\s*\(/g, weight: 2 },
      { regex: /function\s+\w+/g, weight: 5 },
      { regex: /class\s+\w+/g, weight: 8 },
      { regex: /interface\s+\w+/g, weight: 3 },
      { regex: /type\s+\w+/g, weight: 2 },
      { regex: /useState|useEffect|useContext/g, weight: 2 },
      { regex: /async\s+function/g, weight: 3 },
      { regex: /await\s+/g, weight: 2 },
      { regex: /Promise\./g, weight: 3 }
    ]
    
    for (const pattern of patterns) {
      const matches = content.match(pattern.regex)
      if (matches) {
        complexity += matches.length * pattern.weight
      }
    }
    
    return Math.min(Math.round(complexity), 100)
  }

  private extractImports(content: string): string[] {
    const imports: string[] = []
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g
    let match
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1])
    }
    
    return imports
  }

  private extractExports(content: string): string[] {
    const exports: string[] = []
    
    // Named exports
    const namedExportRegex = /export\s+(?:const|function|class|interface|type)\s+(\w+)/g
    let match
    while ((match = namedExportRegex.exec(content)) !== null) {
      exports.push(match[1])
    }
    
    // Default export
    if (content.includes('export default')) {
      exports.push('default')
    }
    
    return exports
  }

  private analyzeDependencies(data: EnhancedRepositoryData, nodes: ComponentNode[], edges: ComponentEdge[]): void {
    // Analyze import/export relationships
    for (const node of nodes) {
      if (!node.imports) continue
      
      for (const importPath of node.imports) {
        const targetNode = this.findNodeByImport(nodes, importPath)
        if (targetNode && targetNode.id !== node.id) {
          edges.push({
            source: node.id,
            target: targetNode.id,
            type: 'imports',
            label: 'imports',
            strength: 1
          })
        }
      }
    }
    
    // Analyze package.json dependencies
    if (data.content.packageJson) {
      this.analyzePackageDependencies(data.content.packageJson, nodes, edges)
    }
  }

  private findNodeByImport(nodes: ComponentNode[], importPath: string): ComponentNode | null {
    // Try exact path match
    let targetNode = nodes.find(node => node.path === importPath)
    if (targetNode) return targetNode
    
    // Try relative path resolution
    const relativePath = importPath.startsWith('./') || importPath.startsWith('../')
    if (relativePath) {
      // This would need more sophisticated path resolution
      // For now, we'll skip relative imports
      return null
    }
    
    // Try package name match
    const packageName = importPath.split('/')[0]
    targetNode = nodes.find(node => 
      node.label.toLowerCase().includes(packageName.toLowerCase()) ||
      node.path.toLowerCase().includes(packageName.toLowerCase())
    )
    
    return targetNode || null
  }

  private analyzePackageDependencies(packageJson: any, nodes: ComponentNode[], edges: ComponentEdge[]): void {
    const dependencies = {
      ...packageJson.dependencies || {},
      ...packageJson.devDependencies || {},
      ...packageJson.peerDependencies || {}
    }
    
    for (const [depName, version] of Object.entries(dependencies)) {
      // Create a virtual node for external dependencies
      const depNode: ComponentNode = {
        id: `external_${depName}`,
        label: depName,
        path: `node_modules/${depName}`,
        type: 'utility',
        size: 0,
        complexity: 0,
        cleanName: depName,
        framework: 'external',
        language: 'Unknown'
      }
      
      nodes.push(depNode)
    }
  }

  private calculateComplexity(nodes: ComponentNode[], edges: ComponentEdge[]): void {
    // Update complexity based on connections
    for (const node of nodes) {
      const connections = edges.filter(edge => 
        edge.source === node.id || edge.target === node.id
      ).length
      
      // Increase complexity based on number of connections
      node.complexity += Math.min(connections * 2, 20)
    }
  }

  private generateInsights(nodes: ComponentNode[], edges: ComponentEdge[]): ArchitectureData['insights'] {
    const highComplexityComponents = nodes
      .filter(node => node.complexity > 50)
      .sort((a, b) => b.complexity - a.complexity)
      .slice(0, 5)
    
    const isolatedComponents = nodes.filter(node => {
      const connections = edges.filter(edge => 
        edge.source === node.id || edge.target === node.id
      ).length
      return connections === 0
    })
    
    const criticalComponents = nodes
      .filter(node => {
        const connections = edges.filter(edge => 
          edge.source === node.id || edge.target === node.id
        ).length
        return connections > 5
      })
      .sort((a, b) => {
        const aConnections = edges.filter(edge => 
          edge.source === a.id || edge.target === a.id
        ).length
        const bConnections = edges.filter(edge => 
          edge.source === b.id || edge.target === b.id
        ).length
        return bConnections - aConnections
      })
      .slice(0, 5)
    
    const architecturalPatterns = this.detectArchitecturalPatterns(nodes, edges)
    const recommendations = this.generateRecommendations(nodes, edges, highComplexityComponents, isolatedComponents)
    
    return {
      highComplexityComponents,
      isolatedComponents,
      criticalComponents,
      architecturalPatterns,
      recommendations
    }
  }

  private detectArchitecturalPatterns(nodes: ComponentNode[], edges: ComponentEdge[]): string[] {
    const patterns: string[] = []
    
    // Check for layered architecture
    const layers = new Set(nodes.map(node => node.type))
    if (layers.size >= 3) {
      patterns.push('Layered Architecture')
    }
    
    // Check for component-based architecture
    const componentCount = nodes.filter(node => node.type === 'component').length
    if (componentCount > 0) {
      patterns.push('Component-Based Architecture')
    }
    
    // Check for API-first architecture
    const apiCount = nodes.filter(node => node.type === 'api').length
    if (apiCount > 0) {
      patterns.push('API-First Architecture')
    }
    
    // Check for microservices pattern
    const serviceCount = nodes.filter(node => node.type === 'service').length
    if (serviceCount > 3) {
      patterns.push('Microservices Pattern')
    }
    
    return patterns
  }

  private generateRecommendations(
    nodes: ComponentNode[], 
    edges: ComponentEdge[], 
    highComplexityComponents: ComponentNode[], 
    isolatedComponents: ComponentNode[]
  ): string[] {
    const recommendations: string[] = []
    
    if (highComplexityComponents.length > 0) {
      recommendations.push(`Consider refactoring ${highComplexityComponents.length} high-complexity components`)
    }
    
    if (isolatedComponents.length > 0) {
      recommendations.push(`Review ${isolatedComponents.length} isolated components for potential integration`)
    }
    
    const totalConnections = edges.length
    const avgConnections = totalConnections / nodes.length
    
    if (avgConnections < 1) {
      recommendations.push('Consider adding more component interactions for better architecture')
    } else if (avgConnections > 5) {
      recommendations.push('Consider reducing component coupling for better maintainability')
    }
    
    const frameworkCount = new Set(nodes.map(node => node.framework).filter(Boolean)).size
    if (frameworkCount > 3) {
      recommendations.push('Consider consolidating frameworks for better consistency')
    }
    
    return recommendations
  }

  private calculateStats(nodes: ComponentNode[], edges: ComponentEdge[]): ArchitectureData['stats'] {
    const layers: Record<string, number> = {}
    const frameworks: Record<string, number> = {}
    const languages: Record<string, number> = {}
    
    for (const node of nodes) {
      // Count by layer
      layers[node.type] = (layers[node.type] || 0) + 1
      
      // Count by framework
      if (node.framework) {
        frameworks[node.framework] = (frameworks[node.framework] || 0) + 1
      }
      
      // Count by language
      if (node.language) {
        languages[node.language] = (languages[node.language] || 0) + 1
      }
    }
    
    const totalConnections = edges.length
    const averageConnections = nodes.length > 0 ? totalConnections / nodes.length : 0
    
    return {
      totalNodes: nodes.length,
      totalEdges: totalConnections,
      averageConnections: Math.round(averageConnections * 10) / 10,
      layers,
      frameworks,
      languages
    }
  }

  private generateNodeId(path: string): string {
    return path
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase()
  }

  private cleanNodeName(name: string): string {
    return name
      .replace(/\.(tsx?|jsx?|vue|svelte|py|php|java|cs)$/i, '')
      .replace(/[-_]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .substring(0, 20)
  }
}

export const architectureAnalyzer = new ArchitectureAnalyzer()


