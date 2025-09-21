import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Target, TrendingUp } from 'lucide-react'
import type { GeminiRepositoryInsights } from '@/lib/gemini-analyzer'

interface BusinessTabProps {
  insights: GeminiRepositoryInsights
}

export default function BusinessTab({ insights }: BusinessTabProps) {
  return (
    <div className="space-y-6 mt-6">
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
              <Badge className="bg-blue-50 text-blue-700">{insights.businessContext.projectType}</Badge>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Target Audience</h4>
              <Badge className="bg-green-50 text-green-700">{insights.businessContext.targetAudience}</Badge>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Market Position</h4>
              <Badge className="bg-purple-50 text-purple-700">{insights.businessContext.marketPosition}</Badge>
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
    </div>
  )
}
