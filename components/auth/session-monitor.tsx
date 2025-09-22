"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";

export function SessionMonitor() {
  const { data: session, status } = useSession();
  const lastValidSessionRef = useRef<boolean>(false);
  const invalidSessionCountRef = useRef<number>(0);
  const consecutiveFailuresRef = useRef<number>(0);
  const lastCheckTimeRef = useRef<number>(0);
  const backoffMultiplierRef = useRef<number>(1);

  useEffect(() => {
    // Monitor session validity with improved resilience
    if (status === "authenticated") {
      if (session?.user) {
        // Session is valid - reset all failure counters
        lastValidSessionRef.current = true;
        invalidSessionCountRef.current = 0;
        consecutiveFailuresRef.current = 0;
        backoffMultiplierRef.current = 1; // Reset backoff
      } else {
        // Session is invalid (user is null but status is authenticated)
        console.log("🚨 Invalid session detected - user is null");
        invalidSessionCountRef.current += 1;

        // Only force logout after 5 consecutive failures (increased from 3)
        if (invalidSessionCountRef.current >= 5) {
          console.log("🚨 Multiple invalid sessions detected, forcing logout");
          signOut({ callbackUrl: "/" });
        }
      }
    } else if (status === "unauthenticated") {
      // User is properly unauthenticated
      lastValidSessionRef.current = false;
      invalidSessionCountRef.current = 0;
      consecutiveFailuresRef.current = 0;
      backoffMultiplierRef.current = 1;
    }
  }, [session, status]);

  // Monitor for session expiration with exponential backoff
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const checkSession = async () => {
        const now = Date.now();

        // Implement exponential backoff for failed checks
        const baseInterval = 15 * 60 * 1000; // 15 minutes base interval
        const backoffInterval = baseInterval * backoffMultiplierRef.current;

        // Don't check too frequently
        if (now - lastCheckTimeRef.current < backoffInterval) {
          return;
        }

        lastCheckTimeRef.current = now;

        try {
          // Add timeout to prevent hanging requests
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          const response = await fetch("/api/auth/session", {
            signal: controller.signal,
            headers: {
              "Cache-Control": "no-cache",
            },
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = await response.json();

          if (!data || !data.user) {
            consecutiveFailuresRef.current += 1;
            console.log(
              `🚨 Session check failed (${consecutiveFailuresRef.current}/5)`
            );

            // Only logout after 5 consecutive failures
            if (consecutiveFailuresRef.current >= 5) {
              console.log("🚨 Multiple session check failures, logging out");
              signOut({ callbackUrl: "/" });
            } else {
              // Increase backoff multiplier for next check
              backoffMultiplierRef.current = Math.min(
                backoffMultiplierRef.current * 2,
                8
              );
            }
          } else {
            // Session is valid - reset failure counters
            consecutiveFailuresRef.current = 0;
            backoffMultiplierRef.current = 1;
          }
        } catch (error) {
          consecutiveFailuresRef.current += 1;
          console.error(
            `Session check failed (${consecutiveFailuresRef.current}/5):`,
            error
          );

          // Only logout after 5 consecutive failures
          if (consecutiveFailuresRef.current >= 5) {
            console.log("🚨 Multiple session check failures, logging out");
            signOut({ callbackUrl: "/" });
          } else {
            // Increase backoff multiplier for next check
            backoffMultiplierRef.current = Math.min(
              backoffMultiplierRef.current * 2,
              8
            );
          }
        }
      };

      // Initial check after 15 minutes, then use dynamic intervals
      const initialTimeout = setTimeout(checkSession, 15 * 60 * 1000);

      // Set up recurring checks with dynamic intervals
      const scheduleNextCheck = () => {
        const baseInterval = 15 * 60 * 1000; // 15 minutes
        const backoffInterval = baseInterval * backoffMultiplierRef.current;
        return setTimeout(() => {
          checkSession().then(() => {
            // Schedule next check
            scheduleNextCheck();
          });
        }, backoffInterval);
      };

      const recurringTimeout = scheduleNextCheck();

      return () => {
        clearTimeout(initialTimeout);
        clearTimeout(recurringTimeout);
      };
    }
  }, [status, session]);

  // This component doesn't render anything
  return null;
}
