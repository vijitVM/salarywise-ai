
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Sun, Moon, Sunset, Star } from 'lucide-react';

export const PersonalizedGreeting = () => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [icon, setIcon] = useState<React.ReactNode>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      setGreeting('Good morning');
      setIcon(<Sun className="h-5 w-5 text-yellow-500" />);
    } else if (hour < 17) {
      setGreeting('Good afternoon');
      setIcon(<Sun className="h-5 w-5 text-orange-500" />);
    } else if (hour < 21) {
      setGreeting('Good evening');
      setIcon(<Sunset className="h-5 w-5 text-orange-600" />);
    } else {
      setGreeting('Good night');
      setIcon(<Star className="h-5 w-5 text-blue-400" />);
    }
  }, []);

  const firstName = user?.email?.split('@')[0] || 'there';

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg p-4 mb-6 animate-fade-in">
      <div className="flex items-center space-x-2">
        {icon}
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {greeting}, {firstName}!
        </h2>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        Here's your financial overview for today
      </p>
    </div>
  );
};
