import { useState } from 'react';
import { Camera, ChevronDown, LogOut, User } from 'lucide-react';
import { PageHeader, inputClass, labelClass } from '@/components/layout/PageHeader';

export default function ProfileScreen() {
  const [formData, setFormData] = useState({
    name: 'Melissa Peters',
    email: 'melpeters@gmail.com',
    password: '••••••••',
    dob: '23/05/1995',
    country: 'Cameroun',
  });

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/';
  };

  return (
    <div className="px-5 md:px-0 pt-2 pb-28">
      <PageHeader greeting="Mon compte" title="Profil" showNotifications={false} />

      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-homify-card shadow-card ring-2 ring-homify-primary/20">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
              alt="Photo de profil"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            className="absolute bottom-0 right-0 bg-homify-primary p-2 rounded-full text-white border-2 border-homify-card hover:bg-homify-primary-light transition"
            aria-label="Changer la photo"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4 max-w-2xl mx-auto bg-homify-card p-6 md:p-8 rounded-modal shadow-card border border-homify-border">
        <div className="flex items-center gap-2 mb-2 pb-4 border-b border-homify-border">
          <User className="w-5 h-5 text-homify-primary" />
          <h2 className="font-bold text-homify-text">Informations personnelles</h2>
        </div>

        <div>
          <label className={labelClass}>Nom complet</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Mot de passe</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className={`${inputClass} tracking-widest`}
          />
        </div>

        <div>
          <label className={labelClass}>Date de naissance</label>
          <div className="relative">
            <input type="text" value={formData.dob} readOnly className={`${inputClass} cursor-pointer`} />
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-homify-muted w-5 h-5 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Pays / Région</label>
          <div className="relative">
            <input type="text" value={formData.country} readOnly className={`${inputClass} cursor-pointer`} />
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-homify-muted w-5 h-5 pointer-events-none" />
          </div>
        </div>

        <button className="w-full bg-homify-primary text-white font-bold py-3.5 rounded-btn mt-2 shadow-sm hover:bg-homify-primary-light transition active:scale-[0.98]">
          Enregistrer les modifications
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 border border-homify-border text-homify-muted font-semibold py-3 rounded-btn hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
