"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface SessionProviderProps {
  children: ReactNode;
}

export function AuthSessionProvider({ children }: SessionProviderProps) {
  return (
    <SessionProvider
      refetchInterval={0} // Disable automatic refetching to reduce API calls
      refetchOnWindowFocus={false} // Disable refetch on window focus
      refetchWhenOffline={false} // Disable refetch when offline
      // Add session configuration for better resilience
      basePath="/api/auth"
      // Increase session timeout tolerance
      session={undefined} // Let NextAuth handle session management
    >
      {children}
    </SessionProvider>
  );
}
