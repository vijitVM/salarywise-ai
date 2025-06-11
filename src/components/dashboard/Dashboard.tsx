
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SalaryOverview } from './SalaryOverview';
import { TransactionTracker } from './TransactionTracker';
import { BudgetManager } from './BudgetManager';
import { FinancialGoals } from './FinancialGoals';
import { Header } from '@/components/layout/Header';
import { FloatingChatWidget } from '@/components/ai/FloatingChatWidget';

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
              Financial Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your salary, transactions, budgets, and financial goals in one place
            </p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Salary Overview</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="budgets">Budgets</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <SalaryOverview />
            </TabsContent>

            <TabsContent value="transactions" className="space-y-6">
              <TransactionTracker />
            </TabsContent>

            <TabsContent value="budgets" className="space-y-6">
              <BudgetManager />
            </TabsContent>

            <TabsContent value="goals" className="space-y-6">
              <FinancialGoals />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <FloatingChatWidget />
    </div>
  );
};
