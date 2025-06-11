
import { useState } from 'react';
import { useSalaryData } from './salary/useSalaryData';
import { useSalaryCalculations } from './salary/useSalaryCalculations';
import { SalaryStatsCards } from './salary/SalaryStatsCards';
import { SalaryRecordsList } from './salary/SalaryRecordsList';
import { SalaryInsightsCards } from './salary/SalaryInsightsCards';
import { format } from 'date-fns';

export const SalaryOverview = () => {
  const { 
    salaryRecords, 
    profile, 
    monthlyExpectedSalaries, 
    loading, 
    addSalaryRecord, 
    updateMonthlyExpectedSalary 
  } = useSalaryData();
  
  const { totalEarnings, monthlyStats } = useSalaryCalculations(
    salaryRecords, 
    profile, 
    monthlyExpectedSalaries
  );

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSalaryDialogOpen, setIsSalaryDialogOpen] = useState(false);

  // Form states
  const [amount, setAmount] = useState('');
  const [payPeriod, setPayPeriod] = useState('monthly');
  const [receivedDate, setReceivedDate] = useState('');
  const [salaryMonth, setSalaryMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [description, setDescription] = useState('');
  const [isBonus, setIsBonus] = useState(false);

  const handleAddSalaryRecord = async (e: React.FormEvent) => {
    e.preventDefault();

    await addSalaryRecord({
      amount: parseFloat(amount),
      pay_period: payPeriod,
      received_date: receivedDate,
      salary_month: salaryMonth,
      description: description || null,
      is_bonus: isBonus,
    });

    // Reset form and close dialog
    setAmount('');
    setPayPeriod('monthly');
    setReceivedDate('');
    setSalaryMonth(format(new Date(), 'yyyy-MM'));
    setDescription('');
    setIsBonus(false);
    setIsDialogOpen(false);
  };

  const handleUpdateMonthlyExpectedSalary = async (monthYear: string, amount: number) => {
    await updateMonthlyExpectedSalary(monthYear, amount);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <SalaryStatsCards
        monthlyStats={monthlyStats}
        totalEarnings={totalEarnings}
        totalRecords={salaryRecords.length}
        monthlyExpectedSalaries={monthlyExpectedSalaries}
        salaryRecords={salaryRecords}
        isSalaryDialogOpen={isSalaryDialogOpen}
        setIsSalaryDialogOpen={setIsSalaryDialogOpen}
        onUpdateMonthlyExpectedSalary={handleUpdateMonthlyExpectedSalary}
      />

      <SalaryInsightsCards 
        salaryRecords={salaryRecords}
        monthlyExpectedSalaries={monthlyExpectedSalaries}
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
        onAddRecord={handleAddSalaryRecord}
      />
    </div>
  );
};
