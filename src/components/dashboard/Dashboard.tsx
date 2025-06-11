
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SalaryOverview } from './SalaryOverview';
import { ExpenseTracker } from './ExpenseTracker';
import { BudgetManager } from './BudgetManager';
import { FinancialGoals } from './FinancialGoals';
import { AIFinancialAdvisor } from './AIFinancialAdvisor';
import { Header } from '../layout/Header';

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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="ai-advisor">AI Advisor</TabsTrigger>
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
          
          <TabsContent value="ai-advisor">
            <AIFinancialAdvisor />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
