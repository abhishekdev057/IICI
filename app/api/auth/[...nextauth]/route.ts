import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import { NextAuthOptions } from "next-auth"

// Check for required environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn("⚠️ Google OAuth credentials not configured. Authentication will not work.")
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async session({ session, token }): Promise<any> {
      if (session.user) {
        try {
          // Always ensure we have the user ID from the token
          const userId = token.sub
          
          if (userId) {
            // Always verify user exists in database
            const dbUser = await prisma.user.findUnique({
              where: { id: userId },
              select: { id: true, role: true, isActive: true, email: true }
            })
            
            if (!dbUser) {
              console.error("❌ User not found in database, revoking session for ID:", userId)
              // Return null to revoke the session
              return null
            }
            
            // Check if user is active
            if (!dbUser.isActive) {
              console.error("❌ User account is inactive, revoking session for ID:", userId)
              // Return null to revoke the session
              return null
            }
            
            // Set session user properties
            session.user.id = dbUser.id
            session.user.role = dbUser.role
            session.user.isActive = dbUser.isActive
            // Mirror application status from token if present
            // @ts-ignore
            session.user.applicationStatus = (token as any).applicationStatus || null
            
            // Session verified
          } else {
            console.warn("⚠️ No user ID found in token, trying email fallback")
            // Try to find user by email as fallback
            if (token.email) {
              const dbUser = await prisma.user.findUnique({
                where: { email: token.email },
                select: { id: true, role: true, isActive: true }
              })
              
              if (dbUser && dbUser.isActive) {
                session.user.id = dbUser.id
                session.user.role = dbUser.role
                session.user.isActive = dbUser.isActive
                console.log('✅ Session set via email fallback:', dbUser.id)
              } else {
                console.error("❌ User not found or inactive by email in session callback:", token.email)
                // Return null to revoke the session
                return null
              }
            } else {
              console.error("❌ No user ID or email found in token")
              // Return null to revoke the session
              return null
            }
          }
        } catch (error) {
          console.error("❌ Session callback error:", error)
          // Return null to revoke the session on any error
          return null
        }
      }
      return session
    },
    async jwt({ token, user, account, profile }): Promise<any> {
      // JWT callback processing
      
      if (account?.provider === "google" && profile) {
        try {
          // Check if user exists
          let dbUser = await prisma.user.findUnique({
            where: { email: token.email! }
          })
          
          console.log('🔍 Found existing user:', dbUser ? dbUser.id : 'none')

          if (!dbUser) {
            // Create new user with role based on email
            const userRole = token.email === 'mukulgadhwal0@gmail.com' ? 'SUPER_ADMIN' : 'USER'
            
            dbUser = await prisma.user.create({
              data: {
                email: token.email!,
                name: token.name,
                image: token.picture,
                role: userRole,
                isActive: true,
                emailVerified: new Date(),
              }
            })
            console.log(`✅ New user created: ${token.email} with role: ${userRole}`)
          } else {
            // Update existing user info and ensure super admin role for specific email
            const userRole = token.email === 'mukulgadhwal0@gmail.com' ? 'SUPER_ADMIN' : dbUser.role
            
            await prisma.user.update({
              where: { email: token.email! },
              data: {
                name: token.name,
                image: token.picture,
                emailVerified: new Date(),
                role: userRole, // Ensure super admin role is maintained
              }
            })
            console.log(`✅ Existing user signed in: ${token.email} with role: ${userRole}`)
          }

          // Set user ID and role in token
          token.sub = dbUser.id
          ;(token as any).role = dbUser.role
          console.log('✅ Set token.sub to:', dbUser.id)
        } catch (error) {
          console.error("❌ Error during user creation/update:", error)
          // Set a fallback ID if database operations fail
          if (!token.sub) {
            token.sub = token.email || undefined // Use email as fallback ID
          }
        }
      }

      // Enrich token with latest application status for middleware routing
      try {
        if (token.sub) {
          // First verify user still exists and is active
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub as string },
            select: { id: true, role: true, isActive: true }
          })
          
          if (!dbUser || !dbUser.isActive) {
            console.error("❌ User not found or inactive in JWT callback, clearing token")
            // Clear the token to force re-authentication
            return {}
          }
          
          const latestApp = await prisma.application.findFirst({
            where: { userId: token.sub as string },
            orderBy: { updatedAt: 'desc' },
            select: { id: true, status: true }
          })
          ;(token as any).applicationId = latestApp?.id || null
          ;(token as any).applicationStatus = latestApp?.status || null
          
          // Ensure role and isActive are set
          ;(token as any).role = dbUser.role
          ;(token as any).isActive = dbUser.isActive
        }
      } catch (e) {
        console.error("❌ Token enrichment error:", e)
        // Clear the token on database errors to force re-authentication
        return {}
      }
      return token
    },
    async redirect({ url, baseUrl }) {
      // Handle redirects properly
      try {
        const target = new URL(url, baseUrl)
        // Default post-auth landing: application
        if (target.origin === baseUrl) {
          if (target.pathname === "/" || target.pathname === "/auth") {
            return `${baseUrl}/application`
          }
          return target.toString()
        }
      } catch {}
      return `${baseUrl}/application`
    },
  },
  pages: {
    signIn: '/auth',
    error: '/auth',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
