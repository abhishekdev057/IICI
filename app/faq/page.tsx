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
  HelpCircle,
  DollarSign,
  Mail,
  Phone,
  Play,
  BarChart3
} from "lucide-react"
import Link from "next/link"

export default function FAQPage() {
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
              <HelpCircle className="w-4 h-4 mr-2" />
              FAQ
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Everything you need to know about IIICI certification and the innovation assessment process. 
              Can't find what you're looking for? Contact our support team.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* General Questions */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center">
                <Award className="w-6 h-6 mr-3 text-primary" />
                General Questions
              </h2>
              <div className="space-y-6">
                <Card className="p-6 border-l-4 border-l-primary hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center">
                    <CheckCircle className="w-5 h-5 text-primary mr-2" />
                    What is IIICI certification?
                  </h3>
                  <p className="text-muted-foreground">
                    IIICI (Investor in Institutional Innovation Certification) is an internationally recognized 
                    certification that assesses and validates an organization's innovation maturity across 6 
                    comprehensive pillars. It helps organizations demonstrate their innovation excellence to 
                    stakeholders, attract investment, and drive systematic improvement.
                  </p>
                </Card>
                
                <Card className="p-6 border-l-4 border-l-accent hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center">
                    <Zap className="w-5 h-5 text-accent mr-2" />
                    Who should get IIICI certified?
                  </h3>
                  <p className="text-muted-foreground">
                    Any organization looking to demonstrate innovation excellence, attract investment, 
                    improve operational efficiency, or build systematic innovation capabilities should 
                    consider IIICI certification. This includes startups, scale-ups, established companies, 
                    and institutions across all industries and sizes.
                  </p>
                </Card>
                
                <Card className="p-6 border-l-4 border-l-chart-1 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center">
                    <TrendingUp className="w-5 h-5 text-chart-1 mr-2" />
                    What are the benefits of certification?
                  </h3>
                  <p className="text-muted-foreground">
                    IIICI certification provides multiple benefits including enhanced market credibility, 
                    increased investor confidence (80% average improvement), improved operational efficiency, 
                    structured innovation roadmap, competitive advantage, and access to our expert network 
                    and support resources.
                  </p>
                </Card>
              </div>
            </div>

            {/* Process Questions */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center">
                <Play className="w-6 h-6 mr-3 text-accent" />
                Process & Timeline
              </h2>
              <div className="space-y-6">
                <Card className="p-6 border-l-4 border-l-primary hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center">
                    <Clock className="w-5 h-5 text-primary mr-2" />
                    How long does the certification process take?
                  </h3>
                  <p className="text-muted-foreground">
                    The complete certification process typically takes 4-6 weeks from initial registration 
                    to final certification. This includes assessment completion (2-4 weeks), expert review 
                    (1-2 weeks), and certification issuance (3-5 days). The timeline may vary based on 
                    organization size and complexity.
                  </p>
                </Card>
                
                <Card className="p-6 border-l-4 border-l-accent hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center">
                    <FileText className="w-5 h-5 text-accent mr-2" />
                    What does the assessment involve?
                  </h3>
                  <p className="text-muted-foreground">
                    The assessment evaluates your organization across 6 innovation pillars with 50+ indicators. 
                    Each indicator requires responses and supporting evidence. Our step-by-step wizard guides 
                    you through the process, and you can save progress and return later to complete the assessment.
                  </p>
                </Card>
                
                <Card className="p-6 border-l-4 border-l-chart-1 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center">
                    <Building2 className="w-5 h-5 text-chart-1 mr-2" />
                    What evidence is required?
                  </h3>
                  <p className="text-muted-foreground">
                    Each indicator requires supporting evidence such as documents, links to policies, 
                    case studies, or detailed descriptions of your innovation practices. Our platform 
                    provides clear guidance on what evidence is required for each indicator with examples 
                    and templates.
                  </p>
                </Card>
              </div>
            </div>

            {/* Scoring & Levels */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center">
                <BarChart3 className="w-6 h-6 mr-3 text-chart-1" />
                Scoring & Certification Levels
              </h2>
              <div className="space-y-6">
                <Card className="p-6 border-l-4 border-l-primary hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center">
                    <CheckCircle className="w-5 h-5 text-primary mr-2" />
                    How does the scoring work?
                  </h3>
                  <p className="text-muted-foreground">
                    Each of the 6 pillars contains multiple indicators that are scored and normalized. 
                    The overall score is the weighted average of all pillar scores, providing a comprehensive 
                    view of innovation maturity. Our advanced scoring engine ensures accuracy and consistency.
                  </p>
                </Card>
                
                <Card className="p-6 border-l-4 border-l-accent hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center">
                    <Award className="w-5 h-5 text-accent mr-2" />
                    What are the certification thresholds?
                  </h3>
                  <p className="text-muted-foreground">
                    Gold Certification requires ≥85% overall score, Standard Certification requires ≥70%, 
                    and scores below 70% receive detailed improvement recommendations with 90-day action plans. 
                    Each level provides different benefits and recognition.
                  </p>
                </Card>
                
                <Card className="p-6 border-l-4 border-l-chart-1 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center">
                    <Clock className="w-5 h-5 text-chart-1 mr-2" />
                    How long is certification valid?
                  </h3>
                  <p className="text-muted-foreground">
                    IIICI certification is valid for one year from the date of issuance. Organizations can 
                    reapply annually to maintain their certification status and track improvement over time. 
                    Annual recertification helps ensure continuous innovation excellence.
                  </p>
                </Card>
              </div>
            </div>

            {/* Technical Questions */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center">
                <Shield className="w-6 h-6 mr-3 text-chart-2" />
                Technical & Support
              </h2>
              <div className="space-y-6">
                <Card className="p-6 border-l-4 border-l-primary hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center">
                    <Users className="w-5 h-5 text-primary mr-2" />
                    Can multiple people work on the assessment?
                  </h3>
                  <p className="text-muted-foreground">
                    Yes, you can invite team members to collaborate on the assessment. Our platform supports 
                    multiple users with different permission levels. You can assign specific sections to 
                    different team members and track progress collectively.
                  </p>
                </Card>
                
                <Card className="p-6 border-l-4 border-l-accent hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center">
                    <FileText className="w-5 h-5 text-accent mr-2" />
                    Can I save my progress and return later?
                  </h3>
                  <p className="text-muted-foreground">
                    Absolutely! Our platform automatically saves your progress as you work. You can return 
                    to complete the assessment at any time. There's no time limit for completion, though 
                    we recommend finishing within 4 weeks for optimal results.
                  </p>
                </Card>
                
                <Card className="p-6 border-l-4 border-l-chart-1 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center">
                    <Globe className="w-5 h-5 text-chart-1 mr-2" />
                    Is the platform available internationally?
                  </h3>
                  <p className="text-muted-foreground">
                    Yes, IIICI certification is available globally. Our platform supports multiple languages 
                    and currencies, and our assessment framework is designed to be applicable across different 
                    industries, cultures, and regulatory environments.
                  </p>
                </Card>
              </div>
            </div>

            {/* Pricing & Payment */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center">
                <DollarSign className="w-6 h-6 mr-3 text-primary" />
                Pricing & Payment
              </h2>
              <div className="space-y-6">
                <Card className="p-6 border-l-4 border-l-primary hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center">
                    <DollarSign className="w-5 h-5 text-primary mr-2" />
                    How much does certification cost?
                  </h3>
                  <p className="text-muted-foreground">
                    Certification pricing varies based on organization size and complexity. We offer 
                    transparent pricing with no hidden fees. Contact our team for a personalized quote 
                    based on your organization's specific needs and requirements.
                  </p>
                </Card>
                
                <Card className="p-6 border-l-4 border-l-accent hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center">
                    <CheckCircle className="w-5 h-5 text-accent mr-2" />
                    What payment methods do you accept?
                  </h3>
                  <p className="text-muted-foreground">
                    We accept major credit cards, bank transfers, and corporate payment methods. 
                    Payment plans are available for larger organizations. All payments are processed 
                    securely through our certified payment partners.
                  </p>
                </Card>
                
                <Card className="p-6 border-l-4 border-l-chart-1 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center">
                    <Shield className="w-5 h-5 text-chart-1 mr-2" />
                    Is there a money-back guarantee?
                  </h3>
                  <p className="text-muted-foreground">
                    We offer a satisfaction guarantee. If you're not completely satisfied with the 
                    certification process or results, we'll work with you to address concerns or 
                    provide appropriate refunds according to our terms of service.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Still Have Questions?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Our support team is here to help. Contact us for personalized assistance with any 
              questions about IIICI certification.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Email Support</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Get detailed responses within 24 hours
                  </p>
                  <a href="mailto:support@iiici.org" className="text-primary hover:underline">
                    support@iiici.org
                  </a>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">Phone Support</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Speak directly with our experts
                  </p>
                  <a href="tel:+1-800-IIICI-00" className="text-accent hover:underline">
                    +1 (800) IIICI-00
                  </a>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-chart-1/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <HelpCircle className="w-6 h-6 text-chart-1" />
                  </div>
                  <h3 className="font-semibold mb-2">Live Chat</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Instant answers during business hours
                  </p>
                  <Button variant="outline" size="sm">
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Button size="lg" asChild>
              <Link href="/application">
                Start Your Certification
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer variant="landing" />
    </main>
  )
}
