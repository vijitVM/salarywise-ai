
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { SalaryRecord } from '@/components/dashboard/salary/types';
import { format, parseISO } from 'date-fns';

interface BonusAnalyticsChartProps {
  salaryRecords: SalaryRecord[];
}

export const BonusAnalyticsChart = ({ salaryRecords }: BonusAnalyticsChartProps) => {
  const bonusRecords = salaryRecords.filter(record => record.is_bonus);
  const regularSalary = salaryRecords
    .filter(record => !record.is_bonus)
    .reduce((sum, record) => sum + record.amount, 0);
  
  const totalBonus = bonusRecords.reduce((sum, record) => sum + record.amount, 0);

  // Group bonuses by month
  const bonusByMonth = bonusRecords.reduce((acc, record) => {
    const month = format(parseISO(record.salary_month + '-01'), 'MMM yyyy');
    if (!acc[month]) acc[month] = 0;
    acc[month] += record.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = [
    { name: 'Regular Salary', value: regularSalary, color: '#3b82f6' },
    { name: 'Bonuses', value: totalBonus, color: '#10b981' }
  ];

  const monthlyBonusData = Object.entries(bonusByMonth).map(([month, amount]) => ({
    month,
    amount
  }));

  const chartConfig = {
    regularSalary: {
      label: "Regular Salary",
      color: "hsl(221, 83%, 53%)",
    },
    bonuses: {
      label: "Bonuses",
      color: "hsl(142, 76%, 36%)",
    },
  };

  if (bonusRecords.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        <p>No bonus data available for analysis</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div>
          <h4 className="text-sm font-medium mb-2">Salary vs Bonus Distribution</h4>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value) => [`₹${Number(value).toLocaleString()}`, ""]}
                  />} 
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Bonus Stats */}
        <div>
          <h4 className="text-sm font-medium mb-4">Bonus Statistics</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium">Total Bonuses</span>
              <span className="text-lg font-bold text-green-600">₹{totalBonus.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">Bonus Count</span>
              <span className="text-lg font-bold text-blue-600">{bonusRecords.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium">Avg Bonus</span>
              <span className="text-lg font-bold text-purple-600">
                ₹{bonusRecords.length > 0 ? Math.round(totalBonus / bonusRecords.length).toLocaleString() : '0'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
