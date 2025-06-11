
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

interface TransactionBreakdownChartProps {
  transactions: Transaction[];
}

const INCOME_COLORS = [
  'hsl(142, 76%, 36%)', // green
  'hsl(142, 69%, 58%)', // light green
  'hsl(142, 52%, 24%)', // dark green
  'hsl(142, 86%, 28%)', // forest green
  'hsl(120, 100%, 25%)', // dark green
];

const EXPENSE_COLORS = [
  'hsl(0, 84%, 60%)',   // red
  'hsl(0, 74%, 42%)',   // dark red
  'hsl(0, 90%, 71%)',   // light red
  'hsl(350, 89%, 60%)', // crimson
  'hsl(348, 83%, 47%)', // deep red
];

export const TransactionBreakdownChart = ({ transactions }: TransactionBreakdownChartProps) => {
  const incomeData = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, transaction) => {
      if (!acc[transaction.category]) {
        acc[transaction.category] = 0;
      }
      acc[transaction.category] += transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  const expenseData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      if (!acc[transaction.category]) {
        acc[transaction.category] = 0;
      }
      acc[transaction.category] += transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  const incomeChartData = Object.entries(incomeData)
    .map(([category, amount]) => ({ category, amount, type: 'income' }))
    .sort((a, b) => b.amount - a.amount);

  const expenseChartData = Object.entries(expenseData)
    .map(([category, amount]) => ({ category, amount, type: 'expense' }))
    .sort((a, b) => b.amount - a.amount);

  if (incomeChartData.length === 0 && expenseChartData.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        <p>No transaction data available for chart</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Chart */}
        {incomeChartData.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-green-600">Income Breakdown</h3>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="amount"
                  >
                    {incomeChartData.map((entry, index) => (
                      <Cell key={`income-cell-${index}`} fill={INCOME_COLORS[index % INCOME_COLORS.length]} />
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
            <div className="grid grid-cols-1 gap-2">
              {incomeChartData.map((item, index) => (
                <div key={item.category} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: INCOME_COLORS[index % INCOME_COLORS.length] }}
                  />
                  <span className="text-sm text-muted-foreground">{item.category}</span>
                  <span className="text-sm font-medium text-green-600">₹{item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expense Chart */}
        {expenseChartData.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-red-600">Expense Breakdown</h3>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="amount"
                  >
                    {expenseChartData.map((entry, index) => (
                      <Cell key={`expense-cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
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
            <div className="grid grid-cols-1 gap-2">
              {expenseChartData.map((item, index) => (
                <div key={item.category} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: EXPENSE_COLORS[index % EXPENSE_COLORS.length] }}
                  />
                  <span className="text-sm text-muted-foreground">{item.category}</span>
                  <span className="text-sm font-medium text-red-600">₹{item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
