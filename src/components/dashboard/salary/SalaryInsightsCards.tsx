
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SalaryRecord, MonthlyExpectedSalary } from './types';
import { SalaryTrendChart } from '@/components/charts/SalaryTrendChart';
import { TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import { format, subMonths, startOfMonth } from 'date-fns';

interface SalaryInsightsCardsProps {
  salaryRecords: SalaryRecord[];
  monthlyExpectedSalaries: MonthlyExpectedSalary[];
}

export const SalaryInsightsCards = ({ salaryRecords, monthlyExpectedSalaries }: SalaryInsightsCardsProps) => {
  // Calculate YTD earnings
  const currentYear = new Date().getFullYear();
  const ytdEarnings = salaryRecords
    .filter(record => {
      const recordYear = new Date(record.received_date).getFullYear();
      return recordYear === currentYear && !record.is_bonus;
    })
    .reduce((sum, record) => sum + record.amount, 0);

  // Calculate average monthly salary (last 6 months)
  const sixMonthsAgo = format(subMonths(startOfMonth(new Date()), 5), 'yyyy-MM');
  const recentSalaries = salaryRecords
    .filter(record => record.salary_month >= sixMonthsAgo && !record.is_bonus)
    .reduce((acc, record) => {
      const month = record.salary_month;
      if (!acc[month]) acc[month] = 0;
      acc[month] += record.amount;
      return acc;
    }, {} as Record<string, number>);

  const avgMonthlySalary = Object.values(recentSalaries).length > 0 
    ? Object.values(recentSalaries).reduce((sum, amount) => sum + amount, 0) / Object.values(recentSalaries).length
    : 0;

  // Calculate bonus earnings
  const bonusEarnings = salaryRecords
    .filter(record => record.is_bonus)
    .reduce((sum, record) => sum + record.amount, 0);

  // Calculate payment frequency
  const totalPayments = salaryRecords.length;
  const monthsWithData = new Set(salaryRecords.map(r => r.salary_month)).size;
  const avgPaymentsPerMonth = monthsWithData > 0 ? totalPayments / monthsWithData : 0;

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YTD Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{ytdEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {currentYear} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Monthly</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{Math.round(avgMonthlySalary).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Last 6 months
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bonuses</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{bonusEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All time bonuses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Frequency</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPaymentsPerMonth.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Payments per month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Salary Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Trend</CardTitle>
          <p className="text-sm text-muted-foreground">Monthly salary amounts over time</p>
        </CardHeader>
        <CardContent>
          <SalaryTrendChart salaryRecords={salaryRecords} />
        </CardContent>
      </Card>
    </div>
  );
};
