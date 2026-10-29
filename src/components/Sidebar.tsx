import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  Layers, 
  Bike, 
  BarChart3, 
  Crown, 
  ShieldCheck, 
  History, 
  ChevronDown, 
  Check, 
  Store, 
  Plus, 
  LogOut, 
  UserCheck, 
  X,
  Sparkles,
  ExternalLink,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';
import { ActiveTab, UserRole, BoutiqueTenant } from '../types';
import { ROLE_LABELS } from '../services/securityService';
import { CreateBoutiqueModal } from './CreateBoutiqueModal';
import { PWAInstallButton } from './pwa/PWAInstallButton';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenTeam: () => void;
  onOpenProfile: () => void;
  onOpenAuditLog: () => void;
  onOpenLanding: () => void;
  onOpenExportModal?: (initialTab?: 'monthly' | 'sales' | 'accounting') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenMobile = false,
  onCloseMobile,
  onOpenTeam,
  onOpenProfile,
  onOpenAuditLog,
  onOpenLanding,
  onOpenExportModal,
}) => {
  const { 
    activeTab, 
    setActiveTab, 
    currentUser, 
    setCurrentUser, 
    users, 
    boutiques, 
    currentBoutique, 
    setCurrentBoutique,
    hasPermission,
    orders,
    isLoggedIn,
    logoutUser,
    isSuperAdmin,
    setIsSuperAdminViewOpen
  } = useStore();

  const [isBoutiqueMenuOpen, setIsBoutiqueMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCreateBoutiqueOpen, setIsCreateBoutiqueOpen] = useState(false);

  const pendingDeliveries = orders.filter((o) => o.status === 'en_cours' && o.isDelivery).length;

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const getRoleLabel = (role: UserRole) => {
    return ROLE_LABELS[role]?.label || role;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Brand & Logo */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
          <div 
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <img 
              src="/favicon.png" 
              alt="ModaFlow Logo" 
              className="w-8 h-8 rounded-xl object-cover shadow-xs group-hover:scale-105 transition-transform" 
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-slate-900">
                  ModaFlow
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                  SaaS
                </span>
              </div>
              <p className="text-[10px] text-slate-600 font-medium leading-none">
                Gestion de Boutique
              </p>
            </div>
          </div>

          {/* Close button for mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Boutique Switcher */}
        <div className="p-3 border-b border-slate-100 relative">
          <button
            onClick={() => setIsBoutiqueMenuOpen(!isBoutiqueMenuOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 text-left transition-all group"
            title="Changer de boutique active"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 shrink-0 group-hover:text-blue-600">
                <Store className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate leading-tight">
                  {currentBoutique.name}
                </p>
                <p className="text-[10px] text-slate-600 truncate leading-tight mt-0.5">
                  {currentBoutique.city} · {currentBoutique.planId.toUpperCase()}
                </p>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1.5 group-hover:text-slate-600" />
          </button>

          {/* Boutique Dropdown */}
          {isBoutiqueMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setIsBoutiqueMenuOpen(false)} 
              />
              <div className="absolute left-3 right-3 top-14 bg-white rounded-xl shadow-lg border border-slate-200/90 py-1.5 z-40 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    {isSuperAdmin ? `Toutes les Boutiques (${boutiques.length})` : `Mes Boutiques (${boutiques.length})`}
                  </p>
                  {isSuperAdmin && (
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                      Accès Total
                    </span>
                  )}
                </div>
                <div className="max-h-48 overflow-y-auto p-1 space-y-0.5">
                  {boutiques.map((b) => {
                    const isSelected = b.id === currentBoutique.id;
                    return (
                      <button
                        key={b.id}
                        onClick={() => {
                          setCurrentBoutique(b);
                          setIsBoutiqueMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition-colors ${
                          isSelected
                            ? 'bg-blue-50/80 text-blue-900 font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="truncate">
                          <p className="font-medium truncate">{b.name}</p>
                          <p className="text-[10px] text-slate-600 truncate">{b.city} ({b.currency})</p>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                <div className="pt-1.5 px-1 border-t border-slate-100 mt-1">
                  <button
                    onClick={() => {
                      setIsBoutiqueMenuOpen(false);
                      setIsCreateBoutiqueOpen(true);
                    }}
                    className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Créer une nouvelle boutique...</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          
          {/* Section: VUE D'ENSEMBLE */}
          <div>
            <p className="px-2.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Principal
            </p>
            <div className="space-y-0.5">
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-white' : 'text-slate-600'}`} />
                <span>Vue d'ensemble</span>
              </button>
            </div>
          </div>

          {/* Section: VENTES & COMMERCE */}
          {(hasPermission('sales.create') || hasPermission('sales.read') || hasPermission('customers.read')) && (
            <div>
              <p className="px-2.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Ventes & Caisse
              </p>
              <div className="space-y-0.5">
                {hasPermission('sales.create') && (
                  <button
                    onClick={() => handleNavClick('catalogue')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      activeTab === 'catalogue'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <ShoppingBag className={`w-4 h-4 ${activeTab === 'catalogue' ? 'text-white' : 'text-slate-600'}`} />
                    <span>Caisse & Vente</span>
                  </button>
                )}

                {hasPermission('sales.read') && (
                  <button
                    onClick={() => handleNavClick('commandes')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      activeTab === 'commandes'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Package className={`w-4 h-4 ${activeTab === 'commandes' ? 'text-white' : 'text-slate-600'}`} />
                    <span>Ventes & Commandes</span>
                  </button>
                )}

                {hasPermission('customers.read') && (
                  <button
                    onClick={() => handleNavClick('clients')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      activeTab === 'clients'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Users className={`w-4 h-4 ${activeTab === 'clients' ? 'text-white' : 'text-slate-600'}`} />
                    <span>Clients & Fidélité</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Section: OPÉRATIONS & LOGISTIQUE */}
          {(hasPermission('inventory.read') || hasPermission('sales.read')) && (
            <div>
              <p className="px-2.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Stocks & Logistique
              </p>
              <div className="space-y-0.5">
                {hasPermission('inventory.read') && (
                  <button
                    onClick={() => handleNavClick('inventaire')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      activeTab === 'inventaire'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Layers className={`w-4 h-4 ${activeTab === 'inventaire' ? 'text-white' : 'text-slate-600'}`} />
                    <span>Stocks & Produits</span>
                  </button>
                )}

                {hasPermission('sales.read') && (
                  <button
                    onClick={() => handleNavClick('livraisons')}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      activeTab === 'livraisons'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Bike className={`w-4 h-4 ${activeTab === 'livraisons' ? 'text-white' : 'text-slate-600'}`} />
                      <span>Livreurs & Courses</span>
                    </div>
                    {pendingDeliveries > 0 && (
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center tabular-nums">
                        {pendingDeliveries}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Section: FINANCES & FORFAIT */}
          {(hasPermission('expenses.read') || hasPermission('reports.financial') || hasPermission('reports.export') || hasPermission('store.billing')) && (
            <div>
              <p className="px-2.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Finances & SaaS
              </p>
              <div className="space-y-0.5">
                {(hasPermission('expenses.read') || hasPermission('reports.financial')) && (
                  <button
                    onClick={() => handleNavClick('comptabilite')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      activeTab === 'comptabilite'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <BarChart3 className={`w-4 h-4 ${activeTab === 'comptabilite' ? 'text-white' : 'text-slate-600'}`} />
                    <span>Caisse & Dépenses</span>
                  </button>
                )}

                {hasPermission('reports.export') && onOpenExportModal && (
                  <button
                    onClick={() => {
                      onOpenExportModal('monthly');
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/70 transition-colors cursor-pointer"
                    title="Générer les bilans mensuels et exports CSV / PDF"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Export & Reporting</span>
                  </button>
                )}

                {hasPermission('store.billing') && (
                  <button
                    onClick={() => handleNavClick('abonnement')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      activeTab === 'abonnement'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Crown className={`w-4 h-4 ${activeTab === 'abonnement' ? 'text-amber-400' : 'text-slate-600'}`} />
                    <span>Abonnement SaaS</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Section: ADMINISTRATION & CONTRÔLE */}
          <div>
            <p className="px-2.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Équipe & Sécurité
            </p>
            <div className="space-y-0.5">
              {(hasPermission('members.read') || hasPermission('members.invite') || hasPermission('members.update_role')) && (
                <button
                  onClick={() => {
                    if (onCloseMobile) onCloseMobile();
                    onOpenTeam();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <Users className="w-4 h-4 text-slate-600" />
                  <span>Employés & Droits</span>
                </button>
              )}

              {(hasPermission('reports.operational') || hasPermission('store.settings')) && (
                <button
                  onClick={() => {
                    if (onCloseMobile) onCloseMobile();
                    onOpenAuditLog();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <History className="w-4 h-4 text-slate-600" />
                  <span>Journal d'audit</span>
                </button>
              )}
            </div>
          </div>

          {/* Section: SUPER ADMIN SOUVERAIN (Strictement réservé) */}
          {isSuperAdmin && (
            <div className="pt-2">
              <p className="px-2.5 text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <span>⚡</span>
                <span>Supervision Plateforme</span>
              </p>
              <button
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                  setIsSuperAdminViewOpen(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-amber-800 hover:text-white transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">⚡</span>
                  <span>Console Super Admin</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}

          {/* PWA App Install Button */}
          <div className="pt-2">
            <PWAInstallButton variant="sidebar" />
          </div>

        </div>

        {/* Footer: User Account */}
        <div className="p-3 border-t border-slate-100 relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/60 transition-all text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-base shrink-0">
                {currentUser.avatar}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-slate-600 truncate leading-tight mt-0.5">
                  {getRoleLabel(currentUser.role)}
                </p>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1.5" />
          </button>

          {/* User Popover Menu */}
          {isUserMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setIsUserMenuOpen(false)} 
              />
              <div className="absolute left-3 right-3 bottom-14 bg-white rounded-xl shadow-xl border border-slate-200/90 py-2 z-40 animate-in fade-in slide-in-from-bottom-1">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-600 truncate">{currentUser.email || 'aissatou@modaflow.com'}</p>
                </div>

                <div className="p-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-slate-600" />
                    <span>Mon Compte & Mot de passe</span>
                  </button>

                  {isSuperAdmin && currentUser?.id !== 'user-owner' && currentUser?.role !== 'owner' && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsSuperAdminViewOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                      <span>⚡</span>
                      <span>Console Super Admin</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenLanding();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                    <span>Présentation SaaS & Tarifs</span>
                  </button>
                </div>

                {/* Quick Role Switcher */}
                <div className="pt-1.5 px-2.5 border-t border-slate-100 mt-1">
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Tester un rôle :
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {users
                      .filter((u) => u.role !== 'superadmin' && u.role !== 'platform_admin' && u.email !== 'abdourahmanebathily1@gmail.com')
                      .slice(0, 4)
                      .map((u) => {
                      const isSelected = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            setIsSuperAdminViewOpen(false);
                            setCurrentUser(u);
                            setIsUserMenuOpen(false);
                          }}
                          className={`flex items-center gap-1 px-1.5 py-1 rounded text-[11px] truncate transition-colors ${
                            isSelected
                              ? 'bg-slate-900 text-white font-bold'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span>{u.avatar}</span>
                          <span className="truncate">{getRoleLabel(u.role)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Logout */}
                {isLoggedIn && (
                  <div className="pt-1.5 px-1 border-t border-slate-100 mt-1">
                    <button
                      onClick={() => {
                        logoutUser();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

      </aside>

      {/* Modal: Créer une nouvelle boutique */}
      <CreateBoutiqueModal
        isOpen={isCreateBoutiqueOpen}
        onClose={() => setIsCreateBoutiqueOpen(false)}
      />
    </>
  );
};
