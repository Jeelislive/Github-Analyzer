'use client'

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import mermaid from 'mermaid'
import { Card } from './card'
import { Badge } from './badge'
import { Button } from './button'
import { 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  Network, 
  TreePine, 
  GitBranch,
  Eye,
  EyeOff,
  Palette,
  Settings,
  Info
} from 'lucide-react'

// Add new interfaces for enhanced features
interface FilterState {
  layers: Record<string, boolean>
  complexityRange: [number, number]
  connectionTypes: Record<string, boolean>
  searchTerm: string
}

interface MiniMapProps {
  diagram: string
  onViewportChange?: (viewport: { x: number, y: number, scale: number }) => void
}

interface Node {
  id: string
  label: string
  path: string
  type: string
  size: number
  complexity: number
  layer?: string
  isDirectory?: boolean
  cleanName?: string
}

interface Edge {
  source: string | Node
  target: string | Node
  type: string
  label: string
  isDependency?: boolean
}

interface ArchitectureData {
  nodes: Node[]
  edges: Edge[]
  stats: {
    totalNodes: number
    totalEdges: number
    averageConnections: number
  }
}

interface MermaidArchitectureDiagramProps {
  data: ArchitectureData
  onNodeClick?: (node: Node) => void
}

// Professional layer configuration with high contrast colors for dark theme
const LAYER_CONFIG = {
  'pages': { 
    name: 'User Interface', 
    color: '#10b981', 
    icon: '👥',
    mermaidColor: 'fill:#10b981,stroke:#ffffff,stroke-width:3px,color:#ffffff'
  },
  'components': { 
    name: 'UI Components', 
    color: '#3b82f6', 
    icon: '🧩',
    mermaidColor: 'fill:#3b82f6,stroke:#ffffff,stroke-width:3px,color:#ffffff'
  },
  'api': { 
    name: 'Backend Services', 
    color: '#8b5cf6', 
    icon: '⚙️',
    mermaidColor: 'fill:#8b5cf6,stroke:#ffffff,stroke-width:3px,color:#ffffff'
  },
  'services': { 
    name: 'Business Logic', 
    color: '#f59e0b', 
    icon: '💼',
    mermaidColor: 'fill:#f59e0b,stroke:#ffffff,stroke-width:3px,color:#ffffff'
  },
  'database': { 
    name: 'Data Storage', 
    color: '#ef4444', 
    icon: '🗄️',
    mermaidColor: 'fill:#ef4444,stroke:#ffffff,stroke-width:3px,color:#ffffff'
  },
  'auth': { 
    name: 'Security', 
    color: '#06b6d4', 
    icon: '🔐',
    mermaidColor: 'fill:#06b6d4,stroke:#ffffff,stroke-width:3px,color:#ffffff'
  }
}

// Intelligent layer detection
const getNodeLayer = (node: Node): string => {
  const path = node.path.toLowerCase()
  const type = node.type.toLowerCase()
  
  if (type === 'page' || path.includes('/pages/') || path.includes('/app/') && !path.includes('/api/')) return 'pages'
  if (type === 'component' || path.includes('/components/')) return 'components'
  if (type === 'api' || path.includes('/api/') || path.includes('/routes/')) return 'api'
  if (path.includes('/lib/') || path.includes('/utils/') || path.includes('/services/')) return 'services'
  if (path.includes('/prisma/') || path.includes('/database/') || path.includes('.sql')) return 'database'
  if (path.includes('/auth/') || path.includes('auth') || path.includes('login')) return 'auth'
  
  return 'services' // default fallback
}

// Clean node names for better readability
const cleanNodeName = (node: Node): string => {
  let name = node.label
  
  // Remove file extensions for cleaner display
  name = name.replace(/\.(tsx?|jsx?|vue|svelte|py|php|java|cs)$/i, '')
  
  // Convert kebab-case and snake_case to Title Case
  name = name.replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  
  // Limit length for better visualization
  if (name.length > 20) {
    name = name.substring(0, 17) + '...'
  }
  
  return name
}

export default function MermaidArchitectureDiagram({ data, onNodeClick }: MermaidArchitectureDiagramProps) {
  const mermaidRef = useRef<HTMLDivElement>(null)
  const [diagramType, setDiagramType] = useState<'flowchart' | 'graph' | 'timeline' | 'gitgraph' | 'mindmap'>('flowchart')
  const [layout, setLayout] = useState<'TB' | 'TD' | 'BT' | 'RL' | 'LR'>('TB')
  const [showLegend, setShowLegend] = useState(true)
  const [theme, setTheme] = useState<'dark' | 'default' | 'forest' | 'neutral'>('dark')
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [zoom, setZoom] = useState(1)

  // Enhanced state management
  const [filterState, setFilterState] = useState<FilterState>({
    layers: {},
    complexityRange: [0, 100],
    connectionTypes: { imports: true, exports: true, calls: true },
    searchTerm: ''
  })
  const [showMiniMap, setShowMiniMap] = useState(false)
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 })
  const [performance, setPerformance] = useState<{ renderTime: number, nodeCount: number } | null>(null)

  // Initialize Mermaid with enhanced dark theme for better visibility
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      themeVariables: {
        // Background and base colors
        primaryColor: '#374151',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#ffffff',
        lineColor: '#ffffff',
        secondaryColor: '#4b5563',
        tertiaryColor: '#6b7280',
        
        // Background colors
        background: '#111827',
        mainBkg: '#1f2937',
        secondBkg: '#374151',
        
        // Text colors - all white for visibility
        nodeTextColor: '#ffffff',
        textColor: '#ffffff',
        labelTextColor: '#ffffff',
        
        // Flowchart specific
        flowchartNodeBkg: '#374151',
        flowchartNodeTextColor: '#ffffff',
        flowchartLinkColor: '#ffffff',
        flowchartLinkTextColor: '#ffffff',
        
        // Timeline specific - enhanced visibility
        timelineTextColor: '#ffffff',
        timelineBorderColor: '#ffffff',
        timelineLineColor: '#ffffff',
        timelineSectionBkg: '#374151',
        
        // Mindmap specific - enhanced visibility
        mindmapBranchColor: '#ffffff',
        mindmapTextColor: '#ffffff',
        mindmapNodeTextColor: '#ffffff',
        mindmapBorderColor: '#ffffff',
        
        // Edges and connections
        edgeLabelBackground: '#1f2937',
        clusterBkg: '#1f2937',
        clusterBorder: '#ffffff',
        
        // Font
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '14px',
        
        // Enable dark mode
        darkMode: true
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
        nodeSpacing: 100,
        rankSpacing: 100
      },
      timeline: {
        useMaxWidth: true
      },
      mindmap: {
        useMaxWidth: true
      },
      gitGraph: {
        mainBranchName: 'main'
      }
    })
  }, [theme])

  // Process nodes and assign layers
  const processedNodes = useMemo(() => {
    return data.nodes.map(node => ({
      ...node,
      layer: getNodeLayer(node),
      cleanName: cleanNodeName(node)
    }))
  }, [data.nodes])

  // Group nodes by layer for better organization
  const nodesByLayer = useMemo(() => {
    return processedNodes.reduce((acc, node) => {
      const layer = node.layer || 'services'
      if (!acc[layer]) acc[layer] = []
      acc[layer].push(node)
      return acc
    }, {} as Record<string, typeof processedNodes>)
  }, [processedNodes])

  // Generate beautiful Mermaid diagram syntax
  const generateMermaidSyntax = useMemo(() => {
    if (!processedNodes.length) return ''

    let syntax = ''
    
    switch (diagramType) {
      case 'flowchart':
        syntax = generateFlowchartSyntax()
        break
      case 'graph':
        syntax = generateGraphSyntax()
        break
      case 'timeline':
        syntax = generateTimelineSyntax()
        break
      case 'mindmap':
        syntax = generateMindmapSyntax()
        break
      default:
        syntax = generateFlowchartSyntax()
    }

    return syntax
  }, [processedNodes, diagramType, layout, nodesByLayer])

  function generateFlowchartSyntax(): string {
    let syntax = `flowchart ${layout}\n\n`
    
    // Add subgraphs for each layer with enhanced styling
    Object.entries(nodesByLayer).forEach(([layerKey, nodes]) => {
      const layerConfig = LAYER_CONFIG[layerKey as keyof typeof LAYER_CONFIG]
      if (!layerConfig || nodes.length === 0) return

      syntax += `    subgraph ${layerKey}_layer["${layerConfig.icon} ${layerConfig.name}"]\n`
      syntax += `        direction ${layout === 'TB' || layout === 'TD' ? 'LR' : 'TB'}\n`
      
      nodes.forEach(node => {
        const shape = getNodeShape(node)
        syntax += `        ${node.id}${shape}\n`
      })
      
      syntax += `    end\n\n`
    })

    // Add connections between nodes with white arrows
    data.edges.forEach(edge => {
      const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id
      const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id
      const arrow = getArrowStyle(edge.type)
      
      syntax += `    ${sourceId} ${arrow} ${targetId}\n`
    })

    // Add enhanced styling with white text and borders
    syntax += '\n'
    
    // Global style for all nodes to ensure white text
    syntax += `    classDef default fill:#374151,stroke:#ffffff,stroke-width:2px,color:#ffffff\n`
    
    // Layer-specific styles
    Object.entries(nodesByLayer).forEach(([layerKey, nodes]) => {
      const layerConfig = LAYER_CONFIG[layerKey as keyof typeof LAYER_CONFIG]
      if (!layerConfig) return

      // Style the subgraph with white text
      syntax += `    classDef ${layerKey}_style ${layerConfig.mermaidColor}\n`
      
      // Apply styling to all nodes in this layer
      const nodeIds = nodes.map(n => n.id).join(',')
      if (nodeIds) {
        syntax += `    class ${nodeIds} ${layerKey}_style\n`
      }
    })

    // Style subgraphs with white borders and text
    Object.keys(nodesByLayer).forEach(layerKey => {
      syntax += `    style ${layerKey}_layer fill:#1f2937,stroke:#ffffff,stroke-width:2px,color:#ffffff\n`
    })

    return syntax
  }

  function generateGraphSyntax(): string {
    let syntax = `graph ${layout}\n\n`
    
    processedNodes.forEach(node => {
      const shape = getNodeShape(node)
      syntax += `    ${node.id}${shape}\n`
    })

    syntax += '\n'
    data.edges.forEach(edge => {
      const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id
      const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id
      syntax += `    ${sourceId} --> ${targetId}\n`
    })

    return syntax
  }

  function generateTimelineSyntax(): string {
    let syntax = 'timeline\n'
    syntax += '    title Architecture Evolution Timeline\n\n'
    
    // Group by complexity/importance
    const sortedNodes = [...processedNodes].sort((a, b) => b.complexity - a.complexity)
    
    sortedNodes.slice(0, 10).forEach((node, index) => {
      syntax += `    Phase ${index + 1} : ${node.cleanName}\n`
    })

    return syntax
  }

  function generateMindmapSyntax(): string {
    let syntax = 'mindmap\n'
    syntax += '  root((Architecture))\n'
    
    Object.entries(nodesByLayer).forEach(([layerKey, nodes]) => {
      const layerConfig = LAYER_CONFIG[layerKey as keyof typeof LAYER_CONFIG]
      if (!layerConfig || nodes.length === 0) return

      syntax += `    ${layerConfig.name}\n`
      nodes.slice(0, 5).forEach(node => {
        syntax += `      ${node.cleanName}\n`
      })
    })

    return syntax
  }

  function getNodeShape(node: typeof processedNodes[0]): string {
    const name = node.cleanName
    
    switch (node.type) {
      case 'page':
        return `["📄 ${name}"]`
      case 'component':
        return `("🧩 ${name}")`
      case 'api':
        return `[["⚙️ ${name}"]]`
      case 'service':
        return `("💼 ${name}")`
      case 'database':
        return `[("🗄️ ${name}")]`
      case 'auth':
        return `{"🔐 ${name}"}`
      default:
        return `("${name}")`
    }
  }

  function getArrowStyle(edgeType: string): string {
    switch (edgeType) {
      case 'renders':
        return '==>'
      case 'calls':
        return '-->'
      case 'uses':
        return '-.->'
      case 'imports':
        return '-..->'
      default:
        return '-->'
    }
  }

  // Render the Mermaid diagram
  useEffect(() => {
    if (mermaidRef.current && generateMermaidSyntax) {
      // Clear previous content
      mermaidRef.current.innerHTML = ''
      
      // Create a unique ID for this diagram
      const diagramId = `mermaid-diagram-${Date.now()}`
      
      try {
        mermaid.render(diagramId, generateMermaidSyntax).then(({ svg }) => {
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = svg
            
            // Add click handlers to nodes
            const svgElement = mermaidRef.current.querySelector('svg')
            if (svgElement) {
              svgElement.style.transform = `scale(${zoom})`
              svgElement.style.transformOrigin = 'top left'
              svgElement.style.maxWidth = 'none'
              svgElement.style.height = 'auto'
              
              // Add node click handling
              const nodes = svgElement.querySelectorAll('.node')
              nodes.forEach(nodeElement => {
                const htmlElement = nodeElement as HTMLElement
                htmlElement.style.cursor = 'pointer'
                nodeElement.addEventListener('click', (e) => {
                  const nodeId = nodeElement.id?.replace('flowchart-', '')?.split('-')[0]
                  const node = processedNodes.find(n => n.id === nodeId)
                  if (node) {
                    setSelectedNode(node)
                    onNodeClick?.(node)
                  }
                })
              })
            }
          }
        }).catch(error => {
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = `
              <div class="p-8 text-center text-red-400">
                <p>Failed to render diagram</p>
              </div>
            `
          }
        })
      } catch (error) {
      }
    }
  }, [generateMermaidSyntax, zoom, processedNodes, onNodeClick])

  const downloadDiagram = () => {
    const svgElement = mermaidRef.current?.querySelector('svg')
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)
      
      const downloadLink = document.createElement('a')
      downloadLink.href = svgUrl
      downloadLink.download = `architecture-diagram-${Date.now()}.svg`
      downloadLink.click()
      
      URL.revokeObjectURL(svgUrl)
    }
  }

  if (!data.nodes?.length) {
    return (
      <Card className="p-12 text-center border-dashed border-2 bg-gray-900 border-gray-700">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-full flex items-center justify-center">
          <Info className="w-12 h-12 text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold mb-3 text-gray-200">No Architecture Data</h3>
        <p className="text-gray-400">No components found to visualize in this repository.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Professional Control Panel */}
      <Card className="p-6 bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Diagram Type Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">Diagram Type</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: 'flowchart', icon: Network, label: 'Flowchart' },
                { type: 'graph', icon: GitBranch, label: 'Graph' },
                { type: 'timeline', icon: TreePine, label: 'Timeline' },
                { type: 'mindmap', icon: Eye, label: 'Mindmap' }
              ].map(({ type, icon: Icon, label }) => (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  onClick={() => setDiagramType(type as any)}
                  className={`justify-start ${
                    diagramType === type 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Layout Direction */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium text-gray-300">Layout & Theme</span>
            </div>
            <div className="space-y-2">
              <select
                value={layout}
                onChange={(e) => setLayout(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 text-sm"
              >
                <option value="TB">Top to Bottom</option>
                <option value="TD">Top Down</option>
                <option value="BT">Bottom to Top</option>
                <option value="LR">Left to Right</option>
                <option value="RL">Right to Left</option>
              </select>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 text-sm"
              >
                <option value="dark">Dark Theme</option>
                <option value="default">Default</option>
                <option value="forest">Forest</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium text-gray-300">Controls</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(Math.min(3, zoom + 0.2))}
                className="text-gray-300 hover:bg-gray-700"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
                className="text-gray-300 hover:bg-gray-700"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(1)}
                className="text-gray-300 hover:bg-gray-700"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadDiagram}
                className="text-gray-300 hover:bg-gray-700"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLegend(!showLegend)}
                className="text-gray-300 hover:bg-gray-700"
              >
                {showLegend ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <div className="text-xs text-gray-400">
              Zoom: {Math.round(zoom * 100)}% • {processedNodes.length} components
            </div>
          </div>
        </div>
      </Card>

      {/* Legend */}
      {showLegend && (
        <Card className="p-4 bg-gray-800 border-gray-600">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Architecture Layers</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(LAYER_CONFIG).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-xs text-gray-400">
                  {config.icon} {config.name}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Main Diagram */}
      <Card className="p-6 bg-gray-900 border-gray-700 overflow-auto">
        <div 
          ref={mermaidRef} 
          className="mermaid-container w-full"
          style={{
            minHeight: '400px',
            maxHeight: '800px',
            overflow: 'auto'
          }}
        />
        
        {/* Enhanced Statistics Panel */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-blue-400">{data.stats.totalNodes}</div>
            <div className="text-sm text-gray-400">Components</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-green-400">{data.stats.totalEdges}</div>
            <div className="text-sm text-gray-400">Connections</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-purple-400">
              {Math.round(data.stats.averageConnections * 10) / 10}
            </div>
            <div className="text-sm text-gray-400">Avg Connections</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-yellow-400">
              {Object.keys(nodesByLayer).length}
            </div>
            <div className="text-sm text-gray-400">Layers</div>
          </div>
        </div>

        {/* Layer Details */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(nodesByLayer).map(([layerKey, nodes]) => {
            const layerConfig = LAYER_CONFIG[layerKey as keyof typeof LAYER_CONFIG]
            if (!layerConfig) return null

            return (
              <Card key={layerKey} className="p-4 bg-gray-800 border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: layerConfig.color }}
                    />
                    <span className="text-sm font-medium text-gray-300">
                      {layerConfig.icon} {layerConfig.name}
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                    {nodes.length}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {nodes.slice(0, 3).map(node => (
                    <div 
                      key={node.id}
                      className="text-xs text-gray-400 truncate cursor-pointer hover:text-gray-300"
                      onClick={() => {
                        setSelectedNode(node)
                        onNodeClick?.(node)
                      }}
                    >
                      {node.cleanName}
                    </div>
                  ))}
                  {nodes.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{nodes.length - 3} more...
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </Card>

      {/* Selected Node Details Panel */}
      {selectedNode && (
        <Card className="p-6 bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">
                {selectedNode.cleanName}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  variant="secondary" 
                  className="bg-blue-600 text-white"
                >
                  {selectedNode.type}
                </Badge>
                <Badge 
                  variant="outline" 
                  className="border-gray-600 text-gray-300"
                >
                  {LAYER_CONFIG[selectedNode.layer as keyof typeof LAYER_CONFIG]?.name || 'Unknown'}
                </Badge>
              </div>
              <p className="text-sm text-gray-400 font-mono">
                {selectedNode.path}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-200"
            >
              ✕
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 p-3 rounded-lg">
              <div className="text-sm text-gray-400">File Size</div>
              <div className="text-lg font-semibold text-gray-200">
                {Math.round(selectedNode.size / 1024 * 10) / 10}KB
              </div>
            </div>
            <div className="bg-gray-900 p-3 rounded-lg">
              <div className="text-sm text-gray-400">Complexity</div>
              <div className="text-lg font-semibold text-gray-200">
                {selectedNode.complexity || 'N/A'}
              </div>
            </div>
            <div className="bg-gray-900 p-3 rounded-lg">
              <div className="text-sm text-gray-400">Type</div>
              <div className="text-lg font-semibold text-gray-200 capitalize">
                {selectedNode.isDirectory ? 'Directory' : 'File'}
              </div>
            </div>
            <div className="bg-gray-900 p-3 rounded-lg">
              <div className="text-sm text-gray-400">Connections</div>
              <div className="text-lg font-semibold text-gray-200">
                {data.edges.filter(edge => 
                  (typeof edge.source === 'string' ? edge.source : edge.source.id) === selectedNode.id ||
                  (typeof edge.target === 'string' ? edge.target : edge.target.id) === selectedNode.id
                ).length}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Advanced Filter Controls */}
      <Card className="p-4 bg-gray-800 border-gray-600">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-300">Advanced Filters</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Reset all filters - you can implement filter state management
            }}
            className="text-gray-400 hover:text-gray-200 text-xs"
          >
            Reset Filters
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Layer Filter */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Show Layers</label>
            <div className="space-y-1">
              {Object.entries(LAYER_CONFIG).map(([key, config]) => (
                <label key={key} className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-600 bg-gray-700 text-blue-600"
                  />
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="text-gray-300">{config.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Complexity Filter */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Complexity Range</label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="0"
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Simple</span>
                <span>Complex</span>
              </div>
            </div>
          </div>

          {/* Connection Filter */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Connection Types</label>
            <div className="space-y-1">
              {['renders', 'calls', 'uses', 'imports'].map(type => (
                <label key={type} className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-600 bg-gray-700 text-blue-600"
                  />
                  <span className="text-gray-300 capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Performance Insights with better contrast */}
      <Card className="p-6 bg-gray-800 border-gray-600">
        <h4 className="text-lg font-semibold text-white mb-4">Architecture Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-sm font-medium text-white mb-3">Potential Issues</h5>
            <div className="space-y-2">
              {/* High complexity components */}
              {processedNodes
                .filter(node => node.complexity > 50)
                .slice(0, 3)
                .map(node => (
                  <div key={node.id} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-red-400 rounded-full" />
                    <span className="text-white">
                      High complexity: {node.cleanName}
                    </span>
                    <Badge variant="destructive" className="text-xs bg-red-600 text-white">
                      {node.complexity}
                    </Badge>
                  </div>
                ))}
              
              {/* Isolated components */}
              {processedNodes
                .filter(node => {
                  const connections = data.edges.filter(edge => 
                    (typeof edge.source === 'string' ? edge.source : edge.source.id) === node.id ||
                    (typeof edge.target === 'string' ? edge.target : edge.target.id) === node.id
                  ).length
                  return connections === 0
                })
                .slice(0, 2)
                .map(node => (
                  <div key={node.id} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                    <span className="text-white">
                      Isolated: {node.cleanName}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div>
            <h5 className="text-sm font-medium text-white mb-3">Recommendations</h5>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2" />
                <span className="text-white">
                  Consider breaking down components with complexity &gt; 50
                </span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2" />
                <span className="text-white">
                  Add connections for isolated components
                </span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2" />
                <span className="text-white">
                  Layer distribution looks balanced ({Object.keys(nodesByLayer).length} layers)
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}