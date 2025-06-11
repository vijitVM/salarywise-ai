import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { BudgetProgressChart } from '@/components/charts/BudgetProgressChart';

interface Budget {
  id: string;
  category: string;
  monthly_limit: number;
  current_spent: number;
}

export const BudgetManager = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Form state
  const [category, setCategory] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .order('category');

      if (error) throw error;
      setBudgets(data || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch budgets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          category,
          monthly_limit: parseFloat(monthlyLimit),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Budget created successfully!",
      });

      // Reset form and close dialog
      setCategory('');
      setMonthlyLimit('');
      setIsDialogOpen(false);

      // Refresh data
      fetchBudgets();
    } catch (error) {
      console.error('Error adding budget:', error);
      toast({
        title: "Error",
        description: "Failed to create budget",
        variant: "destructive",
      });
    }
  };

  // Calculate budget statistics
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.monthly_limit, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + (budget.current_spent || 0), 0);
  const budgetsOverLimit = budgets.filter(budget => (budget.current_spent || 0) > budget.monthly_limit).length;
  const remainingBudget = totalBudget - totalSpent;

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Budget Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monthly budget limit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingUp className={`h-4 w-4 ${remainingBudget >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{Math.abs(remainingBudget).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {remainingBudget >= 0 ? 'Left to spend' : 'Over budget'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Over Budget</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${budgetsOverLimit > 0 ? 'text-red-500' : 'text-green-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${budgetsOverLimit > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {budgetsOverLimit}
            </div>
            <p className="text-xs text-muted-foreground">Categories over limit</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Budget Progress</CardTitle>
              <CardDescription>Track your spending against your budgets</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Budget
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Budget</DialogTitle>
                  <DialogDescription>
                    Set a monthly spending limit for a category
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={addBudget} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Food & Dining"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyLimit">Monthly Limit (₹)</Label>
                    <Input
                      id="monthlyLimit"
                      type="number"
                      value={monthlyLimit}
                      onChange={(e) => setMonthlyLimit(e.target.value)}
                      placeholder="10000"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create Budget
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <BudgetProgressChart budgets={budgets} />
        </CardContent>
      </Card>
    </div>
  );
};
