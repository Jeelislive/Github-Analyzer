import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/auth',
  },
})

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/repos/:path*',
    '/analyzer',
    '/analyzer/:path*',
  ],
}
