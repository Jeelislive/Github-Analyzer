'use client'

import React from 'react'
import AppShell from '@/components/dashboard/AppShell'

export default function ReposLayout({ children }: { children: React.ReactNode }) {
  // Ensure the sidebar is always present for all /repos/* routes,
  // even while individual pages are fetching data.
  return <AppShell>{children}</AppShell>
}
