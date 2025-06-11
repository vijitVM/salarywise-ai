
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const formatAIResponse = (content: string) => {
  // Split content by numbered lists and sections
  const sections = content.split(/(\d+\.\s*\*\*[^*]+\*\*)/g);
  
  return (
    <div className="space-y-2">
      {sections.map((section, index) => {
        if (!section.trim()) return null;
        
        // Check if this is a numbered section with bold title
        const numberedMatch = section.match(/(\d+)\.\s*\*\*([^*]+)\*\*:?\s*(.*)/s);
        if (numberedMatch) {
          const [, number, title, description] = numberedMatch;
          return (
            <div key={index} className="border-l-2 border-primary/20 pl-2 py-1">
              <div className="flex items-center gap-1 mb-1">
                <span className="bg-primary/10 text-primary text-xs font-medium px-1.5 py-0.5 rounded-full">
                  {number}
                </span>
                <h4 className="font-semibold text-xs">{title}</h4>
              </div>
              {description && (
                <p className="text-xs text-muted-foreground ml-5">{description.trim()}</p>
              )}
            </div>
          );
        }
        
        // Regular paragraph
        return (
          <p key={index} className="text-xs leading-relaxed">
            {section.trim()}
          </p>
        );
      })}
    </div>
  );
};

export const FinancialChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm your personal financial advisor. I can help you analyze your spending, budget, and financial goals. What would you like to know about your finances?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('financial-ai-chat', {
        body: {
          message: inputMessage,
          userId: user.id
        }
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 pr-2 mb-3">
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {message.type === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                </div>
                <div className={`rounded-lg p-3 ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted border'
                }`}>
                  {message.type === 'ai' ? (
                    formatAIResponse(message.content)
                  ) : (
                    <p className="text-xs whitespace-pre-wrap">{message.content}</p>
                  )}
                  <p className={`text-xs opacity-70 mt-2 pt-1 border-t ${
                    message.type === 'user' ? 'border-primary-foreground/20' : 'border-border'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 justify-start">
              <div className="flex gap-2 max-w-[85%]">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
                  <Bot className="h-3 w-3" />
                </div>
                <div className="rounded-lg p-3 bg-muted border">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-xs">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Enhanced Input Area */}
      <div className="bg-white border-t border-gray-200 p-3 rounded-b-lg shadow-lg">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your financial question here..."
            disabled={isLoading}
            className="flex-1 text-sm border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white shadow-sm"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="icon"
            className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send, or click the send button
        </p>
      </div>
    </div>
  );
};
