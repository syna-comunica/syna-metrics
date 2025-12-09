export interface FinancialData {
  averageTicket: number;
  profitMargin: number;
  currentMonthlySales: number;
  monthlyGoal: number;
}

export interface BenchmarkData {
  businessType: 'B2B' | 'B2C';
  conversionRates: {
    reachToClick: number;
    clickToLead: number;
    leadToSale: number;
  };
}

export interface HistoryData {
  hasHistory: boolean;
  averageLeadsPerMonth: number;
  averageConversionRate: number;
  averageCAC: number;
}

export interface InvestmentData {
  availableBudget: number;
  currentInvestment: number;
  maxAcceptableCAC: number;
}

export interface ValidationData {
  testDuration: number;
  testBudget: number;
  minimumLeads: number;
}

export interface DiagnosticData {
  financial: FinancialData;
  benchmark: BenchmarkData;
  history: HistoryData;
  investment: InvestmentData;
  validation: ValidationData;
}

export interface CalculatedMetrics {
  maxCAC: number;
  requiredSales: number;
  requiredLeads: number;
  requiredClicks: number;
  requiredReach: number;
  viableInvestment: number;
  recommendations: Recommendation[];
}

export interface Recommendation {
  type: 'success' | 'warning' | 'error';
  title: string;
  description: string;
}

export const DEFAULT_BENCHMARKS = {
  B2C: {
    reachToClick: 5,
    clickToLead: 20,
    leadToSale: 20,
  },
  B2B: {
    reachToClick: 5,
    clickToLead: 32,
    leadToSale: 12.5,
  },
};

export const INITIAL_DIAGNOSTIC_DATA: DiagnosticData = {
  financial: {
    averageTicket: 0,
    profitMargin: 30,
    currentMonthlySales: 0,
    monthlyGoal: 0,
  },
  benchmark: {
    businessType: 'B2C',
    conversionRates: DEFAULT_BENCHMARKS.B2C,
  },
  history: {
    hasHistory: false,
    averageLeadsPerMonth: 0,
    averageConversionRate: 0,
    averageCAC: 0,
  },
  investment: {
    availableBudget: 0,
    currentInvestment: 0,
    maxAcceptableCAC: 0,
  },
  validation: {
    testDuration: 30,
    testBudget: 0,
    minimumLeads: 50,
  },
};
