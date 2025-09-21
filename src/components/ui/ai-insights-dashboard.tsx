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
import OverviewTab from './ai-insights-dashboard/OverviewTab'
import TeamTab from './ai-insights-dashboard/TeamTab'
import BusinessTab from './ai-insights-dashboard/BusinessTab'
import RecommendationsTab from './ai-insights-dashboard/RecommendationsTab'

interface AIInsightsDashboardProps {
  insights: GeminiRepositoryInsights
  className?: string
}

export default function AIInsightsDashboard({ insights, className = '' }: AIInsightsDashboardProps) {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'team' | 'business' | 'recommendations'>('overview')
  const tabOrder: Array<'overview' | 'team' | 'business' | 'recommendations'> = [
    'overview',
    'team',
    'business',
    'recommendations',
  ]
  const currentIndex = Math.max(0, tabOrder.indexOf(activeTab))
  const progressPercent = ((currentIndex + 1) / tabOrder.length) * 100

  return (
    <div className={`space-y-6 ${className}`}>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
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
          <OverviewTab insights={insights} />
        </TabsContent>

        

        <TabsContent value="team" className="space-y-6 mt-6">
          <TeamTab insights={insights} />
        </TabsContent>

        <TabsContent value="business" className="space-y-6 mt-6">
          <BusinessTab insights={insights} />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6 mt-6">
          <RecommendationsTab insights={insights} />
        </TabsContent>
      </Tabs>
    </div>
  )
}