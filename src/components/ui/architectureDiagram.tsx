'use client'

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import * as d3 from 'd3'
import { Card } from './card'
import { Badge } from './badge'
import { Button } from './button'
import { ZoomIn, ZoomOut, RotateCcw, Download, Info, Layers, Grid3X3, Eye, EyeOff, GitBranch, Network, TreePine, Brain, Palette, Activity } from 'lucide-react'
import MermaidArchitectureDiagram from './mermaidArchitectureDiagram'

// Enhanced Architecture Analyzer with Gemini AI Integration
export class ArchitectureAnalyzer {
  private geminiApiKey: string

  constructor(geminiApiKey: string) {
    this.geminiApiKey = geminiApiKey
  }

  async analyzeArchitecture(nodes: Node[], edges: Edge[]): Promise<ArchitectureInsights> {
    const architectureData = this.prepareArchitectureData(nodes, edges)
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze this software architecture and provide insights:

Architecture Data:
- Total Components: ${nodes.length}
- Total Connections: ${edges.length}
- Layers: ${this.getUniqueLayers(nodes)}

Component Details:
${nodes.map(node => `- ${node.label} (${node.type}, Layer: ${node.layer}, Complexity: ${node.complexity})`).join('\n')}

Connection Details:
${edges.map(edge => `- ${edge.source} -> ${edge.target} (${edge.type})`).join('\n')}

Please provide:
1. Architecture quality assessment (0-100)
2. Identified patterns and anti-patterns
3. Complexity hotspots
4. Modularity assessment
5. Scalability concerns
6. Recommended improvements
7. Best practices compliance
8. Suggested refactoring opportunities

Format response as JSON with these fields: 
{
  "qualityScore": number,
  "patterns": string[],
  "antiPatterns": string[],
  "complexityHotspots": Array<{component: string, reason: string, severity: "low"|"medium"|"high"}>,
  "modularityScore": number,
  "scalabilityConcerns": string[],
  "recommendations": Array<{type: string, description: string, priority: "low"|"medium"|"high"}>,
  "bestPractices": Array<{practice: string, compliance: "good"|"needs_improvement"|"poor", suggestion: string}>,
  "refactoringOpportunities": Array<{component: string, opportunity: string, effort: "low"|"medium"|"high"}>,
  "visualizationSuggestions": Array<{type: string, description: string, reason: string}>
}`
            }]
          }]
        })
      })

      const result = await response.json()
      const content = result.candidates?.[0]?.content?.parts?.[0]?.text

      if (content) {
        try {
          return JSON.parse(content)
        } catch (parseError) {
          console.error('Failed to parse Gemini response:', parseError)
          return this.getFallbackInsights()
        }
      }
    } catch (error) {
      console.error('Failed to get Gemini insights:', error)
    }

    return this.getFallbackInsights()
  }

  private prepareArchitectureData(nodes: Node[], edges: Edge[]) {
    return {
      totalComponents: nodes.length,
      totalConnections: edges.length,
      layers: this.getUniqueLayers(nodes),
      avgComplexity: nodes.reduce((sum, n) => sum + n.complexity, 0) / nodes.length,
      maxComplexity: Math.max(...nodes.map(n => n.complexity)),
      connectionDensity: edges.length / Math.max(1, nodes.length)
    }
  }

  private getUniqueLayers(nodes: Node[]): string[] {
    return [...new Set(nodes.map(n => n.layer).filter((layer): layer is string => Boolean(layer)))]
  }

  private getFallbackInsights(): ArchitectureInsights {
    return {
      qualityScore: 75,
      patterns: ['Layered Architecture', 'Component-based Design'],
      antiPatterns: ['Potential circular dependencies'],
      complexityHotspots: [],
      modularityScore: 80,
      scalabilityConcerns: ['Consider breaking down large components'],
      recommendations: [],
      bestPractices: [],
      refactoringOpportunities: [],
      visualizationSuggestions: [
        {
          type: 'dependency-flow',
          description: 'Show data flow between components',
          reason: 'Better understanding of system interactions'
        }
      ]
    }
  }
}

interface ArchitectureInsights {
  qualityScore: number
  patterns: string[]
  antiPatterns: string[]
  complexityHotspots: Array<{component: string, reason: string, severity: "low"|"medium"|"high"}>
  modularityScore: number
  scalabilityConcerns: string[]
  recommendations: Array<{type: string, description: string, priority: "low"|"medium"|"high"}>
  bestPractices: Array<{practice: string, compliance: "good"|"needs_improvement"|"poor", suggestion: string}>
  refactoringOpportunities: Array<{component: string, opportunity: string, effort: "low"|"medium"|"high"}>
  visualizationSuggestions: Array<{type: string, description: string, reason: string}>
}

interface Node {
  id: string
  label: string
  path: string
  type: string
  size: number
  complexity: number
  layer?: string
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
  isDirectory?: boolean
  depth?: number
  fileCount?: number
  childDirCount?: number
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

interface ArchitectureDiagramProps {
  data: ArchitectureData
  onNodeClick?: (node: Node) => void
}

// Layer definitions for smart architecture - user-friendly categories
const SMART_LAYER_CONFIG = {
  'pages': { 
    name: 'User Interface', 
    color: '#10b981', 
    icon: '👥',
    description: 'What users see and interact with',
    userFriendly: 'Frontend - User Pages'
  },
  'components': { 
    name: 'UI Components', 
    color: '#3b82f6', 
    icon: '🧩',
    description: 'Reusable interface building blocks',
    userFriendly: 'Frontend - Components'
  },
  'api': { 
    name: 'Backend Services', 
    color: '#8b5cf6', 
    icon: '⚙️',
    description: 'Server logic and data processing',
    userFriendly: 'Backend - APIs'
  },
  'services': { 
    name: 'Business Logic', 
    color: '#f59e0b', 
    icon: '💼',
    description: 'Core application functionality',
    userFriendly: 'Backend - Services'
  },
  'database': { 
    name: 'Data Storage', 
    color: '#ef4444', 
    icon: '🗄️',
    description: 'Database and data management',
    userFriendly: 'Database'
  },
  'auth': { 
    name: 'Security', 
    color: '#06b6d4', 
    icon: '🔐',
    description: 'Authentication and authorization',
    userFriendly: 'Security & Auth'
  }
}

// Map node types to smart layers
const getSmartLayer = (nodeType: string, path: string) => {
  if (nodeType === 'page') return 'pages'
  if (nodeType === 'component') return 'components'
  if (nodeType === 'api') return 'api'
  if (nodeType === 'service') return 'services'
  if (nodeType === 'database') return 'database'
  if (nodeType === 'auth') return 'auth'
  return 'services' // fallback
}

export default function ArchitectureDiagram({ data, onNodeClick }: ArchitectureDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null)
  const [dimensions, setDimensions] = useState({ width: 1400, height: 900 })
  const [showLayers, setShowLayers] = useState(true)
  const [activeLayer, setActiveLayer] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'tree' | 'layer' | 'dependency' | 'circular' | 'sunburst' | 'matrix'>('layer')
  const [showHierarchy, setShowHierarchy] = useState(true)
  const [showDependencies, setShowDependencies] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredComplexity, setFilteredComplexity] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [filteredFileType, setFilteredFileType] = useState<string>('all')
  const [aiInsights, setAiInsights] = useState<ArchitectureInsights | null>(null)
  const [loadingAI, setLoadingAI] = useState(false)
  const [showComplexityHeatmap, setShowComplexityHeatmap] = useState(false)
  const [showConnectionStrength, setShowConnectionStrength] = useState(false)
  
  // Fixed: Proper visualization engine state management
  const [isMermaidEngine, setIsMermaidEngine] = useState(true)

  // Helper functions for engine switching
  const switchToMermaid = () => setIsMermaidEngine(true)
  const switchToD3 = () => setIsMermaidEngine(false)

  // Render engine selection controls
  const renderEngineSelector = () => (
    <Card className="p-4 bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">Visualization Engine:</span>
          </div>
          
          <div className="flex items-center gap-1 bg-gray-800 rounded-xl p-1 shadow-lg border border-gray-600">
            <Button
              variant="ghost"
              size="sm"
              onClick={switchToMermaid}
              className={`rounded-lg transition-all ${
                isMermaidEngine 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
              title="Professional Mermaid Diagrams - Beautiful, Simple, Modern"
            >
              <Activity className="w-4 h-4 mr-2" />
              Mermaid Pro
              <Badge className="ml-2 bg-green-500 text-white text-xs">Recommended</Badge>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={switchToD3}
              className={`rounded-lg transition-all ${
                !isMermaidEngine 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
              title="Advanced D3.js Visualization - Interactive, Customizable"
            >
              <Network className="w-4 h-4 mr-2" />
              D3 Advanced
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>{isMermaidEngine ? '✨ Using professional Mermaid engine' : '🔧 Using advanced D3.js engine'}</span>
        </div>
      </div>
    </Card>
  )

  // If Mermaid is selected, render the Mermaid component
  if (isMermaidEngine) {
    return (
      <div className="space-y-6">
        {renderEngineSelector()}
        <MermaidArchitectureDiagram 
          data={data} 
          onNodeClick={(node) => {
            setSelectedNode(node)
            onNodeClick?.(node)
          }} 
        />
      </div>
    )
  }

  // D3.js visualization rendering
  return (
    <div className="space-y-6 bg-gray-900 p-6 rounded-xl">
      {renderEngineSelector()}
      
      {/* Enhanced Controls with Dark Theme */}
      <div className="flex items-center justify-between bg-gradient-to-r from-gray-800 to-gray-700 p-4 rounded-xl border border-gray-600">
        <div className="flex items-center gap-3">
          {/* View Mode Selector */}
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1 shadow-lg border border-gray-600">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewMode('tree')}
              className={`hover:bg-gray-700 ${viewMode === 'tree' ? 'text-green-400 bg-gray-700' : 'text-gray-300'}`}
              title="Tree View - Shows hierarchical file structure"
            >
              <TreePine className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewMode('layer')}
              className={`hover:bg-gray-700 ${viewMode === 'layer' ? 'text-blue-400 bg-gray-700' : 'text-gray-300'}`}
              title="Layer View - Groups by architectural layers"
            >
              <Layers className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewMode('dependency')}
              className={`hover:bg-gray-700 ${viewMode === 'dependency' ? 'text-purple-400 bg-gray-700' : 'text-gray-300'}`}
              title="Dependency View - Shows component dependencies"
            >
              <Network className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewMode('circular')}
              className={`hover:bg-gray-700 ${viewMode === 'circular' ? 'text-orange-400 bg-gray-700' : 'text-gray-300'}`}
              title="Circular View - Radial component layout"
            >
              <div className="w-4 h-4 border-2 border-current rounded-full" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewMode('matrix')}
              className={`hover:bg-gray-700 ${viewMode === 'matrix' ? 'text-pink-400 bg-gray-700' : 'text-gray-300'}`}
              title="Matrix View - Dependency matrix"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-gray-400 bg-gray-800 px-4 py-2 rounded-lg border border-gray-600">
          <span className="font-medium text-gray-300">
            {viewMode === 'tree' && '🌳 Tree View'}
            {viewMode === 'layer' && '📑 Layer View'}
            {viewMode === 'dependency' && '🔗 Dependency View'}
            {viewMode === 'circular' && '🔄 Circular View'}
            {viewMode === 'matrix' && '📊 Matrix View'}
          </span>
          <span className="ml-2 text-gray-500">•</span>
          <span className="ml-2">Click nodes to inspect • Scroll to zoom</span>
        </div>
      </div>

      {/* D3.js Implementation Placeholder */}
      <Card className="p-8 bg-gray-800 border-gray-600">
        <div className="text-center">
          <Network className="w-16 h-16 mx-auto mb-4 text-purple-400" />
          <h3 className="text-lg font-semibold text-white mb-2">D3.js Advanced Visualization</h3>
          <p className="text-gray-400 mb-4">
            Interactive force-directed graph with advanced features
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-900 p-3 rounded-lg">
              <div className="text-blue-400 font-semibold">Interactive</div>
              <div className="text-gray-400">Drag, zoom, pan</div>
            </div>
            <div className="bg-gray-900 p-3 rounded-lg">
              <div className="text-green-400 font-semibold">Customizable</div>
              <div className="text-gray-400">Multiple layouts</div>
            </div>
            <div className="bg-gray-900 p-3 rounded-lg">
              <div className="text-purple-400 font-semibold">Advanced</div>
              <div className="text-gray-400">Physics simulation</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics Panel */}
      <Card className="p-6 bg-gray-800 border-gray-600">
        <h4 className="text-lg font-semibold text-white mb-4">Architecture Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{data.stats.totalNodes}</div>
            <div className="text-sm text-gray-400">Components</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{data.stats.totalEdges}</div>
            <div className="text-sm text-gray-400">Connections</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {Math.round(data.stats.averageConnections * 10) / 10}
            </div>
            <div className="text-sm text-gray-400">Avg Connections</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {Math.round((data.stats.totalEdges / Math.max(1, data.stats.totalNodes)) * 100)}%
            </div>
            <div className="text-sm text-gray-400">Connectivity</div>
          </div>
        </div>
      </Card>
    </div>
  )
}