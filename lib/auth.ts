import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import { userAuthService } from "@/lib/user-auth-service"

// Database retry utility with exponential backoff
async function fetchUserWithRetry(userId: string, maxRetries: number = 3): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, isActive: true, email: true }
      })
      
      if (user) {
        console.log(`✅ User data fetched successfully (attempt ${attempt})`)
        return user
      }
      
      // If user not found, don't retry
      if (attempt === 1) {
        console.error("❌ User not found in database:", userId)
        return null
      }
    } catch (error) {
      console.error(`❌ Database error on attempt ${attempt}:`, error)
      
      if (attempt === maxRetries) {
        console.error("❌ Max retries reached, giving up on user fetch")
        return null
      }
      
      // Exponential backoff: wait 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000
      console.log(`⏳ Retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  return null
}

// Check for required environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn("⚠️ Google OAuth credentials not configured. Authentication will not work.")
}

if (!process.env.NEXTAUTH_SECRET) {
  console.warn("⚠️ NEXTAUTH_SECRET not configured. Using fallback secret for development.")
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 1 day
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
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
      // If token is null (revoked), return null to force logout
      if (!token) {
        console.log("❌ Token is null, revoking session")
        return null
      }
      
      if (session.user) {
        try {
          // Always ensure we have the user ID from the token
          const userId = token.sub
          
          if (userId) {
            // Check if we have cached user data in token (less than 1 hour old)
            const tokenUserData = (token as any).userData
            const tokenUserTimestamp = (token as any).userDataTimestamp
            const now = Date.now()
            const oneHour = 60 * 60 * 1000
            
            let dbUser = null
            
            // Use cached data if it's less than 1 hour old
            if (tokenUserData && tokenUserTimestamp && (now - tokenUserTimestamp) < oneHour) {
              console.log("📦 Using cached user data from token")
              dbUser = tokenUserData
            } else {
              // Fetch fresh data from database with retry logic
              dbUser = await fetchUserWithRetry(userId)
            }
            
            if (!dbUser) {
              console.error("❌ User not found in database after retries, revoking session for ID:", userId)
              // Return null to revoke the session completely
              return null
            }
            
            // Check if user is active
            if (!dbUser.isActive) {
              console.error("❌ User account is inactive, revoking session for ID:", userId)
              // Return null to revoke the session completely
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
                // Return null to revoke the session completely
                return null
              }
            } else {
              console.error("❌ No user ID or email found in token")
              // Return null to revoke the session completely
              return null
            }
          }
        } catch (error) {
          console.error("❌ Session callback error:", error)
          // Return null to revoke the session completely on any error
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
            
            // Send welcome email for new user
            await userAuthService.handleUserAuth({
              user: {
                id: dbUser.id,
                email: dbUser.email,
                name: dbUser.name || '',
                role: dbUser.role
              },
              isNewUser: true
            })
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
            
            // Send welcome back email for existing user
            await userAuthService.handleUserAuth({
              user: {
                id: dbUser.id,
                email: dbUser.email,
                name: dbUser.name || '',
                role: userRole
              },
              isNewUser: false,
              loginTime: new Date()
            })
          }

          // Set user ID and role in token with caching
          token.sub = dbUser.id
          ;(token as any).role = dbUser.role
          ;(token as any).isActive = dbUser.isActive
          
          // Cache user data in token
          ;(token as any).userData = {
            id: dbUser.id,
            role: dbUser.role,
            isActive: dbUser.isActive,
            email: dbUser.email
          }
          ;(token as any).userDataTimestamp = Date.now()
          
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
          // Check if we have cached user data (less than 30 minutes old)
          const tokenUserData = (token as any).userData
          const tokenUserTimestamp = (token as any).userDataTimestamp
          const now = Date.now()
          const thirtyMinutes = 30 * 60 * 1000
          
          let dbUser = null
          
          // Use cached data if it's less than 30 minutes old
          if (tokenUserData && tokenUserTimestamp && (now - tokenUserTimestamp) < thirtyMinutes) {
            console.log("📦 Using cached user data in JWT callback")
            dbUser = tokenUserData
          } else {
            // Fetch fresh data with retry logic
            dbUser = await fetchUserWithRetry(token.sub as string)
            
            // Cache the fresh data
            if (dbUser) {
              ;(token as any).userData = dbUser
              ;(token as any).userDataTimestamp = now
            }
          }
          
          if (!dbUser || !dbUser.isActive) {
            console.error("❌ User not found or inactive in JWT callback, clearing token")
            // Return null to completely revoke the token and force logout
            return null
          }
          
          // Only fetch application data if we don't have it cached or it's old
          const tokenAppData = (token as any).applicationData
          const tokenAppTimestamp = (token as any).applicationDataTimestamp
          const fiveMinutes = 5 * 60 * 1000
          
          if (!tokenAppData || !tokenAppTimestamp || (now - tokenAppTimestamp) > fiveMinutes) {
            try {
              const latestApp = await prisma.application.findFirst({
                where: { userId: token.sub as string },
                orderBy: { updatedAt: 'desc' },
                select: { id: true, status: true }
              })
              
              ;(token as any).applicationId = latestApp?.id || null
              ;(token as any).applicationStatus = latestApp?.status || null
              ;(token as any).applicationData = latestApp
              ;(token as any).applicationDataTimestamp = now
            } catch (appError) {
              console.error("❌ Error fetching application data:", appError)
              // Don't fail the entire token for application data errors
              ;(token as any).applicationId = (token as any).applicationId || null
              ;(token as any).applicationStatus = (token as any).applicationStatus || null
            }
          } else {
            // Use cached application data
            ;(token as any).applicationId = tokenAppData?.id || null
            ;(token as any).applicationStatus = tokenAppData?.status || null
          }
          
          // Ensure role and isActive are set
          ;(token as any).role = dbUser.role
          ;(token as any).isActive = dbUser.isActive
        }
      } catch (e) {
        console.error("❌ Token enrichment error:", e)
        // Don't immediately revoke token on database errors - use cached data if available
        const tokenUserData = (token as any).userData
        if (tokenUserData && tokenUserData.isActive) {
          console.log("🔄 Using cached user data due to database error")
          ;(token as any).role = tokenUserData.role
          ;(token as any).isActive = tokenUserData.isActive
        } else {
          // Only revoke if we have no cached data
          console.error("❌ No cached data available, revoking token")
          return null
        }
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
  debug: process.env.NODE_ENV === "development",
}
