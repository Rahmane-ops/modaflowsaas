import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  Store, 
  Sparkles, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Lock, 
  User, 
  Crown,
  AlertTriangle,
  Building,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CreateBoutiqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: 'starter' | 'pro' | 'enterprise';
  onSuccess?: () => void;
}

export const CreateBoutiqueModal: React.FC<CreateBoutiqueModalProps> = ({
  isOpen,
  onClose,
  initialPlan = 'pro',
  onSuccess
}) => {
  const { 
    isLoggedIn, 
    currentUser, 
    registerBoutique, 
    registerUser, 
    setIsLandingPage 
  } = useStore();

  const [boutiqueName, setBoutiqueName] = useState('');
  const [city, setCity] = useState('Dakar');
  const [country, setCountry] = useState('Sénégal');
  const [phone, setPhone] = useState('+221 77 ');
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'enterprise'>(initialPlan);

  // If user is not logged in, we also collect owner credentials to create account + store in 1 step
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const popularCities = [
    { city: 'Dakar', country: 'Sénégal' },
    { city: 'Abidjan', country: 'Côte d’Ivoire' },
    { city: 'Bamako', country: 'Mali' },
    { city: 'Cotonou', country: 'Bénin' },
    { city: 'Lomé', country: 'Togo' },
    { city: 'Paris', country: 'France' },
  ];

  const plans = [
    {
      id: 'starter' as const,
      name: 'Pack Découverte',
      price: '5 900 F/mois',
      desc: '1 boutique · Vente & Reçus WhatsApp',
    },
    {
      id: 'pro' as const,
      name: 'Pack Pro',
      price: '10 900 F/mois',
      badge: 'Recommandé ⭐',
      desc: 'Ventes illimitées · Multi-vendeuses · Livreurs',
    },
    {
      id: 'enterprise' as const,
      name: 'Pack Entreprise',
      price: '29 900 F/mois',
      desc: 'Réseaux de boutiques · Exports & Rapports VIP',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!boutiqueName.trim()) {
      setError('Veuillez renseigner le nom de votre boutique.');
      return;
    }

    setIsLoading(true);

    try {
      if (isLoggedIn) {
        // User already has an account -> register new boutique for this owner
        registerBoutique({
          name: boutiqueName.trim(),
          city: city.trim() || 'Dakar',
          country: country.trim() || 'Sénégal',
          phone: phone.trim() || '+221 77 000 00 00',
          planId: selectedPlan,
        });

        setSuccessMessage(`Félicitations ! Votre boutique "${boutiqueName}" est prête.`);
        try {
          confetti({ particleCount: 70, spread: 70 });
        } catch {}

        setTimeout(() => {
          setIsLoading(false);
          onClose();
          setIsLandingPage(false);
          if (onSuccess) onSuccess();
        }, 900);

      } else {
        // User is not logged in -> register user + create boutique
        if (!ownerName.trim()) {
          setError('Veuillez renseigner votre nom complet.');
          setIsLoading(false);
          return;
        }
        if (!ownerEmail.trim()) {
          setError('Veuillez renseigner une adresse email valide.');
          setIsLoading(false);
          return;
        }
        if (!password || password.length < 6) {
          setError('Le mot de passe doit comporter au moins 6 caractères.');
          setIsLoading(false);
          return;
        }

        const res = await registerUser({
          name: ownerName.trim(),
          email: ownerEmail.trim(),
          phone: phone.trim(),
          password: password,
          storeName: boutiqueName.trim(),
          planId: selectedPlan,
        });

        if (res.success) {
          setSuccessMessage(`Bienvenue sur ModaFlow ! Votre boutique "${boutiqueName}" est créée.`);
          try {
            confetti({ particleCount: 80, spread: 80 });
          } catch {}

          setTimeout(() => {
            setIsLoading(false);
            onClose();
            setIsLandingPage(false);
            if (onSuccess) onSuccess();
          }, 900);
        } else {
          setError(res.message);
          setIsLoading(false);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue lors de la création de votre boutique.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden z-10 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Créer ma boutique de mode
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[10px]">
                  14 jours gratuits
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {isLoggedIn 
                  ? `Ajout d'un nouvel espace de travail pour ${currentUser.name}`
                  : 'Prêt(e) en moins d’une minute · Sans carte bancaire'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[82vh] overflow-y-auto space-y-5">
          
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {/* Section 1: Informations sur la Boutique */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-600" />
              <span>1. Informations de la boutique</span>
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Nom de votre boutique ou marque de mode *
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Maison Wax & Soie, Dakar Atelier, etc."
                  value={boutiqueName}
                  onChange={(e) => setBoutiqueName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Ville principale *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Dakar, Abidjan, Bamako..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Pays *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sénégal, Côte d'Ivoire..."
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* Quick City suggestions */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-600">Suggestions :</span>
              {popularCities.map((item) => (
                <button
                  key={item.city}
                  type="button"
                  onClick={() => {
                    setCity(item.city);
                    setCountry(item.country);
                  }}
                  className={`text-[11px] px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                    city.toLowerCase() === item.city.toLowerCase()
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.city}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Numéro WhatsApp / Téléphone de contact
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  placeholder="+221 77 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all font-medium"
                />
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Utilisé pour l’envoi de vos reçus et factures automatiques aux clients.
              </p>
            </div>
          </div>

          {/* Section 2: Compte Propriétaire si pas encore connecté */}
          {!isLoggedIn && (
            <div className="space-y-3.5 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>2. Vos identifiants de gérant(e)</span>
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Votre nom complet (Propriétaire) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Aïssatou Ba"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Adresse e-mail professionnelle *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="gerant@boutique.com"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Mot de passe de connexion *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Choix du Forfait */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span>{isLoggedIn ? '2.' : '3.'} Forfait sélectionné</span>
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold">
                14 jours offerts (0 FCFA aujourd'hui)
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {plans.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {plan.badge && (
                      <span className="absolute -top-2 right-2 text-[9px] font-bold bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded-full shadow-2xs">
                        {plan.badge}
                      </span>
                    )}
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-xs text-slate-900">{plan.name}</p>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                        isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                    <p className="text-xs font-extrabold text-blue-600 mb-1">{plan.price}</p>
                    <p className="text-[10px] text-slate-500 leading-tight">{plan.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Guarantee / Security info */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-600 leading-relaxed">
              <span className="font-semibold text-slate-900">Aucun paiement requis pour commencer.</span> Vos 14 jours d'essai gratuit démarrent immédiatement. Vous aurez accès complet à la caisse tactile, au stock et aux reçus WhatsApp.
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Création de votre boutique en cours...</span>
                </>
              ) : (
                <>
                  <Store className="w-4 h-4 text-blue-100" />
                  <span>Créer ma boutique maintenant</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
