import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Award,
  TrendingUp,
  Shield,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { UserStatusCTA } from "./user-status-cta";

export function HeroSection() {
  return (
    <section className="relative gradient-hero py-24 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge with animation */}
          <div className="animate-fade-in-up">
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20"
            >
              <Award className="w-4 h-4 mr-2" />
              An Exclusive Initiative for 50 Leading Agricultural Universities
              in India
            </Badge>
          </div>

          {/* Main heading with staggered animation */}
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <h1 className="text-heading text-4xl md:text-6xl lg:text-7xl text-foreground mb-8 leading-tight">
              Unlock Your University's{" "}
              <span className="text-primary relative">
                Innovation Potential
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent rounded-full" />
              </span>{" "}
              From Research to Revenue
            </h1>
          </div>

          {/* Subtitle with animation */}
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <p className="text-body text-xl md:text-2xl text-muted-foreground mb-10 max-w-4xl mx-auto leading-relaxed">
              Is your university prepared to lead the next agricultural
              revolution? Circularecosystem International Private Limited
              (CIPL), through its esteemed Bharat Innovation Research and
              Development Cooperative Forum (BIRD CO-OP Forum), invites your
              institution to pioneer a new standard of academic excellence and
              entrepreneurial success.
            </p>
          </div>

          {/* CTA buttons with animation */}
          <div
            className="animate-fade-in-up flex flex-col sm:flex-row gap-4 justify-center mb-16"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <UserStatusCTA />
              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-10 py-4 rounded-xl border-2 hover:bg-muted/50 transition-all duration-200 bg-transparent"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced stats cards */}
        <div
          className="animate-fade-in-up max-w-6xl mx-auto"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="card-feature card-interactive group">
              <CardContent className="pt-8 pb-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <div className="text-4xl font-bold text-primary mb-2">50</div>
                <div className="text-sm font-medium text-muted-foreground">
                  Leading Universities
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Agricultural Excellence
                </div>
              </CardContent>
            </Card>

            <Card className="card-feature card-interactive group">
              <CardContent className="pt-8 pb-6 text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                  <Award className="w-8 h-8 text-accent" />
                </div>
                <div className="text-4xl font-bold text-accent mb-2">5⭐</div>
                <div className="text-sm font-medium text-muted-foreground">
                  Star Rating System
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Innovation Capacity
                </div>
              </CardContent>
            </Card>

            <Card className="card-feature card-interactive group">
              <CardContent className="pt-8 pb-6 text-center">
                <div className="w-16 h-16 bg-chart-1/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-chart-1/20 transition-colors">
                  <Shield className="w-8 h-8 text-chart-1" />
                </div>
                <div className="text-4xl font-bold text-chart-1 mb-2">IIIC</div>
                <div className="text-sm font-medium text-muted-foreground">
                  Index Assessment
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Proprietary Framework
                </div>
              </CardContent>
            </Card>

            <Card className="card-feature card-interactive group">
              <CardContent className="pt-8 pb-6 text-center">
                <div className="w-16 h-16 bg-chart-2/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-chart-2/20 transition-colors">
                  <CheckCircle className="w-8 h-8 text-chart-2" />
                </div>
                <div className="text-4xl font-bold text-chart-2 mb-2">KAAS</div>
                <div className="text-sm font-medium text-muted-foreground">
                  Quarterly Reports
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Knowledge Audit
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trust indicators */}
        <div
          className="animate-fade-in-up mt-16 text-center"
          style={{ animationDelay: "0.5s" }}
        >
          <p className="text-sm text-muted-foreground mb-6">
            Powered by leading innovation organizations
          </p>
          <div className="flex justify-center items-center gap-8 opacity-60">
            <div className="text-lg font-bold text-muted-foreground">CIPL</div>
            <div className="text-lg font-bold text-muted-foreground">
              BIRD CO-OP Forum
            </div>
            <div className="text-lg font-bold text-muted-foreground">
              Bharat Innovation
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
