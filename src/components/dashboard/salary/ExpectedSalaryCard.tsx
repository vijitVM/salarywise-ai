
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IndianRupee } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';

interface ExpectedSalaryCardProps {
  viewMonth: string;
  expectedSalary: number;
  isCurrentMonth: boolean;
  isSalaryDialogOpen: boolean;
  setIsSalaryDialogOpen: (open: boolean) => void;
  onUpdateMonthlyExpectedSalary: (monthYear: string, amount: number) => void;
}

export const ExpectedSalaryCard = ({
  viewMonth,
  expectedSalary,
  isCurrentMonth,
  isSalaryDialogOpen,
  setIsSalaryDialogOpen,
  onUpdateMonthlyExpectedSalary
}: ExpectedSalaryCardProps) => {
  const [expectedMonthlySalary, setExpectedMonthlySalary] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const handleUpdateExpectedSalary = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMonthlyExpectedSalary(selectedMonth, parseFloat(expectedMonthlySalary));
    setExpectedMonthlySalary('');
    setIsSalaryDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Expected for {format(parseISO(viewMonth + '-01'), 'MMM yyyy')}
        </CardTitle>
        <IndianRupee className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">₹{expectedSalary.toLocaleString()}</div>
        {isCurrentMonth && (
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
        )}
      </CardContent>
    </Card>
  );
};
