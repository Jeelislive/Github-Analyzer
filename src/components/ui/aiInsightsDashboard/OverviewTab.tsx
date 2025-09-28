import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, Target, Network, BarChart3 } from 'lucide-react'
import type { GeminiRepositoryInsights } from '@/lib/geminiAnalyzer'
import { computeProjectHealth, getScoreColor } from './utils'

interface OverviewTabProps {
  insights: GeminiRepositoryInsights
}

export default function OverviewTab({ insights }: OverviewTabProps) {
  return (
    <div className="space-y-6 mt-6">
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
              const value = typeof provided === 'number' && provided > 0 ? provided : computeProjectHealth(insights)
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

      {/* Technology Stack Analysis - Coming Soon */}
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
    </div>
  )
}
