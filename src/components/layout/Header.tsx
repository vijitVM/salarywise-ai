
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User, TrendingUp, Menu, Search } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { DataExportDialog } from '@/components/export/DataExportDialog';
import { useSalaryData } from '@/components/dashboard/salary/useSalaryData';
import { useTransactionData } from '@/hooks/useTransactionData';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface HeaderProps {
  onSearchOpen?: () => void;
}

export const Header = ({ onSearchOpen }: HeaderProps) => {
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

  const getInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  const MobileMenu = () => (
    <div className="flex flex-col space-y-4 p-4">
      <div className="flex items-center space-x-3 pb-4 border-b">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            {user?.email ? getInitials(user.email) : 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{user?.email}</p>
          <p className="text-xs text-muted-foreground">Welcome back!</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {onSearchOpen && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onSearchOpen();
              setIsOpen(false);
            }}
            className="w-full flex items-center space-x-2 btn-enhanced"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </Button>
        )}
        <DataExportDialog data={exportData} />
        <ThemeToggle />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSignOut}
          className="w-full flex items-center space-x-2 btn-enhanced"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg hover-glow animate-pulse-glow">
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
            {onSearchOpen && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={onSearchOpen} className="btn-enhanced">
                    <Search className="h-4 w-4" />
                    <span className="hidden lg:inline ml-2">Search</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Search your financial data</p>
                </TooltipContent>
              </Tooltip>
            )}
            <DataExportDialog data={exportData} />
            <ThemeToggle />
            {user && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3 bg-muted/50 rounded-lg px-3 py-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      {getInitials(user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Welcome back!</p>
                  </div>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 btn-enhanced"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="hidden lg:inline">Sign Out</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sign out of your account</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          {user && (
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2 btn-enhanced">
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
