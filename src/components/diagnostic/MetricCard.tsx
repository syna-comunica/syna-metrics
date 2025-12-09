import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  description?: string;
}

export function MetricCard({ 
  label, 
  value, 
  icon: Icon,
  variant = 'default',
  description 
}: MetricCardProps) {
  return (
    <div 
      className={cn(
        "p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02]",
        variant === 'default' && "bg-card border-border",
        variant === 'primary' && "bg-diagnostic-primary/10 border-diagnostic-primary/30",
        variant === 'secondary' && "bg-diagnostic-secondary/10 border-diagnostic-secondary/30",
        variant === 'accent' && "bg-diagnostic-accent/10 border-diagnostic-accent/30"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className={cn(
            "text-2xl font-bold mt-1",
            variant === 'primary' && "text-diagnostic-primary-foreground",
            variant === 'secondary' && "text-diagnostic-secondary",
            variant === 'accent' && "text-diagnostic-accent"
          )}>
            {value}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div 
          className={cn(
            "p-2 rounded-lg",
            variant === 'default' && "bg-muted",
            variant === 'primary' && "bg-diagnostic-primary/20",
            variant === 'secondary' && "bg-diagnostic-secondary/20",
            variant === 'accent' && "bg-diagnostic-accent/20"
          )}
        >
          <Icon className={cn(
            "w-5 h-5",
            variant === 'default' && "text-muted-foreground",
            variant === 'primary' && "text-diagnostic-primary-foreground",
            variant === 'secondary' && "text-diagnostic-secondary",
            variant === 'accent' && "text-diagnostic-accent"
          )} />
        </div>
      </div>
    </div>
  );
}
