
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Target, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { useState, forwardRef, useImperativeHandle } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';

interface FinancialGoalsRef {
  openAddDialog: () => void;
}

interface Goal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  description?: string;
}

export const FinancialGoals = forwardRef<FinancialGoalsRef>((props, ref) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [description, setDescription] = useState('');

  // Expose openAddDialog method to parent
  useImperativeHandle(ref, () => ({
    openAddDialog: () => {
      setIsDialogOpen(true);
    }
  }));

  const { data: goals = [], refetch } = useQuery({
    queryKey: ['financial-goals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Goal[];
    },
    enabled: !!user?.id,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !targetAmount || !targetDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to add goals",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('financial_goals')
        .insert({
          user_id: user.id,
          title,
          target_amount: parseFloat(targetAmount),
          current_amount: 0,
          target_date: targetDate,
          description: description || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Financial goal added successfully!",
      });

      // Reset form
      setTitle('');
      setTargetAmount('');
      setTargetDate('');
      setDescription('');
      setIsDialogOpen(false);
      
      // Refresh goals list
      refetch();
    } catch (error) {
      console.error('Error adding goal:', error);
      toast({
        title: "Error",
        description: "Failed to add financial goal",
        variant: "destructive",
      });
    }
  };

  const updateGoalProgress = async (goalId: string, amount: number) => {
    try {
      const { error } = await supabase
        .from('financial_goals')
        .update({ current_amount: amount })
        .eq('id', goalId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Goal progress updated!",
      });
      
      refetch();
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: "Error",
        description: "Failed to update goal progress",
        variant: "destructive",
      });
    }
  };

  const totalGoals = goals.length;
  const completedGoals = goals.filter(goal => goal.current_amount >= goal.target_amount).length;
  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.current_amount, 0);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGoals}</div>
            <p className="text-xs text-muted-foreground">
              {completedGoals} completed
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalTargetAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all goals
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalCurrentAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalTargetAmount > 0 ? Math.round((totalCurrentAmount / totalTargetAmount) * 100) : 0}% of target
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Goals completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Financial Goals</CardTitle>
              <CardDescription>Track your savings and investment targets</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Financial Goal</DialogTitle>
                  <DialogDescription>
                    Set a new savings or investment target
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Goal Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Emergency Fund"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetAmount">Target Amount (₹)</Label>
                    <Input
                      id="targetAmount"
                      type="number"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      placeholder="100000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetDate">Target Date</Label>
                    <Input
                      id="targetDate"
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Details about this goal..."
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Add Goal
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No financial goals yet. Add your first goal to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const progress = (goal.current_amount / goal.target_amount) * 100;
                const isCompleted = goal.current_amount >= goal.target_amount;
                
                return (
                  <div key={goal.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{goal.title}</h3>
                        {goal.description && (
                          <p className="text-sm text-gray-500">{goal.description}</p>
                        )}
                        <p className="text-sm text-gray-500">
                          Target: {new Date(goal.target_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${isCompleted ? 'text-green-600' : 'text-gray-900'}`}>
                          ₹{goal.current_amount.toLocaleString()} / ₹{goal.target_amount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {progress.toFixed(1)}% complete
                        </div>
                      </div>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-2" />
                    {!isCompleted && (
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Add amount"
                          className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target as HTMLInputElement;
                              const amount = parseFloat(input.value);
                              if (amount > 0) {
                                updateGoalProgress(goal.id, goal.current_amount + amount);
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={(e) => {
                            const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                            const amount = parseFloat(input.value);
                            if (amount > 0) {
                              updateGoalProgress(goal.id, goal.current_amount + amount);
                              input.value = '';
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

FinancialGoals.displayName = 'FinancialGoals';
