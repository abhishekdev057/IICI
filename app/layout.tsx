import type React from "react";
import type { Metadata, Viewport } from "next";
import {
  Playfair_Display,
  Source_Sans_3 as Source_Sans_Pro,
} from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/contexts/data-context";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair-display",
  weight: ["400", "700", "900"],
});

const sourceSansPro = Source_Sans_Pro({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans-pro",
  weight: ["300", "400", "600", "700"],
});

export const metadata: Metadata = {
  title: "IIICI - Investor in Institutional Innovation Certification",
  description:
    "Professional certification platform for institutional innovation management and assessment",
  generator: "v0.app",
  keywords: [
    "innovation",
    "certification",
    "institutional",
    "assessment",
    "IIICI",
  ],
  authors: [{ name: "IIICI" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${sourceSansPro.variable} antialiased`}
    >
      <body className="font-sans">
        <ErrorBoundary>
          <AuthSessionProvider>
            <DataProvider>
              {children}
              <Toaster />
            </DataProvider>
          </AuthSessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
