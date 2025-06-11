
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Expense {
  id: string;
  amount: number;
  category: string;
}

interface ExpenseBreakdownChartProps {
  expenses: Expense[];
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(142, 76%, 36%)', // green
  'hsl(47, 96%, 53%)',  // yellow
  'hsl(0, 84%, 60%)',   // red
  'hsl(262, 83%, 58%)', // purple
  'hsl(200, 94%, 46%)', // blue
  'hsl(24, 95%, 53%)',  // orange
];

export const ExpenseBreakdownChart = ({ expenses }: ExpenseBreakdownChartProps) => {
  const categoryData = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryData)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const chartConfig = chartData.reduce((config, item, index) => {
    config[item.category] = {
      label: item.category,
      color: COLORS[index % COLORS.length],
    };
    return config;
  }, {} as any);

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        <p>No expense data available for chart</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ChartContainer config={chartConfig} className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              dataKey="amount"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value, name) => [`₹${Number(value).toLocaleString()}`, name]}
              />} 
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
      
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2">
        {chartData.map((item, index) => (
          <div key={item.category} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-sm text-muted-foreground">{item.category}</span>
            <span className="text-sm font-medium">₹{item.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
