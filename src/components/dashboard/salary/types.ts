
export interface SalaryRecord {
  id: string;
  amount: number;
  currency: string;
  pay_period: string;
  received_date: string;
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
}
