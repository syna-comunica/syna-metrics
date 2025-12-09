import { DiagnosticData, DEFAULT_BENCHMARKS } from "@/types/diagnostic";
import { FormField } from "../FormField";
import { Button } from "@/components/ui/button";
import { Building2, Users, Briefcase, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step2BenchmarkProps {
  data: DiagnosticData;
  onUpdate: (data: DiagnosticData) => void;
}

export function Step2Benchmark({ data, onUpdate }: Step2BenchmarkProps) {
  const setBusinessType = (type: 'B2B' | 'B2C') => {
    onUpdate({
      ...data,
      benchmark: {
        businessType: type,
        conversionRates: DEFAULT_BENCHMARKS[type],
      },
    });
  };

  const updateRate = (field: keyof DiagnosticData['benchmark']['conversionRates'], value: number) => {
    onUpdate({
      ...data,
      benchmark: {
        ...data.benchmark,
        conversionRates: { ...data.benchmark.conversionRates, [field]: value },
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-diagnostic-secondary/10 mb-4">
          <Building2 className="w-8 h-8 text-diagnostic-secondary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Tipo de Negócio</h2>
        <p className="text-muted-foreground mt-2">
          Selecione o modelo de negócio para aplicar benchmarks do setor.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setBusinessType('B2C')}
          className={cn(
            "p-6 rounded-xl border-2 transition-all duration-200 text-left",
            data.benchmark.businessType === 'B2C' 
              ? "border-diagnostic-secondary bg-diagnostic-secondary/10" 
              : "border-border hover:border-diagnostic-secondary/50"
          )}
        >
          <ShoppingCart className={cn(
            "w-8 h-8 mb-3",
            data.benchmark.businessType === 'B2C' ? "text-diagnostic-secondary" : "text-muted-foreground"
          )} />
          <h3 className="font-semibold text-foreground">B2C</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Venda direta para consumidor final
          </p>
          <div className="mt-3 text-xs text-muted-foreground">
            <p>• Taxa de clique: 5%</p>
            <p>• Clique → Lead: 20%</p>
            <p>• Lead → Venda: 20%</p>
          </div>
        </button>

        <button
          onClick={() => setBusinessType('B2B')}
          className={cn(
            "p-6 rounded-xl border-2 transition-all duration-200 text-left",
            data.benchmark.businessType === 'B2B' 
              ? "border-diagnostic-secondary bg-diagnostic-secondary/10" 
              : "border-border hover:border-diagnostic-secondary/50"
          )}
        >
          <Briefcase className={cn(
            "w-8 h-8 mb-3",
            data.benchmark.businessType === 'B2B' ? "text-diagnostic-secondary" : "text-muted-foreground"
          )} />
          <h3 className="font-semibold text-foreground">B2B</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Venda para outras empresas
          </p>
          <div className="mt-3 text-xs text-muted-foreground">
            <p>• Taxa de clique: 5%</p>
            <p>• Clique → Lead: 32%</p>
            <p>• Lead → Venda: 12.5%</p>
          </div>
        </button>
      </div>

      <div className="mt-8">
        <h4 className="text-sm font-semibold text-foreground mb-4">Ajustar Taxas de Conversão</h4>
        <div className="grid gap-4">
          <FormField
            label="Alcance → Clique"
            description="Taxa de clique nos anúncios/conteúdo"
            value={data.benchmark.conversionRates.reachToClick}
            onChange={(value) => updateRate('reachToClick', value)}
            type="percentage"
            min={0.1}
            max={20}
            step={0.1}
            showSlider
          />
          
          <FormField
            label="Clique → Lead"
            description="Taxa de conversão em leads"
            value={data.benchmark.conversionRates.clickToLead}
            onChange={(value) => updateRate('clickToLead', value)}
            type="percentage"
            min={1}
            max={50}
            step={0.5}
            showSlider
          />
          
          <FormField
            label="Lead → Venda"
            description="Taxa de fechamento de vendas"
            value={data.benchmark.conversionRates.leadToSale}
            onChange={(value) => updateRate('leadToSale', value)}
            type="percentage"
            min={1}
            max={50}
            step={0.5}
            showSlider
          />
        </div>
      </div>
    </div>
  );
}
