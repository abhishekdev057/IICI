// IIICI Pillar Structure with Sub-pillars and Indicators

export interface SubPillar {
  id: string
  name: string
  description: string
  indicators: string[]
}

export interface PillarStructure {
  id: number
  name: string
  description: string
  subPillars: SubPillar[]
}

export const PILLAR_STRUCTURE: PillarStructure[] = [
  {
    id: 1,
    name: "Strategic Foundation & Leadership Commitment",
    description: "Assesses the organization's strategic foundation and leadership commitment to innovation management.",
    subPillars: [
      {
        id: "1.1",
        name: "Innovation Intent & Strategic Alignment",
        description: "The organization's formal innovation intent and its alignment with strategic objectives.",
        indicators: ["1.1.1", "1.1.2", "1.1.3", "1.1.4"]
      },
      {
        id: "1.2",
        name: "Leadership Commitment & Accountability",
        description: "Leadership's commitment to innovation and accountability mechanisms.",
        indicators: ["1.2.1", "1.2.2", "1.2.3", "1.2.4"]
      },
      {
        id: "1.3",
        name: "Formal Policy & IP Strategy",
        description: "Formal innovation policies and intellectual property strategy.",
        indicators: ["1.3.1", "1.3.2", "1.3.3", "1.3.4"]
      },
      {
        id: "1.4",
        name: "Strategic Flexibility & Feedback Loops",
        description: "Strategic flexibility and feedback mechanisms for innovation.",
        indicators: ["1.4.1", "1.4.2", "1.4.3", "1.4.4"]
      }
    ]
  },
  {
    id: 2,
    name: "Resource Allocation & Infrastructure",
    description: "Evaluates the organization's resource allocation and infrastructure for innovation.",
    subPillars: [
      {
        id: "2.1",
        name: "Financial Investment",
        description: "Financial resources allocated to innovation activities.",
        indicators: ["2.1.1", "2.1.2", "2.1.3"]
      },
      {
        id: "2.2",
        name: "Human Capital Development",
        description: "Human resources and development for innovation capabilities.",
        indicators: ["2.2.1", "2.2.2", "2.2.3", "2.2.4", "2.2.5"]
      },
      {
        id: "2.3",
        name: "Infrastructure & Tools",
        description: "Physical and digital infrastructure supporting innovation.",
        indicators: ["2.3.1", "2.3.2", "2.3.3", "2.3.4"]
      }
    ]
  },
  {
    id: 3,
    name: "Innovation Processes & Culture",
    description: "Assesses the organization's innovation processes and culture.",
    subPillars: [
      {
        id: "3.1",
        name: "Process Maturity",
        description: "Maturity and effectiveness of innovation processes.",
        indicators: ["3.1.1", "3.1.2", "3.1.3", "3.1.4"]
      },
      {
        id: "3.2",
        name: "Idea Management",
        description: "Processes for capturing, evaluating, and managing ideas.",
        indicators: ["3.2.1", "3.2.2", "3.2.3"]
      },
      {
        id: "3.3",
        name: "Experimentation & Learning",
        description: "Experimentation processes and learning mechanisms.",
        indicators: ["3.3.1", "3.3.2", "3.3.3"]
      },
      {
        id: "3.4",
        name: "Innovation Culture",
        description: "Organizational culture supporting innovation.",
        indicators: ["3.4.1", "3.4.2", "3.4.3", "3.4.4"]
      },
      {
        id: "3.5",
        name: "Strategy Communication",
        description: "Communication of innovation strategy to employees.",
        indicators: ["3.5.1", "3.5.2"]
      }
    ]
  },
  {
    id: 4,
    name: "Knowledge & IP Management",
    description: "Evaluates knowledge management and intellectual property practices.",
    subPillars: [
      {
        id: "4.1",
        name: "IP Strategy & Value",
        description: "Intellectual property strategy and value creation.",
        indicators: ["4.1.1", "4.1.2", "4.1.3"]
      },
      {
        id: "4.2",
        name: "IP Identification & Protection",
        description: "Processes for identifying and protecting intellectual property.",
        indicators: ["4.2.1", "4.2.2", "4.2.3"]
      },
      {
        id: "4.3",
        name: "IP Risk Management",
        description: "Risk assessment and mitigation for intellectual property.",
        indicators: ["4.3.1", "4.3.2"]
      },
      {
        id: "4.4",
        name: "Knowledge Sharing",
        description: "Knowledge management and sharing systems.",
        indicators: ["4.4.1", "4.4.2", "4.4.3"]
      }
    ]
  },
  {
    id: 5,
    name: "Strategic Intelligence & Collaboration",
    description: "Assesses external intelligence gathering and collaboration capabilities.",
    subPillars: [
      {
        id: "5.1",
        name: "Intelligence Gathering",
        description: "Strategic intelligence gathering and analysis.",
        indicators: ["5.1.1", "5.1.2", "5.1.3", "5.1.4", "5.1.5"]
      },
      {
        id: "5.2",
        name: "External Collaboration",
        description: "External partnerships and collaboration management.",
        indicators: ["5.2.1", "5.2.2", "5.2.3", "5.2.4"]
      }
    ]
  },
  {
    id: 6,
    name: "Performance Measurement & Improvement",
    description: "Evaluates performance measurement and continuous improvement processes.",
    subPillars: [
      {
        id: "6.1",
        name: "Performance Metrics",
        description: "Innovation performance measurement and metrics.",
        indicators: ["6.1.1", "6.1.2", "6.1.3"]
      },
      {
        id: "6.2",
        name: "Assessment & Auditing",
        description: "Regular assessment and auditing of innovation systems.",
        indicators: ["6.2.1", "6.2.2", "6.2.3"]
      },
      {
        id: "6.3",
        name: "Continuous Improvement",
        description: "Continuous improvement and system evolution.",
        indicators: ["6.3.1", "6.3.2", "6.3.3"]
      }
    ]
  }
]

// Helper functions
export function getPillarStructure(pillarId: number): PillarStructure | undefined {
  return PILLAR_STRUCTURE.find(pillar => pillar.id === pillarId)
}

export function getSubPillarStructure(pillarId: number, subPillarId: string): SubPillar | undefined {
  const pillar = getPillarStructure(pillarId)
  return pillar?.subPillars.find(subPillar => subPillar.id === subPillarId)
}

export function getIndicatorSubPillar(indicatorId: string): { pillarId: number; subPillarId: string } | null {
  for (const pillar of PILLAR_STRUCTURE) {
    for (const subPillar of pillar.subPillars) {
      if (subPillar.indicators.includes(indicatorId)) {
        return { pillarId: pillar.id, subPillarId: subPillar.id }
      }
    }
  }
  return null
}

export function getAllIndicatorsForPillar(pillarId: number): string[] {
  const pillar = getPillarStructure(pillarId)
  if (!pillar) return []
  
  return pillar.subPillars.flatMap(subPillar => subPillar.indicators)
}

export function getAllIndicatorsForSubPillar(pillarId: number, subPillarId: string): string[] {
  const subPillar = getSubPillarStructure(pillarId, subPillarId)
  return subPillar?.indicators || []
}
