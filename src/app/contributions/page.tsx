'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getCurrentVisualized } from '@/lib/github-data'

export default function ContributionsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const currentUser = getCurrentVisualized()
    setUsername(currentUser)
    
    if (currentUser) {
      fetchContributions(currentUser)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchContributions = async (user: string) => {
      setLoading(true)
    try {
      const response = await fetch(`https://api.github.com/users/${user}/events/public?per_page=100`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      console.error('Failed to fetch contributions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading contributions...</p>
          </div>
      </div>
      </DashboardLayout>
    )
  }

  if (!username) {
    return (
      <DashboardLayout>
        <h1 className="text-3xl font-bold mb-6">Contributions</h1>
        <Card className="p-6">
          <p className="text-muted-foreground">
            No profile visualized. Go to dashboard to fetch and visualize a GitHub profile.
          </p>
        </Card>
      </DashboardLayout>
    )
  }

  const eventTypes = events.reduce((acc: any, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1
    return acc
  }, {})

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Contributions</h1>
        <p className="text-muted-foreground">Viewing contributions for @{username}</p>
      </div>

      <div className="grid gap-4 mb-6">
        <Card className="p-4">
          <div className="flex gap-6">
            <div>
              <span className="text-2xl font-bold">{events.length}</span>
              <span className="text-muted-foreground ml-2">Total Events</span>
            </div>
      </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Activity Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(eventTypes).map(([type, count]: [string, any]) => (
            <div key={type} className="p-3 bg-muted rounded">
              <div className="text-sm text-muted-foreground">{type}</div>
              <div className="text-xl font-bold">{count}</div>
          </div>
          ))}
        </div>
      </Card>

      {events.length === 0 ? (
        <Card className="p-6 mt-4">
          <p className="text-muted-foreground">No contributions found.</p>
        </Card>
      ) : (
        <div className="grid gap-4 mt-4">
          {events.slice(0, 30).map((event, idx) => (
            <Card key={idx} className="p-4">
              <div className="text-sm">
                <span className="font-medium">{event.type}</span>
                {event.repo && (
                  <span className="text-muted-foreground ml-2">in {event.repo.name}</span>
                )}
                <span className="text-muted-foreground ml-2">
                  {new Date(event.created_at).toLocaleDateString()}
                </span>
              </div>
            </Card>
          ))}
    </div>
      )}
    </DashboardLayout>
  )
}
