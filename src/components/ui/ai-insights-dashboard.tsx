'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain, 
  TrendingUp, 
  Shield, 
  Zap, 
  Users, 
  GitBranch, 
  AlertTriangle, 
  CheckCircle,
  Target,
  Lightbulb,
  BarChart3,
  Network,
  Clock,
  Star,
  Activity
} from 'lucide-react'
import type { GeminiRepositoryInsights } from '@/lib/gemini-analyzer'

interface AIInsightsDashboardProps {
  insights: GeminiRepositoryInsights
  className?: string
}

export default function AIInsightsDashboard({ insights, className = '' }: AIInsightsDashboardProps) {
  // Compute a dynamic Project Health score when a reliable one isn't provided
  const computeProjectHealth = () => {
    const cq = typeof insights.codeQuality?.overallScore === 'number' ? insights.codeQuality.overallScore : 0
    const maintain = typeof insights.architecture?.maintainabilityScore === 'number' ? insights.architecture.maintainabilityScore : 0
    const doc = typeof insights.projectSummary?.projectMetrics?.documentationCoverage === 'number' ? insights.projectSummary.projectMetrics.documentationCoverage : 0
    const test = typeof insights.projectSummary?.projectMetrics?.testCoverage === 'number' ? insights.projectSummary.projectMetrics.testCoverage : 0
    const complexityLevel = (insights.projectSummary?.complexity || '').toLowerCase()
    const complexityScore = complexityLevel === 'low' ? 90 : complexityLevel === 'medium' ? 70 : complexityLevel === 'high' ? 50 : 60
    // Weighted aggregate
    const weights = { cq: 0.4, maintain: 0.25, doc: 0.15, test: 0.15, complexity: 0.05 }
    const score = ( 
      cq * weights.cq +
      maintain * weights.maintain +
      doc * weights.doc +
      test * weights.test +
      complexityScore * weights.complexity
    )
    return Math.round(score)
  }
  const [activeTab, setActiveTab] = React.useState<'overview' | 'quality' | 'architecture' | 'team' | 'business' | 'recommendations'>('overview')
  const tabOrder: Array<'overview' | 'quality' | 'architecture' | 'team' | 'business' | 'recommendations'> = [
    'overview',
    'quality',
    'architecture',
    'team',
    'business',
    'recommendations',
  ]
  const currentIndex = Math.max(0, tabOrder.indexOf(activeTab))
  const progressPercent = ((currentIndex + 1) / tabOrder.length) * 100

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Low': return 'text-green-500 bg-green-50'
      case 'Medium': return 'text-yellow-500 bg-yellow-50'
      case 'High': return 'text-orange-500 bg-orange-50'
      case 'Very High': return 'text-red-500 bg-red-50'
      default: return 'text-gray-500 bg-gray-50'
    }
  }

  const getMaturityColor = (maturity: string) => {
    switch (maturity) {
      case 'Prototype': return 'text-purple-500 bg-purple-50'
      case 'Alpha': return 'text-blue-500 bg-blue-50'
      case 'Beta': return 'text-indigo-500 bg-indigo-50'
      case 'Production': return 'text-green-500 bg-green-50'
      case 'Mature': return 'text-emerald-500 bg-emerald-50'
      default: return 'text-gray-500 bg-gray-50'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    if (score >= 40) return 'text-orange-500'
    return 'text-red-500'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quality">Code Quality</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="team">Team Insights</TabsTrigger>
          <TabsTrigger value="business">Business Value</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        <div className="mt-2">
          <div className="h-1 rounded bg-gray-200 relative overflow-hidden">
            <div
              className="h-1 bg-blue-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-600"
              style={{ left: `${progressPercent}%` }}
            />
          </div>
        </div>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Project Health Overview */}
          <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Project Health Overview
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                {(() => {
                  const provided = insights.projectSummary.qualityScores?.overall ?? insights.projectSummary.projectHealthScore
                  const value = typeof provided === 'number' && provided > 0 ? provided : computeProjectHealth()
                  return (
                    <>
                      <div className={`text-4xl font-bold ${getScoreColor(value)}`}>{value}/100</div>
                      <div className="text-sm text-gray-600 mt-1">Overall Quality Score</div>
                      <Progress value={value} className="mt-2" />
                    </>
                  )
                })()}
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">
                  {insights.projectSummary.projectMetrics?.totalLinesOfCode?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-gray-600 mt-1">Lines of Code</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">
                  {insights.projectSummary.projectMetrics?.totalFiles || 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Files</div>
              </div>
            </div>
          </Card>

          {/* Project Summary */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Project Summary
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Purpose</h4>
                <p className="text-gray-600">{insights.projectSummary.purpose}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Main Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {insights.projectSummary.mainTechnologies.map((tech) => (
                    <Badge key={tech} variant="outline" className="bg-blue-50 text-blue-700">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Architectural Pattern</h4>
                <Badge className="bg-purple-50 text-purple-700">
                  {insights.projectSummary.architecturalPattern}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Technology Stack Analysis */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Network className="w-5 h-5 text-indigo-500" />
              Technology Stack Analysis
            </h3>
            
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center">
                  <Network className="w-8 h-8 text-indigo-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Coming Soon</h4>
                <p className="text-gray-600 max-w-md">
                  AI-powered technology stack analysis will be available in the next update.
                </p>
              </div>
            </div>
          </Card>

          {/* Project Metrics */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-500" />
              Project Metrics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {insights.projectSummary.projectMetrics?.averageFileSize?.toFixed(0) || '0'}
                </div>
                <div className="text-sm text-gray-600">Avg File Size (lines)</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {insights.projectSummary.projectMetrics?.documentationCoverage || 0}%
                </div>
                <div className="text-sm text-gray-600">Documentation Coverage</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {insights.projectSummary.projectMetrics?.testCoverage || 0}%
                </div>
                <div className="text-sm text-gray-600">Test Coverage</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {insights.projectSummary.complexity}
                </div>
                <div className="text-sm text-gray-600">Complexity Level</div>
              </div>
            </div>
          </Card>

          {/* Architecture Layers */}
          {/* <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Network className="w-5 h-5 text-green-500" />
              Architecture Layers
            </h3>
            
            <div className="space-y-4">
              {insights.architecture.layers.map((layer, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">{layer.name}</h4>
                  <p className="text-gray-600 text-sm mb-3">{layer.purpose}</p>
                  
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">Components:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {layer.components.map((component) => (
                        <Badge key={component} variant="outline" className="text-xs">
                          {component}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-700">Dependencies:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {layer.dependencies.map((dep) => (
                        <Badge key={dep} variant="outline" className="text-xs bg-yellow-50">
                          {dep}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card> */}
        </TabsContent>

        <TabsContent value="quality" className="space-y-6 mt-6">
          {/* Code Quality Overview */}
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              Code Quality Overview
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(insights.codeQuality.overallScore)}`}>
                  {insights.codeQuality.overallScore}/100
                </div>
                <div className="text-sm text-gray-600 mt-1">Overall Score</div>
                <Progress value={insights.codeQuality.overallScore} className="mt-2" />
              </div>

              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(insights.codeQuality.codeMetrics?.maintainabilityIndex || 0)}`}>
                  {(insights.codeQuality.codeMetrics?.maintainabilityIndex || 0).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 mt-1">Maintainability Index</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {(insights.codeQuality.codeMetrics?.cyclomaticComplexity || 0).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 mt-1">Cyclomatic Complexity</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {(insights.codeQuality.codeMetrics?.codeDuplication || 0).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 mt-1">Code Duplication</div>
              </div>
            </div>
          </Card>

          {/* Code Quality Assessment */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Code Quality Assessment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div>
                <h4 className="font-medium text-green-700 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Strengths
                </h4>
                <ul className="space-y-2">
                  {insights.codeQuality.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div>
                <h4 className="font-medium text-red-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Areas for Improvement
                </h4>
                <ul className="space-y-2">
                  {insights.codeQuality.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <span className="text-gray-700">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* Code Standards */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Code Standards Assessment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {insights.codeQuality.codeStandards?.namingConventions || 'Unknown'}
                </div>
                <div className="text-sm text-gray-600">Naming Conventions</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {insights.codeQuality.codeStandards?.documentationQuality || 'Unknown'}
                </div>
                <div className="text-sm text-gray-600">Documentation Quality</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {insights.codeQuality.codeStandards?.errorHandling || 'Unknown'}
                </div>
                <div className="text-sm text-gray-600">Error Handling</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {insights.codeQuality.codeStandards?.logging || 'Unknown'}
                </div>
                <div className="text-sm text-gray-600">Logging</div>
              </div>
            </div>
          </Card>

          {/* Code Smells */}
          {(insights.codeQuality.codeMetrics?.codeSmells?.length || 0) > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Code Smells Detected
              </h3>

              <div className="space-y-3">
                {(insights.codeQuality.codeMetrics?.codeSmells || []).map((smell, index) => (
                  <div key={index} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-orange-800">{smell.type}</h4>
                      <Badge className={`${
                        smell.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                        smell.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                        smell.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {smell.severity}
                      </Badge>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">{smell.description}</p>
                    <p className="text-gray-500 text-xs">Location: {smell.location}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Technical Debt & Security */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h4 className="font-medium text-orange-700 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Technical Debt
              </h4>
              <ul className="space-y-2">
                {insights.codeQuality.technicalDebt.map((debt, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <span className="text-gray-700 text-sm">{debt}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <h4 className="font-medium text-red-700 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security Concerns
              </h4>
              <ul className="space-y-2">
                {insights.codeQuality.securityConcerns.map((concern, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <span className="text-gray-700 text-sm">{concern}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div> */}

          {/* Performance Issues */}
          {insights.codeQuality.performanceIssues.length > 0 && (
            <Card className="p-6">
              <h4 className="font-medium text-purple-700 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Performance Issues
              </h4>
              <ul className="space-y-2">
                {insights.codeQuality.performanceIssues.map((issue, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <span className="text-gray-700 text-sm">{issue}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="architecture" className="space-y-6 mt-6">
          {/* Architecture Overview */}
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Network className="w-5 h-5 text-purple-500" />
              Architecture Overview
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(insights.architecture.maintainabilityScore)}`}>
                  {insights.architecture.maintainabilityScore}/100
                </div>
                <div className="text-sm text-gray-600 mt-1">Maintainability Score</div>
                <Progress value={insights.architecture.maintainabilityScore} className="mt-2" />
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {insights.architecture.dependencyAnalysis?.totalDependencies || 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Dependencies</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {insights.architecture.performanceMetrics?.scalabilityScore || 0}/100
                </div>
                <div className="text-sm text-gray-600 mt-1">Scalability Score</div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Design Patterns */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Network className="w-5 h-5 text-blue-500" />
                Design Patterns
              </h3>
              <div className="space-y-2">
                {insights.architecture.designPatterns.map((pattern, index) => (
                  <Badge key={index} variant="outline" className="mr-2 mb-2 bg-blue-50 text-blue-700">
                    {pattern}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Anti-Patterns */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Anti-Patterns
              </h3>
              <div className="space-y-2">
                {insights.architecture.antiPatterns.map((antiPattern, index) => (
                  <Badge key={index} variant="outline" className="mr-2 mb-2 bg-red-50 text-red-700">
                    {antiPattern}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>

          {/* Dependency Analysis */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              Dependency Analysis
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {insights.architecture.dependencyAnalysis?.totalDependencies || 0}
                </div>
                <div className="text-sm text-gray-600">Total Dependencies</div>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {insights.architecture.dependencyAnalysis?.outdatedDependencies || 0}
                </div>
                <div className="text-sm text-gray-600">Outdated</div>
              </div>

              <div className="p-4 bg-red-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">
                  {insights.architecture.dependencyAnalysis?.securityVulnerabilities || 0}
                </div>
                <div className="text-sm text-gray-600">Security Issues</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {insights.architecture.dependencyAnalysis?.dependencyHealth || 'Unknown'}
                </div>
                <div className="text-sm text-gray-600">Health Status</div>
              </div>
            </div>

            {(insights.architecture.dependencyAnalysis?.criticalDependencies?.length || 0) > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Critical Dependencies</h4>
                <div className="flex flex-wrap gap-2">
                  {(insights.architecture.dependencyAnalysis?.criticalDependencies || []).map((dep, index) => (
                    <Badge key={index} variant="outline" className="bg-yellow-50 text-yellow-700">
                      {dep}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Performance Metrics */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-500" />
              Performance Metrics
            </h3>

            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Coming Soon</h4>
                <p className="text-gray-600 max-w-md">
                  Advanced performance metrics including bundle analysis, load times, memory usage, and real-time monitoring will be available in the next update.
                </p>
              </div>
            </div>
          </Card>

          {/* Architectural Decisions */}
          {(insights.architecture.architecturalDecisions?.length || 0) > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Architectural Decisions
              </h3>

              <div className="space-y-4">
                {(insights.architecture.architecturalDecisions || []).map((decision, index) => (
                  <div key={index} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-yellow-800 mb-2">{decision.decision}</h4>
                    <p className="text-gray-700 text-sm mb-2">{decision.rationale}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <h5 className="font-medium text-gray-700 text-sm mb-1">Consequences:</h5>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {decision.consequences.map((consequence, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                              {consequence}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-gray-700 text-sm mb-1">Alternatives:</h5>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {decision.alternatives.map((alternative, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                              {alternative}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Scalability Assessment */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Scalability Assessment
            </h3>
            <p className="text-gray-700">{insights.architecture.scalabilityAssessment}</p>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6 mt-6">
          {/* Team Overview */}
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              Team Overview
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {insights.developmentPatterns.contributorAnalysis?.length || 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">Team Members</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {(insights.developmentPatterns.developmentMetrics?.commitFrequencyPerWeek || 0).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 mt-1">Commits/Week</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {(insights.developmentPatterns.developmentMetrics?.averageCommitSize || 0).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 mt-1">Avg Commit Size</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {(insights.developmentPatterns.developmentMetrics?.pullRequestMergeTime || 0).toFixed(1)}d
                </div>
                <div className="text-sm text-gray-600 mt-1">PR Merge Time</div>
              </div>
            </div>
          </Card>

          {/* Development Patterns */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-blue-500" />
              Development Patterns
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Commit Frequency</h4>
                <Badge className="bg-blue-50 text-blue-700">
                  {insights.developmentPatterns.commitFrequency}
                </Badge>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Team Size</h4>
                <Badge className="bg-green-50 text-green-700">
                  {insights.developmentPatterns.teamCollaboration}
                </Badge>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Code Review</h4>
                <Badge className="bg-purple-50 text-purple-700">
                  {insights.developmentPatterns.codeReviewPractice}
                </Badge>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Testing Maturity</h4>
                <Badge className="bg-yellow-50 text-yellow-700">
                  {insights.developmentPatterns.testingMaturity}
                </Badge>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">CI/CD Maturity</h4>
                <Badge className="bg-indigo-50 text-indigo-700">
                  {insights.developmentPatterns.cicdMaturity}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Development Metrics */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-500" />
              Development Metrics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {(insights.developmentPatterns.developmentMetrics?.bugFixTime || 0).toFixed(1)}d
                </div>
                <div className="text-sm text-gray-600">Bug Fix Time</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {(insights.developmentPatterns.developmentMetrics?.featureDeliveryTime || 0).toFixed(1)}d
                </div>
                <div className="text-sm text-gray-600">Feature Delivery</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {(insights.developmentPatterns.developmentMetrics?.pullRequestMergeTime || 0).toFixed(1)}d
                </div>
                <div className="text-sm text-gray-600">PR Merge Time</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {(insights.developmentPatterns.developmentMetrics?.commitFrequencyPerWeek || 0).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Commits/Week</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {(insights.developmentPatterns.developmentMetrics?.averageCommitSize || 0).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Avg Commit Size</div>
              </div>
            </div>
          </Card>

          {/* Detailed Contributor Analysis */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              Detailed Contributor Profiles
            </h3>

            <div className="space-y-6">
              {(insights.developmentPatterns.contributorAnalysis || []).map((contributor, index) => (
                <div key={index} className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                  {/* Contributor Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={contributor.profile?.avatar || `https://github.com/${contributor.name}.png`} 
                        alt={contributor.name}
                        className="w-16 h-16 rounded-full border-2 border-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${contributor.name}&background=random`
                        }}
                      />
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900">{contributor.name}</h4>
                        <a 
                          href={contributor.profile?.githubUrl || `https://github.com/${contributor.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          @{contributor.name}
                        </a>
                        <p className="text-sm text-gray-500">
                          Joined {contributor.profile?.joinDate ? new Date(contributor.profile.joinDate).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Badge className="bg-blue-50 text-blue-700">
                        {contributor.contributions} contributions
                      </Badge>
                      <Badge className="bg-green-50 text-green-700">
                        {contributor.codeOwnership.toFixed(1)}% ownership
                      </Badge>
                      <Badge className="bg-purple-50 text-purple-700">
                        {contributor.profile?.contributionStreak || 0} day streak
                      </Badge>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{contributor.profile?.totalCommits || 0}</div>
                      <div className="text-sm text-gray-600">Total Commits</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{contributor.profile?.mergedPRs || 0}</div>
                      <div className="text-sm text-gray-600">Merged PRs</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{contributor.profile?.linesAdded || 0}</div>
                      <div className="text-sm text-gray-600">Lines Added</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{contributor.profile?.filesChanged || 0}</div>
                      <div className="text-sm text-gray-600">Files Changed</div>
                    </div>
                  </div>

                  {/* Detailed Sections */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* PR Activity */}
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <GitBranch className="w-4 h-4" />
                        PR Activity
                      </h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Opened:</span>
                          <span className="font-medium">{contributor.profile?.prActivity?.opened || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Merged:</span>
                          <span className="font-medium text-green-600">{contributor.profile?.prActivity?.merged || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Reviewed:</span>
                          <span className="font-medium text-blue-600">{contributor.profile?.prActivity?.reviewed || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Avg Review Time:</span>
                          <span className="font-medium">{contributor.profile?.prActivity?.averageReviewTime || 0}h</span>
                        </div>
                      </div>
                    </div>

                    {/* Activity Patterns */}
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Activity Patterns
                      </h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Most Active Day:</span>
                          <span className="font-medium">{contributor.profile?.mostActiveDay || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Peak Hour:</span>
                          <span className="font-medium">{contributor.profile?.mostActiveHour || 0}:00</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Longest Streak:</span>
                          <span className="font-medium">{contributor.profile?.longestStreak || 0} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Timezone:</span>
                          <span className="font-medium">{contributor.profile?.timezone || 'UTC'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Expertise Breakdown */}
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Expertise Breakdown
                      </h5>
                      <div className="space-y-2">
                        {(contributor.profile?.expertiseBreakdown || []).map((expertise, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <span className="font-medium text-sm">{expertise.area}</span>
                              <span className="text-xs text-gray-500 ml-2">({expertise.filesCount} files)</span>
                            </div>
                            <Badge className={`text-xs ${
                              expertise.proficiency === 'Expert' ? 'bg-red-100 text-red-800' :
                              expertise.proficiency === 'Advanced' ? 'bg-orange-100 text-orange-800' :
                              expertise.proficiency === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {expertise.proficiency}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Performance Metrics
                      </h5>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Code Quality</span>
                            <span className="font-medium">{contributor.profile?.performanceMetrics?.codeQualityScore?.toFixed(1) || 0}%</span>
                          </div>
                          <Progress value={contributor.profile?.performanceMetrics?.codeQualityScore || 0} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Bug Fix Rate</span>
                            <span className="font-medium">{contributor.profile?.performanceMetrics?.bugFixRate?.toFixed(1) || 0}%</span>
                          </div>
                          <Progress value={contributor.profile?.performanceMetrics?.bugFixRate || 0} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Documentation</span>
                            <span className="font-medium">{contributor.profile?.performanceMetrics?.documentationScore?.toFixed(1) || 0}%</span>
                          </div>
                          <Progress value={contributor.profile?.performanceMetrics?.documentationScore || 0} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="mt-6">
                    <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Recent Activity
                    </h5>
                    <div className="space-y-2">
                      {(contributor.profile?.recentActivity || []).map((activity, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.type === 'commit' ? 'bg-green-500' :
                            activity.type === 'pr' ? 'bg-blue-500' :
                            activity.type === 'issue' ? 'bg-orange-500' :
                            'bg-purple-500'
                          }`}></div>
                          <div className="flex-1">
                            <span className="text-sm font-medium">{activity.description}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              {new Date(activity.date).toLocaleDateString()}
                            </span>
                          </div>
                          <Badge className={`text-xs ${
                            activity.impact === 'high' ? 'bg-red-100 text-red-800' :
                            activity.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {activity.impact}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Collaboration Metrics */}
                  <div className="mt-6">
                    <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Collaboration Metrics
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{contributor.profile?.collaborationMetrics?.coAuthoredCommits || 0}</div>
                        <div className="text-xs text-gray-600">Co-authored</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{contributor.profile?.collaborationMetrics?.codeReviewParticipation || 0}</div>
                        <div className="text-xs text-gray-600">Reviews</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">{contributor.profile?.collaborationMetrics?.pairProgrammingSessions || 0}</div>
                        <div className="text-xs text-gray-600">Pair Sessions</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-lg font-bold text-orange-600">{contributor.profile?.collaborationMetrics?.mentoringActivity || 0}</div>
                        <div className="text-xs text-gray-600">Mentoring</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-6 mt-6">
          {/* Business Overview */}
          <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              Business Overview
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  ${(insights.businessContext.businessMetrics?.estimatedDevelopmentCost || 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 mt-1">Est. Dev Cost</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {(insights.businessContext.businessMetrics?.roi || 0).toFixed(1)}x
                </div>
                <div className="text-sm text-gray-600 mt-1">ROI</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {insights.businessContext.businessMetrics?.competitiveScore || 0}/10
                </div>
                <div className="text-sm text-gray-600 mt-1">Competitive Score</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {insights.businessContext.businessMetrics?.timeToMarket || 'Unknown'}
                </div>
                <div className="text-sm text-gray-600 mt-1">Time to Market</div>
              </div>
            </div>
          </Card>

          {/* Business Context */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Business Context & Value
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Project Type</h4>
                  <Badge className="bg-blue-50 text-blue-700">
                    {insights.businessContext.projectType}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Target Audience</h4>
                  <Badge className="bg-green-50 text-green-700">
                    {insights.businessContext.targetAudience}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Market Position</h4>
                  <Badge className="bg-purple-50 text-purple-700">
                    {insights.businessContext.marketPosition}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Business Value</h4>
                  <p className="text-gray-600 text-sm">{insights.businessContext.businessValue}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Competitive Advantages</h4>
                  <ul className="space-y-1">
                    {insights.businessContext.competitiveAdvantages.map((advantage, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <span className="text-gray-600 text-sm">{advantage}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* Business Metrics */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              Business Metrics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800">
                  ${(insights.businessContext.businessMetrics?.estimatedDevelopmentCost || 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Development Cost</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {insights.businessContext.businessMetrics?.timeToMarket || 'Unknown'}
                </div>
                <div className="text-sm text-gray-600">Time to Market</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {insights.businessContext.businessMetrics?.marketSize || 'Unknown'}
                </div>
                <div className="text-sm text-gray-600">Market Size</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {insights.businessContext.businessMetrics?.competitiveScore || 0}/10
                </div>
                <div className="text-sm text-gray-600">Competitive Score</div>
              </div>
            </div>
          </Card>

          {/* Market Analysis */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              Market Analysis
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Competitors</h4>
                <div className="space-y-2">
                  {(insights.businessContext.marketAnalysis?.competitors || []).map((competitor, index) => (
                    <Badge key={index} variant="outline" className="mr-2 mb-2 bg-red-50 text-red-700">
                      {competitor}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3">Market Trends</h4>
                <ul className="space-y-1">
                  {(insights.businessContext.marketAnalysis?.marketTrends || []).map((trend, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <span className="text-gray-600 text-sm">{trend}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3">Opportunities</h4>
                <ul className="space-y-1">
                  {(insights.businessContext.marketAnalysis?.opportunities || []).map((opportunity, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span className="text-gray-600 text-sm">{opportunity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3">Threats</h4>
                <ul className="space-y-1">
                  {(insights.businessContext.marketAnalysis?.threats || []).map((threat, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <span className="text-gray-600 text-sm">{threat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6 mt-6">
          {/* Recommendations Overview */}
          <Card className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-red-500" />
              Recommendations Overview
            </h3>

            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-100 to-orange-200 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-8 h-8 text-red-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Coming Soon</h4>
                <p className="text-gray-600 max-w-md">
                  AI-powered recommendations including immediate actions, short-term goals, long-term vision, and feature opportunities will be available in the next update.
                </p>
              </div>
            </div>
          </Card>

          {/* Refactoring Priorities */}
          {(insights.recommendations.refactoringPriorities?.length || 0) > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-500" />
                Refactoring Priorities
              </h3>
              <div className="space-y-3">
                {(insights.recommendations.refactoringPriorities || []).map((rec, index) => (
                  <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-purple-800">{rec.component}</h4>
                      <div className="flex gap-2">
                        <Badge className={`${
                          rec.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                          rec.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                          rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {rec.priority}
                        </Badge>
                        <Badge className={`${
                          rec.effort === 'High' ? 'bg-red-100 text-red-800' :
                          rec.effort === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {rec.effort} Effort
                        </Badge>
                        <Badge className={`${
                          rec.impact === 'High' ? 'bg-blue-100 text-blue-800' :
                          rec.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {rec.impact} Impact
                        </Badge>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">{rec.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}