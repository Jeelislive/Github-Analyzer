'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AnalyzerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Repository Analyzer</h1>
      
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Repository URL</label>
            <Input 
              type="url" 
              placeholder="https://github.com/owner/repo"
              className="mt-2"
            />
          </div>
          <Button>Analyze Repository</Button>
        </div>
      </Card>

      <Card className="p-6">
        <p className="text-muted-foreground">
          Repository analysis will be displayed here. This is a UI-only version.
        </p>
      </Card>
    </div>
  )
}
