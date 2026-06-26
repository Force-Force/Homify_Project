import { useState } from 'react';
import { Calculator } from 'lucide-react';

import { inputClassCompact, selectClass } from '@/lib/formStyles';

/** Calculateur de budget loyer — Cameroun (FCFA) */
export default function RentCalculator() {
  const [income, setIncome] = useState('');
  const [ratio, setRatio] = useState('30');
  const [charges, setCharges] = useState('');
  const [depositMonths, setDepositMonths] = useState('2');

  const monthlyIncome = parseFloat(income.replace(/\s/g, '')) || 0;
  const chargeAmount = parseFloat(charges.replace(/\s/g, '')) || 0;
  const ratioPct = parseFloat(ratio) || 30;
  const months = parseInt(depositMonths, 10) || 2;

  const maxRent = Math.floor((monthlyIncome * ratioPct) / 100);
  const totalMoveIn = maxRent * months + chargeAmount + maxRent;

  const fmt = (n: number) => n.toLocaleString('fr-FR');

  return (
    <div className="space-y-6">
      <p className="text-sm text-homify-muted">
        Estimez le loyer mensuel adapté à votre budget à Yaoundé, Douala ou ailleurs au Cameroun.
        Règle usuelle : ne pas dépasser 30 % du revenu net pour le loyer seul.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-homify-text mb-1.5">Revenu mensuel net (FCFA)</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Ex: 450 000"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className={inputClassCompact}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-homify-text mb-1.5">Part du revenu pour le loyer (%)</label>
          <select
            value={ratio}
            onChange={(e) => setRatio(e.target.value)}
            className={selectClass}
          >
            <option value="25">25 % — prudent</option>
            <option value="30">30 % — recommandé</option>
            <option value="35">35 % — maximum conseillé</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-homify-text mb-1.5">Charges mensuelles estimées (FCFA)</label>
          <input
            type="text"
            placeholder="Eau, électricité, gardien..."
            value={charges}
            onChange={(e) => setCharges(e.target.value)}
            className={inputClassCompact}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-homify-text mb-1.5">Caution (mois de loyer)</label>
          <select
            value={depositMonths}
            onChange={(e) => setDepositMonths(e.target.value)}
            className={selectClass}
          >
            <option value="1">1 mois</option>
            <option value="2">2 mois</option>
            <option value="3">3 mois</option>
          </select>
        </div>
      </div>

      {monthlyIncome > 0 && (
        <div className="bg-homify-primary/5 border border-homify-primary/20 rounded-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-homify-primary font-bold">
            <Calculator className="w-5 h-5" />
            Résultat
          </div>
          <p className="text-sm text-homify-text">
            Loyer mensuel conseillé :{' '}
            <span className="text-xl font-bold text-homify-accent">{fmt(maxRent)} FCFA</span>
          </p>
          <p className="text-sm text-homify-muted">
            Budget total mensuel (loyer + charges) :{' '}
            <span className="font-semibold text-homify-text">{fmt(maxRent + chargeAmount)} FCFA</span>
          </p>
          <p className="text-sm text-homify-muted">
            Frais d'entrée estimés (caution + 1er loyer + charges) :{' '}
            <span className="font-semibold text-homify-text">{fmt(totalMoveIn)} FCFA</span>
          </p>
          <p className="text-xs text-homify-muted pt-2 border-t border-homify-border">
            Quartiers populaires à Yaoundé (Bastos, Odza, Essos) et Douala (Bonapriso, Akwa) varient
            fortement — comparez sur Homify avant de vous engager.
          </p>
        </div>
      )}
    </div>
  );
}
