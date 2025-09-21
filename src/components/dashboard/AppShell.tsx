"use client"

import Sidebar from '@/components/dashboard/Sidebar'
import RightProfilePanel from '@/components/dashboard/RightProfilePanel'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full px-6 py-6">
      <div className="flex gap-6">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>

        {/* Right Profile */}
        <div className="hidden xl:block w-80 shrink-0">
          <RightProfilePanel />
        </div>
      </div>
    </div>
  )
}
