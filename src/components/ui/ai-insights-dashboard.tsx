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
  Star
} from 'lucide-react'
import type { GeminiRepositoryInsights } from '@/lib/gemini-analyzer'

interface AIInsightsDashboardProps {
  insights: GeminiRepositoryInsights
  className?: string
}

export default function AIInsightsDashboard({ insights, className = '' }: AIInsightsDashboardProps) {
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
      {/* AI Analysis Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Brain className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI-Powered Repository Analysis</h2>
            <p className="text-gray-600">Comprehensive insights powered by Google Gemini AI</p>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Code Quality</span>
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(insights.codeQuality.overallScore)}`}>
              {insights.codeQuality.overallScore}/100
            </div>
            <Progress value={insights.codeQuality.overallScore} className="mt-2" />
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">Complexity</span>
            </div>
            <Badge className={getComplexityColor(insights.projectSummary.complexity)}>
              {insights.projectSummary.complexity}
            </Badge>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Maturity</span>
            </div>
            <Badge className={getMaturityColor(insights.projectSummary.maturity)}>
              {insights.projectSummary.maturity}
            </Badge>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700">Maintainability</span>
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(insights.architecture.maintainabilityScore)}`}>
              {insights.architecture.maintainabilityScore}/100
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quality">Code Quality</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="team">Team Insights</TabsTrigger>
          <TabsTrigger value="business">Business Value</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Project Summary */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
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

          {/* Architecture Layers */}
          <Card className="p-6">
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
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6 mt-6">
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

          {/* Technical Debt & Security */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>
        </TabsContent>

        <TabsContent value="architecture" className="space-y-6 mt-6">
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
          {/* Development Patterns */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              Team Development Patterns
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
        </TabsContent>

        <TabsContent value="business" className="space-y-6 mt-6">
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
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6 mt-6">
          {/* Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Immediate Actions
              </h3>
              <ul className="space-y-2">
                {insights.recommendations.immediate.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <span className="text-gray-700 text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                Short-term Goals
              </h3>
              <ul className="space-y-2">
                {insights.recommendations.shortTerm.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <span className="text-gray-700 text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Long-term Vision
              </h3>
              <ul className="space-y-2">
                {insights.recommendations.longTerm.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <span className="text-gray-700 text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-green-500" />
                Feature Opportunities
              </h3>
              <ul className="space-y-2">
                {insights.recommendations.featureOpportunities.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <span className="text-gray-700 text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}