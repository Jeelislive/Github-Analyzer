'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import ArchitectureDiagram from '@/components/ui/architecture-diagram'
import { ArrowLeft, Search, Code, FileText, GitBranch, Zap } from 'lucide-react'

interface Component {
  id: string
  name: string
  type: string
  path: string
  startLine: number
  endLine: number
  props?: any
  exports?: any
  description?: string
  complexity: number
}

interface FileData {
  id: string
  name: string
  path: string
  content?: string
  language?: string
  linesOfCode?: number
  complexity?: number
  components: Component[]
  imports: Array<{
    importPath: string
    importType: string
    importedFile: {
      id: string
      name: string
      path: string
      language: string
    }
  }>
  importedBy: Array<{
    importPath: string
    importType: string
    importingFile: {
      id: string
      name: string
      path: string
      language: string
    }
  }>
}

interface ArchitectureData {
  nodes: Array<{
    id: string
    label: string
    path: string
    type: string
    size: number
    complexity: number
  }>
  edges: Array<{
    source: string
    target: string
    type: string
    label: string
  }>
  stats: {
    totalNodes: number
    totalEdges: number
    averageConnections: number
  }
}

export default function RepositoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const repoId = params.repoId as string

  const [repository, setRepository] = useState<any>(null)
  const [components, setComponents] = useState<Component[]>([])
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null)
  const [architecture, setArchitecture] = useState<ArchitectureData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')

  useEffect(() => {
    if (repoId) {
      fetchRepositoryDetails()
      fetchComponents()
      fetchArchitecture()
    }
  }, [repoId])

  const fetchRepositoryDetails = async () => {
    try {
      const response = await fetch(`/api/repos/${repoId}?include=analytics,documentation`)
      if (response.ok) {
        const data = await response.json()
        setRepository(data)
      }
    } catch (error) {
      console.error('Failed to fetch repository details:', error)
    }
  }

  const fetchComponents = async () => {
    try {
      const response = await fetch(`/api/components?repoId=${repoId}`)
      if (response.ok) {
        const data = await response.json()
        setComponents(data.components)
      }
    } catch (error) {
      console.error('Failed to fetch components:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchArchitecture = async () => {
    try {
      const response = await fetch(`/api/repos/${repoId}/architecture`)
      if (response.ok) {
        const data = await response.json()
        setArchitecture(data)
      }
    } catch (error) {
      console.error('Failed to fetch architecture:', error)
    }
  }

  const fetchFileDetails = async (fileId: string) => {
    try {
      const response = await fetch(`/api/repos/${repoId}/files/${fileId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedFile(data)
      }
    } catch (error) {
      console.error('Failed to fetch file details:', error)
    }
  }

  const handleNodeClick = (node: any) => {
    // When a node is clicked in the diagram, show file details
    fetchFileDetails(node.id)
  }

  const filteredComponents = components.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.path.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || component.type === selectedType
    return matchesSearch && matchesType
  })

  const getComplexityColor = (complexity: number) => {
    if (complexity <= 5) return 'text-green-500'
    if (complexity <= 10) return 'text-yellow-500'
    if (complexity <= 20) return 'text-orange-500'
    return 'text-red-500'
  }

  const getComplexityBadge = (complexity: number) => {
    if (complexity <= 5) return 'Low'
    if (complexity <= 10) return 'Medium'
    if (complexity <= 20) return 'High'
    return 'Very High'
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {repository?.owner}/{repository?.repoName}
          </h1>
          <p className="text-muted-foreground">{repository?.description}</p>
        </div>
      </div>

      <Tabs defaultValue="components" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search components..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Types</option>
              <option value="component">Components</option>
              <option value="function">Functions</option>
              <option value="class">Classes</option>
              <option value="hook">Hooks</option>
              <option value="util">Utils</option>
            </select>
          </div>

          {/* Components Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredComponents.map((component) => (
              <Card key={component.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                    onClick={() => {
                      // Find the file ID for this component
                      const fileNode = architecture?.nodes.find(node => node.path === component.path)
                      if (fileNode) {
                        fetchFileDetails(fileNode.id)
                      }
                    }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-3">
                    <h3 className="font-semibold text-lg truncate" title={component.name}>
                      {component.name}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate" title={component.path}>
                      {component.path}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize shrink-0">
                    {component.type}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="truncate">Lines: {component.startLine}-{component.endLine}</span>
                    <span className={`font-medium shrink-0 ml-2 ${getComplexityColor(component.complexity)}`}>
                      {getComplexityBadge(component.complexity)}
                    </span>
                  </div>
                  
                  {component.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 break-words">
                      {component.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <Zap className="w-4 h-4 text-yellow-500 shrink-0" />
                  <span className="text-sm truncate">Complexity: {component.complexity}</span>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="architecture" className="space-y-6">
          {architecture && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">Total Files</span>
                  </div>
                  <p className="text-2xl font-bold">{architecture.stats.totalNodes}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <GitBranch className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Connections</span>
                  </div>
                  <p className="text-2xl font-bold">{architecture.stats.totalEdges}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="w-5 h-5 text-purple-500" />
                    <span className="font-medium">Avg Connections</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {(architecture.stats.averageConnections || 0).toFixed(1)}
                  </p>
                </Card>
              </div>

              {/* Interactive D3.js Architecture Diagram */}
              <ArchitectureDiagram 
                data={architecture} 
                onNodeClick={handleNodeClick}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="documentation" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Generated Documentation</h3>
            {repository?.documentation?.readme ? (
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap">{repository.documentation.readme}</pre>
              </div>
            ) : (
              <p className="text-muted-foreground">
                No documentation available. The system can generate API docs, usage examples, and architectural guides.
              </p>
            )}
          </Card>

          {repository?.documentation?.apiDocs && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">API Documentation</h3>
              <div className="space-y-4">
                {/* API docs would be rendered here */}
                <p className="text-muted-foreground">
                  Generated API documentation based on component analysis would be displayed here.
                </p>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {repository?.analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Total Files</span>
                </div>
                <p className="text-2xl font-bold">{repository.analytics.totalFiles}</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Lines of Code</span>
                </div>
                <p className="text-2xl font-bold">
                  {(repository.analytics.totalLinesOfCode || 0).toLocaleString()}
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">Complexity Score</span>
                </div>
                <p className="text-2xl font-bold">
                  {Math.round(repository.analytics.complexityScore || 0)}
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <GitBranch className="w-5 h-5 text-purple-500" />
                  <span className="font-medium">Maintainability</span>
                </div>
                <p className="text-2xl font-bold">
                  {Math.round(repository.analytics.maintainabilityIndex || 0)}%
                </p>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* File Detail Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0 mr-4">
                  <h3 className="text-xl font-semibold truncate" title={selectedFile.name}>
                    {selectedFile.name}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate" title={selectedFile.path}>
                    {selectedFile.path}
                  </p>
                </div>
                <Button variant="outline" onClick={() => setSelectedFile(null)} className="shrink-0">
                  Close
                </Button>
              </div>
            </div>
            
            <div className="p-6 overflow-auto">
              <Tabs defaultValue="code" className="w-full">
                <TabsList>
                  <TabsTrigger value="code">Code</TabsTrigger>
                  <TabsTrigger value="components">Components</TabsTrigger>
                  <TabsTrigger value="relationships">Relationships</TabsTrigger>
                </TabsList>
                
                <TabsContent value="code" className="mt-4">
                  {selectedFile.content ? (
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                      <code>{selectedFile.content}</code>
                    </pre>
                  ) : (
                    <p className="text-muted-foreground">Code content not available</p>
                  )}
                </TabsContent>
                
                <TabsContent value="components" className="mt-4">
                  <div className="space-y-4">
                    {selectedFile.components.map((component) => (
                      <Card key={component.id} className="p-4 overflow-hidden">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0 mr-3">
                            <h4 className="font-semibold truncate" title={component.name}>
                              {component.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {component.type} (lines {component.startLine}-{component.endLine})
                            </p>
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            Complexity: {component.complexity}
                          </Badge>
                        </div>
                        {component.description && (
                          <p className="text-sm mt-2 break-words">{component.description}</p>
                        )}
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="relationships" className="mt-4">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">Imports ({selectedFile.imports.length})</h4>
                      <div className="space-y-2">
                        {selectedFile.imports.map((imp, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded overflow-hidden gap-3">
                            <span className="text-sm truncate flex-1 min-w-0" title={imp.importedFile.path}>
                              {imp.importedFile.path}
                            </span>
                            <Badge variant="outline" className="shrink-0">{imp.importType}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Imported By ({selectedFile.importedBy.length})</h4>
                      <div className="space-y-2">
                        {selectedFile.importedBy.map((imp, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded overflow-hidden gap-3">
                            <span className="text-sm truncate flex-1 min-w-0" title={imp.importingFile.path}>
                              {imp.importingFile.path}
                            </span>
                            <Badge variant="outline" className="shrink-0">{imp.importType}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}