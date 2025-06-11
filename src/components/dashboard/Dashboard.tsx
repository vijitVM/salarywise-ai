
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SalaryOverview } from './SalaryOverview';
import { ExpenseTracker } from './ExpenseTracker';
import { BudgetManager } from './BudgetManager';
import { FinancialGoals } from './FinancialGoals';
import { Header } from '../layout/Header';
import { FloatingChatWidget } from '../ai/FloatingChatWidget';
import { TrendingUp, IndianRupee, Target, PieChart } from 'lucide-react';

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      <Header />
      
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
              Financial Dashboard
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">Track your salary, expenses, and financial goals with AI assistance</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg border-0 h-auto sm:h-12 gap-1 sm:gap-0 p-1">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-1 sm:gap-2 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-xs sm:text-sm py-2 sm:py-0"
            >
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Home</span>
            </TabsTrigger>
            <TabsTrigger 
              value="expenses"
              className="flex items-center gap-1 sm:gap-2 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-600 data-[state=active]:text-white text-xs sm:text-sm py-2 sm:py-0"
            >
              <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Expenses</span>
              <span className="sm:hidden">Spend</span>
            </TabsTrigger>
            <TabsTrigger 
              value="budgets"
              className="flex items-center gap-1 sm:gap-2 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white text-xs sm:text-sm py-2 sm:py-0"
            >
              <PieChart className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Budgets</span>
              <span className="sm:hidden">Budget</span>
            </TabsTrigger>
            <TabsTrigger 
              value="goals"
              className="flex items-center gap-1 sm:gap-2 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white text-xs sm:text-sm py-2 sm:py-0"
            >
              <Target className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Goals</span>
              <span className="sm:hidden">Goals</span>
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
