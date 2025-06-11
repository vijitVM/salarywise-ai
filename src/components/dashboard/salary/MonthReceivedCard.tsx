
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
  totalReceivedInMonth: number;
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
  const displayAmount = isCurrentMonth ? currentMonthTotal : viewMonthStats.totalReceivedInMonth;
  const displayExpected = isCurrentMonth ? expectedSalary : viewMonthStats.expectedAmount;
  const paymentsCount = isCurrentMonth ? currentMonthRecords.length : viewMonthStats.paymentsCount;

  const shortfallAmount = Math.abs(displayExpected - displayAmount);
  const isIncompletePayment = displayAmount > 0 && displayAmount < displayExpected && displayExpected > 0;
  const isSalaryMissing = displayAmount === 0 && displayExpected > 0;
  const isComplete = displayAmount >= displayExpected && displayExpected > 0;
  const isExcess = displayAmount > displayExpected && displayExpected > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Received in {format(parseISO(viewMonth + '-01'), 'MMM yyyy')}
        </CardTitle>
        {isComplete ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : isExcess ? (
          <TrendingUp className="h-4 w-4 text-blue-500" />
        ) : isIncompletePayment ? (
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        ) : (
          <Clock className="h-4 w-4 text-amber-500" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          ₹{displayAmount.toLocaleString()}
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            {paymentsCount} payment(s) in {format(parseISO(viewMonth + '-01'), 'MMM yyyy')}
          </p>
          {isIncompletePayment && (
            <p className="text-xs text-orange-600 font-medium">
              Short by ₹{shortfallAmount.toLocaleString()}
            </p>
          )}
          {isSalaryMissing && (
            <p className="text-xs text-red-600 font-medium">
              Missing ₹{displayExpected.toLocaleString()}
            </p>
          )}
          {isExcess && (
            <p className="text-xs text-blue-600 font-medium">
              Excess by ₹{shortfallAmount.toLocaleString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
