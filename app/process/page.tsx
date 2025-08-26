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
  Play,
  FileCheck,
  Award as AwardIcon,
  BarChart3
} from "lucide-react"
import Link from "next/link"

export default function ProcessPage() {
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
              <Play className="w-4 h-4 mr-2" />
              Certification Process
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Your Path to Innovation Excellence
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our comprehensive 6-step certification process is designed to be thorough, 
              transparent, and transformative. Here's how we help you achieve innovation excellence.
            </p>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              {/* Step 1 */}
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-4">Initial Registration & Setup</h3>
                  <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                    Begin your journey by creating your account and providing basic organization information. 
                    Our platform will guide you through the initial setup process, including institution 
                    details and contact information.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>15-30 minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Required: Organization details</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-accent">2</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-4">Comprehensive Assessment</h3>
                  <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                    Complete our detailed assessment across 6 innovation pillars. Each pillar contains 
                    multiple indicators that evaluate different aspects of your organization's innovation 
                    capabilities. Our step-by-step wizard guides you through each section.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>2-4 weeks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>6 pillars, 50+ indicators</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-chart-1/10 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-chart-1">3</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-4">Evidence Collection</h3>
                  <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                    Support your assessment responses with relevant evidence. This can include documents, 
                    links to policies, case studies, or detailed descriptions of your innovation practices. 
                    Our platform provides clear guidance on what evidence is required for each indicator.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>1-2 weeks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4" />
                      <span>Documentation & links</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-chart-2/10 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-chart-2">4</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-4">Expert Review</h3>
                  <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                    Our certified innovation experts review your assessment and evidence. They validate 
                    your responses, verify evidence quality, and ensure accuracy of the evaluation. 
                    This thorough review process typically takes 1-2 weeks.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>1-2 weeks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Expert validation</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">5</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-4">Scoring & Analysis</h3>
                  <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                    Our advanced scoring engine calculates your innovation maturity scores across all 
                    pillars. You'll receive detailed analysis including strengths, improvement areas, 
                    and benchmark comparisons with similar organizations.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>3-5 days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>Detailed scoring report</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 6 */}
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-accent">6</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-4">Certification & Recommendations</h3>
                  <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                    Receive your official IIICI certification and detailed improvement recommendations. 
                    Your certification is valid for one year and includes access to our improvement 
                    roadmap and ongoing support resources.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <AwardIcon className="w-4 h-4" />
                      <span>Official certification</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      <span>Improvement roadmap</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Overview */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Process Timeline
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              From initial registration to certification, the complete process typically takes 4-6 weeks.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Total Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">4-6 Weeks</div>
                  <p className="text-muted-foreground">
                    From registration to certification completion
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle>Assessment Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent mb-2">2-4 Weeks</div>
                  <p className="text-muted-foreground">
                    Time to complete the full assessment
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-chart-1/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Award className="w-6 h-6 text-chart-1" />
                  </div>
                  <CardTitle>Review Period</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-chart-1 mb-2">1-2 Weeks</div>
                  <p className="text-muted-foreground">
                    Expert review and validation time
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Certification Levels */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Certification Levels
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Your assessment results determine your certification level, each with its own benefits and recognition.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-2 border-yellow-200">
              <CardHeader>
                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-yellow-600" />
                </div>
                <CardTitle className="text-yellow-600">Gold Certification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600 mb-2">≥85% Score</div>
                <p className="text-muted-foreground mb-4">
                  Exceptional innovation excellence with comprehensive capabilities across all pillars.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Premium market positioning</li>
                  <li>• Enhanced investor confidence</li>
                  <li>• Priority support access</li>
                  <li>• Featured case study opportunity</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-blue-200">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-blue-600">Standard Certification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 mb-2">≥70% Score</div>
                <p className="text-muted-foreground mb-4">
                  Strong innovation foundation with clear improvement pathways identified.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Market credibility enhancement</li>
                  <li>• Investor attraction improvement</li>
                  <li>• Standard support access</li>
                  <li>• Detailed improvement roadmap</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-gray-200">
              <CardHeader>
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-gray-600" />
                </div>
                <CardTitle className="text-gray-600">Improvement Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600 mb-2">&lt;70% Score</div>
                <p className="text-muted-foreground mb-4">
                  Clear improvement opportunities with structured action plan for enhancement.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 90-day action plan</li>
                  <li>• Priority improvement areas</li>
                  <li>• Expert guidance access</li>
                  <li>• Re-assessment pathway</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Certification Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join the growing network of organizations that have transformed their innovation 
            capabilities through IIICI certification.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/application">
                Begin Your Assessment
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/faq">
                View FAQ
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer variant="landing" />
    </main>
  )
}
