import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "CTO, TechInnovate Corp",
    company: "Technology",
    content: "IIICI certification helped us systematize our innovation processes and attract $50M in Series B funding.",
    rating: 5,
  },
  {
    name: "Dr. Michael Rodriguez",
    role: "Head of R&D, BioMed Solutions",
    company: "Healthcare",
    content:
      "The comprehensive framework identified gaps we didn't know existed. Our innovation output increased by 40%.",
    rating: 5,
  },
  {
    name: "Jennifer Park",
    role: "Innovation Director, Global Manufacturing",
    company: "Manufacturing",
    content:
      "Gold certification status has become a key differentiator in our investor presentations and partnerships.",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-[family-name:var(--font-space-grotesk)]">
            Trusted by Innovation Leaders
          </h2>
          <p className="text-lg text-muted-foreground">
            See how organizations are transforming their innovation capabilities
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Avatar className="mr-3">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-sm">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.company}</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">"{testimonial.content}"</p>
                <div className="flex mt-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-accent">
                      ★
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
