import { DiagnosticData } from "@/types/diagnostic";
import { FormField } from "../FormField";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { History, TrendingUp, Users, DollarSign } from "lucide-react";

interface Step3HistoryProps {
  data: DiagnosticData;
  onUpdate: (data: DiagnosticData) => void;
}

export function Step3History({ data, onUpdate }: Step3HistoryProps) {
  const toggleHistory = (hasHistory: boolean) => {
    onUpdate({
      ...data,
      history: { ...data.history, hasHistory },
    });
  };

  const updateHistory = (field: keyof DiagnosticData['history'], value: number) => {
    onUpdate({
      ...data,
      history: { ...data.history, [field]: value },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-diagnostic-accent/10 mb-4">
          <History className="w-8 h-8 text-diagnostic-accent" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Histórico de Campanhas</h2>
        <p className="text-muted-foreground mt-2">
          Informe dados históricos para projeções mais precisas.
        </p>
      </div>

      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
        <div>
          <Label className="text-foreground font-medium">Tenho histórico de campanhas</Label>
          <p className="text-sm text-muted-foreground mt-0.5">
            Dados dos últimos 3-6 meses
          </p>
        </div>
        <Switch 
          checked={data.history.hasHistory}
          onCheckedChange={toggleHistory}
          className="data-[state=checked]:bg-diagnostic-secondary"
        />
      </div>

      {data.history.hasHistory && (
        <div className="grid gap-6 animate-fade-in">
          <FormField
            label="Leads por Mês (média)"
            description="Quantidade média de leads gerados"
            value={data.history.averageLeadsPerMonth}
            onChange={(value) => updateHistory('averageLeadsPerMonth', value)}
            type="number"
          />
          
          <FormField
            label="Taxa de Conversão (Lead → Venda)"
            description="Percentual histórico de conversão"
            value={data.history.averageConversionRate}
            onChange={(value) => updateHistory('averageConversionRate', value)}
            type="percentage"
            min={0}
            max={100}
            showSlider
          />
          
          <FormField
            label="CAC Médio"
            description="Custo de aquisição por cliente"
            value={data.history.averageCAC}
            onChange={(value) => updateHistory('averageCAC', value)}
            type="currency"
          />
        </div>
      )}

      {!data.history.hasHistory && (
        <div className="p-6 rounded-xl bg-muted/20 border border-border text-center">
          <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h4 className="font-medium text-foreground">Sem histórico? Sem problema!</h4>
          <p className="text-sm text-muted-foreground mt-2">
            Usaremos os benchmarks do setor para criar suas projeções iniciais.
            Após 30 dias de campanha, você terá dados reais para refinar as metas.
          </p>
        </div>
      )}
    </div>
  );
}
