
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, TrendingUp, IndianRupee, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isSameMonth, isSameYear } from 'date-fns';

interface SalaryRecord {
  id: string;
  amount: number;
  currency: string;
  pay_period: string;
  received_date: string;
  description: string | null;
  is_bonus: boolean;
}

interface Profile {
  id: string;
  expected_monthly_salary: number | null;
}

export const SalaryOverview = () => {
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSalaryDialogOpen, setIsSalaryDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Form state
  const [amount, setAmount] = useState('');
  const [payPeriod, setPayPeriod] = useState('monthly');
  const [receivedDate, setReceivedDate] = useState('');
  const [description, setDescription] = useState('');
  const [isBonus, setIsBonus] = useState(false);
  const [expectedMonthlySalary, setExpectedMonthlySalary] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch salary records
      const { data: salaryData, error: salaryError } = await supabase
        .from('salary_records')
        .select('*')
        .order('received_date', { ascending: false });

      if (salaryError) throw salaryError;
      setSalaryRecords(salaryData || []);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      setProfile(profileData);
      if (profileData?.expected_monthly_salary) {
        setExpectedMonthlySalary(profileData.expected_monthly_salary.toString());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSalaryRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('salary_records')
        .insert({
          user_id: user.id,
          amount: parseFloat(amount),
          pay_period: payPeriod,
          received_date: receivedDate,
          description: description || null,
          is_bonus: isBonus,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Salary record added successfully!",
      });

      // Reset form and close dialog
      setAmount('');
      setPayPeriod('monthly');
      setReceivedDate('');
      setDescription('');
      setIsBonus(false);
      setIsDialogOpen(false);

      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error adding salary record:', error);
      toast({
        title: "Error",
        description: "Failed to add salary record",
        variant: "destructive",
      });
    }
  };

  const updateExpectedSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          expected_monthly_salary: parseFloat(expectedMonthlySalary),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expected monthly salary updated!",
      });

      setIsSalaryDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error updating expected salary:', error);
      toast({
        title: "Error",
        description: "Failed to update expected salary",
        variant: "destructive",
      });
    }
  };

  const calculateMonthlyStats = () => {
    const currentDate = new Date();
    const currentMonthRecords = salaryRecords.filter(record => {
      const recordDate = parseISO(record.received_date);
      return isSameMonth(recordDate, currentDate) && isSameYear(recordDate, currentDate);
    });

    const currentMonthTotal = currentMonthRecords.reduce((sum, record) => sum + record.amount, 0);
    const expectedSalary = profile?.expected_monthly_salary || 0;
    const remainingBalance = expectedSalary - currentMonthTotal;

    return {
      currentMonthTotal,
      expectedSalary,
      remainingBalance,
      currentMonthRecords
    };
  };

  const totalEarnings = salaryRecords.reduce((sum, record) => sum + record.amount, 0);
  const monthlyAverage = salaryRecords.length > 0 ? totalEarnings / salaryRecords.length : 0;
  const { currentMonthTotal, expectedSalary, remainingBalance, currentMonthRecords } = calculateMonthlyStats();

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Monthly</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{expectedSalary.toLocaleString()}</div>
            <Dialog open={isSalaryDialogOpen} onOpenChange={setIsSalaryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                  {expectedSalary ? 'Update' : 'Set'} expected salary
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set Expected Monthly Salary</DialogTitle>
                  <DialogDescription>
                    Enter your expected monthly salary to track balance
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={updateExpectedSalary} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="expectedSalary">Monthly Salary (₹)</Label>
                    <Input
                      id="expectedSalary"
                      type="number"
                      value={expectedMonthlySalary}
                      onChange={(e) => setExpectedMonthlySalary(e.target.value)}
                      placeholder="50000"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Save Expected Salary
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month Received</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{currentMonthTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {currentMonthRecords.length} payment(s) this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Balance</CardTitle>
            {remainingBalance > 0 ? (
              <AlertCircle className="h-4 w-4 text-amber-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remainingBalance < 0 ? 'text-green-600' : remainingBalance > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
              ₹{remainingBalance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {remainingBalance > 0 ? 'Pending this month' : remainingBalance < 0 ? 'Excess received' : 'Fully received'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {salaryRecords.length} total records
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Salary Records</CardTitle>
              <CardDescription>Track your salary and bonus payments</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Record
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Salary Record</DialogTitle>
                  <DialogDescription>
                    Enter your salary or bonus information
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={addSalaryRecord} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="50000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payPeriod">Pay Period</Label>
                    <Select value={payPeriod} onValueChange={setPayPeriod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receivedDate">Received Date</Label>
                    <Input
                      id="receivedDate"
                      type="date"
                      value={receivedDate}
                      onChange={(e) => setReceivedDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., January 2024 salary, bonus, etc."
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isBonus"
                      checked={isBonus}
                      onChange={(e) => setIsBonus(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="isBonus">This is a bonus payment</Label>
                  </div>
                  <Button type="submit" className="w-full">
                    Add Record
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {salaryRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No salary records yet. Add your first record to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {salaryRecords.map((record) => {
                const recordDate = parseISO(record.received_date);
                const isCurrentMonth = isSameMonth(recordDate, new Date()) && isSameYear(recordDate, new Date());
                
                return (
                  <div key={record.id} className={`flex justify-between items-center p-4 border rounded-lg ${isCurrentMonth ? 'bg-blue-50 border-blue-200' : ''}`}>
                    <div>
                      <div className="font-medium">₹{record.amount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">
                        {record.pay_period} • {format(recordDate, 'MMM dd, yyyy')}
                        {record.is_bonus && ' • Bonus'}
                        {isCurrentMonth && ' • This Month'}
                      </div>
                      {record.description && (
                        <div className="text-sm text-gray-600">{record.description}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
