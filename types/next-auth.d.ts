import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: "USER" | "ADMIN" | "SUPER_ADMIN"
      isActive: boolean
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    role: "USER" | "ADMIN" | "SUPER_ADMIN"
    isActive: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "USER" | "ADMIN" | "SUPER_ADMIN"
    isActive: boolean
  }
}
