
import { MonthlyStats, MonthlyExpectedSalary, SalaryRecord } from './types';
import { format } from 'date-fns';
import { useState } from 'react';
import { MonthSelector } from './MonthSelector';
import { ExpectedSalaryCard } from './ExpectedSalaryCard';
import { MonthReceivedCard } from './MonthReceivedCard';
import { SalaryForMonthCard } from './SalaryForMonthCard';
import { MonthStatusCard } from './MonthStatusCard';
import { useSalaryViewStats } from './useSalaryViewStats';

interface SalaryStatsCardsProps {
  monthlyStats: MonthlyStats;
  totalEarnings: number;
  totalRecords: number;
  monthlyExpectedSalaries: MonthlyExpectedSalary[];
  salaryRecords: SalaryRecord[];
  isSalaryDialogOpen: boolean;
  setIsSalaryDialogOpen: (open: boolean) => void;
  onUpdateMonthlyExpectedSalary: (monthYear: string, amount: number) => void;
}

export const SalaryStatsCards = ({
  monthlyStats,
  totalEarnings,
  totalRecords,
  monthlyExpectedSalaries,
  salaryRecords,
  isSalaryDialogOpen,
  setIsSalaryDialogOpen,
  onUpdateMonthlyExpectedSalary
}: SalaryStatsCardsProps) => {
  const { currentMonthTotal, expectedSalary, remainingBalance, currentMonthRecords, salaryForCurrentMonth, pendingSalaryMonths } = monthlyStats;
  
  const [viewMonth, setViewMonth] = useState(format(new Date(), 'yyyy-MM'));

  // Calculate stats for selected view month
  const viewMonthStats = useSalaryViewStats(viewMonth, monthlyExpectedSalaries, salaryRecords);

  const isCurrentMonth = viewMonth === format(new Date(), 'yyyy-MM');

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <MonthSelector viewMonth={viewMonth} setViewMonth={setViewMonth} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Expected Salary Card */}
        <ExpectedSalaryCard
          viewMonth={viewMonth}
          expectedSalary={isCurrentMonth ? expectedSalary : viewMonthStats.expectedAmount}
          isCurrentMonth={isCurrentMonth}
          isSalaryDialogOpen={isSalaryDialogOpen}
          setIsSalaryDialogOpen={setIsSalaryDialogOpen}
          onUpdateMonthlyExpectedSalary={onUpdateMonthlyExpectedSalary}
        />

        {/* Month Received Card */}
        <MonthReceivedCard
          viewMonth={viewMonth}
          currentMonthTotal={isCurrentMonth ? currentMonthTotal : viewMonthStats.totalReceivedInMonth}
          expectedSalary={isCurrentMonth ? expectedSalary : viewMonthStats.expectedAmount}
          isCurrentMonth={isCurrentMonth}
          currentMonthRecords={currentMonthRecords}
          viewMonthStats={viewMonthStats}
        />

        {/* Salary for Month Card - now shows total received */}
        <SalaryForMonthCard
          viewMonth={viewMonth}
          totalReceivedInMonth={isCurrentMonth ? currentMonthTotal : viewMonthStats.totalReceivedInMonth}
          expectedSalary={isCurrentMonth ? expectedSalary : viewMonthStats.expectedAmount}
        />

        {/* Status Card */}
        <MonthStatusCard
          viewMonth={viewMonth}
          isCurrentMonth={isCurrentMonth}
          pendingSalaryMonths={pendingSalaryMonths}
          currentMonthTotal={isCurrentMonth ? currentMonthTotal : viewMonthStats.totalReceivedInMonth}
          expectedSalary={isCurrentMonth ? expectedSalary : viewMonthStats.expectedAmount}
          viewMonthStats={viewMonthStats}
        />
      </div>
    </div>
  );
};
