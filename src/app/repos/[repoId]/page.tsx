'use client'

import { Card } from '@/components/ui/card'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

export default function RepoDetailPage() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Repository Details</h1>
      <Card className="p-6">
        <p className="text-muted-foreground">
          Repository details will be displayed here. This is a UI-only version.
        </p>
      </Card>
    </DashboardLayout>
  )
}
