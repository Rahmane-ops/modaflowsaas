import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { SuperAdminSubTab } from '../../types';
import { SuperAdminOverview } from './SuperAdminOverview';
import { SuperAdminBoutiques } from './SuperAdminBoutiques';
import { SuperAdminUsers } from './SuperAdminUsers';
import { SuperAdminPlans } from './SuperAdminPlans';
import { SuperAdminPayments } from './SuperAdminPayments';
import { SuperAdminAudit } from './SuperAdminAudit';
import { SuperAdminSettings } from './SuperAdminSettings';
import { SuperAdminSupport } from './SuperAdminSupport';
import {
  LayoutDashboard,
  Store,
  Users,
  CreditCard,
  DollarSign,
  ShieldCheck,
  Settings,
  LifeBuoy,
  LogOut,
  ArrowLeft,
  Crown,
  Lock,
  Menu,
  X,
  Sparkles,
  Server,
  AlertTriangle
} from 'lucide-react';

interface SuperAdminDashboardProps {
  onClose: () => void;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  subTab: string;
  onReset: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class SubTabErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error(`[SuperAdmin Error] Onglet ${this.props.subTab} a échoué:`, error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.subTab !== this.props.subTab && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center max-w-lg mx-auto my-12 shadow-sm animate-in fade-in">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Une erreur inattendue est survenue dans ce module
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4 font-mono break-words">
            {this.state.error?.message || 'Erreur interne de rendu'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              this.props.onReset();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            Recharger ce module
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onClose }) => {
  const {
    isSuperAdmin,
    currentUser,
    platformSettings,
    supportTickets,
    boutiques,
    users
  } = useStore();

  const [currentSubTab, setCurrentSubTab] = useState<SuperAdminSubTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isSuperAdminAuthorized =
    isSuperAdmin &&
    currentUser?.id !== 'user-owner' &&
    currentUser?.role !== 'owner' &&
    ((currentUser?.email || '').trim().toLowerCase() === 'abdourahmanebathily1@gmail.com' ||
     currentUser?.role === 'superadmin' ||
     currentUser?.role === 'platform_admin');

  // Immediately close if an unauthorized user reaches this component
  React.useEffect(() => {
    if (!isSuperAdminAuthorized) {
      onClose();
    }
  }, [isSuperAdminAuthorized, onClose]);

  // Strict Level 1-2 Defense Guard: If user is not Super Admin, close and render nothing
  if (!isSuperAdminAuthorized) {
    return null;
  }

  const pendingTicketsCount = supportTickets.filter((t) => t.status === 'nouveau' || t.status === 'en_cours').length;

  const navItems: { id: SuperAdminSubTab; label: string; icon: React.FC<{ className?: string }>; badge?: number | string }[] = [
    { id: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard },
    { id: 'boutiques', label: 'Gestion des Boutiques', icon: Store, badge: boutiques.length },
    { id: 'users', label: 'Utilisateurs Plateforme', icon: Users, badge: users.length },
    { id: 'plans', label: 'Abonnements & Formules', icon: CreditCard },
    { id: 'payments', label: 'Paiements & Encaissements', icon: DollarSign },
    { id: 'audit', label: 'Sécurité & Audit Logs', icon: ShieldCheck },
    { id: 'support', label: 'Support & Tickets', icon: LifeBuoy, badge: pendingTicketsCount > 0 ? pendingTicketsCount : undefined },
    { id: 'settings', label: 'Paramètres Globaux', icon: Settings },
  ];

  const handleSubTabClick = (tabId: SuperAdminSubTab) => {
    setCurrentSubTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 text-slate-100 flex overflow-hidden">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sovereign Sidebar Navigation */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand & Sovereign Badge */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold text-sm shadow-md shadow-amber-500/20">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-white">
                  {platformSettings.platformName || 'ModaFlow'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  SUPER ADMIN
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-300">
            Console Plateforme
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSubTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.id === 'support'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer / Switch back to Store */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-3">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-7 h-7 rounded-lg bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center">
              👑
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
              <div className="text-[10px] text-slate-300 truncate">{currentUser.email}</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quitter vers Boutique</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-100 text-slate-900 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-5 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Super Admin
                </span>
                <span className="text-slate-300">/</span>
                <h1 className="text-sm font-bold text-slate-900">
                  {navItems.find((n) => n.id === currentSubTab)?.label}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {platformSettings.maintenanceMode && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                Mode Maintenance Actif
              </span>
            )}

            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
              <Server className="w-3.5 h-3.5 text-emerald-600" />
              <span>Base Firestore Connectée</span>
            </div>

            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Espace Boutique</span>
            </button>
          </div>
        </header>

        {/* Subtab Dynamic View Container */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-16">
          <SubTabErrorBoundary
            subTab={currentSubTab}
            onReset={() => setCurrentSubTab('overview')}
          >
            {currentSubTab === 'overview' && (
              <SuperAdminOverview onNavigateTab={setCurrentSubTab} />
            )}

            {currentSubTab === 'boutiques' && (
              <SuperAdminBoutiques />
            )}

            {currentSubTab === 'users' && (
              <SuperAdminUsers />
            )}

            {currentSubTab === 'plans' && (
              <SuperAdminPlans />
            )}

            {currentSubTab === 'payments' && (
              <SuperAdminPayments />
            )}

            {currentSubTab === 'audit' && (
              <SuperAdminAudit />
            )}

            {currentSubTab === 'settings' && (
              <SuperAdminSettings />
            )}

            {currentSubTab === 'support' && (
              <SuperAdminSupport />
            )}
          </SubTabErrorBoundary>
        </main>
      </div>
    </div>
  );
};
