import type { GeminiRepositoryInsights } from '@/lib/gemini-analyzer'

export const computeProjectHealth = (insights: GeminiRepositoryInsights) => {
  const cq = typeof insights.codeQuality?.overallScore === 'number' ? insights.codeQuality.overallScore : 0
  const maintain = typeof insights.architecture?.maintainabilityScore === 'number' ? insights.architecture.maintainabilityScore : 0
  const doc = typeof insights.projectSummary?.projectMetrics?.documentationCoverage === 'number' ? insights.projectSummary.projectMetrics.documentationCoverage : 0
  const test = typeof insights.projectSummary?.projectMetrics?.testCoverage === 'number' ? insights.projectSummary.projectMetrics.testCoverage : 0
  const complexityLevel = (insights.projectSummary?.complexity || '').toLowerCase()
  const complexityScore = complexityLevel === 'low' ? 90 : complexityLevel === 'medium' ? 70 : complexityLevel === 'high' ? 50 : 60
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

export const getComplexityColor = (complexity: string) => {
  switch (complexity) {
    case 'Low': return 'text-green-500 bg-green-50'
    case 'Medium': return 'text-yellow-500 bg-yellow-50'
    case 'High': return 'text-orange-500 bg-orange-50'
    case 'Very High': return 'text-red-500 bg-red-50'
    default: return 'text-gray-500 bg-gray-50'
  }
}

export const getMaturityColor = (maturity: string) => {
  switch (maturity) {
    case 'Prototype': return 'text-purple-500 bg-purple-50'
    case 'Alpha': return 'text-blue-500 bg-blue-50'
    case 'Beta': return 'text-indigo-500 bg-indigo-50'
    case 'Production': return 'text-green-500 bg-green-50'
    case 'Mature': return 'text-emerald-500 bg-emerald-50'
    default: return 'text-gray-500 bg-gray-50'
  }
}

export const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-yellow-500'
  if (score >= 40) return 'text-orange-500'
  return 'text-red-500'
}
