"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  AlertTriangle, 
  TrendingUp, 
  Shield, 
  Banknote, 
  Landmark, 
  PiggyBank,
  Heart,
  FileText,
  ChevronDown,
  ChevronUp,
  DollarSign,
  CheckCircle2
} from "lucide-react"
import type { ClientPlan } from "@/lib/types"
import { 
  generateRecommendations, 
  getCategoryLabel, 
  getCategoryColor,
  type Recommendation,
  type RecommendationCategory,
  type RecommendationPriority
} from "@/lib/recommendations"

const categoryIcons: Record<RecommendationCategory, React.ElementType> = {
  "annuity": Banknote,
  "life-insurance": Heart,
  "long-term-care": Shield,
  "investment": TrendingUp,
  "tax": FileText,
  "estate": Landmark,
  "emergency": PiggyBank,
  "income": DollarSign,
}

function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = categoryIcons[recommendation.category]
  const color = getCategoryColor(recommendation.category)
  
  const priorityStyles: Record<RecommendationPriority, string> = {
    high: "bg-red-50 text-red-700",
    medium: "bg-amber-50 text-amber-700",
    low: "bg-green-50 text-green-700",
  }

  return (
    <div 
      className="p-4 rounded-lg border border-border/50 bg-card hover:border-border transition-colors"
      style={{ borderLeftWidth: '3px', borderLeftColor: color }}
    >
      <div className="flex items-start gap-3">
        <div 
          className="p-2 rounded-md shrink-0"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="size-4" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span 
              className="text-xs font-medium px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${color}15`, color }}
            >
              {getCategoryLabel(recommendation.category)}
            </span>
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded flex items-center gap-1 ${priorityStyles[recommendation.priority]}`}>
              {recommendation.priority === "high" && <AlertTriangle className="size-3" />}
              {recommendation.priority.charAt(0).toUpperCase() + recommendation.priority.slice(1)}
            </span>
            {recommendation.estimatedValue && (
              <span className="text-xs text-muted-foreground">
                ${recommendation.estimatedValue.toLocaleString()}
              </span>
            )}
          </div>
          <h4 className="text-sm font-medium text-foreground mb-1">{recommendation.title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{recommendation.description}</p>
          
          {expanded && (
            <div className="mt-4 space-y-3 pt-3 border-t border-border/50">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Action</p>
                <p className="text-sm text-foreground">{recommendation.action}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Impact</p>
                <p className="text-sm text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-green-600" />
                  {recommendation.impact}
                </p>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
      </div>
    </div>
  )
}

function SummaryBar({ recommendations }: { recommendations: Recommendation[] }) {
  const highCount = recommendations.filter(r => r.priority === "high").length
  const mediumCount = recommendations.filter(r => r.priority === "medium").length
  const lowCount = recommendations.filter(r => r.priority === "low").length
  
  return (
    <div className="flex items-center gap-6 mb-6 pb-6 border-b border-border/50">
      <div>
        <p className="text-2xl font-semibold">{recommendations.length}</p>
        <p className="text-xs text-muted-foreground">Total</p>
      </div>
      <div className="h-8 w-px bg-border/50" />
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-red-500" />
        <span className="text-sm font-medium">{highCount}</span>
        <span className="text-xs text-muted-foreground">High</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-amber-500" />
        <span className="text-sm font-medium">{mediumCount}</span>
        <span className="text-xs text-muted-foreground">Medium</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-sm font-medium">{lowCount}</span>
        <span className="text-xs text-muted-foreground">Low</span>
      </div>
    </div>
  )
}

interface RecommendationsProps {
  client: ClientPlan
}

export function Recommendations({ client }: RecommendationsProps) {
  const [filter, setFilter] = useState<RecommendationCategory | "all">("all")
  
  const recommendations = useMemo(() => generateRecommendations(client), [client])
  
  const filteredRecommendations = useMemo(() => {
    if (filter === "all") return recommendations
    return recommendations.filter(r => r.category === filter)
  }, [recommendations, filter])
  
  const categories = useMemo(() => {
    return Array.from(new Set(recommendations.map(r => r.category)))
  }, [recommendations])

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="size-10 text-green-500 mx-auto mb-3" />
        <h3 className="text-sm font-medium mb-1">No Recommendations</h3>
        <p className="text-xs text-muted-foreground">
          The financial plan looks well-balanced.
        </p>
      </div>
    )
  }

  return (
    <div>
      <SummaryBar recommendations={recommendations} />
      
      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className="text-xs h-7"
        >
          All ({recommendations.length})
        </Button>
        {categories.map(category => {
          const count = recommendations.filter(r => r.category === category).length
          const color = getCategoryColor(category)
          const Icon = categoryIcons[category]
          return (
            <Button
              key={category}
              variant={filter === category ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(category)}
              className="text-xs h-7"
              style={filter === category ? { backgroundColor: color, borderColor: color } : {}}
            >
              <Icon className="size-3 mr-1" />
              {getCategoryLabel(category)} ({count})
            </Button>
          )
        })}
      </div>
      
      {/* List */}
      <div className="space-y-3">
        {filteredRecommendations.map(recommendation => (
          <RecommendationCard key={recommendation.id} recommendation={recommendation} />
        ))}
      </div>
    </div>
  )
}
