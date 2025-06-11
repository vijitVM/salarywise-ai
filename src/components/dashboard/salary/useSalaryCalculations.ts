
import { useMemo } from 'react';
import { parseISO, isSameMonth, isSameYear, format } from 'date-fns';
import { SalaryRecord, Profile, MonthlyStats } from './types';

export const useSalaryCalculations = (salaryRecords: SalaryRecord[], profile: Profile | null) => {
  return useMemo(() => {
    const totalEarnings = salaryRecords.reduce((sum, record) => sum + record.amount, 0);
    
    const currentDate = new Date();
    const currentMonthYear = format(currentDate, 'yyyy-MM');
    
    // Find salary record for current month (regardless of when it was received)
    const salaryForCurrentMonth = salaryRecords.find(record => 
      record.salary_month === currentMonthYear && !record.is_bonus
    );

    // Get all received payments in current month (could be for different salary months)
    const currentMonthRecords = salaryRecords.filter(record => {
      const recordDate = parseISO(record.received_date);
      return isSameMonth(recordDate, currentDate) && isSameYear(recordDate, currentDate);
    });

    const currentMonthTotal = currentMonthRecords.reduce((sum, record) => sum + record.amount, 0);
    const expectedSalary = profile?.expected_monthly_salary || 0;
    
    // Calculate remaining balance for current month
    const currentMonthSalaryAmount = salaryForCurrentMonth?.amount || 0;
    const remainingBalance = expectedSalary - currentMonthSalaryAmount;

    // Find months for which salary hasn't been received yet
    const salaryMonths = salaryRecords
      .filter(record => !record.is_bonus)
      .map(record => record.salary_month);
    
    const uniqueSalaryMonths = [...new Set(salaryMonths)];
    const pendingSalaryMonths: string[] = [];
    
    // Check for missing salary months (simplified - just check last 3 months)
    for (let i = 0; i < 3; i++) {
      const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const checkMonthYear = format(checkDate, 'yyyy-MM');
      if (!uniqueSalaryMonths.includes(checkMonthYear)) {
        pendingSalaryMonths.push(checkMonthYear);
      }
    }

    const monthlyStats: MonthlyStats = {
      currentMonthTotal,
      expectedSalary,
      remainingBalance,
      currentMonthRecords,
      salaryForCurrentMonth,
      pendingSalaryMonths
    };

    return {
      totalEarnings,
      monthlyStats,
    };
  }, [salaryRecords, profile]);
};
