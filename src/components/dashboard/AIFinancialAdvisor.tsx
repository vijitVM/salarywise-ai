
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FinancialChatBot } from '@/components/ai/FinancialChatBot';
import { FinancialInsights } from '@/components/ai/FinancialInsights';
import { Brain, MessageCircle, Lightbulb } from 'lucide-react';

export const AIFinancialAdvisor = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2 mb-2">
          <Brain className="h-6 w-6" />
          AI Financial Advisor
        </h2>
        <p className="text-muted-foreground">
          Get personalized insights and advice powered by artificial intelligence
        </p>
      </div>

      <Tabs defaultValue="chat" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Chat Assistant
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Smart Insights
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat">
          <FinancialChatBot />
        </TabsContent>
        
        <TabsContent value="insights">
          <FinancialInsights />
        </TabsContent>
      </Tabs>
    </div>
  );
};
