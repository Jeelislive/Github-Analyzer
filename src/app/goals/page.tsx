'use client'

import { Card } from '@/components/ui/card'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getCurrentVisualized } from '@/lib/github-data'
import { useEffect, useState } from 'react'

export default function GoalsPage() {
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const currentUser = getCurrentVisualized()
    setUsername(currentUser)
  }, [])

  if (!username) {
    return (
      <DashboardLayout>
        <h1 className="text-3xl font-bold mb-6">Goals</h1>
        <Card className="p-6">
          <p className="text-muted-foreground">
            No profile visualized. Go to dashboard to fetch and visualize a GitHub profile.
          </p>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Goals</h1>
        <p className="text-muted-foreground">Viewing goals for @{username}</p>
      </div>
      <Card className="p-6">
        <p className="text-muted-foreground">
          Goals tracking will be displayed here for @{username}.
        </p>
      </Card>
    </DashboardLayout>
  )
}
