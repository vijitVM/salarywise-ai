
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ViewMonthStats {
  isComplete: boolean;
  isExcess: boolean;
  isIncomplete: boolean;
  isMissing: boolean;
  shortfall: number;
  totalReceivedInMonth: number;
  expectedAmount: number;
}

interface MonthStatusCardProps {
  viewMonth: string;
  isCurrentMonth: boolean;
  pendingSalaryMonths: string[];
  currentMonthTotal: number;
  expectedSalary: number;
  viewMonthStats: ViewMonthStats;
}

export const MonthStatusCard = ({
  viewMonth,
  isCurrentMonth,
  pendingSalaryMonths,
  currentMonthTotal,
  expectedSalary,
  viewMonthStats
}: MonthStatusCardProps) => {
  const displayAmount = isCurrentMonth ? currentMonthTotal : viewMonthStats.totalReceivedInMonth;
  const displayExpected = isCurrentMonth ? expectedSalary : viewMonthStats.expectedAmount;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {format(parseISO(viewMonth + '-01'), 'MMM yyyy')} Status
        </CardTitle>
        {isCurrentMonth ? (
          pendingSalaryMonths.length > 0 ? (
            <AlertCircle className="h-4 w-4 text-amber-500" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )
        ) : (
          viewMonthStats.isComplete ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : viewMonthStats.isExcess ? (
            <TrendingUp className="h-4 w-4 text-blue-500" />
          ) : viewMonthStats.isIncomplete ? (
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {isCurrentMonth ? (
            pendingSalaryMonths.length > 0 ? (
              <>
                <div className="text-2xl font-bold text-amber-600">{pendingSalaryMonths.length}</div>
                <p className="text-xs text-muted-foreground">
                  Pending: {pendingSalaryMonths.map(month => format(parseISO(month + '-01'), 'MMM')).join(', ')}
                </p>
              </>
            ) : displayAmount < displayExpected && displayExpected > 0 ? (
              <>
                <div className="text-2xl font-bold text-orange-600">Partial</div>
                <p className="text-xs text-muted-foreground">
                  Current month incomplete
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">Complete</div>
                <p className="text-xs text-muted-foreground">
                  All salaries up to date
                </p>
              </>
            )
          ) : (
            viewMonthStats.isComplete ? (
              <>
                <div className="text-2xl font-bold text-green-600">Complete</div>
                <p className="text-xs text-muted-foreground">
                  Full amount received
                </p>
              </>
            ) : viewMonthStats.isExcess ? (
              <>
                <div className="text-2xl font-bold text-blue-600">Excess</div>
                <p className="text-xs text-muted-foreground">
                  Extra ₹{Math.abs(viewMonthStats.shortfall).toLocaleString()}
                </p>
              </>
            ) : viewMonthStats.isIncomplete ? (
              <>
                <div className="text-2xl font-bold text-orange-600">Partial</div>
                <p className="text-xs text-muted-foreground">
                  Short by ₹{viewMonthStats.shortfall.toLocaleString()}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-red-600">Missing</div>
                <p className="text-xs text-muted-foreground">
                  No payments received
                </p>
              </>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
};
