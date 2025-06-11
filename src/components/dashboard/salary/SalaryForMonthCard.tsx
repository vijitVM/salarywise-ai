
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { SalaryRecord } from './types';

interface SalaryForMonthCardProps {
  viewMonth: string;
  salaryForCurrentMonth: SalaryRecord | undefined;
  expectedSalary: number;
}

export const SalaryForMonthCard = ({
  viewMonth,
  salaryForCurrentMonth,
  expectedSalary
}: SalaryForMonthCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Salary for: {format(parseISO(viewMonth + '-01'), 'MMM yyyy')}
        </CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">₹{(salaryForCurrentMonth?.amount || 0).toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">
          vs ₹{expectedSalary.toLocaleString()} expected
        </p>
        {expectedSalary > 0 && (salaryForCurrentMonth?.amount || 0) !== expectedSalary && (
          <p className="text-xs text-blue-600 mt-1">
            {(salaryForCurrentMonth?.amount || 0) > expectedSalary ? 'Excess' : 'Gap'}: ₹{Math.abs(expectedSalary - (salaryForCurrentMonth?.amount || 0)).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
