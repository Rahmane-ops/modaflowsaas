import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { DashboardView } from './components/DashboardView';
import { CatalogView } from './components/CatalogView';
import { OrdersView } from './components/OrdersView';
import { DeliveryView } from './components/DeliveryView';
import { ClientsView } from './components/ClientsView';
import { AccountingView } from './components/AccountingView';
import { InventoryView } from './components/InventoryView';
import { NewOrderModal } from './components/NewOrderModal';
import { InvoiceModal } from './components/InvoiceModal';
import { EditOrderModal } from './components/EditOrderModal';
import { SubscriptionView } from './components/SubscriptionView';
import { NewProductModal } from './components/NewProductModal';
import { AuditLogModal } from './components/AuditLogModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { TeamManagementModal } from './components/TeamManagementModal';
import { ExportReportingModal } from './components/ExportReportingModal';
import { LandingPage } from './components/LandingPage';
import { Sidebar } from './components/Sidebar';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { Order } from './types';

const AppContent: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab,
    orders, 
    activeInvoiceOrder, 
    setActiveInvoiceOrder,
    isLandingPage,
    setIsLandingPage,
    isLoggedIn,
    authModalOpen,
    setAuthModalOpen,
    openAuthModalWithPlan,
    isFirebaseLoading,
    firebaseUser,
    hasPermission,
    isSuperAdmin,
    isSuperAdminViewOpen,
    setIsSuperAdminViewOpen,
    currentBoutique,
    boutiques,
    setCurrentBoutique,
  } = useStore();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportInitialTab, setExportInitialTab] = useState<'monthly' | 'sales' | 'accounting'>('monthly');

  // Redirection automatique vers la Landing Page de présentation SaaS :
  // Si l'utilisateur n'est pas authentifié et n'a pas encore visité/choisi d'accéder à la boutique,
  // il est redirigé vers la LandingPage de présentation au lieu du tableau de bord boutique.
  React.useEffect(() => {
    if (!isFirebaseLoading) {
      const isAuthenticated = Boolean(firebaseUser) || isLoggedIn;
      const hasVisited = localStorage.getItem('modaflow_has_visited') === 'true';
      const showLanding = localStorage.getItem('modaflow_show_landing');

      // Si non connecté et (première visite OU préférence landing page active ou non initialisée)
      if (!isAuthenticated && (!hasVisited || showLanding === 'true' || showLanding === null)) {
        setIsLandingPage(true);
      }
    }
  }, [isFirebaseLoading, firebaseUser, isLoggedIn, setIsLandingPage]);

  // Niveau 1 Sécurité : Redirection automatique si l'utilisateur accède à un onglet interdit
  React.useEffect(() => {
    if (activeTab === 'catalogue' && !hasPermission('sales.create')) {
      setActiveTab('dashboard');
    } else if (activeTab === 'commandes' && !hasPermission('sales.read')) {
      setActiveTab('dashboard');
    } else if (activeTab === 'clients' && !hasPermission('customers.read')) {
      setActiveTab('dashboard');
    } else if (activeTab === 'inventaire' && !hasPermission('inventory.read')) {
      setActiveTab('dashboard');
    } else if (activeTab === 'livraisons' && !hasPermission('sales.read')) {
      setActiveTab('dashboard');
    } else if (activeTab === 'comptabilite' && !hasPermission('expenses.read') && !hasPermission('reports.financial')) {
      setActiveTab('dashboard');
    } else if (activeTab === 'abonnement' && !hasPermission('store.billing')) {
      setActiveTab('dashboard');
    }
  }, [activeTab, hasPermission, setActiveTab]);

  const handleOpenExportModal = (initialTab: 'monthly' | 'sales' | 'accounting' = 'monthly') => {
    setExportInitialTab(initialTab);
    setIsExportModalOpen(true);
  };

  // Handle invoice opening
  const handleViewInvoice = (order: Order) => {
    setActiveInvoiceOrder(order);
  };

  const handleOrderCreated = (order: Order) => {
    // Automatically open generated PDF Invoice right after sale!
    setActiveInvoiceOrder(order);
  };

  const handleViewInvoiceByNumber = (invoiceNumber: string) => {
    const order = orders.find((o) => o.invoiceNumber === invoiceNumber);
    if (order) {
      setActiveInvoiceOrder(order);
    }
  };

  // Initial Firebase auth state loading
  if (isFirebaseLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold">ModaFlow SaaS Cloud</h2>
        <p className="text-slate-400 text-xs mt-1">Connexion sécurisée aux services Firebase...</p>
      </div>
    );
  }

  // If user requested to view the Landing Page or is logged out & exploring
  if (isLandingPage) {
    return (
      <>
        <LandingPage
          onOpenAuth={(tab, planId) => openAuthModalWithPlan(planId, tab as any)}
          onEnterDashboard={() => {
            try {
              localStorage.setItem('modaflow_has_visited', 'true');
              localStorage.setItem('modaflow_show_landing', 'false');
            } catch {}
            setIsLandingPage(false);
          }}
        />

        {/* Modal: Espace Connexion & Profils SaaS */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Desktop & Mobile Responsive Sidebar */}
      <Sidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenTeam={() => setIsTeamModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAuditLog={() => setIsAuditLogOpen(true)}
        onOpenLanding={() => setIsLandingPage(true)}
        onOpenExportModal={handleOpenExportModal}
      />

      {/* Main Content Area (Offset by sidebar width on large screens) */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <Header
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAuthModal={() => setAuthModalOpen(true)}
          onOpenLanding={() => setIsLandingPage(true)}
        />

        {/* Super Admin Sovereign Intervention Mode Banner (Total Access to All Boutiques) */}
        {isSuperAdmin && !isSuperAdminViewOpen && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white px-4 sm:px-6 py-2.5 text-xs shadow-md border-b border-amber-800 flex flex-wrap items-center justify-between gap-3 sticky top-16 z-20 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                ⚡
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold uppercase tracking-wider text-[10px] bg-black/30 px-2 py-0.5 rounded-full">
                    Mode Intervention Super Admin
                  </span>
                  <span className="font-bold text-white text-xs">
                    Boutique active : {currentBoutique?.name} ({currentBoutique?.city})
                  </span>
                </div>
                <p className="text-[11px] text-amber-100 hidden sm:block mt-0.5">
                  Accès souverain total : Caisse POS, Catalogue, Commandes, Clients, Trésorerie & Paramètres.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {/* Quick boutique picker */}
              <div className="flex items-center gap-1 bg-black/25 px-2 py-1 rounded-lg border border-white/20">
                <span className="text-[10px] text-amber-200 hidden md:inline">Changer de boutique :</span>
                <select
                  value={currentBoutique?.id}
                  onChange={(e) => {
                    const target = boutiques.find((b) => b.id === e.target.value);
                    if (target) setCurrentBoutique(target);
                  }}
                  className="bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer"
                  title="Sélectionner une autre boutique"
                >
                  {boutiques.map((b) => (
                    <option key={b.id} value={b.id} className="text-slate-900 bg-white">
                      🏢 {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setIsSuperAdminViewOpen(true)}
                className="px-3 py-1.5 bg-black/30 hover:bg-black/50 active:scale-95 text-white font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span>Console Super Admin</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}


        {/* Main View Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-12">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenNewOrder={() => setIsCartOpen(true)}
              onOpenNewProduct={() => setIsNewProductOpen(true)}
              onViewInvoice={handleViewInvoice}
              onOpenExportModal={handleOpenExportModal}
            />
          )}

        {activeTab === 'catalogue' && (
          <CatalogView
            onOpenNewProduct={() => setIsNewProductOpen(true)}
            onOpenCart={() => setIsCartOpen(true)}
          />
        )}

        {activeTab === 'commandes' && (
          <OrdersView 
            onViewInvoice={handleViewInvoice} 
            onEditOrder={(order) => setEditingOrder(order)}
            onOpenExportModal={handleOpenExportModal}
          />
        )}

        {activeTab === 'clients' && (
          <ClientsView onViewInvoice={handleViewInvoice} />
        )}

        {activeTab === 'livraisons' && (
          <DeliveryView onViewInvoice={handleViewInvoice} />
        )}

        {activeTab === 'comptabilite' && (
          <AccountingView 
            onViewInvoiceByNumber={handleViewInvoiceByNumber} 
            onOpenExportModal={handleOpenExportModal}
          />
        )}

        {activeTab === 'inventaire' && (
          <InventoryView onOpenNewProduct={() => setIsNewProductOpen(true)} />
        )}

        {activeTab === 'abonnement' && (
          <SubscriptionView />
        )}
      </main>
    </div>

      {/* Mobile Bottom Tab Navigation */}
      <MobileNav />

      {/* Modal: New Order / Checkout */}
      <NewOrderModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderCreated={handleOrderCreated}
      />

      {/* Modal: PDF Invoice Viewer & Print */}
      <InvoiceModal
        order={activeInvoiceOrder}
        onClose={() => setActiveInvoiceOrder(null)}
      />

      {/* Modal: Edit Order / Product Return & Stock Restocking */}
      <EditOrderModal
        order={editingOrder}
        onClose={() => setEditingOrder(null)}
        onOrderUpdated={(updated) => setActiveInvoiceOrder(updated)}
      />

      {/* Modal: New Clothing Product */}
      <NewProductModal
        isOpen={isNewProductOpen}
        onClose={() => setIsNewProductOpen(false)}
      />

      {/* Modal: Audit Log */}
      <AuditLogModal
        isOpen={isAuditLogOpen}
        onClose={() => setIsAuditLogOpen(false)}
      />

      {/* Modal: Espace Connexion & Profils SaaS */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Modal: User Profile & Security */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Modal: Team & RBAC Permissions */}
      <TeamManagementModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
      />

      {/* Modal: Centre d'Exportation & Reporting Administratif */}
      <ExportReportingModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        initialTab={exportInitialTab}
      />

      {/* Console Super Admin SaaS Plateforme (Strictement réservé au Super Admin) */}
      {isSuperAdminViewOpen && isSuperAdmin && (
        <SuperAdminDashboard onClose={() => setIsSuperAdminViewOpen(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
