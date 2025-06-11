
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { useMemo } from 'react';

interface MonthSelectorProps {
  viewMonth: string;
  setViewMonth: (month: string) => void;
}

export const MonthSelector = ({ viewMonth, setViewMonth }: MonthSelectorProps) => {
  // Generate last 12 months options
  const monthOptions = useMemo(() => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const monthDate = subMonths(new Date(), i);
      const monthYear = format(monthDate, 'yyyy-MM');
      const monthLabel = format(monthDate, 'MMM yyyy');
      months.push({ value: monthYear, label: monthLabel });
    }
    return months;
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Salary Status Viewer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Label htmlFor="monthSelect" className="text-sm font-medium">View Month:</Label>
          <Select value={viewMonth} onValueChange={setViewMonth}>
            <SelectTrigger className="w-48">
              <SelectValue />
              <ChevronDown className="h-4 w-4" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(month => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
