import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, ShoppingCart, Car, Home, Coffee, MoreHorizontal, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ExpenseBreakdownChart } from '@/components/charts/ExpenseBreakdownChart';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  expense_date: string;
}

const expenseCategories = [
  'Food & Dining',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Travel',
  'Other'
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Food & Dining':
      return Coffee;
    case 'Transportation':
      return Car;
    case 'Housing':
      return Home;
    case 'Shopping':
      return ShoppingCart;
    default:
      return MoreHorizontal;
  }
};

export const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch expenses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !category) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          amount: parseFloat(amount),
          category,
          description: description || null,
          expense_date: expenseDate,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expense added successfully!",
      });

      // Reset form and close dialog
      setAmount('');
      setCategory('');
      setDescription('');
      setExpenseDate('');
      setIsDialogOpen(false);

      // Refresh data
      fetchExpenses();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const thisMonthExpenses = expenses.filter(expense => {
    const expenseMonth = new Date(expense.expense_date).getMonth();
    const currentMonth = new Date().getMonth();
    const expenseYear = new Date(expense.expense_date).getFullYear();
    const currentYear = new Date().getFullYear();
    return expenseMonth === currentMonth && expenseYear === currentYear;
  }).reduce((sum, expense) => sum + expense.amount, 0);

  const lastMonthExpenses = expenses.filter(expense => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const expenseMonth = new Date(expense.expense_date).getMonth();
    const expenseYear = new Date(expense.expense_date).getFullYear();
    return expenseMonth === lastMonth.getMonth() && expenseYear === lastMonth.getFullYear();
  }).reduce((sum, expense) => sum + expense.amount, 0);

  const monthlyChange = lastMonthExpenses > 0 ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time spending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{thisMonthExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Change</CardTitle>
            {monthlyChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-red-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${monthlyChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
              {monthlyChange >= 0 ? '+' : ''}{monthlyChange.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">vs last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Expense Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
          <CardDescription>Your spending by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseBreakdownChart expenses={expenses} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Expense History</CardTitle>
              <CardDescription>Track your spending patterns</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Expense</DialogTitle>
                  <DialogDescription>
                    Record a new expense
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={addExpense} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expenseDate">Date</Label>
                    <Input
                      id="expenseDate"
                      type="date"
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Lunch at restaurant"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Add Expense
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No expenses recorded yet</p>
              <p className="text-sm">Add your first expense to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.slice(0, 10).map((expense) => {
                const IconComponent = getCategoryIcon(expense.category);
                return (
                  <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-muted">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">₹{expense.amount.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {expense.category} • {format(new Date(expense.expense_date), 'MMM dd, yyyy')}
                        </div>
                        {expense.description && (
                          <div className="text-sm text-muted-foreground">{expense.description}</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {expenses.length > 10 && (
                <div className="text-center py-4">
                  <Button variant="outline" size="sm">
                    View All ({expenses.length - 10} more)
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
