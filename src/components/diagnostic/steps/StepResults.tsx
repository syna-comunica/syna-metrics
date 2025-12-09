import { DiagnosticData } from "@/types/diagnostic";
import { calculateMetrics, formatCurrency, formatNumber } from "@/utils/diagnosticCalculations";
import { FunnelVisualization } from "../FunnelVisualization";
import { MetricCard } from "../MetricCard";
import { RecommendationCard } from "../RecommendationCard";
import { 
  Target, 
  Users, 
  MousePointerClick, 
  Eye, 
  DollarSign,
  TrendingUp,
  CheckCircle
} from "lucide-react";

interface StepResultsProps {
  data: DiagnosticData;
}

export function StepResults({ data }: StepResultsProps) {
  const metrics = calculateMetrics(data);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-diagnostic-secondary/10 mb-4">
          <CheckCircle className="w-8 h-8 text-diagnostic-secondary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Plano de Objetivos</h2>
        <p className="text-muted-foreground mt-2">
          Aqui está seu plano personalizado baseado nos dados informados.
        </p>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          label="CAC Máximo"
          value={formatCurrency(metrics.maxCAC)}
          icon={DollarSign}
          variant="accent"
          description="Limite por cliente"
        />
        <MetricCard
          label="Vendas Necessárias"
          value={formatNumber(metrics.requiredSales)}
          icon={Target}
          variant="primary"
          description="Para atingir a meta"
        />
        <MetricCard
          label="Leads Necessários"
          value={formatNumber(metrics.requiredLeads)}
          icon={Users}
          variant="secondary"
          description="Leads qualificados"
        />
        <MetricCard
          label="Cliques Necessários"
          value={formatNumber(metrics.requiredClicks)}
          icon={MousePointerClick}
          variant="default"
        />
        <MetricCard
          label="Alcance Necessário"
          value={formatNumber(metrics.requiredReach)}
          icon={Eye}
          variant="default"
        />
        <MetricCard
          label="Investimento Viável"
          value={formatCurrency(metrics.viableInvestment)}
          icon={TrendingUp}
          variant="secondary"
          description="Orçamento sugerido"
        />
      </div>

      {/* Funil */}
      <div className="p-6 rounded-xl bg-card border border-border">
        <FunnelVisualization
          reach={metrics.requiredReach}
          clicks={metrics.requiredClicks}
          leads={metrics.requiredLeads}
          sales={metrics.requiredSales}
        />
      </div>

      {/* Recomendações */}
      {metrics.recommendations.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground">Recomendações</h4>
          {metrics.recommendations.map((rec, index) => (
            <RecommendationCard key={index} recommendation={rec} />
          ))}
        </div>
      )}

      {/* Resumo */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-diagnostic-primary/10 to-diagnostic-secondary/10 border border-diagnostic-primary/20">
        <h4 className="font-semibold text-foreground mb-4">Resumo do Plano</h4>
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            <span className="text-foreground font-medium">Modelo:</span>{' '}
            {data.benchmark.businessType}
          </p>
          <p className="text-muted-foreground">
            <span className="text-foreground font-medium">Ticket Médio:</span>{' '}
            {formatCurrency(data.financial.averageTicket)}
          </p>
          <p className="text-muted-foreground">
            <span className="text-foreground font-medium">Margem:</span>{' '}
            {data.financial.profitMargin}%
          </p>
          <p className="text-muted-foreground">
            <span className="text-foreground font-medium">Meta:</span>{' '}
            De {data.financial.currentMonthlySales} para {data.financial.monthlyGoal} vendas/mês
          </p>
          {data.validation.testBudget > 0 && (
            <p className="text-muted-foreground">
              <span className="text-foreground font-medium">Teste:</span>{' '}
              {data.validation.testDuration} dias com {formatCurrency(data.validation.testBudget)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
