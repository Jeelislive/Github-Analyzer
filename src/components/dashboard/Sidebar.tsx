"use client"

import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { Home, BarChart3, GitPullRequest, MessageSquare, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const items = [
    { label: 'Dashboard', icon: Home, href: '/dashboard' },
    { label: 'PRs', icon: GitPullRequest, href: '/prs' },
    { label: 'Issues', icon: MessageSquare, href: '/issues' },
    { label: 'Repos', icon: BarChart3, href: '/repos' },
    { label: 'Analytics', icon: Target, href: '/analytics' },
  ]

  return (
    <aside aria-label="Sidebar" className="hidden md:flex md:flex-col w-60 shrink-0 border-r bg-white/80 backdrop-blur sticky top-16 h-[calc(100vh-4rem)]">
      <div className="p-4 border-b">
        <div className="text-lg font-semibold">GitHub Analyzer</div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-auto">
        {items.map(({ label, icon: Icon, href }) => (
          <button key={label} onClick={() => router.push(href)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-md text-left hover:bg-gray-100',
              pathname === href ? 'bg-gray-100 font-medium' : 'text-gray-700'
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}
