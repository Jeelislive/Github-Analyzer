'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Github } from 'lucide-react'
import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'

export default function Hero() {
  const { data: session } = useSession()
  const [repoUrl, setRepoUrl] = useState('')
  const [error, setError] = useState('')
  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    progress: 0,
    message: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRepoUrl(e.target.value)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user) {
      setError('Please sign in to analyze your GitHub data')
      return
    }
    if (!repoUrl) {
      setError('Please enter a valid GitHub profile or repository URL')
      return
    }
    
    setLoadingState({
      isLoading: true,
      progress: 0,
      message: 'Fetching GitHub data...'
    })
    
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setLoadingState(prev => {
        if (prev.progress >= 100) {
          clearInterval(progressInterval)
          return { ...prev, isLoading: false }
        }
        return {
          ...prev,
          progress: prev.progress + 10,
          message: prev.progress < 30 ? 'Fetching GitHub data...' :
                   prev.progress < 60 ? 'Analyzing contributions, PRs, and issues...' :
                   prev.progress < 90 ? 'Compiling repository insights...' :
                   'Finalizing insights...'
        }
      })
    }, 500)
  }

  const handleTrySample = () => {
    setRepoUrl('https://github.com/vercel/next.js')
  }

  return (
    <section className="w-full py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left Side - Hero Content */}
          <div className="flex flex-col text-center lg:text-left space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Understand your impact on{' '}
                <span className="text-primary">GitHub at a glance</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                AI-powered analytics for contributions, pull requests, issues, and repositories — all in one dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    type="url"
                    placeholder="https://github.com/username or https://github.com/owner/repo"
                    value={repoUrl}
                    onChange={handleInputChange}
                    className="h-12"
                    disabled={loadingState.isLoading || !session?.user}
                  />
                  {error && (
                    <p className="text-sm text-destructive mt-2">{error}</p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="h-12 px-6"
                  disabled={loadingState.isLoading || !session?.user}
                >
                  {loadingState.isLoading ? 'Analyzing...' : (!session?.user ? 'Sign in to analyze' : 'Analyze')}
                </Button>
              </div>
              
              {loadingState.isLoading && (
                <div className="space-y-2">
                  <Progress value={loadingState.progress} className="w-full" />
                  <p className="text-sm text-muted-foreground">{loadingState.message}</p>
                </div>
              )}
            </form>

            <div className="flex gap-4">
              <Button variant="outline" className="gap-2" onClick={() => signIn('github')}>
                <Github className="h-4 w-4" />
                Sign in with GitHub
              </Button>
              <Button variant="ghost" onClick={handleTrySample}>
                Try sample data
              </Button>
            </div>
          </div>
          
          <div className="hidden lg:block">
            <Card className="bg-card/50 backdrop-blur border-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </CardHeader>
              <CardContent className="font-mono text-sm space-y-2">
                <div className="text-muted-foreground"># GitHub Insights</div>
                <div className="text-primary">## Contributions</div>
                <div className="text-foreground">Commits: 124 • Streak: 12 days</div>
                <div className="text-primary">## Pull Requests</div>
                <div className="text-foreground">Merged: 18 • Open: 3 • Avg review time: 1.2d</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}