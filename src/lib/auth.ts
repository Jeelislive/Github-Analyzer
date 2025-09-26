import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"
import GitHubProvider from "next-auth/providers/github"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      // Request user email scope explicitly to guarantee we receive emails
      authorization: { params: { scope: 'read:user user:email' } },
      // When migrating from credentials/email auth to GitHub-only, allow linking by matching email
      allowDangerousEmailAccountLinking: true,
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Persist the user ID to the token right after signin
      if (user) {
        token.userId = user.id
      }
      // Persist GitHub access token when available, otherwise keep existing one
      if (account?.access_token) {
        (token as any).accessToken = account.access_token
      } else if ((token as any).accessToken) {
        // carry forward existing token across subsequent requests
        (token as any).accessToken = (token as any).accessToken
      }
      return token
    },
    async session({ session, token }) {
      // Send user ID from token to the client
      if (token.userId && session.user) {
        session.user.id = token.userId as string
      }
      // Expose access token to client
      ;(session as any).accessToken = (token as any).accessToken
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: "/auth",
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      if (process.env.DEBUG_AUTH === '1') {
        // eslint-disable-next-line no-console
        console.log('Sign in event:', { user: user.email, provider: account?.provider })
      }
    },
  },
}