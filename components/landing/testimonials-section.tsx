import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Dr. Rajesh Kumar",
    role: "Vice Chancellor, Agricultural University of Excellence",
    company: "Agricultural Education",
    content:
      "The IIIC Index assessment provided us with a clear roadmap for innovation excellence. Our 5-star rating has attracted significant research funding and industry partnerships.",
    rating: 5,
  },
  {
    name: "Prof. Sunita Sharma",
    role: "Director of Innovation, National Agricultural Research Institute",
    company: "Research & Development",
    content:
      "The BIRD CO-OP Forum's incubation support has transformed our research into successful startups. We've launched 12 student-led ventures in the past year.",
    rating: 5,
  },
  {
    name: "Dr. Amit Patel",
    role: "Board Member, Premier Agricultural University",
    company: "University Governance",
    content:
      "The quarterly KAAS reports have revolutionized our governance. We now make data-driven decisions that have increased our innovation ROI by 60%.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-[family-name:var(--font-space-grotesk)]">
            Success Stories from Agricultural Universities
          </h2>
          <p className="text-lg text-muted-foreground">
            See how leading agricultural universities are transforming their
            innovation capabilities with our programs
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
                    <div className="font-semibold text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.company}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "{testimonial.content}"
                </p>
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
  );
}
