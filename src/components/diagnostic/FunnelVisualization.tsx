import { formatNumber } from "@/utils/diagnosticCalculations";

interface FunnelVisualizationProps {
  reach: number;
  clicks: number;
  leads: number;
  sales: number;
}

export function FunnelVisualization({ reach, clicks, leads, sales }: FunnelVisualizationProps) {
  const maxValue = Math.max(reach, 1);
  
  const stages = [
    { label: 'Alcance', value: reach, color: 'bg-diagnostic-primary' },
    { label: 'Cliques', value: clicks, color: 'bg-diagnostic-secondary' },
    { label: 'Leads', value: leads, color: 'bg-diagnostic-accent' },
    { label: 'Vendas', value: sales, color: 'bg-diagnostic-secondary' },
  ];

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-foreground">Funil Necessário</h4>
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const width = maxValue > 0 ? Math.max((stage.value / maxValue) * 100, 5) : 5;
          
          return (
            <div key={stage.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{stage.label}</span>
                <span className="font-semibold text-foreground">{formatNumber(stage.value)}</span>
              </div>
              <div className="h-8 bg-muted/30 rounded-lg overflow-hidden">
                <div
                  className={`h-full ${stage.color} rounded-lg transition-all duration-500 flex items-center justify-end pr-3`}
                  style={{ width: `${width}%` }}
                >
                  {width > 15 && (
                    <span className="text-xs font-medium text-white/90">
                      {formatNumber(stage.value)}
                    </span>
                  )}
                </div>
              </div>
              {index < stages.length - 1 && stages[index + 1].value > 0 && (
                <div className="text-xs text-muted-foreground text-right">
                  Taxa: {((stages[index + 1].value / stage.value) * 100).toFixed(1)}%
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
