import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, CheckCircle, Info, LucideIcon } from "lucide-react";

interface Alert {
  id: string;
  type: "warning" | "deadline" | "success" | "info";
  title: string;
  description: string;
  time: string;
}

interface AlertCardProps {
  alerts: Alert[];
}

const alertIcons: Record<string, LucideIcon> = {
  warning: AlertTriangle,
  deadline: Clock,
  success: CheckCircle,
  info: Info,
};

const alertStyles: Record<string, string> = {
  warning: "border-l-warning bg-warning/5",
  deadline: "border-l-primary bg-primary/5",
  success: "border-l-success bg-success/5",
  info: "border-l-muted-foreground bg-muted/30",
};

export function AlertCard({ alerts }: AlertCardProps) {
  return (
    <div className="glass-card p-5 animate-slide-up">
      <h3 className="font-semibold mb-4">Alertas Recentes</h3>
      <div className="space-y-3">
        {alerts.map((alert) => {
          const Icon = alertIcons[alert.type];
          return (
            <div
              key={alert.id}
              className={cn(
                "p-3 rounded-lg border-l-4 transition-all hover:translate-x-1",
                alertStyles[alert.type]
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className={cn(
                  "w-4 h-4 mt-0.5",
                  alert.type === "warning" && "text-warning",
                  alert.type === "deadline" && "text-primary",
                  alert.type === "success" && "text-success",
                  alert.type === "info" && "text-muted-foreground"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{alert.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{alert.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
