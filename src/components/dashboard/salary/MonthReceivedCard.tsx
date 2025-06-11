
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ViewMonthStats {
  isComplete: boolean;
  isExcess: boolean;
  isIncomplete: boolean;
  shortfall: number;
  expectedAmount: number;
  paymentsCount: number;
}

interface MonthReceivedCardProps {
  viewMonth: string;
  currentMonthTotal: number;
  expectedSalary: number;
  isCurrentMonth: boolean;
  currentMonthRecords: any[];
  viewMonthStats: ViewMonthStats;
}

export const MonthReceivedCard = ({
  viewMonth,
  currentMonthTotal,
  expectedSalary,
  isCurrentMonth,
  currentMonthRecords,
  viewMonthStats
}: MonthReceivedCardProps) => {
  const shortfallAmount = isCurrentMonth 
    ? (expectedSalary - currentMonthTotal)
    : Math.abs(viewMonthStats.shortfall);

  const isIncompletePayment = isCurrentMonth 
    ? (currentMonthTotal > 0 && currentMonthTotal < expectedSalary)
    : viewMonthStats.isIncomplete;
  
  const isSalaryMissing = isCurrentMonth 
    ? (currentMonthTotal === 0 && expectedSalary > 0)
    : viewMonthStats.isComplete === false && currentMonthTotal === 0 && expectedSalary > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Received in {format(parseISO(viewMonth + '-01'), 'MMM yyyy')}
        </CardTitle>
        {!isCurrentMonth ? (
          viewMonthStats.isComplete ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : viewMonthStats.isExcess ? (
            <TrendingUp className="h-4 w-4 text-blue-500" />
          ) : viewMonthStats.isIncomplete ? (
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          ) : (
            <Clock className="h-4 w-4 text-amber-500" />
          )
        ) : (
          currentMonthTotal >= expectedSalary && expectedSalary > 0 ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : currentMonthTotal > 0 && currentMonthTotal < expectedSalary ? (
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          ) : (
            <Clock className="h-4 w-4 text-amber-500" />
          )
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          ₹{currentMonthTotal.toLocaleString()}
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            {isCurrentMonth 
              ? `${currentMonthRecords.length} payment(s) this month`
              : `${viewMonthStats.paymentsCount} payment(s) in ${format(parseISO(viewMonth + '-01'), 'MMM yyyy')}`
            }
          </p>
          {!isCurrentMonth && viewMonthStats.isIncomplete && (
            <p className="text-xs text-orange-600 font-medium">
              Short by ₹{shortfallAmount.toLocaleString()}
            </p>
          )}
          {!isCurrentMonth && !viewMonthStats.isComplete && currentMonthTotal === 0 && viewMonthStats.expectedAmount > 0 && (
            <p className="text-xs text-red-600 font-medium">
              Missing ₹{viewMonthStats.expectedAmount.toLocaleString()}
            </p>
          )}
          {!isCurrentMonth && viewMonthStats.isExcess && (
            <p className="text-xs text-blue-600 font-medium">
              Excess by ₹{Math.abs(viewMonthStats.shortfall).toLocaleString()}
            </p>
          )}
          {isCurrentMonth && isIncompletePayment && (
            <p className="text-xs text-orange-600 font-medium">
              Short by ₹{shortfallAmount.toLocaleString()}
            </p>
          )}
          {isCurrentMonth && isSalaryMissing && (
            <p className="text-xs text-red-600 font-medium">
              Missing ₹{expectedSalary.toLocaleString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
