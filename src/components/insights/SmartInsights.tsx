
import { Brain, TrendingUp, TrendingDown, AlertCircle, CheckCircle, IndianRupee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Insight {
  id: string;
  type: 'positive' | 'warning' | 'info' | 'achievement';
  title: string;
  description: string;
  value?: string;
  trend?: 'up' | 'down' | 'stable';
}

interface SmartInsightsProps {
  insights: Insight[];
}

export const SmartInsights = ({ insights }: SmartInsightsProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'positive': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'achievement': return TrendingUp;
      default: return Brain;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'achievement': return 'text-purple-600 bg-purple-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  // Function to ensure amounts are displayed in Indian Rupees
  const formatCurrency = (text: string) => {
    // Replace any dollar signs with rupee symbol
    return text
      .replace(/\$/g, '₹')
      .replace(/USD/g, 'INR')
      .replace(/dollars?/gi, 'rupees');
  };

  return (
    <Card className="hover-lift">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <CardTitle className="text-lg">Smart Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight) => {
          const Icon = getIcon(insight.type);
          return (
            <div key={insight.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className={`p-1.5 rounded-full ${getColor(insight.type)}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{formatCurrency(insight.title)}</h4>
                  {insight.trend && (
                    <Badge variant="outline" className="h-5">
                      {insight.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : insight.trend === 'down' ? (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      ) : (
                        <span className="h-2 w-2 bg-gray-400 rounded-full" />
                      )}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{formatCurrency(insight.description)}</p>
                {insight.value && (
                  <p className="text-sm font-mono font-medium mt-1 flex items-center gap-1">
                    <IndianRupee className="h-3 w-3" />
                    {formatCurrency(insight.value).replace('₹', '')}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
