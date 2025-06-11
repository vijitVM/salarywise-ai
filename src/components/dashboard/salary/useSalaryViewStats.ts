
import { useMemo } from 'react';
import { parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { MonthlyExpectedSalary, SalaryRecord } from './types';

export const useSalaryViewStats = (
  viewMonth: string,
  monthlyExpectedSalaries: MonthlyExpectedSalary[],
  salaryRecords: SalaryRecord[]
) => {
  return useMemo(() => {
    const viewMonthExpected = monthlyExpectedSalaries.find(
      salary => salary.month_year === viewMonth
    );
    const expectedAmount = viewMonthExpected?.expected_amount || 0;

    // Calculate total received FOR the view month (salary_month matches viewMonth)
    const salaryForViewMonth = salaryRecords
      .filter(record => record.salary_month === viewMonth && !record.is_bonus)
      .reduce((sum, record) => sum + record.amount, 0);

    // Calculate total received DURING the view month period (payments actually received in that month)
    const viewMonthStart = startOfMonth(parseISO(viewMonth + '-01'));
    const viewMonthEnd = endOfMonth(parseISO(viewMonth + '-01'));
    
    const totalReceivedInMonth = salaryRecords
      .filter(record => {
        const recordDate = parseISO(record.received_date);
        return isWithinInterval(recordDate, { start: viewMonthStart, end: viewMonthEnd }) && !record.is_bonus;
      })
      .reduce((sum, record) => sum + record.amount, 0);

    // Get count of payments received in that month
    const paymentsCount = salaryRecords
      .filter(record => {
        const recordDate = parseISO(record.received_date);
        return isWithinInterval(recordDate, { start: viewMonthStart, end: viewMonthEnd });
      }).length;

    // Status logic based on total received vs expected
    const shortfall = expectedAmount - totalReceivedInMonth;
    const isComplete = totalReceivedInMonth >= expectedAmount && expectedAmount > 0;
    const isMissing = totalReceivedInMonth === 0 && expectedAmount > 0;
    const isIncomplete = totalReceivedInMonth > 0 && totalReceivedInMonth < expectedAmount && expectedAmount > 0;
    const isExcess = totalReceivedInMonth > expectedAmount && expectedAmount > 0;

    console.log(`Stats for ${viewMonth}:`, {
      expectedAmount,
      salaryForViewMonth,
      totalReceivedInMonth,
      paymentsCount,
      shortfall,
      isComplete,
      isMissing,
      isIncomplete,
      isExcess
    });

    return {
      expectedAmount,
      salaryForViewMonth, // Amount received FOR this month (by salary_month)
      totalReceivedInMonth, // Amount received DURING this month (by received_date)
      paymentsCount,
      shortfall,
      isComplete,
      isMissing,
      isIncomplete,
      isExcess
    };
  }, [viewMonth, monthlyExpectedSalaries, salaryRecords]);
};
