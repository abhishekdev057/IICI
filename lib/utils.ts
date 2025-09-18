import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Rating system for IIICI certification
export interface RatingInfo {
  stars: number
  range: string
  level: string
  description: string
  color: string
}

export function getRatingInfo(score: number): RatingInfo {
  if (score >= 90) {
    return {
      stars: 5,
      range: "90 - 100",
      level: "Leading",
      description: "Innovation is deeply embedded in the organization's culture and strategy. The organization is a recognized leader, consistently driving value through innovation.",
      color: "text-yellow-500"
    }
  } else if (score >= 80) {
    return {
      stars: 4,
      range: "80 - 89",
      level: "Optimizing",
      description: "Innovation is a strategic priority with robust, integrated processes. The organization uses data for continuous improvement and actively collaborates externally.",
      color: "text-yellow-400"
    }
  } else if (score >= 70) {
    return {
      stars: 3,
      range: "70 - 79",
      level: "Structured",
      description: "Innovation management is systematic and proactive. Formal processes are consistently followed, and the organization is beginning to see measurable results.",
      color: "text-yellow-300"
    }
  } else if (score >= 60) {
    return {
      stars: 2,
      range: "60 - 69",
      level: "Developing",
      description: "Basic innovation processes are in place but are inconsistent and not fully integrated. The organization is building a foundation but lacks strategic coherence.",
      color: "text-yellow-200"
    }
  } else {
    return {
      stars: 1,
      range: "50 - 59",
      level: "Initiating",
      description: "The organization has ad-hoc and reactive innovation practices. Foundational elements are largely missing, and there is a significant opportunity for growth.",
      color: "text-yellow-100"
    }
  }
}

export function renderStars(stars: number, maxStars: number = 5): string {
  return "★".repeat(stars) + "☆".repeat(maxStars - stars)
}
