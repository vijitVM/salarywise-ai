
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User, TrendingUp } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { DataExportDialog } from '@/components/export/DataExportDialog';
import { useSalaryData } from '@/components/dashboard/salary/useSalaryData';

export const Header = () => {
  const { user, signOut } = useAuth();
  const { salaryRecords, monthlyExpectedSalaries } = useSalaryData();

  const handleSignOut = async () => {
    await signOut();
  };

  const exportData = {
    salaryRecords,
    monthlyExpectedSalaries,
  };

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                AI Salary Tracker
              </h1>
              <p className="text-xs text-muted-foreground">Smart Financial Management</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <DataExportDialog data={exportData} />
            <ThemeToggle />
            {user && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{user.email}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
