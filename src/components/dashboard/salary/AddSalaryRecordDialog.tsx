
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface AddSalaryRecordDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  amount: string;
  setAmount: (amount: string) => void;
  payPeriod: string;
  setPayPeriod: (period: string) => void;
  receivedDate: string;
  setReceivedDate: (date: string) => void;
  salaryMonth: string;
  setSalaryMonth: (month: string) => void;
  description: string;
  setDescription: (description: string) => void;
  isBonus: boolean;
  setIsBonus: (isBonus: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AddSalaryRecordDialog = ({
  isOpen,
  setIsOpen,
  amount,
  setAmount,
  payPeriod,
  setPayPeriod,
  receivedDate,
  setReceivedDate,
  salaryMonth,
  setSalaryMonth,
  description,
  setDescription,
  isBonus,
  setIsBonus,
  onSubmit
}: AddSalaryRecordDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
        <form onSubmit={onSubmit} className="space-y-4">
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
          {!isBonus && (
            <div className="space-y-2">
              <Label htmlFor="salaryMonth">Salary Month</Label>
              <Input
                id="salaryMonth"
                type="month"
                value={salaryMonth}
                onChange={(e) => setSalaryMonth(e.target.value)}
                placeholder="2024-05"
                required
              />
            </div>
          )}
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
  );
};
