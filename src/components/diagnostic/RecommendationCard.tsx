import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";
import { Recommendation } from "@/types/diagnostic";

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const icons = {
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
  };
  
  const Icon = icons[recommendation.type];

  return (
    <div 
      className={cn(
        "p-4 rounded-xl border transition-all duration-200 animate-fade-in",
        recommendation.type === 'success' && "bg-diagnostic-secondary/10 border-diagnostic-secondary/30",
        recommendation.type === 'warning' && "bg-diagnostic-accent/10 border-diagnostic-accent/30",
        recommendation.type === 'error' && "bg-destructive/10 border-destructive/30"
      )}
    >
      <div className="flex gap-3">
        <Icon 
          className={cn(
            "w-5 h-5 flex-shrink-0 mt-0.5",
            recommendation.type === 'success' && "text-diagnostic-secondary",
            recommendation.type === 'warning' && "text-diagnostic-accent",
            recommendation.type === 'error' && "text-destructive"
          )} 
        />
        <div>
          <h4 className="font-semibold text-foreground">{recommendation.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{recommendation.description}</p>
        </div>
      </div>
    </div>
  );
}
