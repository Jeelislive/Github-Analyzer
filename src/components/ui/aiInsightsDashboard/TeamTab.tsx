import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Users, GitBranch, Clock, Star, Activity, TrendingUp } from 'lucide-react'
import type { GeminiRepositoryInsights } from '@/lib/geminiAnalyzer'

interface TeamTabProps {
  insights: GeminiRepositoryInsights
}

export default function TeamTab({ insights }: TeamTabProps) {
  return (
    <div className="space-y-6 mt-6">
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
          <Activity className="w-5 h-5 text-green-500" />
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
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={contributor.profile?.avatar || `https://github.com/${contributor.name}.png`} 
                    alt={contributor.name}
                    className="w-16 h-16 rounded-full border-2 border-gray-200"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${contributor.name}&background=random` }}
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
                  <Badge className="bg-blue-50 text-blue-700">{contributor.contributions} contributions</Badge>
                  <Badge className="bg-green-50 text-green-700">{contributor.codeOwnership.toFixed(1)}% ownership</Badge>
                  <Badge className="bg-purple-50 text-purple-700">{contributor.profile?.contributionStreak || 0} day streak</Badge>
                </div>
              </div>

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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    PR Activity
                  </h5>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-sm text-gray-600">Opened:</span><span className="font-medium">{contributor.profile?.prActivity?.opened || 0}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-600">Merged:</span><span className="font-medium text-green-600">{contributor.profile?.prActivity?.merged || 0}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-600">Reviewed:</span><span className="font-medium text-blue-600">{contributor.profile?.prActivity?.reviewed || 0}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-600">Avg Review Time:</span><span className="font-medium">{contributor.profile?.prActivity?.averageReviewTime || 0}h</span></div>
                  </div>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Activity Patterns
                  </h5>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-sm text-gray-600">Most Active Day:</span><span className="font-medium">{contributor.profile?.mostActiveDay || 'Unknown'}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-600">Peak Hour:</span><span className="font-medium">{contributor.profile?.mostActiveHour || 0}:00</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-600">Longest Streak:</span><span className="font-medium">{contributor.profile?.longestStreak || 0} days</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-600">Timezone:</span><span className="font-medium">{contributor.profile?.timezone || 'UTC'}</span></div>
                  </div>
                </div>
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
                <div>
                  <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Performance Metrics
                  </h5>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Code Quality</span><span className="font-medium">{contributor.profile?.performanceMetrics?.codeQualityScore?.toFixed(1) || 0}%</span></div>
                      <Progress value={contributor.profile?.performanceMetrics?.codeQualityScore || 0} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Bug Fix Rate</span><span className="font-medium">{contributor.profile?.performanceMetrics?.bugFixRate?.toFixed(1) || 0}%</span></div>
                      <Progress value={contributor.profile?.performanceMetrics?.bugFixRate || 0} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Documentation</span><span className="font-medium">{contributor.profile?.performanceMetrics?.documentationScore?.toFixed(1) || 0}%</span></div>
                      <Progress value={contributor.profile?.performanceMetrics?.documentationScore || 0} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>

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
                        <span className="text-xs text-gray-500 ml-2">{new Date(activity.date).toLocaleDateString()}</span>
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

              <div className="mt-6">
                <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Collaboration Metrics
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg"><div className="text-lg font-bold text-blue-600">{contributor.profile?.collaborationMetrics?.coAuthoredCommits || 0}</div><div className="text-xs text-gray-600">Co-authored</div></div>
                  <div className="text-center p-3 bg-green-50 rounded-lg"><div className="text-lg font-bold text-green-600">{contributor.profile?.collaborationMetrics?.codeReviewParticipation || 0}</div><div className="text-xs text-gray-600">Reviews</div></div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg"><div className="text-lg font-bold text-purple-600">{contributor.profile?.collaborationMetrics?.pairProgrammingSessions || 0}</div><div className="text-xs text-gray-600">Pair Sessions</div></div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg"><div className="text-lg font-bold text-orange-600">{contributor.profile?.collaborationMetrics?.mentoringActivity || 0}</div><div className="text-xs text-gray-600">Mentoring</div></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
