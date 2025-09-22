"use client";

import { Star, Award, TrendingUp, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EnhancedRatingDisplayProps {
  score: number;
  certificationLevel: string;
  className?: string;
}

export function EnhancedRatingDisplay({
  score,
  certificationLevel,
  className = "",
}: EnhancedRatingDisplayProps) {
  // Calculate rating based on score
  const getRating = (score: number) => {
    if (score >= 90) return 5;
    if (score >= 80) return 4;
    if (score >= 70) return 3;
    if (score >= 60) return 2;
    return 1;
  };

  // Get performance level and description
  const getPerformanceInfo = (score: number) => {
    if (score >= 90) {
      return {
        level: "LEADING",
        description:
          "Innovation is deeply embedded in the organization's culture and strategy. The organization is a recognized leader, consistently driving value through innovation.",
        color: "from-purple-500 to-purple-700",
        textColor: "text-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
      };
    } else if (score >= 80) {
      return {
        level: "OPTIMIZING",
        description:
          "Innovation is a strategic priority with robust, integrated processes. The organization uses data for continuous improvement and actively collaborates externally.",
        color: "from-blue-500 to-blue-700",
        textColor: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
      };
    } else if (score >= 70) {
      return {
        level: "STRUCTURED",
        description:
          "Innovation management is systematic and proactive. Formal processes are consistently followed, and the organization is beginning to see measurable results.",
        color: "from-green-500 to-green-700",
        textColor: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      };
    } else if (score >= 60) {
      return {
        level: "DEVELOPING",
        description:
          "Basic innovation processes are in place but are inconsistent and not fully integrated. The organization is building a foundation but lacks strategic coherence.",
        color: "from-yellow-500 to-yellow-700",
        textColor: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
      };
    } else {
      return {
        level: "INITIATING",
        description:
          "The organization has ad-hoc and reactive innovation practices. Foundational elements are largely missing, and there is a significant opportunity for growth.",
        color: "from-orange-500 to-orange-700",
        textColor: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
      };
    }
  };

  const rating = getRating(score);
  const performanceInfo = getPerformanceInfo(score);

  return (
    <Card
      className={`${className} ${performanceInfo.bgColor} ${performanceInfo.borderColor} border-2`}
    >
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Award className={`w-6 h-6 ${performanceInfo.textColor}`} />
              <h3 className="text-xl font-bold text-gray-900">
                Innovation Maturity Rating
              </h3>
            </div>
            <div className={`text-2xl font-bold ${performanceInfo.textColor}`}>
              {performanceInfo.level}
            </div>
          </div>

          {/* Star Rating */}
          <div className="flex justify-center items-center gap-2 py-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-12 h-12 ${
                  star <= rating
                    ? `fill-current ${performanceInfo.textColor}`
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>

          {/* Score Display */}
          <div className="space-y-2">
            <div className={`text-4xl font-bold ${performanceInfo.textColor}`}>
              {score.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">
              Overall Innovation Maturity Score
            </div>
          </div>

          {/* Performance Description */}
          <div className="max-w-2xl mx-auto">
            <p className="text-sm text-gray-700 leading-relaxed">
              {performanceInfo.description}
            </p>
          </div>

          {/* Certification Badge */}
          <div className="pt-4">
            <Badge
              className={`${performanceInfo.color} text-white px-4 py-2 text-sm font-semibold`}
            >
              {certificationLevel}
            </Badge>
          </div>

          {/* Progress Indicators */}
          <div className="grid grid-cols-3 gap-4 pt-4 max-w-md mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-600">Progress</span>
              </div>
              <div
                className={`text-lg font-semibold ${performanceInfo.textColor}`}
              >
                {score.toFixed(0)}%
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-600">Target</span>
              </div>
              <div className="text-lg font-semibold text-gray-700">
                {score >= 70 ? "Achieved" : "Pending"}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-600">Rating</span>
              </div>
              <div className="text-lg font-semibold text-gray-700">
                {rating}/5
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
