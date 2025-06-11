
import { SalaryRecord, MonthlyExpectedSalary } from '@/components/dashboard/salary/types';

export interface ExportData {
  salaryRecords: SalaryRecord[];
  monthlyExpectedSalaries: MonthlyExpectedSalary[];
  expenses?: any[];
  budgets?: any[];
  goals?: any[];
}

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
};

export const exportToJSON = (data: ExportData, filename: string) => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
};

export const generateFinancialReport = (data: ExportData): string => {
  const { salaryRecords, monthlyExpectedSalaries } = data;
  
  const totalEarnings = salaryRecords.reduce((sum, record) => sum + record.amount, 0);
  const totalExpected = monthlyExpectedSalaries.reduce((sum, expected) => sum + expected.expected_amount, 0);
  const bonuses = salaryRecords.filter(record => record.is_bonus);
  const totalBonuses = bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);

  const report = `
FINANCIAL REPORT
Generated on: ${new Date().toLocaleDateString()}

SALARY OVERVIEW
Total Earnings: ₹${totalEarnings.toLocaleString()}
Total Expected: ₹${totalExpected.toLocaleString()}
Total Bonuses: ₹${totalBonuses.toLocaleString()}
Number of Salary Records: ${salaryRecords.length}
Number of Bonuses: ${bonuses.length}

MONTHLY BREAKDOWN
${monthlyExpectedSalaries.map(month => 
  `${month.month_year}: Expected ₹${month.expected_amount.toLocaleString()}`
).join('\n')}

RECENT TRANSACTIONS
${salaryRecords.slice(-10).map(record => 
  `${record.salary_month}: ₹${record.amount.toLocaleString()} ${record.is_bonus ? '(Bonus)' : ''}`
).join('\n')}
`;

  return report;
};

export const exportReport = (data: ExportData, filename: string) => {
  const reportContent = generateFinancialReport(data);
  downloadFile(reportContent, `${filename}_report.txt`, 'text/plain');
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
