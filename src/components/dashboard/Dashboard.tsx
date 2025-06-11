
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SalaryOverview } from './SalaryOverview';
import { ExpenseTracker } from './ExpenseTracker';
import { BudgetManager } from './BudgetManager';
import { FinancialGoals } from './FinancialGoals';
import { Header } from '../layout/Header';
import { FloatingChatWidget } from '../ai/FloatingChatWidget';
import { TrendingUp, DollarSign, Target, PieChart } from 'lucide-react';

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <Header />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Financial Dashboard
            </h2>
          </div>
          <p className="text-gray-600 text-lg">Track your salary, expenses, and financial goals with AI assistance</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm shadow-lg border-0 h-12">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="expenses"
              className="flex items-center gap-2 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-600 data-[state=active]:text-white"
            >
              <DollarSign className="h-4 w-4" />
              Expenses
            </TabsTrigger>
            <TabsTrigger 
              value="budgets"
              className="flex items-center gap-2 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
            >
              <PieChart className="h-4 w-4" />
              Budgets
            </TabsTrigger>
            <TabsTrigger 
              value="goals"
              className="flex items-center gap-2 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white"
            >
              <Target className="h-4 w-4" />
              Goals
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="animate-fade-in">
            <SalaryOverview />
          </TabsContent>
          
          <TabsContent value="expenses" className="animate-fade-in">
            <ExpenseTracker />
          </TabsContent>
          
          <TabsContent value="budgets" className="animate-fade-in">
            <BudgetManager />
          </TabsContent>
          
          <TabsContent value="goals" className="animate-fade-in">
            <FinancialGoals />
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating Chat Widget */}
      <FloatingChatWidget />
    </div>
  );
};
