
import { useState, useEffect } from 'react';
import { useSalaryData } from './salary/useSalaryData';
import { useSalaryCalculations } from './salary/useSalaryCalculations';
import { SalaryStatsCards } from './salary/SalaryStatsCards';
import { SalaryRecordsList } from './salary/SalaryRecordsList';
import { SalaryInsightsCards } from './salary/SalaryInsightsCards';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { format } from 'date-fns';

export const SalaryOverview = () => {
  const { 
    salaryRecords, 
    profile, 
    monthlyExpectedSalaries, 
    loading, 
    addSalaryRecord, 
    updateMonthlyExpectedSalary,
    refetch
  } = useSalaryData();
  
  const { totalEarnings, monthlyStats } = useSalaryCalculations(
    salaryRecords, 
    profile, 
    monthlyExpectedSalaries
  );

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSalaryDialogOpen, setIsSalaryDialogOpen] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

  // Form states
  const [amount, setAmount] = useState('');
  const [payPeriod, setPayPeriod] = useState('monthly');
  const [receivedDate, setReceivedDate] = useState('');
  const [salaryMonth, setSalaryMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [description, setDescription] = useState('');
  const [isBonus, setIsBonus] = useState(false);

  // Update data version when salary records change to force chart re-render
  useEffect(() => {
    setDataVersion(prev => prev + 1);
  }, [salaryRecords, monthlyExpectedSalaries]);

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

    // Force refresh of data to ensure charts get latest information
    await refetch();
  };

  const handleUpdateMonthlyExpectedSalary = async (monthYear: string, amount: number) => {
    await updateMonthlyExpectedSalary(monthYear, amount);
    // Force refresh after updating expected salary
    await refetch();
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <SkeletonLoader type="stats" />
        <SkeletonLoader type="chart" count={2} />
        <SkeletonLoader type="list" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="hover-lift">
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
      </div>

      <div className="hover-lift">
        <SalaryInsightsCards 
          key={dataVersion}
          salaryRecords={salaryRecords}
          monthlyExpectedSalaries={monthlyExpectedSalaries}
        />
      </div>

      <div className="hover-lift">
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
    </div>
  );
};
