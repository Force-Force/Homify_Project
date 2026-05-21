// Fichier: src/screens/ChatScreen.tsx
import React, { useState } from 'react';
import { ArrowLeft, Phone, Video, Send, Mic, Paperclip } from 'lucide-react';

interface ChatProps {
  onBack: () => void;
  agentName: string;
}

interface Message {
  id: number;
  text: string;
  isSender: boolean; // true = moi (bleu), false = l'autre (gris)
  time: string;
}

export default function ChatScreen({ onBack, agentName }: ChatProps) {
  const [inputText, setInputText] = useState("");
  
  // Données initiales simulées
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: `Hello ${agentName}, I am interested in this property.`, isSender: true, time: "10:00" },
    { id: 2, text: "Hello! Thanks for reaching out. How can I help you today?", isSender: false, time: "10:01" },
  ]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    // Ajouter mon message
    const newMessage = { id: Date.now(), text: inputText, isSender: true, time: "10:05" };
    setMessages([...messages, newMessage]);
    setInputText("");

    // Simuler une réponse auto
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "I am available for a visit tomorrow.",
        isSender: false,
        time: "10:06"
      }]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-white animate-in slide-in-from-right duration-300">
      
      {/* --- HEADER --- */}
      <div className="px-4 py-3 border-b flex items-center justify-between bg-white shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <div className="relative">
             <img 
               src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100" 
               alt="Avatar" 
               className="w-10 h-10 rounded-full object-cover"
             />
             <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-sm">{agentName}</h2>
            <p className="text-xs text-green-600 font-medium">● Online</p>
          </div>
        </div>
        <div className="flex gap-4 text-gray-600">
          <Phone className="w-5 h-5 cursor-pointer hover:text-blue-600" />
          <Video className="w-5 h-5 cursor-pointer hover:text-blue-600" />
        </div>
      </div>

      {/* --- LISTE DES MESSAGES --- */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isSender ? 'justify-end' : 'justify-start items-end gap-2'}`}>
            
            {!msg.isSender && (
               <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=50" className="w-6 h-6 rounded-full mb-1" />
            )}

            <div 
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                msg.isSender 
                  ? 'bg-blue-600 text-white rounded-br-none' // Style Envoyeur (Bleu)
                  : 'bg-white text-gray-700 rounded-bl-none border border-gray-200' // Style Receveur (Gris/Blanc)
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* --- INPUT AREA --- */}
      <div className="p-3 bg-white border-t flex items-center gap-2">
        <button className="p-2 text-gray-400 hover:text-gray-600">
            <Paperclip className="w-5 h-5" />
        </button>
        <div className="flex-1 relative">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Write your message" 
              className="w-full bg-gray-100 text-gray-700 rounded-full pl-4 pr-10 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100"
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
               <Mic className="w-5 h-5" />
            </button>
        </div>
        <button 
          onClick={handleSend}
          className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition shadow-lg shadow-blue-200"
        >
          <Send className="w-5 h-5 ml-0.5" />
        </button>
      </div>

    </div>
  );
}