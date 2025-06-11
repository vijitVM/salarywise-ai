
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Target } from 'lucide-react';

interface Budget {
  id: string;
  category: string;
  monthly_limit: number;
  current_spent: number;
}

interface BudgetProgressChartProps {
  budgets: Budget[];
}

export const BudgetProgressChart = ({ budgets }: BudgetProgressChartProps) => {
  const getBudgetStatus = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return { status: 'over', color: 'text-red-600', icon: AlertTriangle };
    if (percentage >= 80) return { status: 'warning', color: 'text-yellow-600', icon: AlertTriangle };
    return { status: 'good', color: 'text-green-600', icon: CheckCircle };
  };

  if (budgets.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No budgets to display</p>
        <p className="text-sm">Create your first budget to see progress visualization</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {budgets.map((budget) => {
        const percentage = Math.min((budget.current_spent / budget.monthly_limit) * 100, 100);
        const remaining = Math.max(budget.monthly_limit - budget.current_spent, 0);
        const { status, color, icon: Icon } = getBudgetStatus(budget.current_spent, budget.monthly_limit);
        
        return (
          <Card key={budget.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium">{budget.category}</h4>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  ₹{budget.current_spent.toLocaleString()} / ₹{budget.monthly_limit.toLocaleString()}
                </div>
                <div className={`text-xs ${color}`}>
                  {status === 'over' ? 'Over budget' : `₹${remaining.toLocaleString()} remaining`}
                </div>
              </div>
            </div>
            <Progress 
              value={percentage} 
              className={`h-3 ${status === 'over' ? '[&>div]:bg-red-500' : status === 'warning' ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'}`}
            />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>{percentage.toFixed(1)}%</span>
              <span>100%</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
