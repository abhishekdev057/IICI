import { HeroSection } from "@/components/landing/hero-section";
import { PillarsSection } from "@/components/landing/pillars-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { UserStatusCTA } from "@/components/landing/user-status-cta";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
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
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navigation variant="landing" />
      <HeroSection />
      <PillarsSection />
      <TestimonialsSection />

      {/* About Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="secondary">
              <Award className="w-4 h-4 mr-2" />
              About Our Initiative
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Transforming Agricultural Education Through Innovation
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our exclusive initiative brings together 50 leading agricultural
              universities in India to pioneer a new standard of academic
              excellence and entrepreneurial success. Through the IIIC Index,
              incubation support, and quarterly knowledge audits, we're building
              the future of agricultural innovation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To empower agricultural universities with comprehensive
                  innovation assessment tools, incubation support, and
                  governance frameworks that transform research into real-world
                  impact.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>National Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Exclusively serving 50 leading agricultural universities
                  across India with our proprietary IIIC Index assessment and
                  comprehensive innovation support programs.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Proven Framework</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our proprietary IIIC Index framework provides data-driven
                  insights and 5-star rating system recognized by leading
                  agricultural institutions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="secondary">
              <Clock className="w-4 h-4 mr-2" />
              Certification Process
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Simple 4-Step Certification Process
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our streamlined process makes it easy to assess your innovation
              maturity and achieve certification in just a few weeks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Register & Setup</h3>
              <p className="text-muted-foreground">
                Create your account and provide basic organization information
                to get started.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">
                Complete Assessment
              </h3>
              <p className="text-muted-foreground">
                Fill out the comprehensive assessment across all 6 innovation
                pillars with supporting evidence.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Review & Analysis</h3>
              <p className="text-muted-foreground">
                Our expert team reviews your submission and provides detailed
                analysis and recommendations.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                4
              </div>
              <h3 className="text-xl font-semibold mb-4">Get Certified</h3>
              <p className="text-muted-foreground">
                Receive your certification and detailed improvement roadmap for
                continued innovation growth.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <UserStatusCTA />
          </div>
        </div>
      </section>

      {/* Learn More Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="secondary">
              <Lightbulb className="w-4 h-4 mr-2" />
              Learn More
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Discover Innovation Excellence
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Explore our resources and learn how IIICI certification can
              transform your organization's innovation capabilities and drive
              sustainable growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-2 hover:border-blue-200">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Case Studies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Explore real-world examples of organizations that have
                  achieved innovation excellence through IIICI certification.
                </p>
                <Button
                  variant="outline"
                  className="w-full mt-4 group-hover:bg-blue-50 group-hover:border-blue-300 group-hover:text-blue-700 transition-all duration-200"
                  asChild
                >
                  <Link href="/case-studies">
                    Read Case Studies
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-2 hover:border-green-200">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Innovation Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Access the latest research, trends, and best practices in
                  organizational innovation and capability building.
                </p>
                <Button
                  variant="outline"
                  className="w-full mt-4 group-hover:bg-green-50 group-hover:border-green-300 group-hover:text-green-700 transition-all duration-200"
                  asChild
                >
                  <Link href="/insights">
                    Explore Insights
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-2 hover:border-purple-200">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Expert Network</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Connect with innovation experts, certified organizations, and
                  thought leaders in the IIICI community.
                </p>
                <Button
                  variant="outline"
                  className="w-full mt-4 group-hover:bg-purple-50 group-hover:border-purple-300 group-hover:text-purple-700 transition-all duration-200"
                  asChild
                >
                  <Link href="/network">
                    Join Network
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="secondary">
              <Star className="w-4 h-4 mr-2" />
              FAQ
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about IIICI certification and the
              innovation assessment process.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <div className="card-feature p-6 border-l-4 border-l-primary hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center">
                <CheckCircle className="w-5 h-5 text-primary mr-2" />
                How long is certification valid?
              </h3>
              <p className="text-muted-foreground">
                IIICI certification is valid for one year from the date of
                issuance. Organizations can reapply annually to maintain their
                certification status and track improvement over time.
              </p>
            </div>

            <div className="card-feature p-6 border-l-4 border-l-accent hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center">
                <Zap className="w-5 h-5 text-accent mr-2" />
                What are the certification thresholds?
              </h3>
              <p className="text-muted-foreground">
                Gold Certification requires ≥85% overall score, Standard
                Certification requires ≥70%, and scores below 70% receive
                detailed improvement recommendations with 90-day action plans.
              </p>
            </div>

            <div className="card-feature p-6 border-l-4 border-l-chart-1 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center">
                <TrendingUp className="w-5 h-5 text-chart-1 mr-2" />
                How does the scoring work?
              </h3>
              <p className="text-muted-foreground">
                Each of the 6 pillars contains multiple indicators that are
                scored and normalized. The overall score is the weighted average
                of all pillar scores, providing a comprehensive view of
                innovation maturity.
              </p>
            </div>

            <div className="card-feature p-6 border-l-4 border-l-chart-2 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center">
                <Building2 className="w-5 h-5 text-chart-2 mr-2" />
                What evidence is required?
              </h3>
              <p className="text-muted-foreground">
                Each indicator requires supporting evidence such as documents,
                links, or detailed descriptions. Our platform guides you through
                the evidence collection process with clear requirements and
                examples.
              </p>
            </div>

            <div className="card-feature p-6 border-l-4 border-l-primary hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center">
                <Clock className="w-5 h-5 text-primary mr-2" />
                How long does the process take?
              </h3>
              <p className="text-muted-foreground">
                The complete certification process typically takes 4-6 weeks
                from initial registration to final certification. This includes
                assessment completion, review period, and certification
                issuance.
              </p>
            </div>

            <div className="card-feature p-6 border-l-4 border-l-accent hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center">
                <Award className="w-5 h-5 text-accent mr-2" />
                What are the benefits of certification?
              </h3>
              <p className="text-muted-foreground">
                IIICI certification demonstrates innovation excellence, enhances
                market credibility, attracts investment, improves operational
                efficiency, and provides a roadmap for continuous improvement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Contact Us Today
            </h2>
            <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto mb-8">
              Contact us today to enroll your university in the IIIC Index
              Assessment Program.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Nodal Agency</h3>
                  <p className="text-primary-foreground/90">
                    Bharat Innovation Research and Development Cooperative Forum
                    (BIRD CO-OP Forum)
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    Proprietary Index by
                  </h3>
                  <p className="text-primary-foreground/90">
                    Circularecosystem International Private Limited (CIPL)
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    <p className="text-primary-foreground/90">
                      <strong>Email:</strong> Dr.rawat@bharatinnovation.org
                    </p>
                    <p className="text-primary-foreground/90">
                      <strong>Website:</strong> www.bharatinnovation.org
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-3"
                    asChild
                  >
                    <Link href="/contact">
                      Get in Touch
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer variant="landing" />
    </main>
  );
}
