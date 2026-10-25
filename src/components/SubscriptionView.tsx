import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  CreditCard, 
  Check, 
  Sparkles, 
  Crown, 
  Building2, 
  Globe, 
  ShieldCheck, 
  ArrowRight, 
  HelpCircle, 
  Smartphone, 
  ExternalLink,
  Calendar,
  Lock,
  Plus,
  Store,
  Layers,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { BoutiqueTenant, PaymentMethod, SubscriptionPlan } from '../types';

export const SubscriptionView: React.FC = () => {
  const { 
    currentBoutique, 
    boutiques, 
    setCurrentBoutique, 
    registerBoutique, 
    upgradeSubscription, 
    subscriptionPlans 
  } = useStore();

  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<SubscriptionPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave');
  const [phoneNumber, setPhoneNumber] = useState('+221 77 654 32 10');
  const [isRegisterBoutiqueOpen, setIsRegisterBoutiqueOpen] = useState(false);
  const [newBoutiqueName, setNewBoutiqueName] = useState('');
  const [newBoutiqueCity, setNewBoutiqueCity] = useState('Dakar');
  const [newBoutiquePhone, setNewBoutiquePhone] = useState('+221 77 000 00 00');
  const [newBoutiquePlan, setNewBoutiquePlan] = useState<'starter' | 'pro' | 'enterprise'>('pro');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForPayment) return;

    upgradeSubscription(selectedPlanForPayment.id, paymentMethod);
    setSelectedPlanForPayment(null);
    setIsSuccessModalOpen(true);
  };

  const handleCreateBoutique = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoutiqueName.trim()) return;

    registerBoutique({
      name: newBoutiqueName.trim(),
      city: newBoutiqueCity,
      country: newBoutiqueCity.includes('Abidjan') ? 'Côte d’Ivoire' : 'Sénégal',
      phone: newBoutiquePhone.trim(),
      planId: newBoutiquePlan,
    });

    setIsRegisterBoutiqueOpen(false);
    setNewBoutiqueName('');
  };

  const activePlan = subscriptionPlans.find((p) => p.id === currentBoutique.planId) || subscriptionPlans[1];

  return (
    <div className="pb-24 lg:pb-16 space-y-8 max-w-6xl mx-auto">
      {/* Top Banner: Current Boutique Subscription Status */}
      <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                Abonnement SaaS
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                currentBoutique.subscriptionStatus === 'actif'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {currentBoutique.subscriptionStatus === 'actif' ? 'Abonnement Actif' : 'Essai Gratuit 14 Jours'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span>{currentBoutique.name}</span>
            </h1>

            <p className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
              <span>{currentBoutique.city}, {currentBoutique.country}</span>
              <span>·</span>
              <span>Tél : {currentBoutique.phone}</span>
              <span>·</span>
              <span>Formule : <strong className="text-slate-900">{activePlan.name}</strong></span>
            </p>
          </div>

          {/* Quick Renewal / Status Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                Prochain renouvellement
              </span>
              <p className="text-base font-bold text-slate-900 mt-0.5 tabular-nums">
                {currentBoutique.subscriptionExpiresAt}
              </p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                {currentBoutique.daysRemaining} jours restants
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedPlanForPayment(activePlan)}
                className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs active:scale-98 flex items-center gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Renouveler</span>
              </button>

              <button
                onClick={() => setIsRegisterBoutiqueOpen(true)}
                className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                title="Inscrire une nouvelle boutique cliente"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouvelle boutique</span>
              </button>
            </div>
          </div>
        </div>

        {/* Multi-Boutique Switcher Pills */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 font-medium">Boutique en cours :</span>
          {boutiques.map((b) => {
            const isSelected = b.id === currentBoutique.id;
            return (
              <button
                key={b.id}
                onClick={() => setCurrentBoutique(b)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{b.name}</span>
                <span className="text-[10px] opacity-75">({b.city})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PRICING PLANS GRID */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Formules d'Abonnement Mensuel pour les Boutiques
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Chaque boutique cliente souscrit à son forfait mensuel réglé automatiquement par Wave, Orange Money ou Carte bancaire.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subscriptionPlans.map((plan) => {
            const isCurrent = plan.id === currentBoutique.planId;
            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all ${
                  plan.isPopular
                    ? 'bg-white border-2 border-amber-500 shadow-xl ring-4 ring-amber-500/10'
                    : 'bg-white border border-neutral-200 shadow-xs hover:border-neutral-300'
                }`}
              >
                {/* Popular badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-amber-500 text-neutral-950 text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-neutral-900">{plan.name}</h3>
                    <p className="text-xs text-neutral-500 mt-1 min-h-[36px]">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="py-4 border-y border-neutral-100 mb-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-extrabold font-mono text-neutral-900 tabular-nums">
                        {plan.priceMonthly.toLocaleString('fr-FR')}
                      </span>
                      <span className="text-xs font-semibold text-neutral-500 font-sans">
                        FCFA / mois
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 mt-0.5 block">
                      Sans engagement · Annulable à tout moment
                    </span>
                  </div>

                  {/* Features list */}
                  <div className="space-y-2.5 mb-6 text-xs text-neutral-700">
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                <div>
                  {isCurrent ? (
                    <button
                      onClick={() => setSelectedPlanForPayment(plan)}
                      className="w-full py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Renouveler ce forfait</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedPlanForPayment(plan)}
                      className="w-full py-3 rounded-2xl border-2 border-neutral-900 hover:bg-neutral-900 hover:text-white text-neutral-900 text-xs font-bold transition-all active:scale-95"
                    >
                      Choisir cette formule
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PUBLISHING & MONETIZATION GUIDE (How to publish & sell to boutiques) */}
      <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
          <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-neutral-900">
              Guide : Comment Publier et Commercialiser ce SaaS auprès des Boutiques
            </h3>
            <p className="text-xs text-neutral-500">
              Étapes concrètes pour lancer votre service en ligne et encaisser les abonnements mensuels.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Step 1: Production URL */}
          <div className="p-4 rounded-2xl bg-neutral-50/70 border border-neutral-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                1
              </span>
              <h4 className="font-bold text-neutral-900 text-sm">
                Lien de Production Public Actif
              </h4>
            </div>
            <p className="text-neutral-600 leading-relaxed">
              Votre application est déjà compilée et hébergée sur Google Cloud Run avec une URL publique permanente :
            </p>
            <div className="p-2.5 rounded-xl bg-white border border-neutral-200 font-mono text-[11px] text-neutral-800 break-all select-all flex items-center justify-between">
              <span>https://ais-pre-6wkzghgfgrdswcdwmnkrwz-307132903369.europe-west3.run.app</span>
            </div>
            <p className="text-[11px] text-neutral-500">
              Vous pouvez partager ce lien immédiatement sur WhatsApp, Instagram ou aux gérants de boutiques pour leur faire tester le logiciel.
            </p>
          </div>

          {/* Step 2: Custom Domain */}
          <div className="p-4 rounded-2xl bg-neutral-50/70 border border-neutral-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                2
              </span>
              <h4 className="font-bold text-neutral-900 text-sm">
                Nom de Domaine Personnalisé
              </h4>
            </div>
            <p className="text-neutral-600 leading-relaxed">
              Pour faire très professionnel auprès des commerçants, achetez un nom de domaine (ex: <code className="bg-white px-1 rounded border">www.modaflow-saas.com</code> ou <code className="bg-white px-1 rounded border">www.vetix.sn</code> chez Gandi, Namecheap ou OVH).
            </p>
            <p className="text-[11px] text-neutral-500">
              Il suffit d'ajouter un enregistrement <strong>CNAME</strong> pointant vers votre service Cloud Run pour que les boutiques se connectent sous votre marque.
            </p>
          </div>

          {/* Step 3: Payment gateway for subscriptions */}
          <div className="p-4 rounded-2xl bg-neutral-50/70 border border-neutral-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                3
              </span>
              <h4 className="font-bold text-neutral-900 text-sm">
                Encaissement Automatique des Abonnements
              </h4>
            </div>
            <p className="text-neutral-600 leading-relaxed">
              Pour prélever automatiquement les <strong>5 900 F / 10 900 F / 29 900 F par mois</strong> :
            </p>
            <ul className="space-y-1 text-neutral-600 list-disc list-inside">
              <li><strong>Wave Business (Merchant API)</strong> : Prélèvement direct par QR Code ou push mobile.</li>
              <li><strong>Orange Money Web Payment</strong> : Paiement sécurisé avec OTP.</li>
              <li><strong>Passerelle agrégée (PayTech ou PayDunya)</strong> : Un seul contrat pour accepter Wave, Orange Money, Free Money et Cartes Visa/Mastercard.</li>
            </ul>
          </div>

          {/* Step 4: Acquisition & Sales strategy */}
          <div className="p-4 rounded-2xl bg-neutral-50/70 border border-neutral-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                4
              </span>
              <h4 className="font-bold text-neutral-900 text-sm">
                Stratégie Commerciale Terrain
              </h4>
            </div>
            <p className="text-neutral-600 leading-relaxed">
              Approchez les gérantes de boutiques de prêt-à-porter (Dakar Plateau, Maristes, Almadies, Abidjan Cocody...) :
            </p>
            <p className="text-[11px] text-neutral-600">
              Proposez-leur <strong>14 jours d’essai 100% gratuit</strong> sans carte requise. Dès qu'elles voient les stocks se décompter en direct, leurs livreurs utiliser le cockpit WhatsApp et les factures Wave générées en 1 seconde, elles souscrivent naturellement au forfait mensuel !
            </p>
          </div>
        </div>
      </div>

      {/* MODAL 1: Payment Simulation (Wave / Orange Money / Carte) */}
      {selectedPlanForPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full my-auto shadow-2xl overflow-hidden border border-neutral-200 animate-in zoom-in-95 flex flex-col">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Régler l'Abonnement Mensuel
                </h3>
                <p className="text-xs text-neutral-500">
                  {selectedPlanForPayment.name} · {currentBoutique.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedPlanForPayment(null)}
                className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecutePayment} className="p-6 space-y-4 text-xs">
              {/* Plan recap */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                    Formule Sélectionnée
                  </span>
                  <p className="font-bold text-neutral-900 text-sm">{selectedPlanForPayment.name}</p>
                  <p className="text-[11px] text-neutral-500">Renouvellement pour 30 jours</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold font-mono text-neutral-900 tabular-nums">
                    {selectedPlanForPayment.priceMonthly.toLocaleString('fr-FR')}
                  </span>
                  <span className="text-xs block text-neutral-500">FCFA</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block font-semibold text-neutral-700 mb-2">
                  Choisir le moyen de paiement de la boutique :
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wave')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                      paymentMethod === 'wave'
                        ? 'border-[#00A3FF] bg-[#00A3FF]/15 text-[#0070AA] ring-2 ring-[#00A3FF]'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    <span className="w-6 h-6 rounded-full bg-[#00A3FF] text-white font-bold flex items-center justify-center text-xs mb-1">
                      W
                    </span>
                    <span className="font-bold">Wave</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('orange_money')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                      paymentMethod === 'orange_money'
                        ? 'border-[#FF6600] bg-[#FF6600]/15 text-[#D15500] ring-2 ring-[#FF6600]'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    <span className="w-6 h-6 rounded-full bg-[#FF6600] text-white font-bold flex items-center justify-center text-xs mb-1">
                      OM
                    </span>
                    <span className="font-bold">Orange M.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-emerald-600 bg-emerald-50 text-neutral-900 ring-2 ring-emerald-600'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs mb-1">
                      💳
                    </span>
                    <span className="font-bold">Carte / Visa</span>
                  </button>
                </div>
              </div>

              {/* Phone number */}
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Numéro de compte pour le prélèvement :
                </label>
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+221 77 123 45 67"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-mono font-bold focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
                <p className="text-[10px] text-neutral-400 mt-1">
                  Une notification de validation de paiement sera envoyée sur votre téléphone.
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlanForPayment(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Confirmer & Payer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Register New Boutique */}
      {isRegisterBoutiqueOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full my-auto shadow-2xl overflow-hidden border border-neutral-200 animate-in zoom-in-95 flex flex-col">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Inscrire une Nouvelle Boutique
                </h3>
                <p className="text-xs text-neutral-500">
                  Création d'un espace SaaS dédié avec 14 jours d'essai gratuit.
                </p>
              </div>
              <button
                onClick={() => setIsRegisterBoutiqueOpen(false)}
                className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBoutique} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Nom de la boutique ou enseigne *
                </label>
                <input
                  type="text"
                  required
                  value={newBoutiqueName}
                  onChange={(e) => setNewBoutiqueName(e.target.value)}
                  placeholder="Ex: Douala Fashion Glam"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Ville</label>
                  <select
                    value={newBoutiqueCity}
                    onChange={(e) => setNewBoutiqueCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                  >
                    <option value="Dakar">Dakar (Sénégal)</option>
                    <option value="Abidjan">Abidjan (Côte d’Ivoire)</option>
                    <option value="Douala">Douala (Cameroun)</option>
                    <option value="Lomé">Lomé (Togo)</option>
                    <option value="Cotonou">Cotonou (Bénin)</option>
                    <option value="Paris">Paris (France)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Contact Tél</label>
                  <input
                    type="tel"
                    required
                    value={newBoutiquePhone}
                    onChange={(e) => setNewBoutiquePhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-mono focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Pack choisi pour l'essai gratuit :
                </label>
                <select
                  value={newBoutiquePlan}
                  onChange={(e) => setNewBoutiquePlan(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                >
                  <option value="pro">Pack Pro Vendeur & Livraisons (10 900 F/mois) ⭐</option>
                  <option value="starter">Pack Découverte (5 900 F/mois)</option>
                  <option value="enterprise">Pack Multi-Boutiques & Réseaux (29 900 F/mois) 👑</option>
                </select>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterBoutiqueOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold shadow-xs active:scale-95"
                >
                  Activer l'Essai 14 Jours
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Success Celebration */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-base font-bold text-neutral-900">
                Abonnement Activé avec Succès !
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Le paiement pour la boutique <strong>{currentBoutique.name}</strong> a été validé. Votre accès complet est prolongé de 30 jours.
              </p>
            </div>

            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold text-xs"
            >
              Accéder à la boutique
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
