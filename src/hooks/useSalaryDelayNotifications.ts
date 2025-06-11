
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SalaryRecord, MonthlyExpectedSalary } from '@/components/dashboard/salary/types';
import { format, addDays, isBefore, parseISO, startOfMonth, endOfMonth } from 'date-fns';

interface UseSalaryDelayNotificationsProps {
  salaryRecords: SalaryRecord[];
  monthlyExpectedSalaries: MonthlyExpectedSalary[];
}

export const useSalaryDelayNotifications = ({
  salaryRecords,
  monthlyExpectedSalaries
}: UseSalaryDelayNotificationsProps) => {
  const { toast } = useToast();

  useEffect(() => {
    const checkSalaryDelays = () => {
      const currentDate = new Date();
      const currentMonthYear = format(currentDate, 'yyyy-MM');
      
      // Find expected salary for current month
      const currentMonthExpected = monthlyExpectedSalaries.find(
        salary => salary.month_year === currentMonthYear
      );
      
      if (!currentMonthExpected) return;

      // Check if salary for current month has been received
      const currentMonthSalary = salaryRecords.find(record => 
        record.salary_month === currentMonthYear && !record.is_bonus
      );

      if (currentMonthSalary) return; // Salary already received

      // Calculate expected salary date based on historical patterns
      const historicalSalaryDates = salaryRecords
        .filter(record => !record.is_bonus)
        .map(record => {
          const receivedDate = parseISO(record.received_date);
          return receivedDate.getDate(); // Get day of month
        });

      if (historicalSalaryDates.length === 0) return;

      // Calculate average salary payment date
      const averagePaymentDate = Math.round(
        historicalSalaryDates.reduce((sum, date) => sum + date, 0) / historicalSalaryDates.length
      );

      // Expected salary date for current month
      const expectedSalaryDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), averagePaymentDate);
      
      // Add grace period of 2 days
      const delayThreshold = addDays(expectedSalaryDate, 2);

      // Check if we're past the delay threshold
      if (isBefore(delayThreshold, currentDate)) {
        const daysPastDue = Math.floor(
          (currentDate.getTime() - delayThreshold.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Only show notification once per month
        const notificationKey = `salary-delay-${currentMonthYear}`;
        const hasShownNotification = localStorage.getItem(notificationKey);

        if (!hasShownNotification) {
          toast({
            title: "Salary Delay Alert",
            description: `Your salary for ${format(currentDate, 'MMMM yyyy')} is ${daysPastDue} day(s) overdue. Expected around ${format(expectedSalaryDate, 'MMM dd')}.`,
            variant: "destructive",
          });

          // Mark notification as shown for this month
          localStorage.setItem(notificationKey, 'true');
        }
      }

      // Check for upcoming salary date (3 days before expected date)
      const upcomingThreshold = addDays(expectedSalaryDate, -3);
      if (
        isBefore(upcomingThreshold, currentDate) && 
        isBefore(currentDate, expectedSalaryDate)
      ) {
        const upcomingNotificationKey = `salary-upcoming-${currentMonthYear}`;
        const hasShownUpcomingNotification = localStorage.getItem(upcomingNotificationKey);

        if (!hasShownUpcomingNotification) {
          toast({
            title: "Salary Expected Soon",
            description: `Your salary is expected around ${format(expectedSalaryDate, 'MMM dd')} based on historical patterns.`,
          });

          localStorage.setItem(upcomingNotificationKey, 'true');
        }
      }
    };

    // Check immediately
    checkSalaryDelays();

    // Set up interval to check daily
    const interval = setInterval(checkSalaryDelays, 24 * 60 * 60 * 1000); // 24 hours

    return () => clearInterval(interval);
  }, [salaryRecords, monthlyExpectedSalaries, toast]);
};
