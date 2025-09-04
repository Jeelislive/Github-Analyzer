import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LayoutTemplate, GitPullRequest, PanelLeft } from 'lucide-react'

export default function Features() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Powerful features for developers
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to create professional documentation from your codebase
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <LayoutTemplate className="h-8 w-8 text-primary mb-4" />
              <CardTitle>Smart Code Analysis</CardTitle>
              <CardDescription>
                AI understands your code structure, dependencies, and patterns to generate accurate documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-md p-3 font-mono text-sm">
                <span className="text-muted-foreground">$</span> npm install @your/package
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <GitPullRequest className="h-8 w-8 text-primary mb-4" />
              <CardTitle>Multiple Export Formats</CardTitle>
              <CardDescription>
                Export as Markdown, PDF, or integrate with popular documentation platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Badge variant="outline">Markdown</Badge>
                <Badge variant="outline">PDF</Badge>
                <Badge variant="outline">GitBook</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <PanelLeft className="h-8 w-8 text-primary mb-4" />
              <CardTitle>Interactive Examples</CardTitle>
              <CardDescription>
                Generate runnable code examples and API references automatically from your source
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-md p-3 font-mono text-sm">
                <span className="text-primary">function</span> example() &#123;&#125;
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}