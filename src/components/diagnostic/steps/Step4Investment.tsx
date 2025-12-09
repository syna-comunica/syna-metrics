import { DiagnosticData } from "@/types/diagnostic";
import { FormField } from "../FormField";
import { calculateMetrics, formatCurrency } from "@/utils/diagnosticCalculations";
import { Wallet, TrendingUp, AlertCircle } from "lucide-react";

interface Step4InvestmentProps {
  data: DiagnosticData;
  onUpdate: (data: DiagnosticData) => void;
}

export function Step4Investment({ data, onUpdate }: Step4InvestmentProps) {
  const metrics = calculateMetrics(data);
  
  const updateInvestment = (field: keyof DiagnosticData['investment'], value: number) => {
    onUpdate({
      ...data,
      investment: { ...data.investment, [field]: value },
    });
  };

  const budgetCoverage = data.investment.availableBudget > 0 && metrics.viableInvestment > 0
    ? (data.investment.availableBudget / metrics.viableInvestment) * 100
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-diagnostic-accent/10 mb-4">
          <Wallet className="w-8 h-8 text-diagnostic-accent" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Análise de Investimento</h2>
        <p className="text-muted-foreground mt-2">
          Defina seu orçamento e valide a viabilidade das metas.
        </p>
      </div>

      <div className="grid gap-6">
        <FormField
          label="Orçamento Disponível"
          description="Quanto você pode investir em marketing este mês"
          value={data.investment.availableBudget}
          onChange={(value) => updateInvestment('availableBudget', value)}
          type="currency"
        />
        
        <FormField
          label="Investimento Atual"
          description="Quanto você já investe atualmente"
          value={data.investment.currentInvestment}
          onChange={(value) => updateInvestment('currentInvestment', value)}
          type="currency"
        />
        
        <FormField
          label="CAC Máximo Aceitável"
          description="Limite máximo que você aceita pagar por cliente"
          value={data.investment.maxAcceptableCAC}
          onChange={(value) => updateInvestment('maxAcceptableCAC', value)}
          type="currency"
        />
      </div>

      {metrics.viableInvestment > 0 && (
        <div className="space-y-4 mt-6">
          <div className="p-4 rounded-xl bg-diagnostic-secondary/10 border border-diagnostic-secondary/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-diagnostic-secondary" />
              <span className="text-sm font-medium text-foreground">Investimento Necessário</span>
            </div>
            <p className="text-2xl font-bold text-diagnostic-secondary">
              {formatCurrency(metrics.viableInvestment)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Para atingir {metrics.requiredSales} vendas com CAC de {formatCurrency(metrics.maxCAC)}
            </p>
          </div>

          {data.investment.availableBudget > 0 && (
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">Cobertura do Orçamento</span>
                <span className={`text-sm font-bold ${
                  budgetCoverage >= 100 ? 'text-diagnostic-secondary' : 
                  budgetCoverage >= 50 ? 'text-diagnostic-accent' : 'text-destructive'
                }`}>
                  {budgetCoverage.toFixed(0)}%
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    budgetCoverage >= 100 ? 'bg-diagnostic-secondary' : 
                    budgetCoverage >= 50 ? 'bg-diagnostic-accent' : 'bg-destructive'
                  }`}
                  style={{ width: `${Math.min(budgetCoverage, 100)}%` }}
                />
              </div>
              {budgetCoverage < 100 && (
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <AlertCircle className="w-3 h-3" />
                  <span>
                    Faltam {formatCurrency(metrics.viableInvestment - data.investment.availableBudget)} para cobertura total
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
