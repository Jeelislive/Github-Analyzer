import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, Zap } from 'lucide-react'
import type { GeminiRepositoryInsights } from '@/lib/gemini-analyzer'

interface RecommendationsTabProps {
  insights: GeminiRepositoryInsights
}

export default function RecommendationsTab({ insights }: RecommendationsTabProps) {
  return (
    <div className="space-y-6 mt-6">
      {/* Recommendations Overview - Coming Soon */}
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
    </div>
  )
}
