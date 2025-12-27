'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Github } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Hero() {
  const router = useRouter()
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
                    disabled={loadingState.isLoading}
                  />
                  {error && (
                    <p className="text-sm text-destructive mt-2">{error}</p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="h-12 px-6"
                  disabled={loadingState.isLoading}
                >
                  {loadingState.isLoading ? 'Analyzing...' : 'Analyze'}
                </Button>
              </div>
              
              {loadingState.isLoading && (
                <div className="space-y-2">
                  <Progress value={loadingState.progress} className="w-full" />
                  <p className="text-sm text-muted-foreground">{loadingState.message}</p>
                </div>
              )}
            </form>

            <div className="flex gap-4 items-center">
              <Button variant="outline" className="gap-2" onClick={() => router.push('/dashboard')}>
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Go to Dashboard
              </Button>
              <Button variant="outline" size="icon" asChild aria-label="Open GitHub repository">
                <a href="https://github.com/Jeelislive/Github-Analyzer" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center">
                  <Github className="h-4 w-4" />
                </a>
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