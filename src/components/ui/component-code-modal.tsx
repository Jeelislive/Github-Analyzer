'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Code, Copy, Check, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface ComponentCodeModalProps {
  component: {
    id: string
    name: string
    type: string
    path: string
    startLine: number
    endLine: number
    description?: string
    complexity: number
  }
  children: React.ReactNode
  repoId?: string
  repoOwner?: string
  repoName?: string
  branch?: string
}

export default function ComponentCodeModal({ component, children, repoId, repoOwner, repoName, branch }: ComponentCodeModalProps) {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchComponentCode = async () => {
    setLoading(true)
    try {
      const url = `/api/repos/files/${component.id}/content${repoId ? `?repoId=${encodeURIComponent(repoId)}&path=${encodeURIComponent(component.path)}` : ''}`
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setCode(data.content || 'Code not available')
      } else {
        setCode('Code not available')
      }
    } catch (error) {
      console.error('Failed to fetch component code:', error)
      setCode('Failed to load code')
    } finally {
      setLoading(false)
    }
  }

  // Auto-fetch when dialog opens
  useEffect(() => {
    if (open && !code && !loading) {
      fetchComponentCode()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success('Code copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy code')
    }
  }

  const getComplexityColor = (complexity: number) => {
    if (complexity <= 3) return 'text-green-600'
    if (complexity <= 6) return 'text-yellow-600'
    if (complexity <= 10) return 'text-orange-600'
    return 'text-red-600'
  }

  const getComplexityBadge = (complexity: number) => {
    if (complexity <= 3) return 'Low'
    if (complexity <= 6) return 'Medium'
    if (complexity <= 10) return 'High'
    return 'Very High'
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <Code className="h-5 w-5" />
                {component.name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {component.path} (Lines {component.startLine}-{component.endLine})
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {component.type}
              </Badge>
              <Badge 
                variant="outline" 
                className={`${getComplexityColor(component.complexity)} border-current`}
              >
                {getComplexityBadge(component.complexity)} Complexity
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col">
          {component.description && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">{component.description}</p>
            </div>
          )}

          <div className="flex-1 min-h-0 border rounded-lg flex flex-col">
            <div className="flex items-center justify-between p-3 border-b bg-muted/50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Source Code</span>
                {loading && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
                    Loading...
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  disabled={!code || code === 'Code not available' || code === 'Failed to load code'}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                {repoOwner && repoName ? (
                  <a
                    href={`https://github.com/${repoOwner}/${repoName}/blob/${branch || 'main'}/${component.path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm hover:bg-accent"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View on GitHub
                  </a>
                ) : null}
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <pre className="p-4 text-sm font-mono whitespace-pre overflow-auto">
                  {code || 'Code not available'}
                </pre>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
