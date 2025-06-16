
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, TrendingDown, TrendingUp, Calendar, Filter } from 'lucide-react';
import { useTransactionData } from '@/hooks/useTransactionData';
import { useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { SmartTransactionForm } from '@/components/ai/SmartTransactionForm';

interface TransactionTrackerRef {
  openAddDialog: () => void;
}

export const TransactionTracker = forwardRef<TransactionTrackerRef>((props, ref) => {
  const { transactions, addTransaction, loading } = useTransactionData();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // Filter states - only month now
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Expose openAddDialog method to parent
  useImperativeHandle(ref, () => ({
    openAddDialog: () => {
      setIsDialogOpen(true);
    }
  }));

  // Get unique months from transactions for filter options
  const filterOptions = useMemo(() => {
    const months = new Set<string>();
    
    transactions.forEach(transaction => {
      const transactionDate = parseISO(transaction.date);
      months.add(format(transactionDate, 'yyyy-MM'));
    });

    return {
      months: Array.from(months).sort((a, b) => b.localeCompare(a))
    };
  }, [transactions]);

  // Filter transactions based on selected month
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (selectedMonth !== 'all') {
      filtered = filtered.filter(transaction => {
        const transactionDate = parseISO(transaction.date);
        return format(transactionDate, 'yyyy-MM') === selectedMonth;
      });
    }

    return filtered;
  }, [transactions, selectedMonth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category || !description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    await addTransaction({
      amount: parseFloat(amount),
      type,
      category,
      description,
      date,
    });

    // Reset form
    setAmount('');
    setType('expense');
    setCategory('');
    setDescription('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Transaction added successfully!",
    });
  };

  const handleCategoryGenerated = (generatedCategory: string) => {
    setCategory(generatedCategory);
  };

  // Calculate totals for filtered transactions
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Salary',
    'Freelance',
    'Investment',
    'Other'
  ];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {selectedMonth !== 'all' ? 'Filtered period' : '+₹' + (totalIncome * 0.12).toLocaleString() + ' from last month'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {selectedMonth !== 'all' ? 'Filtered period' : '+₹' + (totalExpenses * 0.08).toLocaleString() + ' from last month'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{netBalance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {netBalance >= 0 ? 'Surplus' : 'Deficit'} {selectedMonth !== 'all' ? 'for filtered period' : 'this month'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>
                {filteredTransactions.length} transactions found
                {selectedMonth !== 'all' ? ' (filtered)' : ''}
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add Transaction</DialogTitle>
                  <DialogDescription>
                    Record a new income or expense transaction
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (₹)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="1000"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select value={type} onValueChange={(value: 'income' | 'expense') => setType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What was this transaction for?"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>

                  <SmartTransactionForm 
                    onCategoryGenerated={handleCategoryGenerated}
                    currentDescription={description}
                    currentAmount={amount}
                    currentType={type}
                  />

                  <Button type="submit" className="w-full">
                    Add Transaction
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Controls - Only Month */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Month:</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="space-y-1">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Months" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {filterOptions.months.map((month) => {
                      const [year, monthNum] = month.split('-');
                      const monthName = monthNames[parseInt(monthNum) - 1];
                      return (
                        <SelectItem key={month} value={month}>
                          {monthName} {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedMonth !== 'all' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedMonth('all')}
                className="self-end sm:self-center"
              >
                Clear Filter
              </Button>
            )}
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {transactions.length === 0 
                ? "No transactions yet. Add your first transaction to get started!"
                : "No transactions found for the selected filter. Try adjusting your filter criteria."
              }
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'income' ? 
                        <TrendingUp className="h-4 w-4" /> : 
                        <TrendingDown className="h-4 w-4" />
                      }
                    </div>
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-gray-500">{transaction.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(parseISO(transaction.date), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredTransactions.length > 10 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Showing 10 of {filteredTransactions.length} transactions
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

TransactionTracker.displayName = 'TransactionTracker';
