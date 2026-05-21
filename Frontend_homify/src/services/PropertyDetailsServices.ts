import React, { useState } from 'react';
import { ArrowLeft, Share2, Heart, Star, MapPin, Bath, Utensils, MessageCircle, MessageSquare } from 'lucide-react'; 
import { Hotel } from '../types';
import { PropertyImage } from '../components/PropertyImage';

interface DetailsProps {
  hotel: Hotel;
  onBack: () => void;
  onBookNow: () => void; // <--- AJOUT DE CETTE PROP
}

export default function PropertyDetailsScreen({ hotel, onBack, onBookNow }: DetailsProps) {
  const [activeTab, setActiveTab] = useState('About');
  const [showModal, setShowModal] = useState(false); // <--- AJOUT DU STATE MODAL

  // Fonction WhatsApp
  const handleWhatsApp = () => {
    const phoneNumber = "237600000000"; // Remplace par le vrai numéro
    const message = `Bonjour, je suis intéressé par : ${hotel.name}`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setShowModal(false);
  };

  // Fonction Chat Interne
  const handleInternalChat = () => {
    setShowModal(false);
    onBookNow(); // Redirige vers la page ChatScreen
  };

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-0 relative animate-in fade-in slide-in-from-bottom-10 duration-300">
      <div className="md:max-w-6xl md:mx-auto md:p-6 md:grid md:grid-cols-2 md:gap-8">
        
        {/* Section Image */}
        <div className="relative h-[400px] md:h-[500px] md:rounded-3xl overflow-hidden">
          <PropertyImage 
            src={hotel.imageUrl} 
            alt={hotel.name} 
            className="w-full h-full object-cover" 
          />
          
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pt-10 md:pt-4 z-10">
            <button onClick={onBack} className="bg-black/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-black/40 transition">
              <ArrowLeft className="w-6 h-6" />
            </button>
            
            {/* J'ai remis les boutons Share/Heart ici pour que ce soit joli */}
            <div className="flex gap-3">
              <button className="bg-black/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-black/40 transition">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="bg-black/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-black/40 transition">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

       <div className="px-5 pt-6 md:px-0 md:pt-0">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{hotel.name}</h1>
            </div>
            <div className="flex items-center gap-1 mt-1"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /><span className="text-sm font-medium text-gray-700">{hotel.rating}</span></div>
          </div>
          <p className="text-gray-500 text-sm mb-6 flex items-center gap-1"><MapPin className="w-4 h-4" /> {hotel.location}</p>

          <div className="flex border-b border-gray-100 mb-6">
            {['About', 'Gallery', 'Review'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 pr-6 text-sm font-semibold transition-colors relative ${activeTab === tab ? 'text-blue-900' : 'text-gray-400'}`}>{tab}{activeTab === tab && <span className="absolute bottom-0 left-0 w-8 h-1 bg-blue-900 rounded-t-full"></span>}</button>
            ))}
          </div>

          <div className="flex gap-6 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {[
                { icon: Bath, label: `${hotel.amenities?.baths || 1} Bath` }, 
                { icon: Utensils, label: `${hotel.amenities?.kitchen || 1} Kitchen` }
            ].map((item, idx) => (
               <div key={idx} className="flex flex-col items-center gap-2 min-w-[60px]"><div className="p-3 bg-gray-100 rounded-xl text-gray-600"><item.icon className="w-6 h-6" /></div><span className="text-xs font-medium text-gray-500">{item.label}</span></div>
            ))}
          </div>
          
          <h3 className="font-bold text-gray-900 mb-2">Description</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">{hotel.description || "No description available."}</p>

          <div className="hidden md:flex justify-between items-center pt-6 border-t">
              <div><span className="text-sm text-gray-500">Total Price</span><div className="flex items-baseline gap-1"><span className="text-2xl font-bold text-blue-900">${hotel.price}</span><span className="text-sm text-gray-400">/night</span></div></div>
              
              {/* BOUTON DESKTOP : Ouvre le modal */}
              <button 
                onClick={() => setShowModal(true)}
                className="bg-blue-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-800 transition shadow-lg"
              >
                Book Now
              </button>
          </div>
        </div>
      </div>

      {/* BOUTON MOBILE : Ouvre le modal */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-5 md:hidden z-20 flex justify-between items-center">
         <div><span className="text-xs text-gray-400 block mb-1">Total Price</span><div className="flex items-baseline gap-1"><span className="text-2xl font-bold text-blue-900">${hotel.price}</span><span className="text-sm text-gray-500">/night</span></div></div>
         <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-900 text-white px-8 py-3 rounded-full font-bold shadow-lg"
         >
            Book Now
         </button>
      </div>

      {/* --- LE MODAL DE CHOIX (POPUP) --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full md:w-[400px] rounded-t-3xl md:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 md:hidden"></div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Contact Agent</h3>
            <p className="text-gray-500 text-center mb-6 text-sm">How would you like to connect?</p>
            
            <div className="space-y-3">
              {/* Option 1: WhatsApp */}
              <button 
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-3 p-4 bg-green-50 text-green-700 rounded-xl font-bold hover:bg-green-100 transition border border-green-200"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </button>

              {/* Option 2: Messagerie Interne */}
              <button 
                onClick={handleInternalChat}
                className="w-full flex items-center justify-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition border border-blue-200"
              >
                <MessageSquare className="w-5 h-5" />
                Integrated Chat
              </button>
            </div>

            <button 
              onClick={() => setShowModal(false)}
              className="w-full mt-4 p-3 text-gray-400 font-medium hover:text-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}