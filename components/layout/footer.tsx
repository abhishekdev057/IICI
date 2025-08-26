import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

interface FooterProps {
  variant?: "landing" | "minimal"
}

export function Footer({ variant = "landing" }: FooterProps) {
  if (variant === "minimal") {
    return (
      <footer className="border-t bg-muted/30 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">II</span>
              </div>
              <span className="font-semibold text-sm">IIICI</span>
            </div>
            <p className="text-xs text-muted-foreground">© 2024 IIICI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-muted/50 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">II</span>
              </div>
              <span className="font-bold text-2xl">IIICI</span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Investor in Institutional Innovation Certification - The global standard for institutional innovation
              maturity assessment and certification.
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                LinkedIn
              </Button>
              <Button variant="outline" size="sm">
                Twitter
              </Button>
              <Button variant="outline" size="sm">
                Newsletter
              </Button>
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold mb-4">About</h3>
            <div className="space-y-2">
              <Link href="/about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                About IIICI
              </Link>
              <Link href="/process" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Certification Process
              </Link>
              <Link href="/faq" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </Link>
              <Link href="/about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Our Mission
              </Link>
              <Link href="/team" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Team
              </Link>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <div className="space-y-2">
              <Link
                href="/application"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Apply for Certification
              </Link>
              <Link
                href="/dashboard"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/institution"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Institution Management
              </Link>

            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <div className="space-y-2">
              <Link href="/case-studies" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Case Studies
              </Link>
              <Link href="/about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Innovation Insights
              </Link>
              <Link href="/team" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Expert Network
              </Link>
              <Link href="/process" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Documentation
              </Link>
              <Link href="/contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Support Center
              </Link>
            </div>
          </div>
        </div>

        <Separator className="mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-6 mb-4 md:mb-0">
            <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cookie Policy
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact Us
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-sm text-muted-foreground">© 2024 IIICI. All rights reserved.</p>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <span>Built with</span>
              <span className="text-primary">♦</span>
              <span>innovation excellence</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
