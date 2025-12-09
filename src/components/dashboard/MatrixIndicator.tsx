import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface MatrixIndicatorProps {
  topo: number;
  meio: number;
  fundo: number;
  showAlert?: boolean;
}

export function MatrixIndicator({ topo, meio, fundo, showAlert = true }: MatrixIndicatorProps) {
  const total = topo + meio + fundo;
  const topoPercent = total > 0 ? (topo / total) * 100 : 0;
  const meioPercent = total > 0 ? (meio / total) * 100 : 0;
  const fundoPercent = total > 0 ? (fundo / total) * 100 : 0;

  const isBalanced = 
    Math.abs(topoPercent - 40) <= 10 &&
    Math.abs(meioPercent - 30) <= 10 &&
    Math.abs(fundoPercent - 30) <= 10;

  return (
    <div className="glass-card p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Matriz 40-30-30</h3>
        {isBalanced ? (
          <div className="flex items-center gap-1.5 text-success text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Balanceada</span>
          </div>
        ) : (
          showAlert && (
            <div className="flex items-center gap-1.5 text-warning text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Ajustar</span>
            </div>
          )
        )}
      </div>

      <div className="space-y-3">
        {/* Topo */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-muted-foreground">Topo (Awareness)</span>
            </div>
            <span className="font-medium">
              {topoPercent.toFixed(0)}% <span className="text-muted-foreground text-xs">/ 40%</span>
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="matrix-indicator bg-secondary" 
              style={{ width: `${Math.min(topoPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Meio */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning" />
              <span className="text-muted-foreground">Meio (Consideração)</span>
            </div>
            <span className="font-medium">
              {meioPercent.toFixed(0)}% <span className="text-muted-foreground text-xs">/ 30%</span>
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="matrix-indicator bg-warning" 
              style={{ width: `${Math.min(meioPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Fundo */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">Fundo (Conversão)</span>
            </div>
            <span className="font-medium">
              {fundoPercent.toFixed(0)}% <span className="text-muted-foreground text-xs">/ 30%</span>
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="matrix-indicator bg-primary" 
              style={{ width: `${Math.min(fundoPercent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {!isBalanced && showAlert && (
        <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
          <p className="text-sm text-warning">
            Ajuste a distribuição para otimizar resultados.
          </p>
        </div>
      )}
    </div>
  );
}
