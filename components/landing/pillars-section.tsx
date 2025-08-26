import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const pillars = [
  {
    id: 1,
    title: "Strategic Foundation & Leadership",
    description: "Formal innovation intent, strategy alignment, and leadership commitment to innovation excellence.",
    color: "border-l-primary",
  },
  {
    id: 2,
    title: "Resource Allocation & Infrastructure",
    description: "Budget allocation, personnel dedication, and physical infrastructure supporting innovation.",
    color: "border-l-secondary",
  },
  {
    id: 3,
    title: "Innovation Processes & Culture",
    description: "Structured processes, creative culture, and systematic approach to innovation management.",
    color: "border-l-accent",
  },
  {
    id: 4,
    title: "Knowledge & IP Management",
    description: "Intellectual property strategy, knowledge sharing, and systematic IP value creation.",
    color: "border-l-chart-4",
  },
  {
    id: 5,
    title: "Strategic Intelligence & Collaboration",
    description: "External intelligence gathering, partnership management, and collaborative innovation.",
    color: "border-l-chart-5",
  },
  {
    id: 6,
    title: "Performance Measurement & Improvement",
    description: "Metrics implementation, continuous assessment, and systematic improvement processes.",
    color: "border-l-primary",
  },
]

export function PillarsSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-[family-name:var(--font-space-grotesk)]">
            Six Pillars of Innovation Maturity
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our comprehensive framework evaluates your organization across six critical dimensions of innovation
            excellence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {pillars.map((pillar) => (
            <Card key={pillar.id} className={`border-l-4 ${pillar.color} hover:shadow-lg transition-shadow`}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Pillar {pillar.id}: {pillar.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{pillar.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
