
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SalaryOverview } from './SalaryOverview';
import { TransactionTracker } from './TransactionTracker';
import { BudgetManager } from './BudgetManager';
import { FinancialGoals } from './FinancialGoals';
import { Header } from '@/components/layout/Header';
import { FloatingChatWidget } from '@/components/ai/FloatingChatWidget';
import { PersonalizedGreeting } from './PersonalizedGreeting';
import { FinancialHealthBar } from './FinancialHealthBar';
import { TooltipProvider } from '@/components/ui/tooltip';

export const Dashboard = () => {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-7xl">
          <div className="space-y-4 sm:space-y-6">
            <PersonalizedGreeting />
            <FinancialHealthBar />
            
            <div className="text-center space-y-2 px-2">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                Financial Dashboard
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage your salary, transactions, budgets, and financial goals in one place
              </p>
            </div>

            {/* Gradient divider */}
            <div className="gradient-divider"></div>

            <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
              <div className="overflow-x-auto">
                <TabsList className="grid w-full grid-cols-4 min-w-fit mx-auto">
                  <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-4 hover-glow">
                    <span className="hidden sm:inline">Salary Overview</span>
                    <span className="sm:hidden">Salary</span>
                  </TabsTrigger>
                  <TabsTrigger value="transactions" className="text-xs sm:text-sm px-2 sm:px-4 hover-glow">
                    <span className="hidden sm:inline">Transactions</span>
                    <span className="sm:hidden">Txns</span>
                  </TabsTrigger>
                  <TabsTrigger value="budgets" className="text-xs sm:text-sm px-2 sm:px-4 hover-glow">Budgets</TabsTrigger>
                  <TabsTrigger value="goals" className="text-xs sm:text-sm px-2 sm:px-4 hover-glow">Goals</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="space-y-4 sm:space-y-6 tab-content">
                <SalaryOverview />
              </TabsContent>

              <TabsContent value="transactions" className="space-y-4 sm:space-y-6 tab-content">
                <TransactionTracker />
              </TabsContent>

              <TabsContent value="budgets" className="space-y-4 sm:space-y-6 tab-content">
                <BudgetManager />
              </TabsContent>

              <TabsContent value="goals" className="space-y-4 sm:space-y-6 tab-content">
                <FinancialGoals />
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <FloatingChatWidget />
      </div>
    </TooltipProvider>
  );
};
