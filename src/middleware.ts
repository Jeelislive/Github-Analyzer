import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimit = new Map<string, { count: number; resetTime: number }>()

function getRateLimitKey(request: NextRequest): string {
  return request.headers.get('x-forwarded-for') || 
         request.headers.get('x-real-ip') || 
         'anonymous'
}

function checkRateLimit(key: string, limit: number = 100, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now()
  const userLimit = rateLimit.get(key)
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimit.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (userLimit.count >= limit) {
    return false
  }
  
  userLimit.count++
  return true
}

export default withAuth(
  function middleware(request: NextRequest) {
    const response = NextResponse.next()
    
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    
    if (request.nextUrl.pathname.startsWith('/api/')) {
      const rateLimitKey = getRateLimitKey(request)
      
      if (!checkRateLimit(rateLimitKey)) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        )
      }
    }
    
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      const origin = request.headers.get('origin')
      const host = request.headers.get('host')
      
      if (origin && host && new URL(origin).host !== host) {
        return NextResponse.json(
          { error: 'CSRF protection: Invalid origin' },
          { status: 403 }
        )
      }
    }
    
    return response
  },
  {
    pages: {
      signIn: '/auth',
      error: '/auth/error',
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/repos/:path*',
    '/analyzer/:path*',
    '/analytics/:path*',
    '/contributions/:path*',
    '/prs/:path*',
    '/issues/:path*',
    '/goals/:path*',
    '/api/analyze/:path*',
    '/api/github/:path*',
    '/api/repos/:path*',
    '/api/analytics/:path*',
  ],
}
