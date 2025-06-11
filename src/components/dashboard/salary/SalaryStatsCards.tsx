
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IndianRupee, Calendar, AlertCircle, CheckCircle, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
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

  const isIncompletePayment = salaryForCurrentMonth && salaryForCurrentMonth.amount < expectedSalary;
  const isSalaryMissing = !salaryForCurrentMonth && expectedSalary > 0;
  const shortfallAmount = expectedSalary - (salaryForCurrentMonth?.amount || 0);

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
          {salaryForCurrentMonth && !isIncompletePayment ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : isIncompletePayment ? (
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          ) : (
            <Clock className="h-4 w-4 text-amber-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{salaryForCurrentMonth?.amount.toLocaleString() || '0'}
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {salaryForCurrentMonth ? 'Received' : 'Pending'} for {format(new Date(), 'MMM yyyy')}
            </p>
            {isIncompletePayment && (
              <p className="text-xs text-orange-600 font-medium">
                Short by ₹{shortfallAmount.toLocaleString()}
              </p>
            )}
            {isSalaryMissing && expectedSalary > 0 && (
              <p className="text-xs text-red-600 font-medium">
                Missing ₹{expectedSalary.toLocaleString()}
              </p>
            )}
          </div>
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
          {expectedSalary > 0 && currentMonthTotal !== expectedSalary && (
            <p className="text-xs text-blue-600 mt-1">
              {currentMonthTotal > expectedSalary ? 'Excess' : 'Gap'}: ₹{Math.abs(expectedSalary - currentMonthTotal).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Salary Status</CardTitle>
          {pendingSalaryMonths.length > 0 ? (
            <AlertCircle className="h-4 w-4 text-amber-500" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {pendingSalaryMonths.length > 0 ? (
              <>
                <div className="text-2xl font-bold text-amber-600">{pendingSalaryMonths.length}</div>
                <p className="text-xs text-muted-foreground">
                  Pending: {pendingSalaryMonths.map(month => format(parseISO(month + '-01'), 'MMM')).join(', ')}
                </p>
              </>
            ) : isIncompletePayment ? (
              <>
                <div className="text-2xl font-bold text-orange-600">Partial</div>
                <p className="text-xs text-muted-foreground">
                  Current month incomplete
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">Complete</div>
                <p className="text-xs text-muted-foreground">
                  All salaries up to date
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
