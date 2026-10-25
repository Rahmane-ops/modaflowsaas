import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  Receipt, 
  CreditCard, 
  Calendar, 
  Tag, 
  AlertCircle, 
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { PaymentMethod } from '../types';

interface NewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXPENSE_CATEGORIES = [
  { id: 'loyer', label: 'Loyer du local commercial' },
  { id: 'electricite', label: 'Électricité (Senelec) / Eau' },
  { id: 'salaires', label: 'Salaires & Primes du personnel' },
  { id: 'emballages', label: 'Emballages & Sacs shopping kraft' },
  { id: 'transport', label: 'Transport & Frais de livraison' },
  { id: 'achat_fournitures', label: 'Fournitures de caisse & magasin' },
  { id: 'marketing', label: 'Publicité & Marketing digital' },
  { id: 'autre', label: 'Autre charge d’exploitation' },
];

export const NewExpenseModal: React.FC<NewExpenseModalProps> = ({ isOpen, onClose }) => {
  const { addExpense, currentUser, currentBoutique } = useStore();

  const [category, setCategory] = useState('loyer');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [date, setDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [beneficiary, setBeneficiary] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseInt(amount.replace(/\D/g, ''), 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Veuillez saisir un montant valide supérieur à 0 FCFA.');
      return;
    }

    if (!description.trim()) {
      setError('Veuillez préciser le motif ou la description de la dépense.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addExpense({
        amount: parsedAmount,
        expenseCategory: category,
        description: description.trim(),
        paymentMethod,
        beneficiary: beneficiary.trim() || undefined,
        date,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsSubmitting(false);
        setDescription('');
        setAmount('');
        setBeneficiary('');
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err?.message || "Erreur lors de l'enregistrement de la dépense.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Enregistrer une Dépense
              </h2>
              <p className="text-xs text-slate-300">
                Débit automatique du compte de règlement et mise à jour du grand livre.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Dépense enregistrée avec succès dans Cloud Firestore !</span>
            </div>
          )}

          {/* Amount input */}
          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">
              Montant décaissé (FCFA) *
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                required
                placeholder="Ex : 25 000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2.5 pl-9 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-600"
              />
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">
              Catégorie de la dépense *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-600 bg-white"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">
              Motif / Libellé de la dépense *
            </label>
            <input
              type="text"
              required
              placeholder="Ex : Règlement facture électricité showroom du mois"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-600"
            />
          </div>

          {/* Beneficiary */}
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Bénéficiaire / Fournisseur (Optionnel)
            </label>
            <input
              type="text"
              placeholder="Ex : Propriétaire bailleur / Senelec"
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-600"
            />
          </div>

          {/* Payment Method & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">
                Compte débité *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-600 bg-white"
              >
                <option value="cash">Caisse Espèces (Cash)</option>
                <option value="wave">Compte Wave Mobile Money</option>
                <option value="orange_money">Compte Orange Money</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">
                Date de décaissement *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-600 bg-white"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Enregistrement...' : 'Valider la dépense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
