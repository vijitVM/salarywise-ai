
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface SalaryForMonthCardProps {
  viewMonth: string;
  totalReceivedInMonth: number;
  expectedSalary: number;
}

export const SalaryForMonthCard = ({
  viewMonth,
  totalReceivedInMonth,
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
        <div className="text-2xl font-bold">₹{totalReceivedInMonth.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">
          vs ₹{expectedSalary.toLocaleString()} expected
        </p>
        {expectedSalary > 0 && totalReceivedInMonth !== expectedSalary && (
          <p className="text-xs text-blue-600 mt-1">
            {totalReceivedInMonth > expectedSalary ? 'Excess' : 'Gap'}: ₹{Math.abs(expectedSalary - totalReceivedInMonth).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
