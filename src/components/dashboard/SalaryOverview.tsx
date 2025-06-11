
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, TrendingUp, IndianRupee, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface SalaryRecord {
  id: string;
  amount: number;
  currency: string;
  pay_period: string;
  received_date: string;
  description: string | null;
  is_bonus: boolean;
}

export const SalaryOverview = () => {
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Form state
  const [amount, setAmount] = useState('');
  const [payPeriod, setPayPeriod] = useState('monthly');
  const [receivedDate, setReceivedDate] = useState('');
  const [description, setDescription] = useState('');
  const [isBonus, setIsBonus] = useState(false);

  useEffect(() => {
    fetchSalaryRecords();
  }, []);

  const fetchSalaryRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('salary_records')
        .select('*')
        .order('received_date', { ascending: false });

      if (error) throw error;
      setSalaryRecords(data || []);
    } catch (error) {
      console.error('Error fetching salary records:', error);
      toast({
        title: "Error",
        description: "Failed to fetch salary records",
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
      fetchSalaryRecords();
    } catch (error) {
      console.error('Error adding salary record:', error);
      toast({
        title: "Error",
        description: "Failed to add salary record",
        variant: "destructive",
      });
    }
  };

  const totalEarnings = salaryRecords.reduce((sum, record) => sum + record.amount, 0);
  const monthlyAverage = salaryRecords.length > 0 ? totalEarnings / salaryRecords.length : 0;

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All time earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{monthlyAverage.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Per record average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salaryRecords.length}</div>
            <p className="text-xs text-muted-foreground">
              Salary entries
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
                      placeholder="Regular salary, bonus, etc."
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
              {salaryRecords.map((record) => (
                <div key={record.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">₹{record.amount.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">
                      {record.pay_period} • {format(new Date(record.received_date), 'MMM dd, yyyy')}
                      {record.is_bonus && ' • Bonus'}
                    </div>
                    {record.description && (
                      <div className="text-sm text-gray-600">{record.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
