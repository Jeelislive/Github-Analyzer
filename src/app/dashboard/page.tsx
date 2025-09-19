'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AIInsightsDashboard from '@/components/ui/ai-insights-dashboard'
import CollaborationNetwork from '@/components/ui/collaboration-network'
import EvolutionTimeline from '@/components/ui/evolution-timeline'
import { GitBranch, Plus, Search, Sparkles, Brain, Zap, AlertCircle, CheckCircle, Trash2 } from 'lucide-react'

interface Repository {
  id: string
  owner: string
  repoName: string
  description: string
  language: string
  stars: number
  forks: number
  analysisStatus: 'pending' | 'completed' | 'failed'
  lastAnalyzed: string
  enhancedData?: any
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [enhancedAnalyzing, setEnhancedAnalyzing] = useState(false)
  const [repoUrl, setRepoUrl] = useState('')
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [activeTab, setActiveTab] = useState('repositories') // Default to repositories
  const [deletingRepoId, setDeletingRepoId] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user) {
      fetchRepositories()
    }
  }, [session])

  useEffect(() => {
    if (repositories.length > 0 && !selectedRepo) {
      const repoWithInsights = repositories.find(r => r.enhancedData?.geminiInsights)
      if (repoWithInsights) {
        setSelectedRepo(repoWithInsights)
      }
    }
  }, [repositories, selectedRepo])

  const fetchRepositories = async () => {
    try {
      const response = await fetch('/api/repos')
      if (response.ok) {
        const data = await response.json()
        setRepositories(data)
      }
    } catch (error) {
      console.error('Failed to fetch repositories:', error)
    } finally {
      setLoading(false)
    }
  }

  const analyzeRepository = async (enhanced = false) => {
    if (!repoUrl) return

    const setLoadingState = enhanced ? setEnhancedAnalyzing : setAnalyzing
    setLoadingState(true)

    try {
      const endpoint = enhanced ? '/api/analyze/enhanced' : '/api/analyze'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          repoUrl,
          options: enhanced ? {
            includeFileContent: true,
            includeCommitHistory: true,
            includeGeminiAnalysis: true,
            maxFiles: 100,
            maxCommits: 200
          } : {}
        })
      })

      if (response.ok) {
        const data = await response.json()
        setRepoUrl('')
        
        // Refresh the repository list
        await fetchRepositories()
        
        if (enhanced && data.enhancedData) {
          // Wait a bit for the UI to update, then select the new repository
          setTimeout(async () => {
            await fetchRepositories() // Ensure we have the latest data
            const newRepo = repositories.find(r => r.id === data.repositoryId)
            if (newRepo) {
              setSelectedRepo(newRepo)
            }
          }, 1500)
        }
        
        // Show success message
        alert(`Repository analyzed successfully! ${enhanced ? 'AI Insights tab will be enabled shortly.' : ''}`)
      } else {
        const error = await response.json()
        alert(`Analysis failed: ${error.details || error.error}`)
      }
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('Analysis failed. Please try again.')
    } finally {
      setLoadingState(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <AlertCircle className="w-4 h-4" />
      case 'failed': return <AlertCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  // Function to handle AI Insights button click
  const handleViewAIInsights = (repo: Repository) => {
    console.log('Viewing AI insights for:', repo.owner + '/' + repo.repoName)
    console.log('Has Gemini insights:', !!repo.enhancedData?.geminiInsights)
    
    setSelectedRepo(repo)
    setActiveTab('insights') // Switch to insights tab
  }

  // Function to handle repository deletion
  const handleDeleteRepository = async (repoId: string) => {
    if (!confirm('Are you sure you want to delete this repository analysis? This action cannot be undone.')) {
      return
    }

    setDeletingRepoId(repoId)
    try {
      const response = await fetch(`/api/repos/${repoId}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Remove the repository from the list
        setRepositories(repos => repos.filter(repo => repo.id !== repoId))
        console.log('Repository analysis deleted successfully')
      } else {
        const error = await response.json()
        console.error('Delete failed:', error)
        alert('Failed to delete repository analysis. Please try again.')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('An error occurred while deleting the repository analysis.')
    } finally {
      setDeletingRepoId(null)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Repository Dashboard</h1>
          <p className="text-gray-600">Analyze and visualize your GitHub repositories with AI-powered insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Brain className="w-3 h-3 mr-1" />
            Powered by Gemini AI
          </Badge>
        </div>
      </div>

      {/* Analysis Input Section */}
      <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-600" />
          Analyze New Repository
        </h2>
        
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Enter GitHub repository URL (e.g., https://github.com/owner/repo)"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={() => analyzeRepository(true)}
              disabled={!repoUrl || enhancedAnalyzing}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Sparkles className="w-4 h-4" />
              {enhancedAnalyzing ? 'Analyzing...' : 'Analyze Repository'}
            </Button>
          </div>

          <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border">
            <p><strong>Comprehensive Analysis:</strong> Runs the full enhanced analysis powered by Gemini AI, including code quality assessment, architecture insights, team collaboration patterns, and actionable recommendations.</p>
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="repositories">Repositories</TabsTrigger>
          <TabsTrigger 
            value="insights" 
            disabled={!selectedRepo?.enhancedData?.geminiInsights}
            className={!selectedRepo?.enhancedData?.geminiInsights ? "opacity-50" : ""}
          >
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Insights
              {!selectedRepo?.enhancedData?.geminiInsights && (
                <span className="text-xs bg-orange-100 text-orange-700 px-1 rounded">Requires Enhanced Analysis</span>
              )}
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="visualizations" 
            disabled={!selectedRepo?.enhancedData?.geminiInsights}
            className={!selectedRepo?.enhancedData?.geminiInsights ? "opacity-50" : ""}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Visualizations
              {!selectedRepo?.enhancedData?.geminiInsights && (
                <span className="text-xs bg-orange-100 text-orange-700 px-1 rounded">Requires Enhanced Analysis</span>
              )}
            </div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="repositories" className="space-y-6">
          {/* Summary Metrics moved from Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Total Repositories</span>
              </div>
              <p className="text-2xl font-bold">{repositories.length}</p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">Analyzed</span>
              </div>
              <p className="text-2xl font-bold">
                {repositories.filter(r => r.analysisStatus === 'completed').length}
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-purple-500" />
                <span className="font-medium">AI Enhanced</span>
              </div>
              <p className="text-2xl font-bold">
                {repositories.filter(r => r.enhancedData?.geminiInsights).length}
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="font-medium">Total Stars</span>
              </div>
              <p className="text-2xl font-bold">
                {repositories.reduce((sum, repo) => sum + (repo.stars || 0), 0)}
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repositories.map((repo) => (
              <Card key={repo.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{repo.owner}/{repo.repoName}</h3>
                    <p className="text-sm text-gray-600 mt-1">{repo.description}</p>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(repo.analysisStatus)}`}>
                    {getStatusIcon(repo.analysisStatus)}
                    {repo.analysisStatus}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <span>{repo.language}</span>
                  <span>⭐ {repo.stars}</span>
                  <span>🍴 {repo.forks}</span>
                </div>
                <div className="text-xs text-gray-500 mb-4">
                  Last Analyzed: {repo.lastAnalyzed ? new Date(repo.lastAnalyzed).toLocaleDateString() : 'N/A'}
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(`/repos/${repo.id}`, '_blank')}
                  >
                    View Details
                  </Button>
                  {repo.enhancedData?.geminiInsights && (
                    <Button 
                      size="sm" 
                      onClick={() => handleViewAIInsights(repo)}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Brain className="w-3 h-3 mr-1" />
                      AI Insights
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteRepository(repo.id)}
                    disabled={deletingRepoId === repo.id}
                    className="ml-auto"
                  >
                    {deletingRepoId === repo.id ? (
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                  </Button>
                </div>

                {repo.enhancedData?.geminiInsights && (
                  <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-700 font-medium">AI Quality Score</span>
                      <span className="text-blue-800 font-bold">
                        {repo.enhancedData.geminiInsights.codeQuality.overallScore}/100
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {selectedRepo?.enhancedData?.geminiInsights ? (
            <AIInsightsDashboard insights={selectedRepo.enhancedData.geminiInsights} />
          ) : (
            <Card className="p-12 text-center">
              <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No AI Insights Available</h3>
              <p className="text-gray-600 mb-4">
                Select a repository with enhanced AI analysis to view detailed insights.
              </p>
              <Button onClick={() => setSelectedRepo(repositories.find(r => r.enhancedData?.geminiInsights) || null)}>
                Find AI-Analyzed Repository
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="visualizations" className="space-y-6">
          {selectedRepo?.enhancedData?.geminiInsights?.visualizations ? (
            <div className="space-y-6">
              <EvolutionTimeline 
                data={selectedRepo.enhancedData.geminiInsights.visualizations.evolutionTimeline} 
              />
              <CollaborationNetwork 
                data={selectedRepo.enhancedData.geminiInsights.visualizations.collaborationNetwork} 
              />
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Zap className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No Visualizations Available</h3>
              <p className="text-gray-600">
                Enhanced AI analysis is required to generate interactive visualizations.
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}