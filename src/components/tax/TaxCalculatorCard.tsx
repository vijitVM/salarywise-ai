
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { calculateIncomeTax, TaxCalculation } from '@/utils/taxCalculator';
import { SalaryRecord } from '@/components/dashboard/salary/types';

interface TaxCalculatorCardProps {
  salaryRecords: SalaryRecord[];
}

export const TaxCalculatorCard = ({ salaryRecords }: TaxCalculatorCardProps) => {
  const [deductions, setDeductions] = useState(50000);
  const [taxCalc, setTaxCalc] = useState<TaxCalculation | null>(null);

  const currentYearIncome = salaryRecords
    .filter(record => {
      const recordYear = new Date(record.salary_month + '-01').getFullYear();
      const currentYear = new Date().getFullYear();
      return recordYear === currentYear && !record.is_bonus;
    })
    .reduce((sum, record) => sum + record.amount, 0);

  const projectedAnnualIncome = currentYearIncome * (12 / new Date().getMonth() + 1);

  useEffect(() => {
    if (projectedAnnualIncome > 0) {
      const calculation = calculateIncomeTax(projectedAnnualIncome, deductions);
      setTaxCalc(calculation);
    }
  }, [projectedAnnualIncome, deductions]);

  if (!taxCalc) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Tax Calculator
          </CardTitle>
          <CardDescription>
            Add salary records to see tax calculations
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Tax Calculator (FY 2024-25)
        </CardTitle>
        <CardDescription>
          Based on current year income and Indian tax slabs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="deductions">Deductions (₹)</Label>
            <Input
              id="deductions"
              type="number"
              value={deductions}
              onChange={(e) => setDeductions(Number(e.target.value))}
              placeholder="50000"
            />
          </div>
          <div>
            <Label>Projected Annual Income</Label>
            <div className="text-lg font-semibold">₹{projectedAnnualIncome.toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Gross Income:</span>
              <span className="font-medium">₹{taxCalc.grossIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Taxable Income:</span>
              <span className="font-medium">₹{taxCalc.taxableIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Tax:</span>
              <span className="font-medium text-red-600">₹{taxCalc.totalTax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Net Income:</span>
              <span className="font-semibold text-green-600">₹{taxCalc.netIncome.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Tax Breakdown:</div>
            {taxCalc.taxBreakdown.map((bracket, index) => (
              <div key={index} className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{bracket.bracket}:</span>
                  <span>₹{bracket.tax.toLocaleString()}</span>
                </div>
              </div>
            ))}
            <div className="text-xs text-muted-foreground mt-2">
              Effective Rate: {taxCalc.effectiveRate.toFixed(2)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
