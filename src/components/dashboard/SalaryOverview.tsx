
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SalaryStatsCards } from './salary/SalaryStatsCards';
import { SalaryRecordsList } from './salary/SalaryRecordsList';
import { useSalaryData } from './salary/useSalaryData';
import { useSalaryCalculations } from './salary/useSalaryCalculations';
import { useState, forwardRef, useImperativeHandle } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SalaryOverviewRef {
  openAddDialog: () => void;
}

export const SalaryOverview = forwardRef<SalaryOverviewRef>((props, ref) => {
  const { salaryRecords, profile, monthlyExpectedSalaries, loading, addSalaryRecord, updateMonthlyExpectedSalary } = useSalaryData();
  const { monthlyStats, totalEarnings, totalRecords } = useSalaryCalculations(salaryRecords, profile, monthlyExpectedSalaries);
  const { toast } = useToast();

  // Form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [payPeriod, setPayPeriod] = useState('monthly');
  const [receivedDate, setReceivedDate] = useState('');
  const [salaryMonth, setSalaryMonth] = useState('');
  const [description, setDescription] = useState('');
  const [isBonus, setIsBonus] = useState(false);
  const [isSalaryDialogOpen, setIsSalaryDialogOpen] = useState(false);

  // Expose openAddDialog method to parent
  useImperativeHandle(ref, () => ({
    openAddDialog: () => {
      setIsDialogOpen(true);
    }
  }));

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !receivedDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!isBonus && !salaryMonth) {
      toast({
        title: "Error",
        description: "Please specify the salary month",
        variant: "destructive",
      });
      return;
    }

    await addSalaryRecord({
      amount: parseFloat(amount),
      pay_period: payPeriod,
      received_date: receivedDate,
      salary_month: isBonus ? '' : salaryMonth,
      description: description || null,
      is_bonus: isBonus,
    });

    // Reset form
    setAmount('');
    setPayPeriod('monthly');
    setReceivedDate('');
    setSalaryMonth('');
    setDescription('');
    setIsBonus(false);
    setIsDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
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
    <div className="space-y-4 sm:space-y-6">
      <SalaryStatsCards
        monthlyStats={monthlyStats}
        totalEarnings={totalEarnings}
        totalRecords={totalRecords}
        monthlyExpectedSalaries={monthlyExpectedSalaries}
        salaryRecords={salaryRecords}
        isSalaryDialogOpen={isSalaryDialogOpen}
        setIsSalaryDialogOpen={setIsSalaryDialogOpen}
        onUpdateMonthlyExpectedSalary={updateMonthlyExpectedSalary}
      />
      
      <SalaryRecordsList
        salaryRecords={salaryRecords}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        amount={amount}
        setAmount={setAmount}
        payPeriod={payPeriod}
        setPayPeriod={setPayPeriod}
        receivedDate={receivedDate}
        setReceivedDate={setReceivedDate}
        salaryMonth={salaryMonth}
        setSalaryMonth={setSalaryMonth}
        description={description}
        setDescription={setDescription}
        isBonus={isBonus}
        setIsBonus={setIsBonus}
        onAddRecord={handleAddRecord}
      />
    </div>
  );
});

SalaryOverview.displayName = 'SalaryOverview';
