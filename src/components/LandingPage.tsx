import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Sparkles, 
  ShoppingBag, 
  Smartphone, 
  Bike, 
  BarChart3, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Layers, 
  Clock, 
  Users, 
  Zap, 
  CreditCard, 
  CheckCircle2, 
  HelpCircle, 
  Star,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  ExternalLink,
  Laptop,
  PlayCircle,
  Heart,
  Store,
  Shield,
  FileText,
  Plus
} from 'lucide-react';
import { CreateBoutiqueModal } from './CreateBoutiqueModal';

interface LandingPageProps {
  onOpenAuth: (tab?: 'login' | 'register', planId?: 'starter' | 'pro' | 'enterprise') => void;
  onEnterDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onEnterDashboard }) => {
  const { isLoggedIn, currentUser, currentBoutique } = useStore();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [previewTab, setPreviewTab] = useState<'caisse' | 'stock' | 'facture' | 'rapport'>('caisse');
  
  // Dedicated Quick Access "Créer ma boutique" modal state
  const [isCreateBoutiqueModalOpen, setIsCreateBoutiqueModalOpen] = useState(false);
  const [createBoutiquePlan, setCreateBoutiquePlan] = useState<'starter' | 'pro' | 'enterprise'>('pro');

  const handleOpenCreateBoutique = (planId: 'starter' | 'pro' | 'enterprise' = 'pro') => {
    setCreateBoutiquePlan(planId);
    setIsCreateBoutiqueModalOpen(true);
  };

  const plans = [
    {
      id: 'starter' as const,
      name: 'Pack Découverte',
      badge: 'Pour démarrer seul',
      priceMonthly: 5900,
      priceYearly: 59000,
      description: 'L’essentiel pour informatiser votre boutique de mode et arrêter les carnets papier.',
      features: [
        '1 Boutique (physique ou en ligne)',
        'Caisse tactile ultra-rapide',
        'Paiements Wave, Orange Money & Espèces',
        'Factures automatiques au format PDF',
        'Envoi instantané sur WhatsApp',
        'Suivi du stock & alertes ruptures',
        'Assistance WhatsApp 6j/7',
      ],
      isPopular: false,
      ctaText: 'Choisir le Pack Découverte',
    },
    {
      id: 'pro' as const,
      name: 'Pack Pro',
      badge: 'Le plus populaire ⭐',
      priceMonthly: 10900,
      priceYearly: 109000,
      description: 'Pour les boutiques actives avec plusieurs vendeuses, livreurs et fort volume de ventes.',
      features: [
        'Ventes & Produits illimités',
        'Espace Livreurs en direct (1-clic WhatsApp)',
        'Comptabilité automatique Wave & Orange Money',
        'Carnet d’adresses & fidélité clientes (VIP)',
        'Gestion des retours & échanges sans erreur',
        'Comptes employés avec permissions sécurisées',
        'Accessible sur smartphone, tablette & ordinateur',
        'Support prioritaire 7j/7',
      ],
      isPopular: true,
      ctaText: 'Choisir le Pack Pro',
    },
    {
      id: 'enterprise' as const,
      name: 'Pack Entreprise',
      badge: 'Grands Ateliers & Réseaux',
      priceMonthly: 29900,
      priceYearly: 299000,
      description: 'Pour les marques de mode, ateliers de haute couture et enseignes avec plusieurs magasins.',
      features: [
        'Tout le Pack Pro en illimité',
        'Multi-boutiques (Dakar, Abidjan, Bamako...)',
        'Nombre illimité d’employés & livreurs',
        'Rapports financiers complets & Export Excel',
        'Contrôle ultra-sécurisé des caisses',
        'Historique d’audit des suppressions et remises',
        'Formation personnalisée de vos équipes',
        'Gestionnaire de compte dédié par téléphone',
      ],
      isPopular: false,
      ctaText: 'Choisir le Pack Entreprise',
    },
  ];

  const faqs = [
    {
      q: 'Est-ce difficile à utiliser si je ne m’y connais pas en informatique ?',
      a: 'Absolument pas ! ModaFlow a été conçu spécialement pour être utilisé en quelques secondes par n’importe qui, même sans aucune formation. Les boutons sont gros, les étapes sont évidentes, et tout est écrit en français simple.',
    },
    {
      q: 'Comment s’effectuent les encaissements Wave et Orange Money ?',
      a: 'Lors d’une vente, vous choisissez simplement le moyen de paiement (Wave, Orange Money ou Espèces). ModaFlow enregistre la transaction et sépare automatiquement vos totaux pour que votre caisse tombe toujours juste à la fin de la journée.',
    },
    {
      q: 'Puis-je utiliser ModaFlow sur mon téléphone portable ?',
      a: 'Oui ! ModaFlow s’adapte parfaitement aux smartphones (iPhone et Android), aux tablettes et aux ordinateurs. Vos vendeuses peuvent enregistrer une vente depuis leur téléphone dans la boutique.',
    },
    {
      q: 'Mes employées peuvent-elles voir mes bénéfices ou modifier les prix ?',
      a: 'Non, sauf si vous le décidez ! Grâce au système de rôles (Propriétaire, Vendeuse, Caissier, Livreur), chaque personne ne voit que ce dont elle a besoin. Vos bénéfices et marges restent strictement confidentiels.',
    },
    {
      q: 'L’essai gratuit nécessite-t-il une carte bancaire ?',
      a: 'Non ! Vous pouvez tester ModaFlow gratuitement pendant 14 jours, sans entrer de carte bancaire ni d’engagement. Vous activez votre abonnement simplement par Wave ou Orange Money quand vous êtes convaincu(e).',
    },
  ];

  const testimonials = [
    {
      name: 'Aïssatou Ba',
      boutique: 'Maison Wax & Soie',
      city: 'Dakar, Sénégal',
      avatar: '👗',
      text: 'Avant ModaFlow, on perdait un temps fou sur nos cahiers de vente. Maintenant, en 3 clics, la cliente a son reçu WhatsApp et le stock de robes est mis à jour. Même mes nouvelles vendeuses ont compris en 5 minutes !',
    },
    {
      name: 'Kouassi Brou',
      boutique: 'Élégance Couture',
      city: 'Abidjan, Côte d’Ivoire',
      avatar: '👔',
      text: 'Le point fort pour moi, c’est le suivi Wave et Orange Money. En fin de journée, je sais exactement combien est entré sur chaque compte sans faire d’erreurs de calcul.',
    },
    {
      name: 'Mariama Traoré',
      boutique: 'Atelier Mandingue',
      city: 'Bamako, Mali',
      avatar: '✨',
      text: 'Nos livreurs reçoivent les commandes avec le numéro WhatsApp du client directement. Ça a réduit les retours et les retards de moitié.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-amber-100 selection:text-neutral-900 font-sans">
      
      {/* 1. Header Navigation (Pure Crisp White) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/favicon.png"
              alt="ModaFlow Logo"
              className="w-10 h-10 rounded-2xl object-cover shadow-sm hover:scale-105 transition-transform"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-neutral-950 font-sans">
                  ModaFlow
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                  SaaS Mode
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-medium hidden sm:block">
                Logiciel de gestion de boutique facile & épuré
              </p>
            </div>
          </div>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-neutral-600">
            <a href="#facile" className="hover:text-neutral-950 transition-colors">
              Comment ça marche
            </a>
            <a href="#apercu" className="hover:text-neutral-950 transition-colors">
              Aperçu en direct
            </a>
            <a href="#tarifs" className="hover:text-neutral-950 transition-colors">
              Tarifs des Forfaits
            </a>
            <a href="#temoignages" className="hover:text-neutral-950 transition-colors">
              Avis Clientes
            </a>
            <a href="#faq" className="hover:text-neutral-950 transition-colors">
              Questions
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onOpenAuth('login')}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Se Connecter
            </button>

            {isLoggedIn ? (
              <button
                onClick={onEnterDashboard}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Accéder à ma boutique</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
              </button>
            ) : (
              <button
                onClick={() => onOpenAuth('register', 'pro')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Essai Gratuit</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
            )}
          </div>

        </div>
      </header>

      {/* 2. Hero Section (Ultra-sleek White, High Legibility, No Clutter) */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        
        {/* Simple Trust Kicker */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>La solution N°1 pour les boutiques de mode & créateurs</span>
        </div>

        {/* Big Crisp Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-6">
          Gérez votre boutique de mode. <br className="hidden sm:inline" />
          <span className="text-slate-500 font-extrabold">Tellement simple que tout le monde peut l'utiliser.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          Finis les cahiers perdus et les erreurs de calcul. Enregistrez vos ventes en 10 secondes, partagez le reçu sur WhatsApp, gérez vos stocks et suivez vos encaissements <span className="font-bold text-slate-900">Wave, Orange Money & Espèces</span>.
        </p>

        {/* Big Obvious Action Buttons - Avec bouton CRÉER MA BOUTIQUE proéminent */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
          <button
            onClick={() => handleOpenCreateBoutique('pro')}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
          >
            <Store className="w-5 h-5 text-blue-100 group-hover:scale-105 transition-transform" />
            <span>Créer ma boutique</span>
            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={onEnterDashboard}
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <PlayCircle className="w-4 h-4 text-slate-500" />
            <span>Tester la démo en direct</span>
          </button>
        </div>

        {/* Simple Guarantees */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>14 jours gratuits sans carte bancaire</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Compatible téléphones & tablettes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Prise en main en moins de 10 minutes</span>
          </div>
        </div>

      </section>

      {/* 3. Section "Comment ça marche ?" (Conçu pour les nuls en informatique) */}
      <section id="facile" className="py-16 sm:py-20 bg-neutral-50/70 border-y border-neutral-200/80 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Une simplicité enfantine
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-neutral-950 tracking-tight mt-2">
              Comment ça fonctionne en 3 étapes simples
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 mt-3">
              Vous n'avez pas besoin de formation technique. ModaFlow a été pensé pour que vos vendeuses soient autonomes dès le premier jour.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-neutral-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black text-xl mb-5">
                  1
                </div>
                <h3 className="text-lg font-bold text-neutral-950 mb-2">
                  Ajoutez vos vêtements
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Renseignez le nom (ex: <em>Robe Wax Émeraude</em>), les tailles chiffrées (36, 38, 40, 42), le stock par taille et vos prix. C'est prêt !
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-100 text-xs font-semibold text-neutral-500">
                ⏱️ Moins d'une minute par article
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-neutral-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xl mb-5">
                  2
                </div>
                <h3 className="text-lg font-bold text-neutral-950 mb-2">
                  Encaissez la cliente
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Au comptoir ou au téléphone : cliquez sur le vêtement, sélectionnez <strong>Wave, Orange Money ou Espèces</strong>, et validez la vente.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-100 text-xs font-semibold text-neutral-500">
                ⚡ Vente enregistrée en 10 secondes
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-neutral-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-xl mb-5">
                  3
                </div>
                <h3 className="text-lg font-bold text-neutral-950 mb-2">
                  Partagez le reçu WhatsApp
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  La facture PDF est générée immédiatement. Un simple clic pour l’envoyer à la cliente sur WhatsApp ou l'imprimer. Tout votre stock est à jour !
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-100 text-xs font-semibold text-neutral-500">
                📲 Professionnel & sans erreur
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. Aperçu interactif en direct (Clean White Dashboard Mockup) */}
      <section id="apercu" className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
            Interface Épurée & Intuitive
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-neutral-950 tracking-tight mt-2">
            Voyez comme tout est clair et lisible
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 mt-2">
            Cliquez sur les onglets ci-dessous pour découvrir chaque écran de l’application.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setPreviewTab('caisse')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              previewTab === 'caisse'
                ? 'bg-neutral-950 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/80'
            }`}
          >
            🛍️ Caisse & Vente Rapide
          </button>
          <button
            onClick={() => setPreviewTab('stock')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              previewTab === 'stock'
                ? 'bg-neutral-950 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/80'
            }`}
          >
            🏷️ Vêtements & Alertes Stock
          </button>
          <button
            onClick={() => setPreviewTab('facture')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              previewTab === 'facture'
                ? 'bg-neutral-950 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/80'
            }`}
          >
            📄 Reçus & WhatsApp
          </button>
          <button
            onClick={() => setPreviewTab('rapport')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              previewTab === 'rapport'
                ? 'bg-neutral-950 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/80'
            }`}
          >
            💰 Caisse Wave, OM & Cash
          </button>
        </div>

        {/* Interactive Mockup Container (Pure White & Crisp) */}
        <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-lg p-6 sm:p-8 max-w-4xl mx-auto">
          
          {previewTab === 'caisse' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div>
                  <h4 className="font-bold text-base text-neutral-950">Interface de Caisse Tactile</h4>
                  <p className="text-xs text-neutral-500">Sélectionnez les pièces demandées par la cliente</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                  ● Mode Vente Directe
                </span>
              </div>

              {/* Sample Product Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/50 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">Robe Soie & Bazin Or</span>
                    <span className="text-xs text-neutral-500 block">Tailles : M, L · Reste : 12</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-black text-sm text-neutral-950">35 000 FCFA</span>
                    <span className="px-2 py-1 rounded-lg bg-neutral-950 text-white text-xs font-bold">+ Vendre</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/50 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">Ensemble Chemisier Lin</span>
                    <span className="text-xs text-neutral-500 block">Tailles : 36, 38, 40 · Reste : 8</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-black text-sm text-neutral-950">28 000 FCFA</span>
                    <span className="px-2 py-1 rounded-lg bg-neutral-950 text-white text-xs font-bold">+ Vendre</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-amber-300 bg-amber-50/40 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">Combinaison Wax Royale</span>
                    <span className="text-xs text-amber-700 font-semibold block">⚠️ Alerte Stock : Reste 2</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-black text-sm text-neutral-950">42 000 FCFA</span>
                    <span className="px-2 py-1 rounded-lg bg-neutral-950 text-white text-xs font-bold">+ Vendre</span>
                  </div>
                </div>
              </div>

              {/* Payment Selector Simulation */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-neutral-500 block">Total de la commande :</span>
                  <span className="text-xl font-black text-neutral-950">63 000 FCFA</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold">
                    💙 Wave
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-orange-50 text-orange-800 border border-orange-200 text-xs font-bold">
                    🍊 Orange Money
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                    💵 Espèces
                  </span>
                </div>
              </div>
            </div>
          )}

          {previewTab === 'stock' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h4 className="font-bold text-base text-neutral-950">Vue Stock Simplifiée</h4>
                <span className="text-xs text-neutral-500">Mise à jour automatique à chaque vente</span>
              </div>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-neutral-900">Robe Cocktail Wax & Satin</p>
                    <p className="text-xs text-neutral-500">SKU: ROB-004 · Tailles : S (4), M (6), L (2)</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      12 en stock
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-neutral-900">Boubou Riche 3 Pièces</p>
                    <p className="text-xs text-neutral-500">SKU: BOU-002 · Taille Unique</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                      ⚠️ Stock bas (1 restant)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {previewTab === 'facture' && (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-xl">
                ✓
              </div>
              <h4 className="text-lg font-bold text-neutral-950">Vente N° FAC-2026-089 Validée</h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                La cliente Fatou Diallo reçoit son reçu au format PDF propre avec l'en-tête de votre boutique.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button 
                  onClick={onEnterDashboard}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Envoyer sur WhatsApp</span>
                </button>
                <button 
                  onClick={onEnterDashboard}
                  className="px-4 py-2 bg-neutral-100 text-neutral-800 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>Imprimer le Ticket</span>
                </button>
              </div>
            </div>
          )}

          {previewTab === 'rapport' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h4 className="font-bold text-base text-neutral-950">Solde de Caisse du Jour</h4>
                <span className="text-xs text-emerald-600 font-bold">100% équilibré</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200">
                  <span className="text-xs font-bold text-blue-900 block">Wave</span>
                  <span className="text-base font-black text-neutral-950">145 000 F</span>
                </div>
                <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200">
                  <span className="text-xs font-bold text-orange-900 block">Orange Money</span>
                  <span className="text-base font-black text-neutral-950">80 000 F</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-900 block">Espèces Caisse</span>
                  <span className="text-base font-black text-neutral-950">110 000 F</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </section>

      {/* 5. Section Tarifs & Choix du Plan (Transparent & Clean) */}
      <section id="tarifs" className="py-16 sm:py-24 bg-neutral-50/60 border-t border-neutral-200/80 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Tarification Transparente
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight mt-2">
              Choisissez le forfait adapté à votre boutique
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 mt-2">
              Tarifs simples en Francs CFA (FCFA). Aucun frais caché. Annulable à tout moment.
            </p>

            {/* Toggle Monthly / Yearly */}
            <div className="mt-6 inline-flex items-center gap-2 p-1 bg-white border border-neutral-200 rounded-2xl shadow-2xs">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-neutral-950 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Paiement Mensuel
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-neutral-950 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <span>Paiement Annuel</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-400 text-neutral-950 text-[10px] font-black">
                  2 mois offerts 🎉
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan) => {
              const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all relative ${
                    plan.isPopular
                      ? 'border-2 border-neutral-950 shadow-xl ring-4 ring-neutral-950/5'
                      : 'border border-neutral-200 shadow-xs hover:border-neutral-300'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-neutral-950 text-white text-[11px] font-extrabold uppercase tracking-wider">
                      Recommandé pour débuter ⭐
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-black text-neutral-950">{plan.name}</h3>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                        {plan.badge}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
                      {plan.description}
                    </p>

                    {/* Price display */}
                    <div className="mb-6 pb-6 border-b border-neutral-100">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight">
                          {new Intl.NumberFormat('fr-FR').format(price)}
                        </span>
                        <span className="text-xs font-bold text-neutral-500">
                          FCFA {billingCycle === 'monthly' ? '/ mois' : '/ an'}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1">
                        Paiement facile par Wave, Orange Money ou Carte
                      </p>
                    </div>

                    {/* Features list */}
                    <ul className="space-y-3 mb-8 text-xs sm:text-sm text-neutral-700">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Choose Plan CTA button */}
                  <button
                    onClick={() => handleOpenCreateBoutique(plan.id)}
                    className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      plan.isPopular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-98'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-98'
                    }`}
                  >
                    <Store className="w-4 h-4 opacity-80" />
                    <span>Créer ma boutique ({plan.name})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. Section Témoignages (Avis de vraies commerçantes) */}
      <section id="temoignages" className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
            Recommandé par le métier
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-neutral-950 tracking-tight mt-2">
            Adopté par plus de 450 boutiques de mode
          </h2>
          <p className="text-sm text-neutral-600 mt-2">
            Découvrez pourquoi elles ont abandonné les cahiers papier pour ModaFlow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-2xl p-6 border border-neutral-200/90 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed italic mb-6">
                  "{t.text}"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                <div className="text-2xl">{t.avatar}</div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-neutral-950">{t.name}</h4>
                  <p className="text-[11px] text-neutral-500">{t.boutique} · {t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Section FAQ (Réponses claires pour les débutants) */}
      <section id="faq" className="py-16 sm:py-20 bg-neutral-50/70 border-t border-neutral-200/80 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Vous avez des questions ?
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight mt-1">
              Foire aux questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-neutral-900 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-neutral-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 8. Call to Action final */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
          Prêt(e) à moderniser votre boutique dès aujourd'hui ?
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mb-8">
          Rejoignez des centaines de commerçants qui gagnent du temps chaque jour grâce à ModaFlow.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => handleOpenCreateBoutique('pro')}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Store className="w-5 h-5 text-blue-100" />
            <span>Créer ma boutique</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={onEnterDashboard}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl transition-all cursor-pointer"
          >
            <span>Explorer la démo</span>
          </button>
        </div>
      </section>

      {/* 9. Footer (Pure Clean Light) */}
      <footer className="border-t border-slate-200 py-10 px-4 sm:px-6 text-center text-xs text-slate-500 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/favicon.png" alt="ModaFlow Logo" className="w-6 h-6 rounded-lg object-cover shadow-xs" />
            <span className="font-extrabold text-slate-900">ModaFlow SaaS</span>
            <span>·</span>
            <span>Logiciel de Caisse & Gestion de Mode</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <button 
              onClick={() => handleOpenCreateBoutique('pro')} 
              className="text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Créer ma boutique</span>
            </button>
            <button onClick={() => onOpenAuth('login')} className="hover:text-slate-900 cursor-pointer">
              Connexion
            </button>
            <button onClick={() => onOpenAuth('register')} className="hover:text-slate-900 cursor-pointer">
              Inscription
            </button>
            <button onClick={onEnterDashboard} className="hover:text-slate-900 cursor-pointer">
              Espace Démo
            </button>
          </div>
          <p>© 2026 ModaFlow. Tous droits réservés.</p>
        </div>
      </footer>

      {/* Floating Action Button for Mobile screens (Toujours accessible) */}
      <div className="fixed bottom-4 right-4 z-40 sm:hidden">
        <button
          onClick={() => handleOpenCreateBoutique('pro')}
          className="px-4 py-3 bg-blue-600 active:scale-95 text-white rounded-2xl shadow-xl shadow-blue-600/30 font-bold text-xs flex items-center gap-2 cursor-pointer border border-blue-500"
          title="Créer ma boutique"
        >
          <Store className="w-4 h-4" />
          <span>Créer ma boutique</span>
        </button>
      </div>

      {/* Dedicated Modal for Fast Boutique Creation */}
      <CreateBoutiqueModal
        isOpen={isCreateBoutiqueModalOpen}
        onClose={() => setIsCreateBoutiqueModalOpen(false)}
        initialPlan={createBoutiquePlan}
        onSuccess={onEnterDashboard}
      />

    </div>
  );
};
