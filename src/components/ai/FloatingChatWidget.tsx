
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FinancialChatBot } from './FinancialChatBot';
import { FinancialInsights } from './FinancialInsights';
import { MessageCircle, Lightbulb, X, Minimize2, Sparkles } from 'lucide-react';

export const FloatingChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleChat = () => {
    if (isOpen && !isMinimized) {
      setIsMinimized(true);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {(!isOpen || isMinimized) && (
        <Button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl z-50 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform transition-all duration-300 hover:scale-110 animate-bounce"
          size="icon"
        >
          <div className="relative">
            <MessageCircle className="h-7 w-7" />
            <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
          </div>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && !isMinimized && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] z-50 animate-scale-in">
          <Card className="h-full flex flex-col shadow-2xl backdrop-blur-md bg-white/95 border-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <h3 className="font-semibold text-lg">AI Financial Assistant</h3>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsMinimized(true)}
                  className="h-8 w-8 text-white hover:bg-white/20 transition-all duration-200"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={closeChat}
                  className="h-8 w-8 text-white hover:bg-white/20 transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <CardContent className="flex-1 p-0 bg-gradient-to-b from-white to-gray-50/50">
              <Tabs defaultValue="chat" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-2 m-4 mb-0 bg-gray-100/50 backdrop-blur-sm">
                  <TabsTrigger 
                    value="chat" 
                    className="flex items-center gap-2 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger 
                    value="insights" 
                    className="flex items-center gap-2 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-yellow-500 data-[state=active]:text-white"
                  >
                    <Lightbulb className="h-4 w-4" />
                    Insights
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex-1 px-4 pb-2">
                  <TabsContent value="chat" className="h-full mt-0 animate-fade-in">
                    <div className="h-[470px]">
                      <FinancialChatBot />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="insights" className="h-full mt-0 animate-fade-in">
                    <div className="h-[470px] overflow-y-auto">
                      <FinancialInsights />
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
