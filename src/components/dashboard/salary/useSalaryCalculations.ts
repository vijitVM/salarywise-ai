
import { useMemo } from 'react';
import { parseISO, isSameMonth, isSameYear } from 'date-fns';
import { SalaryRecord, Profile, MonthlyStats } from './types';

export const useSalaryCalculations = (salaryRecords: SalaryRecord[], profile: Profile | null) => {
  return useMemo(() => {
    const totalEarnings = salaryRecords.reduce((sum, record) => sum + record.amount, 0);
    
    const currentDate = new Date();
    const currentMonthRecords = salaryRecords.filter(record => {
      const recordDate = parseISO(record.received_date);
      return isSameMonth(recordDate, currentDate) && isSameYear(recordDate, currentDate);
    });

    const currentMonthTotal = currentMonthRecords.reduce((sum, record) => sum + record.amount, 0);
    const expectedSalary = profile?.expected_monthly_salary || 0;
    const remainingBalance = expectedSalary - currentMonthTotal;

    const monthlyStats: MonthlyStats = {
      currentMonthTotal,
      expectedSalary,
      remainingBalance,
      currentMonthRecords
    };

    return {
      totalEarnings,
      monthlyStats,
    };
  }, [salaryRecords, profile]);
};
