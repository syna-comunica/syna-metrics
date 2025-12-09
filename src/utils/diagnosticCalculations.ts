import { DiagnosticData, CalculatedMetrics, Recommendation } from '@/types/diagnostic';

export function calculateMetrics(data: DiagnosticData): CalculatedMetrics {
  const { financial, benchmark, history, investment } = data;
  
  // CAC Máximo = Ticket × Margem × 30%
  const maxCAC = financial.averageTicket * (financial.profitMargin / 100) * 0.3;
  
  // Vendas Necessárias = (Meta - Atual) ÷ Ticket (mas em unidades, não valor)
  const requiredSales = Math.max(0, financial.monthlyGoal - financial.currentMonthlySales);
  
  // Usar taxas do histórico se disponível, senão benchmark
  const conversionRates = history.hasHistory && history.averageConversionRate > 0 
    ? {
        reachToClick: benchmark.conversionRates.reachToClick,
        clickToLead: benchmark.conversionRates.clickToLead,
        leadToSale: history.averageConversionRate,
      }
    : benchmark.conversionRates;
  
  // Funil Reverso: Vendas → Leads → Cliques → Alcance
  const requiredLeads = requiredSales > 0 
    ? Math.ceil(requiredSales / (conversionRates.leadToSale / 100))
    : 0;
    
  const requiredClicks = requiredLeads > 0 
    ? Math.ceil(requiredLeads / (conversionRates.clickToLead / 100))
    : 0;
    
  const requiredReach = requiredClicks > 0 
    ? Math.ceil(requiredClicks / (conversionRates.reachToClick / 100))
    : 0;
  
  // Investimento Viável = Vendas × CAC Máximo
  const viableInvestment = requiredSales * maxCAC;
  
  // Gerar recomendações
  const recommendations = generateRecommendations(data, {
    maxCAC,
    requiredSales,
    requiredLeads,
    requiredClicks,
    requiredReach,
    viableInvestment,
  });
  
  return {
    maxCAC,
    requiredSales,
    requiredLeads,
    requiredClicks,
    requiredReach,
    viableInvestment,
    recommendations,
  };
}

function generateRecommendations(
  data: DiagnosticData, 
  metrics: Omit<CalculatedMetrics, 'recommendations'>
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const { history, investment } = data;
  
  // Verificar CAC
  if (history.hasHistory && history.averageCAC > 0) {
    if (history.averageCAC > metrics.maxCAC) {
      recommendations.push({
        type: 'error',
        title: 'CAC Acima do Limite',
        description: `Seu CAC atual (R$ ${history.averageCAC.toFixed(0)}) está ${((history.averageCAC / metrics.maxCAC - 1) * 100).toFixed(0)}% acima do máximo recomendado (R$ ${metrics.maxCAC.toFixed(0)}). Revise suas estratégias de aquisição.`,
      });
    } else if (history.averageCAC > metrics.maxCAC * 0.8) {
      recommendations.push({
        type: 'warning',
        title: 'CAC Próximo do Limite',
        description: `Seu CAC está em ${((history.averageCAC / metrics.maxCAC) * 100).toFixed(0)}% do limite máximo. Monitore de perto.`,
      });
    } else {
      recommendations.push({
        type: 'success',
        title: 'CAC Saudável',
        description: `Seu CAC atual está ${((1 - history.averageCAC / metrics.maxCAC) * 100).toFixed(0)}% abaixo do limite. Bom trabalho!`,
      });
    }
  }
  
  // Verificar orçamento vs investimento viável
  if (investment.availableBudget > 0) {
    if (investment.availableBudget < metrics.viableInvestment * 0.5) {
      recommendations.push({
        type: 'error',
        title: 'Orçamento Insuficiente',
        description: `Seu orçamento (R$ ${investment.availableBudget.toFixed(0)}) cobre apenas ${((investment.availableBudget / metrics.viableInvestment) * 100).toFixed(0)}% do investimento necessário para atingir a meta.`,
      });
    } else if (investment.availableBudget < metrics.viableInvestment) {
      recommendations.push({
        type: 'warning',
        title: 'Orçamento Limitado',
        description: `Considere aumentar o orçamento em R$ ${(metrics.viableInvestment - investment.availableBudget).toFixed(0)} para maximizar resultados.`,
      });
    } else {
      recommendations.push({
        type: 'success',
        title: 'Orçamento Adequado',
        description: `Seu orçamento está alinhado com os objetivos definidos.`,
      });
    }
  }
  
  // Verificar taxa de conversão
  if (history.hasHistory && history.averageConversionRate > 0) {
    const benchmarkRate = data.benchmark.conversionRates.leadToSale;
    if (history.averageConversionRate < benchmarkRate * 0.7) {
      recommendations.push({
        type: 'warning',
        title: 'Conversão Abaixo do Benchmark',
        description: `Sua taxa de conversão (${history.averageConversionRate.toFixed(1)}%) está abaixo do benchmark do setor (${benchmarkRate}%). Foque em qualificação de leads.`,
      });
    } else if (history.averageConversionRate > benchmarkRate) {
      recommendations.push({
        type: 'success',
        title: 'Conversão Acima da Média',
        description: `Sua taxa de conversão supera o benchmark! Continue otimizando.`,
      });
    }
  }
  
  // Verificar volume de leads
  if (metrics.requiredLeads > 0 && history.hasHistory) {
    const leadGap = metrics.requiredLeads - history.averageLeadsPerMonth;
    if (leadGap > history.averageLeadsPerMonth * 0.5) {
      recommendations.push({
        type: 'warning',
        title: 'Aumento Significativo de Leads',
        description: `Você precisa gerar ${leadGap.toFixed(0)} leads adicionais/mês (${((leadGap / history.averageLeadsPerMonth) * 100).toFixed(0)}% a mais).`,
      });
    }
  }
  
  return recommendations;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(Math.round(value));
}
