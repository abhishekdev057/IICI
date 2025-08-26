import { Navigation } from "@/components/layout/navigation"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Award, 
  Users, 
  Target, 
  TrendingUp, 
  Shield, 
  CheckCircle, 
  ArrowRight, 
  Building2, 
  Globe, 
  Lightbulb,
  FileText,
  Clock,
  Star,
  Zap,
  ArrowLeft,
  Linkedin,
  Twitter,
  Mail,
  GraduationCap,
  Briefcase
} from "lucide-react"
import Link from "next/link"

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation variant="landing" title="IIICI" />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <Badge className="mb-4" variant="secondary">
              <Users className="w-4 h-4 mr-2" />
              Our Team
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Meet the IIICI Team
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our diverse team of innovation experts, industry leaders, and technology professionals 
              is dedicated to advancing organizational innovation excellence worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Leadership Team
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Experienced leaders driving innovation certification standards and organizational transformation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* CEO */}
            <Card className="text-center group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Users className="w-12 h-12 text-primary" />
                </div>
                <CardTitle className="text-xl">Dr. Sarah Johnson</CardTitle>
                <Badge variant="secondary" className="w-fit mx-auto">Chief Executive Officer</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Former innovation director at Fortune 500 companies with 15+ years of experience 
                  in organizational transformation and innovation strategy.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                  <GraduationCap className="w-4 h-4" />
                  <span>PhD, Innovation Management</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                  <Briefcase className="w-4 h-4" />
                  <span>15+ Years Experience</span>
                </div>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" size="sm">
                    <Linkedin className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* CTO */}
            <Card className="text-center group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                  <Lightbulb className="w-12 h-12 text-accent" />
                </div>
                <CardTitle className="text-xl">Michael Chen</CardTitle>
                <Badge variant="secondary" className="w-fit mx-auto">Chief Technology Officer</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Technology leader with expertise in AI, machine learning, and digital transformation. 
                  Former CTO at leading innovation platforms.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                  <GraduationCap className="w-4 h-4" />
                  <span>MS, Computer Science</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                  <Briefcase className="w-4 h-4" />
                  <span>12+ Years Experience</span>
                </div>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" size="sm">
                    <Linkedin className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* COO */}
            <Card className="text-center group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-24 h-24 bg-chart-1/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-chart-1/20 transition-colors">
                  <TrendingUp className="w-12 h-12 text-chart-1" />
                </div>
                <CardTitle className="text-xl">Emily Rodriguez</CardTitle>
                <Badge variant="secondary" className="w-fit mx-auto">Chief Operations Officer</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Operations expert specializing in scaling innovation programs and building 
                  sustainable organizational capabilities across global markets.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                  <GraduationCap className="w-4 h-4" />
                  <span>MBA, Operations Management</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                  <Briefcase className="w-4 h-4" />
                  <span>10+ Years Experience</span>
                </div>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" size="sm">
                    <Linkedin className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Advisory Board */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Advisory Board
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Industry experts and thought leaders providing strategic guidance and ensuring 
              the highest standards in innovation certification.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                name: "Dr. James Wilson",
                role: "Innovation Strategy",
                company: "Stanford University",
                expertise: "Academic Research"
              },
              {
                name: "Lisa Thompson",
                role: "Corporate Innovation",
                company: "Google",
                expertise: "Industry Practice"
              },
              {
                name: "David Kim",
                role: "Investment Strategy",
                company: "Sequoia Capital",
                expertise: "Venture Capital"
              },
              {
                name: "Prof. Maria Garcia",
                role: "Organizational Psychology",
                company: "MIT",
                expertise: "Behavioral Science"
              }
            ].map((advisor, index) => (
              <Card key={index} className="text-center group hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{advisor.name}</CardTitle>
                  <Badge variant="outline" className="w-fit mx-auto text-xs">
                    {advisor.role}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {advisor.company}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {advisor.expertise}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Our Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              The principles that guide our team and shape how we serve our global community.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Excellence</h3>
              <p className="text-muted-foreground">
                We maintain the highest standards in everything we do, from assessment methodology 
                to customer service.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Integrity</h3>
              <p className="text-muted-foreground">
                We conduct our work with complete transparency, ethical standards, and unwavering honesty.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-chart-1/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-chart-1" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Collaboration</h3>
              <p className="text-muted-foreground">
                We work closely with organizations, partners, and stakeholders to ensure mutual success.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-chart-2/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-chart-2" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Innovation</h3>
              <p className="text-muted-foreground">
                We continuously improve our processes and methodologies to better serve our community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Our Team */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join Our Team
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            We're always looking for talented individuals passionate about innovation and organizational excellence. 
            Explore opportunities to make a difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/faq">
                View Open Positions
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/faq">
                Contact HR
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer variant="landing" />
    </main>
  )
}
