
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Target, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface FinancialGoal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  description: string | null;
}

interface GoalProgressChartProps {
  goals: FinancialGoal[];
}

export const GoalProgressChart = ({ goals }: GoalProgressChartProps) => {
  if (goals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No financial goals set</p>
        <p className="text-sm">Create your first goal to track your progress</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {goals.map((goal) => {
        const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
        const remaining = Math.max(goal.target_amount - goal.current_amount, 0);
        
        return (
          <Card key={goal.id} className="p-6">
            <CardHeader className="p-0 mb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    {goal.title}
                  </CardTitle>
                  {goal.description && (
                    <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                  )}
                </div>
                {goal.target_date && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(goal.target_date), 'MMM dd, yyyy')}
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-0 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">{percentage.toFixed(1)}%</span>
                </div>
                <Progress value={percentage} className="h-3" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Saved</p>
                  <p className="font-semibold text-green-600">₹{goal.current_amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Remaining</p>
                  <p className="font-semibold">₹{remaining.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex items-center text-sm text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Target: ₹{goal.target_amount.toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
