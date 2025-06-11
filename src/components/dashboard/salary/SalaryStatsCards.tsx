
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IndianRupee, Calendar, AlertCircle, CheckCircle, TrendingUp, Clock, AlertTriangle, ChevronDown } from 'lucide-react';
import { MonthlyStats, MonthlyExpectedSalary, SalaryRecord } from './types';
import { format, parseISO, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { useState, useMemo } from 'react';

interface SalaryStatsCardsProps {
  monthlyStats: MonthlyStats;
  totalEarnings: number;
  totalRecords: number;
  monthlyExpectedSalaries: MonthlyExpectedSalary[];
  salaryRecords: SalaryRecord[];
  isSalaryDialogOpen: boolean;
  setIsSalaryDialogOpen: (open: boolean) => void;
  onUpdateMonthlyExpectedSalary: (monthYear: string, amount: number) => void;
}

export const SalaryStatsCards = ({
  monthlyStats,
  totalEarnings,
  totalRecords,
  monthlyExpectedSalaries,
  salaryRecords,
  isSalaryDialogOpen,
  setIsSalaryDialogOpen,
  onUpdateMonthlyExpectedSalary
}: SalaryStatsCardsProps) => {
  const { currentMonthTotal, expectedSalary, remainingBalance, currentMonthRecords, salaryForCurrentMonth, pendingSalaryMonths } = monthlyStats;
  
  const [expectedMonthlySalary, setExpectedMonthlySalary] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [viewMonth, setViewMonth] = useState(format(new Date(), 'yyyy-MM'));

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

  // Calculate stats for selected view month
  const viewMonthStats = useMemo(() => {
    const viewMonthExpected = monthlyExpectedSalaries.find(
      salary => salary.month_year === viewMonth
    );
    const expectedAmount = viewMonthExpected?.expected_amount || 0;

    // Find salary record for the viewed month (salary_month matches viewMonth)
    const salaryForViewMonth = salaryRecords.find(record => 
      record.salary_month === viewMonth && !record.is_bonus
    );

    // Calculate total received during the view month period (all payments received in that month)
    const viewMonthStart = startOfMonth(parseISO(viewMonth + '-01'));
    const viewMonthEnd = endOfMonth(parseISO(viewMonth + '-01'));
    
    const totalReceivedInMonth = salaryRecords
      .filter(record => {
        const recordDate = parseISO(record.received_date);
        return isWithinInterval(recordDate, { start: viewMonthStart, end: viewMonthEnd });
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

    return {
      expectedAmount,
      receivedAmount: salaryForViewMonth?.amount || 0,
      totalReceivedInMonth,
      paymentsCount,
      shortfall,
      isComplete,
      isMissing,
      isIncomplete,
      isExcess,
      salaryRecord: salaryForViewMonth
    };
  }, [viewMonth, monthlyExpectedSalaries, salaryRecords]);

  const handleUpdateExpectedSalary = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMonthlyExpectedSalary(selectedMonth, parseFloat(expectedMonthlySalary));
    setExpectedMonthlySalary('');
    setIsSalaryDialogOpen(false);
  };

  const isCurrentMonth = viewMonth === format(new Date(), 'yyyy-MM');
  const displayStats = isCurrentMonth ? monthlyStats : {
    expectedSalary: viewMonthStats.expectedAmount,
    salaryForCurrentMonth: viewMonthStats.salaryRecord,
    currentMonthTotal: viewMonthStats.totalReceivedInMonth,
    remainingBalance: viewMonthStats.shortfall
  };

  // For non-current months, use the view month stats for status calculations
  const isIncompletePayment = isCurrentMonth 
    ? (displayStats.salaryForCurrentMonth && displayStats.salaryForCurrentMonth.amount < displayStats.expectedSalary)
    : viewMonthStats.isIncomplete;
  
  const isSalaryMissing = isCurrentMonth 
    ? (!displayStats.salaryForCurrentMonth && displayStats.expectedSalary > 0)
    : viewMonthStats.isMissing;

  const shortfallAmount = isCurrentMonth 
    ? (displayStats.expectedSalary - (displayStats.salaryForCurrentMonth?.amount || 0))
    : Math.abs(viewMonthStats.shortfall);

  return (
    <div className="space-y-6">
      {/* Month Selector */}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Expected Salary Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Expected for {format(parseISO(viewMonth + '-01'), 'MMM yyyy')}
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{displayStats.expectedSalary.toLocaleString()}</div>
            {isCurrentMonth && (
              <Dialog open={isSalaryDialogOpen} onOpenChange={setIsSalaryDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                    Set expected salary
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Set Expected Monthly Salary</DialogTitle>
                    <DialogDescription>
                      Set expected salary for a specific month (useful when you get hikes)
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpdateExpectedSalary} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="selectedMonth">Month</Label>
                      <Input
                        id="selectedMonth"
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expectedSalary">Expected Salary (₹)</Label>
                      <Input
                        id="expectedSalary"
                        type="number"
                        value={expectedMonthlySalary}
                        onChange={(e) => setExpectedMonthlySalary(e.target.value)}
                        placeholder="50000"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Save Expected Salary
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>

        {/* Month Received Card */}
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
              displayStats.currentMonthTotal >= displayStats.expectedSalary && displayStats.expectedSalary > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : displayStats.currentMonthTotal > 0 && displayStats.currentMonthTotal < displayStats.expectedSalary ? (
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              ) : (
                <Clock className="h-4 w-4 text-amber-500" />
              )
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{displayStats.currentMonthTotal.toLocaleString()}
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
              {!isCurrentMonth && viewMonthStats.isMissing && viewMonthStats.expectedAmount > 0 && (
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
              {isCurrentMonth && isSalaryMissing && displayStats.expectedSalary > 0 && (
                <p className="text-xs text-red-600 font-medium">
                  Missing ₹{displayStats.expectedSalary.toLocaleString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Salary for Month Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Salary for: {format(parseISO(viewMonth + '-01'), 'MMM yyyy')}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(displayStats.salaryForCurrentMonth?.amount || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              vs ₹{displayStats.expectedSalary.toLocaleString()} expected
            </p>
            {displayStats.expectedSalary > 0 && (displayStats.salaryForCurrentMonth?.amount || 0) !== displayStats.expectedSalary && (
              <p className="text-xs text-blue-600 mt-1">
                {(displayStats.salaryForCurrentMonth?.amount || 0) > displayStats.expectedSalary ? 'Excess' : 'Gap'}: ₹{Math.abs(displayStats.expectedSalary - (displayStats.salaryForCurrentMonth?.amount || 0)).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Status Card */}
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
                ) : displayStats.currentMonthTotal < displayStats.expectedSalary && displayStats.expectedSalary > 0 ? (
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
      </div>
    </div>
  );
};
