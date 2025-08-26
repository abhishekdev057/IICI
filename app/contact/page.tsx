import { Navigation } from "@/components/layout/navigation"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Send,
  DollarSign
} from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
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
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact Us
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Have questions about IIICI certification? Our team is here to help you succeed 
              in your innovation journey.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
              <Card>
                <CardContent className="p-6">
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">First Name</label>
                        <Input placeholder="Enter your first name" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Last Name</label>
                        <Input placeholder="Enter your last name" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <Input type="email" placeholder="Enter your email address" />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Organization</label>
                      <Input placeholder="Enter your organization name" />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Subject</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="certification">Certification Inquiry</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="pricing">Pricing Information</SelectItem>
                          <SelectItem value="partnership">Partnership Opportunities</SelectItem>
                          <SelectItem value="general">General Inquiry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Message</label>
                      <Textarea 
                        placeholder="Tell us how we can help you..."
                        rows={5}
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Contact Information</h2>
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Mail className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Email Support</h3>
                        <p className="text-muted-foreground mb-2">
                          Get detailed responses within 24 hours
                        </p>
                        <a href="mailto:support@iiici.org" className="text-primary hover:underline">
                          support@iiici.org
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Phone className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Phone Support</h3>
                        <p className="text-muted-foreground mb-2">
                          Speak directly with our experts
                        </p>
                        <a href="tel:+1-800-IIICI-00" className="text-accent hover:underline">
                          +1 (800) IIICI-00
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-chart-1/10 rounded-lg flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-chart-1" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Office Location</h3>
                        <p className="text-muted-foreground mb-2">
                          Visit our headquarters
                        </p>
                        <address className="text-chart-1 not-italic">
                          123 Innovation Drive<br />
                          San Francisco, CA 94105<br />
                          United States
                        </address>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-chart-2" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Business Hours</h3>
                        <p className="text-muted-foreground mb-2">
                          When we're available to help
                        </p>
                        <div className="text-chart-2">
                          <p>Monday - Friday: 9:00 AM - 6:00 PM PST</p>
                          <p>Saturday: 10:00 AM - 2:00 PM PST</p>
                          <p>Sunday: Closed</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Quick Answers
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Find answers to common questions in our comprehensive FAQ section.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center group hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Certification Process</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Learn about our 6-step certification process and timeline.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/process">
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center group hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Pricing Information</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Understand our transparent pricing structure and payment options.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/faq">
                    View Pricing
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center group hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-chart-1/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-chart-1" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Case Studies</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  See how organizations have benefited from IIICI certification.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/case-studies">
                    View Stories
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="border-2 border-primary/20">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Need Immediate Assistance?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  For urgent matters or technical issues affecting your certification process, 
                  our emergency support team is available 24/7.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild>
                    <a href="tel:+1-800-IIICI-00">
                      <Phone className="w-4 h-4 mr-2" />
                      Emergency Hotline
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="mailto:emergency@iiici.org">
                      <Mail className="w-4 h-4 mr-2" />
                      Emergency Email
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer variant="landing" />
    </main>
  )
}
