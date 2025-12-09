import { DiagnosticData } from "@/types/diagnostic";
import { FormField } from "../FormField";
import { DollarSign, TrendingUp, Target, BarChart3 } from "lucide-react";

interface Step1FinancialProps {
  data: DiagnosticData;
  onUpdate: (data: DiagnosticData) => void;
}

export function Step1Financial({ data, onUpdate }: Step1FinancialProps) {
  const updateFinancial = (field: keyof DiagnosticData['financial'], value: number) => {
    onUpdate({
      ...data,
      financial: { ...data.financial, [field]: value },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-diagnostic-primary/10 mb-4">
          <DollarSign className="w-8 h-8 text-diagnostic-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Diagnóstico Financeiro</h2>
        <p className="text-muted-foreground mt-2">
          Vamos entender os números do seu negócio para calcular metas realistas.
        </p>
      </div>

      <div className="grid gap-6">
        <FormField
          label="Ticket Médio"
          description="Valor médio de cada venda"
          value={data.financial.averageTicket}
          onChange={(value) => updateFinancial('averageTicket', value)}
          type="currency"
        />
        
        <FormField
          label="Margem de Lucro"
          description="Percentual de lucro por venda"
          value={data.financial.profitMargin}
          onChange={(value) => updateFinancial('profitMargin', value)}
          type="percentage"
          min={0}
          max={100}
          showSlider
        />
        
        <FormField
          label="Vendas Atuais (mês)"
          description="Quantidade de vendas realizadas no último mês"
          value={data.financial.currentMonthlySales}
          onChange={(value) => updateFinancial('currentMonthlySales', value)}
          type="number"
        />
        
        <FormField
          label="Meta de Vendas (mês)"
          description="Quantidade de vendas desejadas por mês"
          value={data.financial.monthlyGoal}
          onChange={(value) => updateFinancial('monthlyGoal', value)}
          type="number"
        />
      </div>

      {data.financial.averageTicket > 0 && data.financial.profitMargin > 0 && (
        <div className="mt-6 p-4 rounded-xl bg-diagnostic-secondary/10 border border-diagnostic-secondary/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-diagnostic-secondary" />
            <span className="text-sm font-medium text-foreground">CAC Máximo Calculado</span>
          </div>
          <p className="text-2xl font-bold text-diagnostic-secondary">
            R$ {(data.financial.averageTicket * (data.financial.profitMargin / 100) * 0.3).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Baseado em 30% da margem de lucro
          </p>
        </div>
      )}
    </div>
  );
}
