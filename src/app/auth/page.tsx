'use client'

import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function AuthPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { status } = useSession()

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard')
    }
  }, [status, router])

  const handleGitHubSignIn = () => {
    signIn('github', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            Sign in with GitHub
          </h2>
          <p className="text-muted-foreground mt-2">
            Use your GitHub account to sign in or sign up instantly.
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full" 
            size="lg"
            onClick={handleGitHubSignIn}
            disabled={loading}
          >
            <Github className="mr-2 h-5 w-5" />
            Continue with GitHub
          </Button>

          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              🎉 <strong>Free trial available</strong> - No credit card required
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}