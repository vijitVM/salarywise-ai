
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IndianRupee, Calendar, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { MonthlyStats } from './types';

interface SalaryStatsCardsProps {
  monthlyStats: MonthlyStats;
  totalEarnings: number;
  totalRecords: number;
  expectedMonthlySalary: string;
  setExpectedMonthlySalary: (value: string) => void;
  isSalaryDialogOpen: boolean;
  setIsSalaryDialogOpen: (open: boolean) => void;
  onUpdateExpectedSalary: (e: React.FormEvent) => void;
}

export const SalaryStatsCards = ({
  monthlyStats,
  totalEarnings,
  totalRecords,
  expectedMonthlySalary,
  setExpectedMonthlySalary,
  isSalaryDialogOpen,
  setIsSalaryDialogOpen,
  onUpdateExpectedSalary
}: SalaryStatsCardsProps) => {
  const { currentMonthTotal, expectedSalary, remainingBalance, currentMonthRecords } = monthlyStats;

  return (
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
              <form onSubmit={onUpdateExpectedSalary} className="space-y-4">
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
            {totalRecords} total records
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
