import { useState } from 'react';
import { ArrowLeft, Phone, Video, Send, Mic, Paperclip } from 'lucide-react';

interface ChatProps {
  onBack: () => void;
  agentName: string;
}

interface Message {
  id: number;
  text: string;
  isSender: boolean;
  time: string;
}

export default function ChatScreen({ onBack, agentName }: ChatProps) {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: `Bonjour, je suis intéressé(e) par ce bien.`, isSender: true, time: '10:00' },
    { id: 2, text: 'Bonjour ! Merci pour votre message. Comment puis-je vous aider ?', isSender: false, time: '10:01' },
  ]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMessage = { id: Date.now(), text: inputText, isSender: true, time: '10:05' };
    setMessages([...messages, newMessage]);
    setInputText('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: 'Je suis disponible pour une visite demain.', isSender: false, time: '10:06' },
      ]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-homify-surface">
      <div className="px-4 py-3 border-b border-homify-border flex items-center justify-between bg-homify-card shadow-sm z-10 md:ml-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-homify-surface rounded-full transition">
            <ArrowLeft className="w-5 h-5 text-homify-text" />
          </button>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100"
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-homify-primary/20"
            />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-homify-card" />
          </div>
          <div>
            <h2 className="font-bold text-homify-text text-sm">{agentName}</h2>
            <p className="text-xs text-emerald-600 font-medium">● En ligne</p>
          </div>
        </div>
        <div className="flex gap-3 text-homify-muted">
          <Phone className="w-5 h-5 cursor-pointer hover:text-homify-primary transition" />
          <Video className="w-5 h-5 cursor-pointer hover:text-homify-primary transition" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isSender ? 'justify-end' : 'justify-start items-end gap-2'}`}>
            {!msg.isSender && (
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=50"
                className="w-6 h-6 rounded-full mb-1"
                alt=""
              />
            )}
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                msg.isSender
                  ? 'bg-homify-primary text-white rounded-br-sm'
                  : 'bg-homify-card text-homify-text rounded-bl-sm border border-homify-border shadow-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-homify-card border-t border-homify-border flex items-center gap-2 md:pb-4">
        <button className="p-2 text-homify-muted hover:text-homify-primary transition">
          <Paperclip className="w-5 h-5" />
        </button>
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Écrivez votre message..."
            className="w-full bg-homify-surface text-homify-text rounded-full pl-4 pr-10 py-3 text-sm outline-none focus:ring-2 focus:ring-homify-primary/20 border border-homify-border"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-homify-muted hover:text-homify-primary">
            <Mic className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={handleSend}
          className="bg-homify-accent text-white p-3 rounded-full hover:bg-homify-accent-hover transition shadow-sm"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
