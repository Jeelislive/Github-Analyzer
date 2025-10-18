import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"
import GitHubProvider from "next-auth/providers/github"

const requiredEnvVars = {
  GITHUB_ID: process.env.GITHUB_ID,
  GITHUB_SECRET: process.env.GITHUB_SECRET,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
}

for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

async function storeGitHubToken(userId: string, accessToken: string, refreshToken?: string) {
  try {
    await prisma.account.updateMany({
      where: { 
        userId, 
        provider: 'github' 
      },
      data: { 
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 60),
      }
    })
  } catch (error) {
    console.error('Failed to store GitHub token:', error)
  }
}

export async function getGitHubToken(userId: string): Promise<string | null> {
  try {
    const account = await prisma.account.findFirst({
      where: { 
        userId, 
        provider: 'github' 
      },
      select: { 
        access_token: true, 
        expires_at: true 
      }
    })
    
    if (!account?.access_token) return null
    
    if (account.expires_at && account.expires_at < Math.floor(Date.now() / 1000)) {
      console.warn('GitHub token expired for user:', userId)
      return null
    }
    
    return account.access_token
  } catch (error) {
    console.error('Failed to retrieve GitHub token:', error)
    return null
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: { 
        params: { 
          scope: 'read:user user:email',
        } 
      },
      allowDangerousEmailAccountLinking: process.env.NODE_ENV === 'development',
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" && user?.email) {
        return true
      }
      console.warn('Sign-in attempt failed validation:', { provider: account?.provider, hasEmail: !!user?.email })
      return false
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.userId = user.id
        token.email = user.email
      }
      
      if (account?.access_token && token.userId) {
        await storeGitHubToken(
          token.userId as string, 
          account.access_token, 
          account.refresh_token || undefined
        )
      }
      
      return token
    },
    async session({ session, token }) {
      if (token.userId && session.user) {
        session.user.id = token.userId as string
        session.user.email = token.email as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      try {
        if (url.startsWith("/")) return `${baseUrl}${url}`
        
        const urlObj = new URL(url)
        const baseUrlObj = new URL(baseUrl)
        if (urlObj.origin === baseUrlObj.origin) return url
        
        return baseUrl
      } catch {
        return baseUrl
      }
    },
  },
  pages: {
    signIn: "/auth",
    error: "/auth/error",
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log('User authentication:', {
        userId: user.id,
        email: user.email,
        provider: account?.provider,
        isNewUser,
        timestamp: new Date().toISOString()
      })
    },
    async signOut({ token }) {
      if (token?.userId) {
        try {
          await prisma.account.updateMany({
            where: { 
              userId: token.userId as string, 
              provider: 'github' 
            },
            data: { 
              access_token: null,
              refresh_token: null 
            }
          })
        } catch (error) {
          console.error('Failed to clean up tokens on signout:', error)
        }
      }
    },
    async session({ session }) {
      if (process.env.NODE_ENV === 'production') {
        console.log('Active session:', {
          userId: session.user?.id,
          timestamp: new Date().toISOString()
        })
      }
    }
  },
}