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
  DollarSign,
  BarChart3,
  Calendar,
  MapPin
} from "lucide-react"
import Link from "next/link"

export default function CaseStudiesPage() {
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
              <FileText className="w-4 h-4 mr-2" />
              Case Studies
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Success Stories
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover how organizations across industries have transformed their innovation capabilities 
              and achieved remarkable results through IIICI certification.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Case Study */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Featured Success Story
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                How TechInnovate Corp achieved Gold certification and transformed their innovation culture.
              </p>
            </div>
            
            <Card className="overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-8 lg:p-12">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-yellow-100 text-yellow-800">Gold Certification</Badge>
                    <Badge variant="outline">Technology</Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    TechInnovate Corp
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    A mid-size technology company struggling with innovation silos and inconsistent 
                    processes achieved Gold certification within 6 months, resulting in 40% faster 
                    time-to-market and 60% increase in R&D efficiency.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary">40%</div>
                      <div className="text-sm text-muted-foreground">Faster Time-to-Market</div>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-accent">60%</div>
                      <div className="text-sm text-muted-foreground">R&D Efficiency Increase</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <h4 className="font-semibold text-foreground">Key Achievements:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Implemented systematic innovation processes across all departments
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Reduced innovation cycle time from 18 to 11 months
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Increased patent applications by 150%
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Improved employee innovation engagement by 80%
                      </li>
                    </ul>
                  </div>
                  
                  <Button asChild>
                    <Link href="/application">
                      Start Your Journey
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 lg:p-12 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="w-12 h-12 text-primary" />
                    </div>
                    <h4 className="text-lg font-semibold mb-2">Gold Certification</h4>
                    <p className="text-muted-foreground text-sm">
                      Achieved in 6 months with comprehensive innovation transformation
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* More Case Studies */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              More Success Stories
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Explore how different organizations have leveraged IIICI certification to drive innovation excellence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Healthcare Case Study */}
            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-blue-100 text-blue-800">Standard Certification</Badge>
                  <Badge variant="outline">Healthcare</Badge>
                </div>
                <CardTitle className="text-xl">MedTech Solutions</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>Boston, MA</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Healthcare technology startup improved patient outcomes and secured $5M in funding 
                  after achieving Standard certification.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Funding Secured:</span>
                    <span className="font-semibold">$5M</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Patient Outcomes:</span>
                    <span className="font-semibold">+35%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Time to Market:</span>
                    <span className="font-semibold">-25%</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Read Full Case Study
                </Button>
              </CardContent>
            </Card>

            {/* Manufacturing Case Study */}
            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-green-100 text-green-800">Gold Certification</Badge>
                  <Badge variant="outline">Manufacturing</Badge>
                </div>
                <CardTitle className="text-xl">Global Manufacturing Inc</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>Detroit, MI</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Traditional manufacturer transformed operations with smart factory initiatives, 
                  achieving 30% cost reduction and 50% quality improvement.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cost Reduction:</span>
                    <span className="font-semibold">30%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quality Improvement:</span>
                    <span className="font-semibold">50%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Energy Efficiency:</span>
                    <span className="font-semibold">+40%</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Read Full Case Study
                </Button>
              </CardContent>
            </Card>

            {/* Finance Case Study */}
            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-purple-100 text-purple-800">Standard Certification</Badge>
                  <Badge variant="outline">Finance</Badge>
                </div>
                <CardTitle className="text-xl">FinTech Innovations</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>New York, NY</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Financial services company enhanced customer experience and increased market share 
                  by 25% through digital innovation initiatives.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Market Share:</span>
                    <span className="font-semibold">+25%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Customer Satisfaction:</span>
                    <span className="font-semibold">+45%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Digital Adoption:</span>
                    <span className="font-semibold">+60%</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Read Full Case Study
                </Button>
              </CardContent>
            </Card>

            {/* Education Case Study */}
            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-orange-100 text-orange-800">Standard Certification</Badge>
                  <Badge variant="outline">Education</Badge>
                </div>
                <CardTitle className="text-xl">EduTech University</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>San Francisco, CA</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  University modernized learning platforms and research capabilities, improving 
                  student outcomes and research funding by 40%.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Research Funding:</span>
                    <span className="font-semibold">+40%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Student Success:</span>
                    <span className="font-semibold">+30%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Digital Learning:</span>
                    <span className="font-semibold">+70%</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Read Full Case Study
                </Button>
              </CardContent>
            </Card>

            {/* Non-Profit Case Study */}
            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-teal-100 text-teal-800">Standard Certification</Badge>
                  <Badge variant="outline">Non-Profit</Badge>
                </div>
                <CardTitle className="text-xl">Green Future Initiative</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>Portland, OR</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Environmental organization scaled impact through technology innovation, 
                  increasing community engagement and funding by 200%.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Community Engagement:</span>
                    <span className="font-semibold">+200%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Funding Increase:</span>
                    <span className="font-semibold">+200%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Impact Scale:</span>
                    <span className="font-semibold">+150%</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Read Full Case Study
                </Button>
              </CardContent>
            </Card>

            {/* Government Case Study */}
            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-indigo-100 text-indigo-800">Standard Certification</Badge>
                  <Badge variant="outline">Government</Badge>
                </div>
                <CardTitle className="text-xl">Smart City Initiative</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>Austin, TX</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Municipal government improved citizen services and operational efficiency 
                  through digital transformation and smart city technologies.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Efficiency:</span>
                    <span className="font-semibold">+50%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Citizen Satisfaction:</span>
                    <span className="font-semibold">+35%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cost Savings:</span>
                    <span className="font-semibold">$2M/year</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Read Full Case Study
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Impact by the Numbers
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Real results achieved by organizations through IIICI certification.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">Organizations Certified</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">$2.5B+</div>
              <p className="text-muted-foreground">Additional Funding Raised</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-chart-1 mb-2">85%</div>
              <p className="text-muted-foreground">Average ROI Improvement</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-chart-2 mb-2">40%</div>
              <p className="text-muted-foreground">Faster Time-to-Market</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join hundreds of organizations that have transformed their innovation capabilities 
            and achieved remarkable results through IIICI certification.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/application">
                Start Your Certification
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/process">
                Learn About Process
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer variant="landing" />
    </main>
  )
}
