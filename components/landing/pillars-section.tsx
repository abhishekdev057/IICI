import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const pillars = [
  {
    id: 1,
    title: "Assess Your Innovation Ecosystem with the IIIC Index",
    description:
      "Gain a clear, data-driven understanding of your institution's innovation capabilities with our proprietary 'Investment in Institutional Innovation Capacity' (IIIC) Index. This comprehensive assessment is the first step toward transforming your research into real-world impact.",
    color: "border-l-primary",
    features: [
      "Proprietary Framework: Our unique methodology evaluates your entire innovation pipeline, from research grants to intellectual property management.",
      "Actionable Rating: Receive a definitive 1 to 5 Star Rating (⭐) that benchmarks your university's innovation capacity against national standards. This rating provides a clear roadmap for strategic improvement.",
    ],
  },
  {
    id: 2,
    title: "Build Your Engine of Growth: An Incubation Centre",
    description:
      "An assessment is only the beginning. We don't just provide a rating; we provide a pathway. CIPL and the BIRD CO-OP Forum will provide expert, end-to-end support to help your university:",
    color: "border-l-secondary",
    features: [
      "Establish a world-class Incubation Centre. 💡",
      "Nurture student and faculty-led startups.",
      "Create a thriving ecosystem that bridges the gap between the laboratory and the marketplace.",
    ],
  },
  {
    id: 3,
    title: "Govern with Insight: Quarterly Knowledge Audits",
    description:
      "Ensure your leadership is always informed and empowered. Through the BIRD CO-OP Forum, your university's Board of Management will receive a quarterly 'Knowledge Audit and Accounting Service' (KAAS) Report.",
    color: "border-l-accent",
    features: [
      "This powerful governance tool provides a transparent audit of your intellectual assets, research commercialization progress, and overall innovation ROI, enabling data-backed strategic decisions.",
    ],
  },
];

export function PillarsSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-[family-name:var(--font-space-grotesk)]">
            Join the Vanguard of Agricultural Innovation
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Be one of the 50 pioneering institutions to embrace this
            transformative opportunity. Partner with us to measure your
            potential, build your capacity, and lead the future of Indian
            agriculture.
          </p>
        </div>

        <div className="grid md:grid-cols-1 lg:grid-cols-1 gap-8 max-w-5xl mx-auto">
          {pillars.map((pillar) => (
            <Card
              key={pillar.id}
              className={`border-l-4 ${pillar.color} hover:shadow-lg transition-shadow`}
            >
              <CardHeader>
                <CardTitle className="text-xl">{pillar.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {pillar.description}
                </p>
                <ul className="space-y-2">
                  {pillar.features.map((feature, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground flex items-start"
                    >
                      <span className="text-primary mr-2">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
