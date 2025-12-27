'use client'

import Sidebar from './Sidebar'
import RightProfilePanel from './RightProfilePanel'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex">
        <main className="flex-1 p-6">
          {children}
        </main>
        <RightProfilePanel />
      </div>
    </div>
  )
}

