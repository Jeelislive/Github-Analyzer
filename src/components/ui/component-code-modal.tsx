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
}

export default function ComponentCodeModal({ component, children }: ComponentCodeModalProps) {
  const [code, setCode] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchComponentCode = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/repos/files/${component.id}/content`)
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
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
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

        <div className="flex-1 overflow-hidden flex flex-col">
          {component.description && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">{component.description}</p>
            </div>
          )}

          <div className="flex-1 overflow-hidden border rounded-lg">
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://github.com`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  View on GitHub
                </Button>
              </div>
            </div>

            <div className="h-full overflow-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <pre className="p-4 text-sm font-mono whitespace-pre-wrap overflow-auto h-full">
                  {code || 'Click to load code...'}
                </pre>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
