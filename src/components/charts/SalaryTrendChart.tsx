
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { SalaryRecord } from '@/components/dashboard/salary/types';
import { format, parseISO } from 'date-fns';

interface SalaryTrendChartProps {
  salaryRecords: SalaryRecord[];
}

export const SalaryTrendChart = ({ salaryRecords }: SalaryTrendChartProps) => {
  // Group by month and calculate totals
  const monthlyData = salaryRecords
    .filter(record => !record.is_bonus)
    .reduce((acc, record) => {
      const month = record.salary_month;
      if (!acc[month]) {
        acc[month] = { month, amount: 0 };
      }
      acc[month].amount += record.amount;
      return acc;
    }, {} as Record<string, { month: string; amount: number }>);

  const chartData = Object.values(monthlyData)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6) // Last 6 months
    .map(item => ({
      month: format(parseISO(item.month + '-01'), 'MMM yyyy'),
      amount: item.amount
    }));

  const chartConfig = {
    amount: {
      label: "Salary Amount",
      color: "hsl(var(--primary))",
    },
  };

  if (chartData.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-muted-foreground">
        <p>No salary data available for chart</p>
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
          />
          <ChartTooltip 
            content={<ChartTooltipContent 
              formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Salary"]}
            />} 
          />
          <Line 
            type="monotone" 
            dataKey="amount" 
            stroke="var(--color-amount)" 
            strokeWidth={3}
            dot={{ fill: "var(--color-amount)", strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
