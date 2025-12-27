'use client'

import React from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

export default function ReposLayout({ children }: { children: React.ReactNode }) {
  // Ensure the sidebar is always present for all /repos/* routes,
  // even while individual pages are fetching data.
  return <DashboardLayout>{children}</DashboardLayout>
}
