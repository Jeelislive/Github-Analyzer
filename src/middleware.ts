import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

type RouteConfig = {
  pattern: string
  requiresAuth: boolean
  redirectTo?: string
}

type SecurityPolicy = {
  rateLimit: { requests: number; windowMs: number }
  headers: Record<string, string>
  csrfProtection: boolean
}

class MiddlewareHandler {
  private rateLimit = new Map<string, { count: number; resetTime: number }>()
  
  private readonly routes: RouteConfig[] = [
    { pattern: '/', requiresAuth: false, redirectTo: '/dashboard' },
    { pattern: '/dashboard', requiresAuth: true },
    { pattern: '/repos', requiresAuth: true },
    { pattern: '/analyzer', requiresAuth: true },
    { pattern: '/analytics', requiresAuth: true },
    { pattern: '/contributions', requiresAuth: true },
    { pattern: '/prs', requiresAuth: true },
    { pattern: '/issues', requiresAuth: true },
    { pattern: '/goals', requiresAuth: true },
    { pattern: '/api/analyze', requiresAuth: true },
    { pattern: '/api/github', requiresAuth: true },
    { pattern: '/api/repos', requiresAuth: true },
    { pattern: '/api/analytics', requiresAuth: true },
  ]
  
  private readonly security: SecurityPolicy = {
    rateLimit: { requests: 100, windowMs: 15 * 60 * 1000 },
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-XSS-Protection': '1; mode=block'
    },
    csrfProtection: true
  }

  private getClientIP(request: NextRequest): string {
    return request.headers.get('x-forwarded-for') || 
           request.headers.get('x-real-ip') || 
           'anonymous'
  }

  private isRateLimited(clientIP: string): boolean {
    const now = Date.now()
    const userLimit = this.rateLimit.get(clientIP)
    const { requests, windowMs } = this.security.rateLimit
    
    if (!userLimit || now > userLimit.resetTime) {
      this.rateLimit.set(clientIP, { count: 1, resetTime: now + windowMs })
      return false
    }
    
    if (userLimit.count >= requests) return true
    
    userLimit.count++
    return false
  }

  private findMatchingRoute(pathname: string): RouteConfig | null {
    return this.routes.find(route => 
      pathname === route.pattern || pathname.startsWith(route.pattern + '/')
    ) || null
  }

  private handleAuthRedirect(pathname: string, isAuthenticated: boolean, request: NextRequest): NextResponse | null {
    const route = this.findMatchingRoute(pathname)
    if (!route) return null

    // Root path logic: redirect authenticated users to dashboard
    if (pathname === '/' && isAuthenticated && route.redirectTo) {
      return NextResponse.redirect(new URL(route.redirectTo, request.url))
    }

    // Protected route logic: redirect unauthenticated users to auth
    if (route.requiresAuth && !isAuthenticated) {
      const isApiRoute = pathname.startsWith('/api/')
      return isApiRoute 
        ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        : NextResponse.redirect(new URL('/auth', request.url))
    }

    return null
  }

  private applySecurityHeaders(response: NextResponse): void {
    Object.entries(this.security.headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
  }

  private handleRateLimit(request: NextRequest): NextResponse | null {
    if (!request.nextUrl.pathname.startsWith('/api/')) return null
    
    const clientIP = this.getClientIP(request)
    return this.isRateLimited(clientIP)
      ? NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
      : null
  }

  private handleCSRFProtection(request: NextRequest): NextResponse | null {
    if (!this.security.csrfProtection) return null
    if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) return null

    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    
    return (origin && host && new URL(origin).host !== host)
      ? NextResponse.json({ error: 'CSRF protection: Invalid origin' }, { status: 403 })
      : null
  }

  async handle(request: NextRequest): Promise<NextResponse> {
    const { pathname } = request.nextUrl
    
    // Get authentication status
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    })
    const isAuthenticated = !!token

    // Security checks (fail fast)
    const rateLimitResponse = this.handleRateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

    const csrfResponse = this.handleCSRFProtection(request)
    if (csrfResponse) return csrfResponse

    // Authentication and routing
    const authRedirect = this.handleAuthRedirect(pathname, isAuthenticated, request)
    if (authRedirect) return authRedirect

    // Apply security headers and continue
    const response = NextResponse.next()
    this.applySecurityHeaders(response)
    return response
  }
}

const handler = new MiddlewareHandler()

export async function middleware(request: NextRequest) {
  return handler.handle(request)
}

export const config = {
  matcher: [
    '/',
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
