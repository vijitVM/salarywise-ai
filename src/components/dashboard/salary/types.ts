
export interface SalaryRecord {
  id: string;
  amount: number;
  currency: string;
  pay_period: string;
  received_date: string;
  salary_month: string; // New field for which month this salary is for
  description: string | null;
  is_bonus: boolean;
}

export interface Profile {
  id: string;
  expected_monthly_salary: number | null;
}

export interface MonthlyStats {
  currentMonthTotal: number;
  expectedSalary: number;
  remainingBalance: number;
  currentMonthRecords: SalaryRecord[];
  salaryForCurrentMonth: SalaryRecord | null; // Salary record for current month (regardless of when received)
  pendingSalaryMonths: string[]; // Months for which salary hasn't been received yet
}
