
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SalaryOverview } from './SalaryOverview';
import { ExpenseTracker } from './ExpenseTracker';
import { BudgetManager } from './BudgetManager';
import { FinancialGoals } from './FinancialGoals';
import { Header } from '../layout/Header';
import { FloatingChatWidget } from '../ai/FloatingChatWidget';

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Financial Dashboard</h2>
          <p className="text-gray-600">Track your salary, expenses, and financial goals with AI assistance</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <SalaryOverview />
          </TabsContent>
          
          <TabsContent value="expenses">
            <ExpenseTracker />
          </TabsContent>
          
          <TabsContent value="budgets">
            <BudgetManager />
          </TabsContent>
          
          <TabsContent value="goals">
            <FinancialGoals />
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating Chat Widget */}
      <FloatingChatWidget />
    </div>
  );
};
