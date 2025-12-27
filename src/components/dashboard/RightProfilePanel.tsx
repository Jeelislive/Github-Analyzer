"use client"

import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Mail } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'

export default function RightProfilePanel() {
  const { user } = useAuth()

  const getUserInitials = (email: string | undefined) => {
    if (!email) return 'U'
    return email[0].toUpperCase()
  }

  return (
    <aside className="hidden lg:block w-80 border-l bg-white/80 backdrop-blur p-6 space-y-6 overflow-y-auto h-[calc(100vh-4rem)]">
      <Card className="p-6">
        <div className="text-center mb-4">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {getUserInitials(user?.email)}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold">{user?.user_metadata?.full_name || 'User'}</h2>
          {user?.email && (
            <p className="text-sm text-muted-foreground">{user.email}</p>
          )}
        </div>
      </Card>

      {user && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Profile Information</h3>
          <div className="space-y-3 text-sm">
            {user.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
            )}
          </div>
        </Card>
      )}
    </aside>
  )
}
