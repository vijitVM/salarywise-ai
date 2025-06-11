
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { SalaryRecord, MonthlyExpectedSalary } from '@/components/dashboard/salary/types';
import { format, parseISO } from 'date-fns';

interface MonthlyComparisonChartProps {
  salaryRecords: SalaryRecord[];
  monthlyExpectedSalaries: MonthlyExpectedSalary[];
}

export const MonthlyComparisonChart = ({ salaryRecords, monthlyExpectedSalaries }: MonthlyComparisonChartProps) => {
  // Group actual salary by month
  const actualData = salaryRecords
    .filter(record => !record.is_bonus)
    .reduce((acc, record) => {
      const month = record.salary_month;
      if (!acc[month]) acc[month] = 0;
      acc[month] += record.amount;
      return acc;
    }, {} as Record<string, number>);

  // Create expected salary map
  const expectedData = monthlyExpectedSalaries.reduce((acc, item) => {
    acc[item.month_year] = item.expected_amount;
    return acc;
  }, {} as Record<string, number>);

  // Combine data for last 6 months
  const months = Object.keys(actualData)
    .sort()
    .slice(-6);

  const chartData = months.map(month => ({
    month: format(parseISO(month + '-01'), 'MMM yyyy'),
    actual: actualData[month] || 0,
    expected: expectedData[month] || 0,
    variance: (actualData[month] || 0) - (expectedData[month] || 0)
  }));

  const chartConfig = {
    actual: {
      label: "Actual Salary",
      color: "hsl(142, 76%, 36%)",
    },
    expected: {
      label: "Expected Salary",
      color: "hsl(221, 83%, 53%)",
    },
  };

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        <p>No comparison data available</p>
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barCategoryGap="20%">
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
              formatter={(value, name) => [
                `₹${Number(value).toLocaleString()}`,
                name === "actual" ? "Actual" : "Expected"
              ]}
            />} 
          />
          <Bar dataKey="expected" fill="var(--color-expected)" radius={[0, 0, 4, 4]} />
          <Bar dataKey="actual" fill="var(--color-actual)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
