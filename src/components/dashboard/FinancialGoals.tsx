import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Target, Calendar, TrendingUp, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { GoalProgressChart } from '@/components/charts/GoalProgressChart';

interface FinancialGoal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  description: string | null;
}

export const FinancialGoals = () => {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        title: "Error",
        description: "Failed to fetch financial goals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('financial_goals')
        .insert({
          user_id: user.id,
          title,
          target_amount: parseFloat(targetAmount),
          target_date: targetDate || null,
          description: description || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Financial goal created successfully!",
      });

      // Reset form and close dialog
      setTitle('');
      setTargetAmount('');
      setTargetDate('');
      setDescription('');
      setIsDialogOpen(false);

      // Refresh data
      fetchGoals();
    } catch (error) {
      console.error('Error adding goal:', error);
      toast({
        title: "Error",
        description: "Failed to create financial goal",
        variant: "destructive",
      });
    }
  };

  // Calculate goal statistics
  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + (goal.current_amount || 0), 0);
  const completedGoals = goals.filter(goal => (goal.current_amount || 0) >= goal.target_amount).length;
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Goals Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length}</div>
            <p className="text-xs text-muted-foreground">Active goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Target</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalTargetAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Combined target amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{overallProgress.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Overall progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Award className={`h-4 w-4 ${completedGoals > 0 ? 'text-green-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${completedGoals > 0 ? 'text-green-600' : ''}`}>
              {completedGoals}
            </div>
            <p className="text-xs text-muted-foreground">Goals achieved</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Financial Goals</CardTitle>
              <CardDescription>Set and track your financial objectives</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Set Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Financial Goal</DialogTitle>
                  <DialogDescription>
                    Set a new financial target to work towards
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={addGoal} className="space-y-4">
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
                    <Label htmlFor="targetDate">Target Date (Optional)</Label>
                    <Input
                      id="targetDate"
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Saving for unexpected expenses"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create Goal
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <GoalProgressChart goals={goals} />
        </CardContent>
      </Card>
    </div>
  );
};
