import React, { useState, useRef, useEffect } from 'react';
import { Send, Headphones, MoreVertical, Sparkles, AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  intent?: string;
  marketData?: any;
  hasAction?: boolean;
  actionType?: 'market_analysis' | 'property_search' | 'mortgage_calc';
  actionData?: any;
}

const ChatSupport = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Replace with your n8n webhook URL
  const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/chatbot';

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message from bot
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 1,
      text: 'Hello! 👋 I\'m your AI real estate assistant. I can help you find properties, analyze markets, calculate mortgages, and answer any questions about real estate. How can I assist you today?',
      sender: 'ai',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  // Send message to n8n webhook
  const sendMessageToN8n = async (message: string) => {
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          timestamp: new Date().toISOString(),
          userId: `user-${Date.now()}`,
          conversationId: `conv-${Date.now()}`
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle n8n response format: [{ reply: { message: "..." }, timestamp: "..." }]
      let aiResponse = '';
      let intent = 'general';
      let marketData = null;

      // Check if data is an array
      if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0];
        aiResponse = firstItem.reply?.message || firstItem.response || '';
        intent = firstItem.reply?.intent || firstItem.intent || 'general';
        marketData = firstItem.reply?.marketData || firstItem.marketData || null;
      } 
      // Check if data has reply.message structure
      else if (data.reply && data.reply.message) {
        aiResponse = data.reply.message;
        intent = data.reply.intent || data.intent || 'general';
        marketData = data.reply.marketData || data.marketData || null;
      }
      // Fallback to previous format
      else if (data.response) {
        aiResponse = data.response;
        intent = data.intent || 'general';
        marketData = data.marketData || null;
      }
      
      if (!aiResponse) {
        throw new Error('Invalid response from server');
      }

      return {
        response: aiResponse,
        intent: intent,
        marketData: marketData
      };
    } catch (error) {
      console.error('Error sending message to n8n:', error);
      throw error;
    }
  };

  // Handle action buttons (View Details, Calculate, etc.)
  const handleAction = (message: Message) => {
    if (message.actionType === 'market_analysis' && message.marketData) {
      // Store market data in sessionStorage for the next page
      sessionStorage.setItem('marketAnalysisData', JSON.stringify(message.marketData));
      // Redirect to market analysis page
      window.location.href = '/market-analysis';
    } else if (message.actionType === 'property_search' && message.actionData) {
      // Store search criteria
      sessionStorage.setItem('propertySearchCriteria', JSON.stringify(message.actionData));
      // Redirect to property search page
      window.location.href = '/property-search';
    } else if (message.actionType === 'mortgage_calc' && message.actionData) {
      // Store mortgage data
      sessionStorage.setItem('mortgageData', JSON.stringify(message.actionData));
      // Redirect to mortgage calculator page
      window.location.href = '/mortgage-calculator';
    }
  };

  // Handle sending user message
  const handleSend = async () => {
    if (inputText.trim() === '' || isLoading) return;

    const userMessageText = inputText;
    
    // Add user message immediately
    const userMessage: Message = {
      id: Date.now(),
      text: userMessageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setError('');

    try {
      // Get AI response from n8n
      const { response: aiResponse, intent, marketData } = await sendMessageToN8n(userMessageText);

      // Determine if this message should have an action button
      let hasAction = false;
      let actionType: 'market_analysis' | 'property_search' | 'mortgage_calc' | undefined;
      let actionData: any = null;

      if (intent === 'market_analysis' && marketData) {
        hasAction = true;
        actionType = 'market_analysis';
        actionData = marketData;
      } else if (intent === 'property_search') {
        hasAction = true;
        actionType = 'property_search';
        actionData = { query: userMessageText };
      } else if (intent === 'mortgage_calculation') {
        hasAction = true;
        actionType = 'mortgage_calc';
        actionData = { query: userMessageText };
      }

      // Add AI response
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        intent: intent,
        marketData: marketData,
        hasAction: hasAction,
        actionType: actionType,
        actionData: actionData
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError('Unable to get a response. Please check your connection and try again.');
      
      // Add error message to chat
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key to send
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
  };

  // Get action button config based on action type
  const getActionButton = (message: Message) => {
    if (!message.hasAction || !message.actionType) return null;

    const configs = {
      market_analysis: {
        text: 'View Full Analysis',
        icon: <ArrowRight className="w-4 h-4" />,
        color: 'from-blue-600 to-blue-700'
      },
      property_search: {
        text: 'Search Properties',
        icon: <ExternalLink className="w-4 h-4" />,
        color: 'from-purple-600 to-purple-700'
      },
      mortgage_calc: {
        text: 'Open Calculator',
        icon: <ArrowRight className="w-4 h-4" />,
        color: 'from-green-600 to-green-700'
      }
    };

    const config = configs[message.actionType];

    return (
      <button
        onClick={() => handleAction(message)}
        className={`mt-3 px-4 py-2 bg-gradient-to-r ${config.color} text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2 hover:scale-105 active:scale-95`}
      >
        {config.text}
        {config.icon}
      </button>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 rounded-full transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">AI Assistant</h2>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
                Online - Powered by n8n
              </p>
            </div>
          </div>
        </div>

        <button className="p-2 hover:bg-gray-100 rounded-full transition">
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center gap-2 animate-in fade-in duration-300">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-xs text-red-600 flex-1">{error}</p>
          <button 
            onClick={() => setError('')}
            className="ml-auto text-red-600 hover:text-red-800 transition"
          >
            ✕
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom duration-300`}
          >
            {message.sender === 'ai' && (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div className={`max-w-[75%] ${message.sender === 'user' ? '' : 'flex flex-col'}`}>
              <div
                className={`rounded-2xl px-4 py-3 shadow-sm ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                <div className="flex items-center justify-between mt-1 gap-2 flex-wrap">
                  <p className={`text-xs ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {message.intent && message.sender === 'ai' && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                      {message.intent.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Action Button */}
              {message.sender === 'ai' && getActionButton(message)}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0 shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white text-gray-900 border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {messages.length <= 1 && !isLoading && (
        <div className="px-4 py-3 bg-white border-t border-gray-100 animate-in fade-in duration-500">
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3" />
            Quick suggestions to get started
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              onClick={() => handleSuggestionClick('Find properties in San Francisco')}
              className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-xs font-medium whitespace-nowrap hover:bg-purple-100 transition border border-purple-200 hover:shadow-sm"
            >
              🏠 Find properties
            </button>
            <button 
              onClick={() => handleSuggestionClick('Show me market trends for Miami')}
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-medium whitespace-nowrap hover:bg-blue-100 transition border border-blue-200 hover:shadow-sm"
            >
              📈 Market analysis
            </button>
            <button 
              onClick={() => handleSuggestionClick('Calculate mortgage for $500K home')}
              className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-medium whitespace-nowrap hover:bg-green-100 transition border border-green-200 hover:shadow-sm"
            >
              💰 Calculate mortgage
            </button>
            <button 
              onClick={() => handleSuggestionClick('Tell me about neighborhoods in Austin')}
              className="px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-xs font-medium whitespace-nowrap hover:bg-orange-100 transition border border-orange-200 hover:shadow-sm"
            >
              📍 Neighborhoods
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
        <div className="flex items-end gap-3">
          <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-100 transition">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about real estate..."
              rows={1}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-transparent resize-none focus:outline-none text-sm max-h-32 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ minHeight: '44px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={inputText.trim() === '' || isLoading}
            className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 hover:scale-105 active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Powered by Claude AI via n8n • Press Enter to send
        </p>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-from-bottom {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-in {
          animation: fade-in 0.3s ease-out, slide-in-from-bottom 0.3s ease-out;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce {
          animation: bounce 1s ease-in-out infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ChatSupport;