
import { useSalaryData } from './salary/useSalaryData';
import { useSalaryCalculations } from './salary/useSalaryCalculations';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const FinancialHealthBar = () => {
  const { salaryRecords, profile, monthlyExpectedSalaries } = useSalaryData();
  const { monthlyStats } = useSalaryCalculations(salaryRecords, profile, monthlyExpectedSalaries);

  const { currentMonthTotal, expectedSalary } = monthlyStats;
  
  // Calculate health percentage (0-100)
  const healthPercentage = expectedSalary > 0 
    ? Math.min((currentMonthTotal / expectedSalary) * 100, 100)
    : 0;

  const getHealthStatus = () => {
    if (healthPercentage >= 80) return { text: 'Excellent', color: 'text-green-600', icon: TrendingUp };
    if (healthPercentage >= 60) return { text: 'Good', color: 'text-blue-600', icon: TrendingUp };
    if (healthPercentage >= 40) return { text: 'Fair', color: 'text-yellow-600', icon: Minus };
    return { text: 'Needs Attention', color: 'text-red-600', icon: TrendingDown };
  };

  const status = getHealthStatus();
  const Icon = status.icon;

  return (
    <div className="bg-white dark:bg-gray-800 border rounded-lg p-4 mb-6 shadow-sm hover-lift">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon className={`h-4 w-4 ${status.color}`} />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Financial Health: <span className={status.color}>{status.text}</span>
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {healthPercentage.toFixed(0)}% of monthly goal
        </span>
      </div>
      
      <div className="relative">
        <div className="health-bar w-full"></div>
        <div 
          className="absolute top-0 left-0 h-full bg-current transition-all duration-700 ease-out rounded-r"
          style={{ 
            width: `${healthPercentage}%`,
            color: healthPercentage >= 80 ? '#10b981' : 
                   healthPercentage >= 60 ? '#3b82f6' : 
                   healthPercentage >= 40 ? '#f59e0b' : '#ef4444'
          }}
        ></div>
      </div>
    </div>
  );
};
