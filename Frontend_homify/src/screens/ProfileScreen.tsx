// Fichier: src/screens/ProfileScreen.tsx
import React, { useState } from 'react';
import { ArrowLeft, Camera, ChevronDown } from 'lucide-react';

export default function ProfileScreen() {
  // On gère les données du formulaire dans le state
  const [formData, setFormData] = useState({
    name: "Melissa Peters",
    email: "melpeters@gmail.com",
    password: "password123",
    dob: "23/05/1995",
    country: "Nigeria"
  });

  return (
    <div className="px-4 pt-6 pb-24 animate-in slide-in-from-right-10 duration-300 bg-white min-h-screen">
      
      {/* Header */}
      <div className="flex items-center mb-8 relative">
        <button className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition">
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 absolute left-1/2 transform -translate-x-1/2">
          Edit Profile
        </h1>
      </div>

      {/* Photo de profil */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
             <img 
               src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200" 
               alt="Profile" 
               className="w-full h-full object-cover" 
             />
          </div>
          {/* Bouton caméra (Edit) */}
          <button className="absolute bottom-1 right-1 bg-blue-900 p-2 rounded-full text-white border-2 border-white hover:bg-blue-800 transition">
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Formulaire */}
      <div className="space-y-5">
        
        {/* Champ Name */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full p-4 bg-gray-50 rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        {/* Champ Email */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full p-4 bg-gray-50 rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        {/* Champ Password */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full p-4 bg-gray-50 rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 tracking-widest transition"
          />
        </div>

        {/* Champ Date of Birth (Select simulé) */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Date of Birth</label>
          <div className="relative cursor-pointer group">
             <input
              type="text"
              value={formData.dob}
              readOnly
              className="w-full p-4 bg-gray-50 rounded-xl text-gray-700 outline-none cursor-pointer group-hover:bg-gray-100 transition"
            />
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          </div>
        </div>

        {/* Champ Country (Select simulé) */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Country/Region</label>
          <div className="relative cursor-pointer group">
             <input
              type="text"
              value={formData.country}
              readOnly
              className="w-full p-4 bg-gray-50 rounded-xl text-gray-700 outline-none cursor-pointer group-hover:bg-gray-100 transition"
            />
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          </div>
        </div>

        {/* Bouton Sauvegarder */}
        <button className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl mt-4 shadow-lg shadow-blue-200 hover:bg-blue-800 transition transform active:scale-95">
          Save changes
        </button>
      </div>
    </div>
  );
}