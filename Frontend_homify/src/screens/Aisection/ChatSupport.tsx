import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  intent?: string;
  marketData?: unknown;
  hasAction?: boolean;
  actionType?: 'market_analysis' | 'property_search' | 'rent_calc';
  actionData?: unknown;
}

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;

function getLocalFaqResponse(message: string): {
  response: string;
  intent: string;
  hasAction?: boolean;
  actionType?: Message['actionType'];
} {
  const m = message.toLowerCase();
  if (m.includes('bastos') || m.includes('akwa') || m.includes('yaoundé') || m.includes('douala') || m.includes('studio') || m.includes('appart') || m.includes('maison') || m.includes('logement') || m.includes('louer')) {
    return {
      response: 'Consultez les annonces publiées sur Homify avec nos filtres par ville, quartier et budget. Je peux vous y rediriger.',
      intent: 'property_search',
      hasAction: true,
      actionType: 'property_search',
    };
  }
  if (m.includes('loyer') || m.includes('budget') || m.includes('fcfa') || m.includes('salaire') || m.includes('revenu')) {
    return {
      response: 'La règle usuelle au Cameroun est de ne pas dépasser 30 % de votre revenu net pour le loyer. Utilisez notre calculateur pour une estimation précise.',
      intent: 'rent_calculation',
      hasAction: true,
      actionType: 'rent_calc',
    };
  }
  if (m.includes('marché') || m.includes('prix') || m.includes('analyse') || m.includes('tendance')) {
    return {
      response: 'Notre analyse de marché calcule les loyers moyens à partir des annonces réelles publiées sur Homify.',
      intent: 'market_analysis',
      hasAction: true,
      actionType: 'market_analysis',
    };
  }
  if (m.includes('gratuit') || m.includes('inscription') || m.includes('compte')) {
    return {
      response: 'Homify est gratuit pour les locataires. Les propriétaires peuvent publier après vérification email. Inscrivez-vous depuis la page d\'accueil.',
      intent: 'general',
    };
  }
  return {
    response: 'Je suis l\'assistant Homify (mode local). Posez-moi une question sur la location à Yaoundé ou Douala, votre budget loyer, ou parcourez directement les annonces et outils dans l\'onglet Assistant.',
    intent: 'general',
  };
}

const ChatSupport = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const N8N_ENABLED = Boolean(N8N_WEBHOOK_URL?.trim());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const welcomeMessage: Message = {
      id: 1,
      text: 'Bonjour ! 👋 Je suis l\'assistant Homify pour le marché locatif au Cameroun. Je peux vous aider à trouver un logement à Yaoundé ou Douala, estimer votre budget loyer en FCFA, ou analyser un quartier. Comment puis-je vous aider ?',
      sender: 'ai',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendMessageToN8n = async (message: string) => {
    if (!N8N_WEBHOOK_URL) throw new Error('n8n non configuré');
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        timestamp: new Date().toISOString(),
        userId: `user-${Date.now()}`,
        conversationId: `conv-${Date.now()}`,
        locale: 'fr-CM',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse = '';
    let intent = 'general';
    let marketData = null;

    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      aiResponse = firstItem.reply?.message || firstItem.response || '';
      intent = firstItem.reply?.intent || firstItem.intent || 'general';
      marketData = firstItem.reply?.marketData || firstItem.marketData || null;
    } else if (data.reply?.message) {
      aiResponse = data.reply.message;
      intent = data.reply.intent || data.intent || 'general';
      marketData = data.reply.marketData || data.marketData || null;
    } else if (data.response) {
      aiResponse = data.response;
      intent = data.intent || 'general';
      marketData = data.marketData || null;
    }

    if (!aiResponse) {
      throw new Error('Réponse serveur invalide');
    }

    return { response: aiResponse, intent, marketData };
  };

  const handleAction = (message: Message) => {
    if (message.actionType === 'market_analysis' && message.marketData) {
      sessionStorage.setItem('marketAnalysisData', JSON.stringify(message.marketData));
      sessionStorage.setItem('openAssistFeature', '2');
      window.location.href = '/assist';
    } else if (message.actionType === 'property_search') {
      window.location.href = '/home';
    } else if (message.actionType === 'rent_calc') {
      sessionStorage.setItem('openAssistFeature', '3');
      window.location.href = '/assist';
    }
  };

  const handleSend = async () => {
    if (inputText.trim() === '' || isLoading) return;

    const userMessageText = inputText;
    const userMessage: Message = {
      id: Date.now(),
      text: userMessageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setError('');

    try {
      const result = N8N_ENABLED
        ? await sendMessageToN8n(userMessageText).catch(() => getLocalFaqResponse(userMessageText))
        : getLocalFaqResponse(userMessageText);

      const { response: aiResponse, intent, marketData } = 'marketData' in result
        ? result as { response: string; intent: string; marketData?: unknown }
        : { ...result, marketData: undefined };

      let hasAction = 'hasAction' in result ? result.hasAction : false;
      let actionType: Message['actionType'] = 'actionType' in result ? result.actionType : undefined;
      let actionData: unknown = null;

      if (!hasAction) {
        if (intent === 'market_analysis') {
          hasAction = true;
          actionType = 'market_analysis';
        } else if (intent === 'property_search') {
          hasAction = true;
          actionType = 'property_search';
          actionData = { query: userMessageText };
        } else if (intent === 'mortgage_calculation' || intent === 'rent_calculation') {
          hasAction = true;
          actionType = 'rent_calc';
          actionData = { query: userMessageText };
        }
      }

      const aiMessage: Message = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        intent,
        marketData,
        hasAction,
        actionType,
        actionData,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      const local = getLocalFaqResponse(userMessageText);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        text: local.response,
        sender: 'ai',
        timestamp: new Date(),
        intent: local.intent,
        hasAction: local.hasAction,
        actionType: local.actionType,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
  };

  const getActionButton = (message: Message) => {
    if (!message.hasAction || !message.actionType) return null;

    const configs = {
      market_analysis: {
        text: 'Voir l\'analyse',
        icon: <ArrowRight className="w-4 h-4" />,
        color: 'from-homify-primary to-homify-primary-light',
      },
      property_search: {
        text: 'Parcourir les annonces',
        icon: <ExternalLink className="w-4 h-4" />,
        color: 'from-homify-accent to-homify-accent-hover',
      },
      rent_calc: {
        text: 'Calculateur de loyer',
        icon: <ArrowRight className="w-4 h-4" />,
        color: 'from-emerald-600 to-emerald-700',
      },
    };

    const config = configs[message.actionType];

    return (
      <button
        type="button"
        onClick={() => handleAction(message)}
        className={`mt-3 px-4 py-2 bg-gradient-to-r ${config.color} text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2`}
      >
        {config.text}
        {config.icon}
      </button>
    );
  };

  const intentLabels: Record<string, string> = {
    market_analysis: 'Marché',
    property_search: 'Recherche',
    rent_calculation: 'Budget loyer',
    mortgage_calculation: 'Budget loyer',
    general: 'Général',
  };

  return (
    <div className="flex flex-col min-h-[420px] bg-homify-surface rounded-card border border-homify-border overflow-hidden">
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <p className="text-xs text-red-600 flex-1">{error}</p>
          <button type="button" onClick={() => setError('')} className="text-red-600 hover:text-red-800">
            ✕
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-h-[360px]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'ai' && (
              <div className="w-8 h-8 bg-homify-primary rounded-full flex items-center justify-center mr-2 shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}

            <div className={`max-w-[80%] ${message.sender === 'user' ? '' : 'flex flex-col'}`}>
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-homify-primary text-white'
                    : 'bg-homify-card text-homify-text border border-homify-border'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                <div className="flex items-center justify-between mt-1 gap-2 flex-wrap">
                  <p className={`text-xs ${message.sender === 'user' ? 'text-white/70' : 'text-homify-muted'}`}>
                    {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {message.intent && message.sender === 'ai' && (
                    <span className="text-xs bg-homify-accent/10 text-homify-accent px-2 py-0.5 rounded-full font-medium">
                      {intentLabels[message.intent] ?? message.intent}
                    </span>
                  )}
                </div>
              </div>
              {message.sender === 'ai' && getActionButton(message)}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 bg-homify-primary rounded-full flex items-center justify-center mr-2 shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-homify-card border border-homify-border rounded-2xl px-4 py-3">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-homify-muted rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-homify-muted rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-homify-muted rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 1 && !isLoading && (
        <div className="px-4 py-3 border-t border-homify-border bg-homify-card">
          <p className="text-xs text-homify-muted mb-2 font-medium">Suggestions</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              'Studio meublé à Bastos, Yaoundé',
              'Prix moyen à Akwa, Douala',
              'Quel loyer pour 300 000 FCFA/mois ?',
              'Quartiers calmes à Yaoundé',
            ].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="shrink-0 px-3 py-1.5 bg-homify-surface text-homify-text rounded-full text-xs font-medium border border-homify-border hover:border-homify-primary/30 transition"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-homify-border px-4 py-3 bg-homify-card">
        <div className="flex items-end gap-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Posez votre question sur la location au Cameroun..."
            rows={1}
            disabled={isLoading}
            className="flex-1 px-3 py-2.5 bg-homify-surface rounded-btn border border-homify-border resize-none focus:outline-none focus:ring-2 focus:ring-homify-primary/20 text-sm disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={inputText.trim() === '' || isLoading}
            className="w-10 h-10 bg-homify-primary text-white rounded-full flex items-center justify-center hover:bg-homify-primary-light transition disabled:opacity-50 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-homify-muted mt-1.5 text-center">
          {N8N_ENABLED ? 'Assistant IA · n8n + FAQ local' : 'Assistant Homify · mode FAQ local (Cameroun)'}
        </p>
      </div>
    </div>
  );
};

export default ChatSupport;
