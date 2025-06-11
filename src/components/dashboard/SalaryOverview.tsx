
import { useState } from 'react';
import { useSalaryData } from './salary/useSalaryData';
import { useSalaryCalculations } from './salary/useSalaryCalculations';
import { SalaryStatsCards } from './salary/SalaryStatsCards';
import { SalaryRecordsList } from './salary/SalaryRecordsList';

export const SalaryOverview = () => {
  const { salaryRecords, profile, loading, addSalaryRecord, updateExpectedSalary } = useSalaryData();
  const { totalEarnings, monthlyStats } = useSalaryCalculations(salaryRecords, profile);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSalaryDialogOpen, setIsSalaryDialogOpen] = useState(false);

  // Form states
  const [amount, setAmount] = useState('');
  const [payPeriod, setPayPeriod] = useState('monthly');
  const [receivedDate, setReceivedDate] = useState('');
  const [description, setDescription] = useState('');
  const [isBonus, setIsBonus] = useState(false);
  const [expectedMonthlySalary, setExpectedMonthlySalary] = useState(
    profile?.expected_monthly_salary?.toString() || ''
  );

  const handleAddSalaryRecord = async (e: React.FormEvent) => {
    e.preventDefault();

    await addSalaryRecord({
      amount: parseFloat(amount),
      pay_period: payPeriod,
      received_date: receivedDate,
      description: description || null,
      is_bonus: isBonus,
    });

    // Reset form and close dialog
    setAmount('');
    setPayPeriod('monthly');
    setReceivedDate('');
    setDescription('');
    setIsBonus(false);
    setIsDialogOpen(false);
  };

  const handleUpdateExpectedSalary = async (e: React.FormEvent) => {
    e.preventDefault();

    await updateExpectedSalary(parseFloat(expectedMonthlySalary));
    setIsSalaryDialogOpen(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <SalaryStatsCards
        monthlyStats={monthlyStats}
        totalEarnings={totalEarnings}
        totalRecords={salaryRecords.length}
        expectedMonthlySalary={expectedMonthlySalary}
        setExpectedMonthlySalary={setExpectedMonthlySalary}
        isSalaryDialogOpen={isSalaryDialogOpen}
        setIsSalaryDialogOpen={setIsSalaryDialogOpen}
        onUpdateExpectedSalary={handleUpdateExpectedSalary}
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
        description={description}
        setDescription={setDescription}
        isBonus={isBonus}
        setIsBonus={setIsBonus}
        onAddRecord={handleAddSalaryRecord}
      />
    </div>
  );
};
