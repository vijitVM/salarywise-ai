
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { SalaryTrendChart } from '@/components/charts/SalaryTrendChart';
import { SalaryGrowthChart } from '@/components/charts/SalaryGrowthChart';
import { MonthlyComparisonChart } from '@/components/charts/MonthlyComparisonChart';
import { BonusAnalyticsChart } from '@/components/charts/BonusAnalyticsChart';
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
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex-shrink-0">
              <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg">{currentInsight.title}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{currentInsight.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={prevSlide}
              disabled={insights.length <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs sm:text-sm text-muted-foreground min-w-[3rem] text-center">
              {currentIndex + 1} / {insights.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={nextSlide}
              disabled={insights.length <= 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="transition-all duration-300 ease-in-out overflow-x-auto">
          {currentInsight.component}
        </div>
      </CardContent>
    </Card>
  );
};
