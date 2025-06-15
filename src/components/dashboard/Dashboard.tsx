import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SalaryOverview } from './SalaryOverview';
import { TransactionTracker } from './TransactionTracker';
import { BudgetManager } from './BudgetManager';
import { FinancialGoals } from './FinancialGoals';
import { Header } from '@/components/layout/Header';
import { FloatingChatWidget } from '@/components/ai/FloatingChatWidget';
import { PersonalizedGreeting } from './PersonalizedGreeting';
import { FinancialHealthBar } from './FinancialHealthBar';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { SmartInsights } from '@/components/insights/SmartInsights';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useState, useRef } from 'react';
import { DollarSign, Target, TrendingUp } from 'lucide-react';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // References to child components for triggering actions
  const salaryOverviewRef = useRef<{ openAddDialog: () => void } | null>(null);
  const transactionTrackerRef = useRef<{ openAddDialog: () => void } | null>(null);
  const financialGoalsRef = useRef<{ openAddDialog: () => void } | null>(null);

  const fabActions = [
    {
      icon: DollarSign,
      label: 'Add Salary',
      onClick: () => {
        setActiveTab('overview');
        // Give a small delay to ensure tab is switched before opening dialog
        setTimeout(() => {
          salaryOverviewRef.current?.openAddDialog();
        }, 100);
      },
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      icon: TrendingUp,
      label: 'Add Transaction',
      onClick: () => {
        setActiveTab('transactions');
        setTimeout(() => {
          transactionTrackerRef.current?.openAddDialog();
        }, 100);
      },
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      icon: Target,
      label: 'Set Goal',
      onClick: () => {
        setActiveTab('goals');
        setTimeout(() => {
          financialGoalsRef.current?.openAddDialog();
        }, 100);
      },
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  const sampleInsights = [
    {
      id: '1',
      type: 'positive' as const,
      title: 'Great Progress!',
      description: 'You\'re 15% ahead of your monthly salary target',
      value: '+₹1,250',
      trend: 'up' as const
    },
    {
      id: '2',
      type: 'info' as const,
      title: 'Spending Pattern',
      description: 'Your expenses are consistent with last month',
      trend: 'stable' as const
    },
    {
      id: '3',
      type: 'achievement' as const,
      title: 'Milestone Reached',
      description: 'You\'ve saved 20% of your target this month!',
      value: '₹2,500'
    }
  ];

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

            {/* Smart Insights */}
            <div className="hover-lift">
              <SmartInsights insights={sampleInsights} />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
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
                <SalaryOverview ref={salaryOverviewRef} />
              </TabsContent>

              <TabsContent value="transactions" className="space-y-4 sm:space-y-6 tab-content">
                <TransactionTracker ref={transactionTrackerRef} />
              </TabsContent>

              <TabsContent value="budgets" className="space-y-4 sm:space-y-6 tab-content">
                <BudgetManager />
              </TabsContent>

              <TabsContent value="goals" className="space-y-4 sm:space-y-6 tab-content">
                <FinancialGoals ref={financialGoalsRef} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        <FloatingActionButton actions={fabActions} />
        <FloatingChatWidget />
      </div>
    </TooltipProvider>
  );
};
