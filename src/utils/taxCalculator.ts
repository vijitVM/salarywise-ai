
export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

// Indian Income Tax Slabs for FY 2024-25 (New Tax Regime)
export const TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 700000, rate: 0.05 },
  { min: 700000, max: 1000000, rate: 0.10 },
  { min: 1000000, max: 1200000, rate: 0.15 },
  { min: 1200000, max: 1500000, rate: 0.20 },
  { min: 1500000, max: Infinity, rate: 0.30 }
];

export interface TaxCalculation {
  grossIncome: number;
  taxableIncome: number;
  totalTax: number;
  netIncome: number;
  effectiveRate: number;
  taxBreakdown: Array<{
    bracket: string;
    taxableAmount: number;
    tax: number;
    rate: number;
  }>;
}

export const calculateIncomeTax = (
  annualIncome: number,
  deductions: number = 50000 // Standard deduction
): TaxCalculation => {
  const taxableIncome = Math.max(0, annualIncome - deductions);
  let totalTax = 0;
  const taxBreakdown = [];

  for (const bracket of TAX_BRACKETS) {
    if (taxableIncome <= bracket.min) break;

    const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    const taxInBracket = taxableInBracket * bracket.rate;
    
    if (taxableInBracket > 0) {
      totalTax += taxInBracket;
      taxBreakdown.push({
        bracket: bracket.max === Infinity 
          ? `₹${bracket.min.toLocaleString()}+` 
          : `₹${bracket.min.toLocaleString()} - ₹${bracket.max.toLocaleString()}`,
        taxableAmount: taxableInBracket,
        tax: taxInBracket,
        rate: bracket.rate
      });
    }
  }

  // Add 4% Health and Education Cess
  const cess = totalTax * 0.04;
  const finalTax = totalTax + cess;

  return {
    grossIncome: annualIncome,
    taxableIncome,
    totalTax: finalTax,
    netIncome: annualIncome - finalTax,
    effectiveRate: annualIncome > 0 ? (finalTax / annualIncome) * 100 : 0,
    taxBreakdown
  };
};

export const calculateMonthlySavings = (monthlyIncome: number, monthlyExpenses: number) => {
  const savings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;
  
  return {
    monthlySavings: savings,
    savingsRate,
    annualSavings: savings * 12,
    recommendation: getSavingsRecommendation(savingsRate)
  };
};

const getSavingsRecommendation = (savingsRate: number): string => {
  if (savingsRate < 10) return "Try to save at least 10% of your income for emergencies.";
  if (savingsRate < 20) return "Good start! Aim for 20% savings rate for better financial security.";
  if (savingsRate < 30) return "Excellent savings rate! Consider investing for long-term growth.";
  return "Outstanding savings rate! You're on track for early financial independence.";
};
