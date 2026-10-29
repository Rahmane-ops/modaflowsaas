import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  ShoppingBag, 
  Menu, 
  Plus, 
  Globe, 
  ShieldCheck, 
  Sparkles,
  Bell,
  CheckCircle2
} from 'lucide-react';
import { ActiveTab } from '../types';
import { PWAInstallButton } from './pwa/PWAInstallButton';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenCart: () => void;
  onOpenAuthModal: () => void;
  onOpenLanding: () => void;
}

const TAB_TITLES: Record<ActiveTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Tableau de Bord",
    subtitle: "Vue d'ensemble des ventes et de l'activité"
  },
  catalogue: {
    title: "Caisse & Vente",
    subtitle: "Prise de commande et encaissement direct"
  },
  commandes: {
    title: "Ventes & Commandes",
    subtitle: "Suivi des paiements et factures clients"
  },
  clients: {
    title: "Clients & Fidélité",
    subtitle: "Gestion du carnet d'adresses et programmes VIP"
  },
  livraisons: {
    title: "Livreurs & Courses",
    subtitle: "Affectation et suivi des courses en temps réel"
  },
  comptabilite: {
    title: "Caisse & Finances",
    subtitle: "Encaissements Wave, Orange Money et Espèces"
  },
  inventaire: {
    title: "Stocks & Produits",
    subtitle: "Catalogue des vêtements et alertes de rupture"
  },
  abonnement: {
    title: "Abonnement SaaS",
    subtitle: "Gestion de votre forfait et succursales"
  }
};

export const Header: React.FC<HeaderProps> = ({ 
  onOpenMobileMenu, 
  onOpenCart, 
  onOpenAuthModal,
  onOpenLanding
}) => {
  const { 
    activeTab, 
    cartItemCount, 
    currentBoutique,
    isLoggedIn,
    currentUser,
    isSuperAdmin,
    setIsSuperAdminViewOpen
  } = useStore();

  const currentTabInfo = TAB_TITLES[activeTab] || {
    title: "ModaFlow",
    subtitle: "Gestion de Boutique"
  };

  const isSuperAdminAuthorized =
    isSuperAdmin &&
    currentUser?.id !== 'user-owner' &&
    currentUser?.role !== 'owner' &&
    ((currentUser?.email || '').trim().toLowerCase() === 'abdourahmanebathily1@gmail.com' ||
     currentUser?.role === 'superadmin' ||
     currentUser?.role === 'platform_admin');

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Hamburger (mobile) & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Ouvrir le menu de navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                {currentTabInfo.title}
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                En direct
              </span>
            </div>
            <p className="text-xs text-slate-600 hidden sm:block">
              {currentBoutique.name} · {currentTabInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-2.5">
          
          {/* Super Admin Sovereign Access Button */}
          {isSuperAdminAuthorized && (
            <button
              onClick={() => setIsSuperAdminViewOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold shadow-xs transition-all cursor-pointer animate-in fade-in"
              title="Accéder à la console Super Admin de la plateforme SaaS"
            >
              <span>⚡</span>
              <span className="hidden sm:inline">Console Super Admin</span>
              <span className="sm:hidden">Super Admin</span>
            </button>
          )}

          {/* Quick link to Landing Page */}
          <button
            onClick={onOpenLanding}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 text-xs font-semibold bg-white transition-colors"
            title="Voir la page de présentation ModaFlow SaaS"
          >
            <Globe className="w-3.5 h-3.5 text-slate-600" />
            <span>Présentation SaaS</span>
          </button>

          {/* Auth modal toggle */}
          <button
            onClick={onOpenAuthModal}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 text-xs font-semibold bg-white transition-colors"
            title="Gérer les connexions et comptes"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
            <span>{isLoggedIn ? 'Connexion' : 'Se Connecter'}</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton variant="header" />

          {/* Primary Action Button: Caisse / Panier (Electric Blue Accent) */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-98 cursor-pointer"
            title="Ouvrir la caisse et finaliser la vente"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="font-semibold">Caisse</span>
            {cartItemCount > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full bg-white text-blue-700 text-[11px] font-bold">
                {cartItemCount}
              </span>
            ) : (
              <span className="text-[11px] text-blue-100 hidden sm:inline">(0)</span>
            )}
          </button>

        </div>
      </div>
    </header>
  );
};
