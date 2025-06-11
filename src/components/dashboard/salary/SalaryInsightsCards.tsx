
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, TrendingUp, BarChart3, PieChart, Calculator } from 'lucide-react';
import { SalaryTrendChart } from '@/components/charts/SalaryTrendChart';
import { SalaryGrowthChart } from '@/components/charts/SalaryGrowthChart';
import { MonthlyComparisonChart } from '@/components/charts/MonthlyComparisonChart';
import { BonusAnalyticsChart } from '@/components/charts/BonusAnalyticsChart';
import { TaxCalculatorCard } from '@/components/tax/TaxCalculatorCard';
import { SalaryRecord, MonthlyExpectedSalary } from './types';

interface SalaryInsightsCardsProps {
  salaryRecords: SalaryRecord[];
  monthlyExpectedSalaries: MonthlyExpectedSalary[];
}

export const SalaryInsightsCards = ({ salaryRecords, monthlyExpectedSalaries }: SalaryInsightsCardsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const insights = [
    {
      id: 'trend',
      title: 'Salary Trend Analysis',
      description: 'Track your salary progression over time',
      icon: TrendingUp,
      component: <SalaryTrendChart salaryRecords={salaryRecords} />
    },
    {
      id: 'growth',
      title: 'Salary Growth Analysis',
      description: 'Analyze growth patterns and percentages',
      icon: BarChart3,
      component: <SalaryGrowthChart salaryRecords={salaryRecords} />
    },
    {
      id: 'comparison',
      title: 'Expected vs Actual Comparison',
      description: 'Compare your expected vs actual earnings',
      icon: BarChart3,
      component: <MonthlyComparisonChart salaryRecords={salaryRecords} monthlyExpectedSalaries={monthlyExpectedSalaries} />
    },
    {
      id: 'bonus',
      title: 'Bonus Analytics',
      description: 'Detailed analysis of your bonus payments',
      icon: PieChart,
      component: <BonusAnalyticsChart salaryRecords={salaryRecords} />
    },
    {
      id: 'tax',
      title: 'Tax Calculator',
      description: 'Calculate your income tax based on current earnings',
      icon: Calculator,
      component: <TaxCalculatorCard salaryRecords={salaryRecords} />
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % insights.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + insights.length) % insights.length);
  };

  const currentInsight = insights[currentIndex];
  const IconComponent = currentInsight.icon;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <IconComponent className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>{currentInsight.title}</CardTitle>
              <CardDescription>{currentInsight.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              disabled={insights.length <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
              {currentIndex + 1} / {insights.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              disabled={insights.length <= 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="transition-all duration-300 ease-in-out">
          {currentInsight.component}
        </div>
      </CardContent>
    </Card>
  );
};
