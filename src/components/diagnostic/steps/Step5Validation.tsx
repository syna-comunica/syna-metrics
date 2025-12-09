import { DiagnosticData } from "@/types/diagnostic";
import { FormField } from "../FormField";
import { calculateMetrics, formatCurrency } from "@/utils/diagnosticCalculations";
import { FlaskConical, Calendar, Target, AlertTriangle } from "lucide-react";

interface Step5ValidationProps {
  data: DiagnosticData;
  onUpdate: (data: DiagnosticData) => void;
}

export function Step5Validation({ data, onUpdate }: Step5ValidationProps) {
  const metrics = calculateMetrics(data);
  
  const updateValidation = (field: keyof DiagnosticData['validation'], value: number) => {
    onUpdate({
      ...data,
      validation: { ...data.validation, [field]: value },
    });
  };

  // Calcular leads mínimos para significância estatística
  const suggestedMinLeads = Math.max(50, Math.ceil(metrics.requiredLeads * 0.3));
  const suggestedBudget = Math.ceil(suggestedMinLeads * (metrics.maxCAC / (data.benchmark.conversionRates.leadToSale / 100)));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-diagnostic-primary/10 mb-4">
          <FlaskConical className="w-8 h-8 text-diagnostic-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Plano de Teste</h2>
        <p className="text-muted-foreground mt-2">
          Configure um teste inicial para validar suas hipóteses.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-diagnostic-accent/10 border border-diagnostic-accent/30 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-diagnostic-accent flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-foreground">Por que testar?</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Um teste inicial permite validar as taxas de conversão reais antes de 
              comprometer todo o orçamento. Recomendamos pelo menos {suggestedMinLeads} leads 
              para ter significância estatística.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <FormField
          label="Duração do Teste (dias)"
          description="Período para coleta de dados"
          value={data.validation.testDuration}
          onChange={(value) => updateValidation('testDuration', value)}
          type="number"
          min={7}
          max={90}
        />
        
        <FormField
          label="Orçamento de Teste"
          description={`Sugerido: ${formatCurrency(suggestedBudget)} para ${suggestedMinLeads} leads`}
          value={data.validation.testBudget}
          onChange={(value) => updateValidation('testBudget', value)}
          type="currency"
        />
        
        <FormField
          label="Meta Mínima de Leads"
          description={`Recomendado: pelo menos ${suggestedMinLeads} leads para validação`}
          value={data.validation.minimumLeads}
          onChange={(value) => updateValidation('minimumLeads', value)}
          type="number"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="p-4 rounded-xl bg-muted/30 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Leads/dia necessários</span>
          </div>
          <p className="text-xl font-bold text-foreground">
            {data.validation.testDuration > 0 
              ? (data.validation.minimumLeads / data.validation.testDuration).toFixed(1)
              : '0'}
          </p>
        </div>
        
        <div className="p-4 rounded-xl bg-muted/30 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Custo/lead esperado</span>
          </div>
          <p className="text-xl font-bold text-foreground">
            {data.validation.minimumLeads > 0 
              ? formatCurrency(data.validation.testBudget / data.validation.minimumLeads)
              : 'R$ 0'}
          </p>
        </div>
      </div>
    </div>
  );
}
