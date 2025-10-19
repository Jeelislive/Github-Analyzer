'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import MermaidArchitectureDiagram from '@/components/ui/mermaidArchitectureDiagram'
import ComponentCodeModal from '@/components/ui/componentCodeModal'
import DeleteConfirmationDialog from '@/components/ui/deleteConfirmationDialog'
import { ArrowLeft, Search, Code, FileText, GitBranch, Zap, Eye, Trash2 } from 'lucide-react'

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
  const [files, setFiles] = useState<FileData[]>([])
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null)
  const [architecture, setArchitecture] = useState<ArchitectureData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [enhancedData, setEnhancedData] = useState<any>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (repoId) {
      fetchRepositoryDetails()
      fetchEnhancedData()
    }
  }, [repoId])

  const fetchRepositoryDetails = async () => {
    try {
      const response = await fetch(`/api/repos/${repoId}?include=files,analytics,documentation`)
      if (response.ok) {
        const data = await response.json()
        setRepository(data)
        if (Array.isArray(data.files)) {
          setFiles(data.files as FileData[])
        }
      }
    } catch (error) {
    }
  }

  const fetchEnhancedData = async () => {
    try {
      const response = await fetch(`/api/repos/${repoId}`)
      if (response.ok) {
        const data = await response.json()
        setEnhancedData(data.data)
        
        // Extract architecture data
        if (data.data?.architecture) {
          setArchitecture(data.data.architecture)
        }
        
        // Extract components from architecture nodes
        if (data.data?.architecture?.nodes) {
          const extractedComponents = data.data.architecture.nodes
            .filter((node: any) => node.type === 'component' || node.type === 'page')
            .map((node: any) => ({
              id: node.id,
              name: node.cleanName || node.label,
              type: node.type,
              path: node.path,
              startLine: 1,
              endLine: Math.floor(node.size / 50) || 10,
              complexity: node.complexity || 0,
              description: `Component from ${node.path}`
            }))
          setComponents(extractedComponents)
        }
      }
    } catch (error) {
    } finally {
      setLoading(false)
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
    }
  }

  const handleNodeClick = (node: any) => {
    // When a node is clicked in the diagram, show file details
    fetchFileDetails(node.id)
  }

  const handleDeleteRepository = async () => {
    if (!repoId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/repos/${repoId}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Redirect to dashboard after successful deletion
        router.push('/dashboard')
      } else {
        const error = await response.json()
        alert('Failed to delete repository analysis. Please try again.')
      }
    } catch (error) {
      alert('An error occurred while deleting the repository analysis.')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
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

  const getFileDifficulty = (file: FileData) => {
    const c = file.complexity ?? 0
    const loc = file.linesOfCode ?? (file.content ? file.content.split('\n').length : 0)
    const score = c * 2 + Math.ceil(loc / 200)
    if (score <= 5) return { label: 'Easy', color: 'bg-green-100 text-green-700' }
    if (score <= 10) return { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' }
    if (score <= 20) return { label: 'Hard', color: 'bg-orange-100 text-orange-700' }
    return { label: 'Very Hard', color: 'bg-red-100 text-red-700' }
  }

  if (loading) {
    return <div className="w-full px-6 py-6">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
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
        
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          className="flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete Analysis
        </Button>
      </div>

      <Tabs defaultValue="components" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="components">Components & Files</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="space-y-6">
          {/* Important Files (Top 10) */}
          <Card className="p-5">
            <h3 className="text-lg font-semibold mb-4">Important Files (Top 10)</h3>
            {files && files.length > 0 ? (
              <div className="space-y-6">
                {([...files]
                  .sort((a,b)=> (b.complexity ?? 0) - (a.complexity ?? 0) || (b.linesOfCode ?? 0) - (a.linesOfCode ?? 0))
                  .slice(0,10)
                ).map((f) => {
                  const diff = getFileDifficulty(f)
                  return (
                    <div key={f.id} className="border rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2 bg-gray-50">
                        <div className="truncate">
                          <div className="font-medium truncate" title={f.name}>{f.name}</div>
                          <div className="text-xs text-gray-600 truncate" title={f.path}>{f.path}</div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${diff.color}`}>{diff.label}</span>
                      </div>
                      <div className="p-0">
                        {f.content ? (
                          <pre className="bg-white p-4 text-sm overflow-auto max-h-[420px]"><code>{f.content}</code></pre>
                        ) : (
                          <div className="p-4 text-sm text-gray-600">Code content not available.</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No files found for this analysis.</p>
            )}
          </Card>

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

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500 shrink-0" />
                    <span className="text-sm truncate">Complexity: {component.complexity}</span>
                  </div>
                  <ComponentCodeModal
                    component={component}
                    repoId={repoId}
                    repoOwner={repository?.owner}
                    repoName={repository?.repoName}
                    branch={repository?.defaultBranch || 'main'}
                  >
                    <Button size="sm" variant="outline" className="h-8 px-3">
                      <Eye className="h-4 w-4 mr-1" />
                      Code
                    </Button>
                  </ComponentCodeModal>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="architecture" className="space-y-6">
          <Card className="p-12 text-center">
            <h3 className="text-2xl font-semibold mb-2">Architecture</h3>
            <p className="text-gray-600">Coming soon</p>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-6">
          <Card className="p-12 text-center">
            <h3 className="text-2xl font-semibold mb-2">Documentation</h3>
            <p className="text-gray-600">Coming soon</p>
          </Card>
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteRepository}
        repository={{
          id: repoId,
          owner: repository?.owner || '',
          repoName: repository?.repoName || '',
          description: repository?.description,
          language: repository?.language,
          stars: repository?.stars,
          forks: repository?.forks
        }}
        isLoading={isDeleting}
      />
    </div>
  )
}
    