export async function generateDocumentation(components: any[], repoId: string): Promise<any> {
  const documentation: {
    components: {
      name: any;
      type: any;
      path: any;
      startLine: any;
      endLine: any;
      description: any;
      props: any;
      exports: any;
      complexity: any;
      usage: string;
      relatedComponents: string[];
    }[];
    functions: any[];
    classes: any[];
    hooks: any[];
    utils: any[];
    overview: {
      totalComponents: number;
      totalFunctions: number;
      totalClasses: number;
      totalHooks: number;
      complexityDistribution: Record<string, number>;
      recommendations: string[];
    };
  } = {
    components: [],
    functions: [],
    classes: [],
    hooks: [],
    utils: [],
    overview: {
      totalComponents: 0,
      totalFunctions: 0,
      totalClasses: 0,
      totalHooks: 0,
      complexityDistribution: {},
      recommendations: []
    }
  }

  // Categorize components
  for (const component of components) {
    const docItem = {
      name: component.name,
      type: component.type,
      path: component.path,
      startLine: component.startLine,
      endLine: component.endLine,
      description: component.description || generateAutoDescription(component),
      props: component.props,
      exports: component.exports,
      complexity: component.complexity,
      usage: await generateUsageExample(component),
      relatedComponents: await findRelatedComponents(component, repoId)
    }

    switch (component.type) {
      case 'component':
        documentation.components.push(docItem)
        documentation.overview.totalComponents++
        break
      case 'function':
        documentation.functions.push(docItem)
        documentation.overview.totalFunctions++
        break
      case 'class':
        documentation.classes.push(docItem)
        documentation.overview.totalClasses++
        break
      case 'hook':
        documentation.hooks.push(docItem)
        documentation.overview.totalHooks++
        break
      case 'util':
        documentation.utils.push(docItem)
        break
    }
  }

  // Generate complexity distribution
  documentation.overview.complexityDistribution = generateComplexityDistribution(components)
  
  // Generate recommendations
  documentation.overview.recommendations = generateRecommendations(components)

  return documentation
}

function generateAutoDescription(component: any): string {
  const { name, type } = component
  
  switch (type) {
    case 'component':
      return `A React ${name} component that renders UI elements.`
    case 'hook':
      return `A custom React hook '${name}' that provides reusable stateful logic.`
    case 'function':
      return `A utility function '${name}' that performs specific operations.`
    case 'class':
      return `A '${name}' class that encapsulates data and methods.`
    default:
      return `A ${type} named '${name}'.`
  }
}

async function generateUsageExample(component: any): Promise<string> {
  const { name, type, props } = component
  
  switch (type) {
    case 'component':
      if (props && props.type) {
        return `import { ${name} } from './${component.path.replace(/\.[^/.]+$/, '')}'

// Basic usage
<${name} />

// With props
<${name} 
  // Add your props here based on the component's interface
/>`
      }
      return `import { ${name} } from './${component.path.replace(/\.[^/.]+$/, '')}'

<${name} />`
    
    case 'hook':
      return `import { ${name} } from './${component.path.replace(/\.[^/.]+$/, '')}'

function MyComponent() {
  const result = ${name}()
  
  return (
    <div>
      {/* Use the hook result here */}
    </div>
  )
}`
    
    case 'function':
      return `import { ${name} } from './${component.path.replace(/\.[^/.]+$/, '')}'

const result = ${name}(/* parameters */)`
    
    case 'class':
      return `import { ${name} } from './${component.path.replace(/\.[^/.]+$/, '')}'

const instance = new ${name}(/* constructor parameters */)`
    
    default:
      return `import { ${name} } from './${component.path.replace(/\.[^/.]+$/, '')}'`
  }
}

async function findRelatedComponents(component: any, repoId: string): Promise<string[]> {
  try {
    // Find components that import this component or are imported by this component
    const { prisma } = await import('./prisma')
    
    const file = await prisma.repoFile.findFirst({
      where: {
        repoId,
        path: component.path
      },
      include: {
        imports: {
          include: {
            importedFile: true
          }
        },
        importedBy: {
          include: {
            importingFile: true
          }
        }
      }
    })

    const related: string[] = []
    
    if (file) {
      // Add files that this file imports
      file.imports.forEach(imp => {
        related.push(imp.importedFile.path)
      })
      
      // Add files that import this file
      file.importedBy.forEach(imp => {
        related.push(imp.importingFile.path)
      })
    }
    
    return [...new Set(related)] // Remove duplicates
  } catch (error) {
    return []
  }
}

function generateComplexityDistribution(components: any[]): Record<string, number> {
  const distribution = {
    low: 0,    // 1-5
    medium: 0, // 6-10
    high: 0,   // 11-20
    very_high: 0 // 21+
  }
  
  components.forEach(component => {
    const complexity = component.complexity || 0
    
    if (complexity <= 5) {
      distribution.low++
    } else if (complexity <= 10) {
      distribution.medium++
    } else if (complexity <= 20) {
      distribution.high++
    } else {
      distribution.very_high++
    }
  })
  
  return distribution
}

function generateRecommendations(components: any[]): string[] {
  const recommendations: string[] = []
  
  // Check for high complexity components
  const highComplexityComponents = components.filter(c => c.complexity > 15)
  if (highComplexityComponents.length > 0) {
    recommendations.push(
      `Consider refactoring ${highComplexityComponents.length} high-complexity components: ${highComplexityComponents.map(c => c.name).join(', ')}`
    )
  }
  
  // Check for missing descriptions
  const undocumentedComponents = components.filter(c => !c.description)
  if (undocumentedComponents.length > 0) {
    recommendations.push(
      `Add documentation for ${undocumentedComponents.length} components without descriptions`
    )
  }
  
  // Check component distribution
  const componentTypes = components.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  if (componentTypes.component && componentTypes.function && componentTypes.component / componentTypes.function > 2) {
    recommendations.push('Consider extracting some logic into utility functions to improve reusability')
  }
  
  if (componentTypes.hook && componentTypes.hook < 2) {
    recommendations.push('Consider creating custom hooks to share stateful logic between components')
  }
  
  return recommendations
}

export async function generateArchitectureDiagram(repoId: string): Promise<any> {
  try {
    const { prisma } = await import('./prisma')
    
    // Get ALL files first, then intelligently filter and rank them
    const allFiles = await prisma.repoFile.findMany({
      where: { repoId },
      include: {
        imports: {
          include: {
            importedFile: true
          }
        }
      },
      orderBy: [
        { linesOfCode: 'desc' },
        { complexity: 'desc' }
      ]
    })
    
    
    if (allFiles.length === 0) {
      return { nodes: [], edges: [], stats: { totalNodes: 0, totalEdges: 0, averageConnections: 0 } }
    }
    
    // Smart scoring system to identify the most important files
    const scoredFiles = allFiles.map(file => {
      let score = 0
      let nodeType = 'file'
      let layer = 'services'
      let friendlyName = file.name.replace(/\.(tsx|ts|jsx|js|prisma)$/, '')
      
      // Base scoring factors
      score += Math.min(file.linesOfCode || 0, 500) / 10 // Lines of code (capped)
      score += (file.complexity || 0) * 2 // Complexity weight
      score += file.imports.length * 5 // Import connections
      
      // Path-based scoring and categorization
      const path = file.path.toLowerCase()
      
      // PAGES (highest priority - user-facing)
      if (path.includes('/page.tsx') || path.includes('/page.ts')) {
        score += 100
        nodeType = 'page'
        layer = 'pages'
        if (path.includes('dashboard')) friendlyName = 'Dashboard Page'
        else if (path.includes('auth')) friendlyName = 'Auth Page'
        else if (path.includes('repo')) friendlyName = 'Repository Page'
        else friendlyName = 'Page'
      }
      
      // LAYOUTS 
      else if (path.includes('/layout.tsx') || path.includes('/layout.ts')) {
        score += 80
        nodeType = 'page'
        layer = 'pages'
        friendlyName = 'App Layout'
      }
      
      // API ROUTES (high priority - backend endpoints)
      else if (path.includes('/api/') && path.includes('/route.')) {
        score += 90
        nodeType = 'api'
        layer = 'api'
        if (path.includes('analyze')) friendlyName = 'Analysis API'
        else if (path.includes('auth')) friendlyName = 'Auth API'
        else if (path.includes('repo')) friendlyName = 'Repository API'
        else if (path.includes('component')) friendlyName = 'Components API'
        else friendlyName = 'API Endpoint'
      }
      
      // REACT COMPONENTS (medium-high priority)
      else if (path.includes('/component') || path.includes('/ui/')) {
        score += 60
        nodeType = 'component'
        layer = 'components'
        if (path.includes('architecture-diagram')) {
          friendlyName = 'Architecture Diagram'
          score += 20 // Boost for important components
        }
        else if (path.includes('auth-provider')) {
          friendlyName = 'Auth Provider'
          score += 15
        }
        else if (path.includes('header')) friendlyName = 'Header'
        else if (path.includes('card')) friendlyName = 'Card Component'
        else if (path.includes('button')) friendlyName = 'Button Component'
        else friendlyName = friendlyName.replace(/([A-Z])/g, ' $1').trim()
      }
      
      // CORE BUSINESS LOGIC (high priority)
      else if (path.includes('/lib/')) {
        score += 70
        nodeType = 'service'
        layer = 'services'
        if (path.includes('githubAnalyzer')) {
          friendlyName = 'GitHub Integration'
          score += 25
        }
        else if (path.includes('codeAnalyzer')) {
          friendlyName = 'Code Analysis Engine'
          score += 25
        }
        else if (path.includes('documentationGenerator')) {
          friendlyName = 'Documentation Generator'
          score += 20
        }
        else if (path.includes('auth')) {
          friendlyName = 'Auth Service'
          layer = 'auth'
          score += 15
        }
        else if (path.includes('prisma')) {
          friendlyName = 'Database Client'
          layer = 'database'
          score += 20
        }
        else friendlyName = friendlyName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      }
      
      // DATABASE SCHEMA
      else if (path.includes('schema.prisma')) {
        score += 95
        nodeType = 'database'
        layer = 'database'
        friendlyName = 'Database Schema'
      }
      
      // CONFIGURATION FILES
      else if (path.includes('config') || path.includes('.config.')) {
        score += 30
        nodeType = 'config'
        layer = 'services'
        friendlyName = 'Configuration'
      }
      
      // ROOT FILES (package.json, etc.)
      else if (!path.includes('/')) {
        score += 40
        nodeType = 'config'
        layer = 'services'
        if (path.includes('package.json')) friendlyName = 'Dependencies'
        else if (path.includes('tsconfig')) friendlyName = 'TypeScript Config'
        else friendlyName = file.name
      }
      
      // BOOST SCORE for files with many connections
      const connectionBoost = Math.min(file.imports.length * 10, 50)
      score += connectionBoost
      
      return {
        ...file,
        score,
        nodeType,
        layer,
        friendlyName,
        importance: Math.ceil(score / 20) // 1-5 importance scale
      }
    })
    
    // Select top 20 most important files
    const topFiles = scoredFiles
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
    
    
    // Create nodes for architecture diagram
    const nodes = topFiles.map(file => ({
      id: file.id,
      label: file.friendlyName,
      originalName: file.name,
      path: file.path,
      type: file.nodeType,
      layer: file.layer,
      size: file.linesOfCode || 0,
      complexity: file.complexity || 0,
      importance: file.importance,
      connections: file.imports.length,
      isDirectory: false
    }))
    
    // Create meaningful edges between selected nodes
    const selectedNodeIds = new Set(nodes.map(n => n.id))
    const edges: any[] = []
    
    topFiles.forEach(file => {
      const sourceNode = nodes.find(n => n.id === file.id)
      if (!sourceNode) return
      
      file.imports.forEach(imp => {
        const targetNode = nodes.find(n => n.id === imp.importedFile.id)
        if (!targetNode) return // Only show connections between top 20 files
        
        // Determine connection type based on node types
        let connectionType = 'uses'
        if (sourceNode.type === 'page' && targetNode.type === 'component') {
          connectionType = 'renders'
        } else if (sourceNode.type === 'page' && targetNode.type === 'api') {
          connectionType = 'calls'
        } else if (sourceNode.type === 'api' && targetNode.type === 'service') {
          connectionType = 'uses'
        } else if (targetNode.type === 'database') {
          connectionType = 'queries'
        } else if (targetNode.layer === 'auth') {
          connectionType = 'authenticates via'
        }
        
        edges.push({
          source: file.id,
          target: imp.importedFile.id,
          type: connectionType,
          label: connectionType,
          isDependency: true
        })
      })
    })
    
    return {
      nodes,
      edges,
      stats: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        averageConnections: edges.length / nodes.length || 0,
        layerDistribution: nodes.reduce((acc, n) => {
          acc[n.layer] = (acc[n.layer] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }
    }
  } catch (error) {
    return { 
      nodes: [], 
      edges: [], 
      stats: { totalNodes: 0, totalEdges: 0, averageConnections: 0 } 
    }
  }
}

// Helper function to create user-friendly names
function generateFriendlyName(fileName: string, filePath: string): string {
  // Remove file extensions
  let name = fileName.replace(/\.(tsx|ts|jsx|js)$/, '')
  
  // Handle special cases
  if (name === 'page') {
    const pathParts = filePath.split('/')
    const parentDir = pathParts[pathParts.length - 2]
    return `${parentDir} Page`
  }
  
  if (name === 'layout') {
    return 'App Layout'
  }
  
  if (name === 'route') {
    const pathParts = filePath.split('/')
    const apiPath = pathParts.slice(pathParts.indexOf('api') + 1, -1).join('/')
    return `${apiPath} API`
  }
  
  // Convert kebab-case and camelCase to Title Case
  return name
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, l => l.toUpperCase())
}