import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                  isCompleted && "bg-diagnostic-secondary text-diagnostic-secondary-foreground",
                  isCurrent && "bg-diagnostic-accent text-diagnostic-accent-foreground ring-4 ring-diagnostic-accent/20",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              <span 
                className={cn(
                  "text-xs mt-2 text-center max-w-[80px] transition-colors",
                  isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
                )}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div 
                className={cn(
                  "w-12 lg:w-20 h-0.5 mx-2 transition-colors",
                  isCompleted ? "bg-diagnostic-secondary" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
