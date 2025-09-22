import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session) {
      console.log("🔓 Logging out user:", session.user?.email)
    }
    
    // Create response with cleared cookies
    const response = NextResponse.json({ 
      success: true, 
      message: "Logged out successfully" 
    })
    
    // Clear all NextAuth cookies
    response.cookies.delete("next-auth.session-token")
    response.cookies.delete("next-auth.csrf-token")
    response.cookies.delete("next-auth.callback-url")
    response.cookies.delete("next-auth.state")
    response.cookies.delete("next-auth.pkce.code_verifier")
    
    // Clear application-specific cookies
    response.cookies.delete("iiici_app_submitted")
    
    return response
  } catch (error) {
    console.error("❌ Logout error:", error)
    return NextResponse.json(
      { success: false, message: "Logout failed" },
      { status: 500 }
    )
  }
}
