import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LayoutTemplate, GitPullRequest, PanelLeft } from 'lucide-react'

export default function Features() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Powerful GitHub analytics for developers
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to track contributions, pull requests, issues, and repository health
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <LayoutTemplate className="h-8 w-8 text-primary mb-4" />
              <CardTitle>Contribution Insights</CardTitle>
              <CardDescription>
                AI highlights commit activity, streaks, busiest hours, and language trends across your GitHub profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-md p-3 font-mono text-sm">
                <span className="text-muted-foreground">›</span> commits: 124 • prs: 18 • issues: 9
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <GitPullRequest className="h-8 w-8 text-primary mb-4" />
              <CardTitle>PR & Issue Metrics</CardTitle>
              <CardDescription>
                Track merged vs open PRs, review time, issue resolution, and team collaboration patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Badge variant="outline">PRs</Badge>
                <Badge variant="outline">Issues</Badge>
                <Badge variant="outline">Reviews</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <PanelLeft className="h-8 w-8 text-primary mb-4" />
              <CardTitle>Repository Health</CardTitle>
              <CardDescription>
                Monitor stars, forks, contributors, activity velocity, and maintenance signals across repositories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-md p-3 font-mono text-sm">
                <span className="text-primary">repo</span> score: 92/100
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}