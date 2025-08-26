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
    async session({ session, token }) {
      if (session.user) {
        try {
          // Always ensure we have the user ID from the token
          const userId = token.sub
          
          if (userId) {
            // Get user from database
            const dbUser = await prisma.user.findUnique({
              where: { id: userId },
              select: { role: true, isActive: true }
            })
            
            // Set session user properties
            session.user.id = userId
            session.user.role = dbUser?.role || 'USER'
            session.user.isActive = dbUser?.isActive ?? true
            
            console.log('✅ Session set with user ID:', userId)
          } else {
            console.warn("⚠️ No user ID found in token, trying email fallback")
            // Try to find user by email as fallback
            if (token.email) {
              const dbUser = await prisma.user.findUnique({
                where: { email: token.email },
                select: { id: true, role: true, isActive: true }
              })
              
              if (dbUser) {
                session.user.id = dbUser.id
                session.user.role = dbUser.role
                session.user.isActive = dbUser.isActive
                console.log('✅ Session set via email fallback:', dbUser.id)
              } else {
                console.error("❌ User not found by email in session callback:", token.email)
              }
            }
          }
        } catch (error) {
          console.error("❌ Session callback error:", error)
          // Last resort: try email lookup
          if (token.email) {
            try {
              const dbUser = await prisma.user.findUnique({
                where: { email: token.email },
                select: { id: true, role: true, isActive: true }
              })
              
              if (dbUser) {
                session.user.id = dbUser.id
                session.user.role = dbUser.role
                session.user.isActive = dbUser.isActive
                console.log('✅ Session set via error fallback:', dbUser.id)
              }
            } catch (fallbackError) {
              console.error("❌ Fallback session lookup failed:", fallbackError)
            }
          }
        }
      }
      return session
    },
    async jwt({ token, user, account, profile }) {
      console.log('🔍 JWT Callback - token:', { sub: token.sub, email: token.email })
      console.log('🔍 JWT Callback - account provider:', account?.provider)
      
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

          // Set user ID in token
          token.sub = dbUser.id
          console.log('✅ Set token.sub to:', dbUser.id)
        } catch (error) {
          console.error("❌ Error during user creation/update:", error)
          // Set a fallback ID if database operations fail
          if (!token.sub) {
            token.sub = token.email || undefined // Use email as fallback ID
          }
        }
      }
      return token
    },
    async redirect({ url, baseUrl }) {
      // Handle redirects properly
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
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
