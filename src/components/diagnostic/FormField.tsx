import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  description?: string;
  value: number;
  onChange: (value: number) => void;
  type?: 'currency' | 'percentage' | 'number';
  min?: number;
  max?: number;
  step?: number;
  showSlider?: boolean;
  className?: string;
}

export function FormField({
  label,
  description,
  value,
  onChange,
  type = 'number',
  min = 0,
  max = 100,
  step = 1,
  showSlider = false,
  className,
}: FormFieldProps) {
  const formatValue = (val: number) => {
    if (type === 'currency') return val.toLocaleString('pt-BR');
    if (type === 'percentage') return `${val}%`;
    return val.toString();
  };
  
  const parseValue = (val: string) => {
    const cleaned = val.replace(/[^\d.,]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          {type === 'currency' && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              R$
            </span>
          )}
          <Input
            type="text"
            value={type === 'currency' ? value.toLocaleString('pt-BR') : value}
            onChange={(e) => onChange(parseValue(e.target.value))}
            className={cn(
              "bg-diagnostic-background border-diagnostic-border focus:border-diagnostic-secondary focus:ring-1 focus:ring-diagnostic-secondary/50",
              type === 'currency' && "pl-10",
              type === 'percentage' && "pr-8"
            )}
          />
          {type === 'percentage' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              %
            </span>
          )}
        </div>
        
        {showSlider && (
          <Slider
            value={[value]}
            onValueChange={([val]) => onChange(val)}
            min={min}
            max={max}
            step={step}
            className="flex-1 [&_[role=slider]]:bg-diagnostic-accent [&_[role=slider]]:border-diagnostic-accent [&_.bg-primary]:bg-diagnostic-accent"
          />
        )}
      </div>
    </div>
  );
}
