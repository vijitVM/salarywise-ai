
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IndianRupee, Calendar, AlertCircle, CheckCircle, TrendingUp, Clock } from 'lucide-react';
import { MonthlyStats, MonthlyExpectedSalary } from './types';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';

interface SalaryStatsCardsProps {
  monthlyStats: MonthlyStats;
  totalEarnings: number;
  totalRecords: number;
  monthlyExpectedSalaries: MonthlyExpectedSalary[];
  isSalaryDialogOpen: boolean;
  setIsSalaryDialogOpen: (open: boolean) => void;
  onUpdateMonthlyExpectedSalary: (monthYear: string, amount: number) => void;
}

export const SalaryStatsCards = ({
  monthlyStats,
  totalEarnings,
  totalRecords,
  monthlyExpectedSalaries,
  isSalaryDialogOpen,
  setIsSalaryDialogOpen,
  onUpdateMonthlyExpectedSalary
}: SalaryStatsCardsProps) => {
  const { currentMonthTotal, expectedSalary, remainingBalance, currentMonthRecords, salaryForCurrentMonth, pendingSalaryMonths } = monthlyStats;
  
  const [expectedMonthlySalary, setExpectedMonthlySalary] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const handleUpdateExpectedSalary = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMonthlyExpectedSalary(selectedMonth, parseFloat(expectedMonthlySalary));
    setExpectedMonthlySalary('');
    setIsSalaryDialogOpen(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expected This Month</CardTitle>
          <IndianRupee className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{expectedSalary.toLocaleString()}</div>
          <Dialog open={isSalaryDialogOpen} onOpenChange={setIsSalaryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                Set expected salary
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set Expected Monthly Salary</DialogTitle>
                <DialogDescription>
                  Set expected salary for a specific month (useful when you get hikes)
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateExpectedSalary} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="selectedMonth">Month</Label>
                  <Input
                    id="selectedMonth"
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedSalary">Expected Salary (₹)</Label>
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
          <CardTitle className="text-sm font-medium">Current Month Salary</CardTitle>
          {salaryForCurrentMonth ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <Clock className="h-4 w-4 text-amber-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{salaryForCurrentMonth?.amount.toLocaleString() || '0'}
          </div>
          <p className="text-xs text-muted-foreground">
            {salaryForCurrentMonth ? 'Received' : 'Pending'} for {format(new Date(), 'MMM yyyy')}
          </p>
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
          <CardTitle className="text-sm font-medium">Pending Months</CardTitle>
          {pendingSalaryMonths.length > 0 ? (
            <AlertCircle className="h-4 w-4 text-amber-500" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingSalaryMonths.length}</div>
          <p className="text-xs text-muted-foreground">
            {pendingSalaryMonths.length > 0 
              ? `${pendingSalaryMonths.map(month => format(parseISO(month + '-01'), 'MMM')).join(', ')} pending`
              : 'All up to date'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
