
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/auth/AuthForm';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Sparkles } from 'lucide-react';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
        <div className="container mx-auto py-8 max-w-7xl">
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4 shadow-lg animate-pulse-glow">
              <Sparkles className="h-8 w-8 text-white animate-float" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent mb-2">
              Loading SalaryWise AI
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-base font-medium">
              Preparing your financial dashboard...
            </p>
          </div>
          
          {/* Loading skeleton */}
          <div className="space-y-6">
            <SkeletonLoader type="stats" />
            <SkeletonLoader type="chart" count={2} />
            <SkeletonLoader type="list" />
          </div>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthForm />;
};

export default Index;
