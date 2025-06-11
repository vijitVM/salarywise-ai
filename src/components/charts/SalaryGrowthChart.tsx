
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { SalaryRecord } from '@/components/dashboard/salary/types';
import { format, parseISO } from 'date-fns';

interface SalaryGrowthChartProps {
  salaryRecords: SalaryRecord[];
}

export const SalaryGrowthChart = ({ salaryRecords }: SalaryGrowthChartProps) => {
  // Group by month and calculate totals with growth percentage
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

  const sortedData = Object.values(monthlyData)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12); // Last 12 months

  // Calculate growth percentage
  const chartData = sortedData.map((item, index) => {
    const growth = index > 0 
      ? ((item.amount - sortedData[index - 1].amount) / sortedData[index - 1].amount) * 100 
      : 0;
    
    return {
      month: format(parseISO(item.month + '-01'), 'MMM yyyy'),
      amount: item.amount,
      growth: growth.toFixed(1)
    };
  });

  const chartConfig = {
    amount: {
      label: "Salary Amount",
      color: "hsl(var(--primary))",
    },
  };

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        <p>No salary data available for growth analysis</p>
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-amount)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--color-amount)" stopOpacity={0}/>
            </linearGradient>
          </defs>
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
              formatter={(value, name, props) => [
                `₹${Number(value).toLocaleString()}`,
                "Salary",
                props.payload.growth > 0 
                  ? `+${props.payload.growth}% growth` 
                  : props.payload.growth < 0 
                    ? `${props.payload.growth}% decline`
                    : 'No change'
              ]}
            />} 
          />
          <Area 
            type="monotone" 
            dataKey="amount" 
            stroke="var(--color-amount)" 
            strokeWidth={3}
            fill="url(#colorGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
