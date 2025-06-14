import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User, TrendingUp, Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { DataExportDialog } from '@/components/export/DataExportDialog';
import { useSalaryData } from '@/components/dashboard/salary/useSalaryData';
import { useTransactionData } from '@/hooks/useTransactionData';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export const Header = () => {
  const { user, signOut } = useAuth();
  const { salaryRecords, monthlyExpectedSalaries } = useSalaryData();
  const { transactions } = useTransactionData();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const exportData = {
    salaryRecords,
    monthlyExpectedSalaries,
    transactions,
  };

  const MobileMenu = () => (
    <div className="flex flex-col space-y-4 p-4">
      <div className="flex items-center space-x-2 pb-4 border-b">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium truncate">{user?.email}</span>
      </div>
      
      <div className="space-y-3">
        <DataExportDialog data={exportData} />
        <ThemeToggle />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSignOut}
          className="w-full flex items-center space-x-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                SalaryWise AI
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Smart Financial Management</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 ml-auto">
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

          {/* Mobile Navigation */}
          {user && (
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <MobileMenu />
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
