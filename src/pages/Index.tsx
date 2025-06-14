
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/auth/AuthForm';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Loader2, Sparkles } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4 shadow-lg animate-pulse">
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-4 animate-spin text-blue-600" />
          <p className="text-gray-600 text-base sm:text-lg font-medium px-4">Loading your financial dashboard...</p>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthForm />;
};

export default Index;
