import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  ShoppingBag, 
  Package, 
  Bike, 
  BarChart3, 
  Layers,
  Users,
  LayoutDashboard
} from 'lucide-react';
import { ActiveTab, PermissionKey } from '../types';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, orders, hasPermission } = useStore();

  const pendingDeliveriesCount = orders.filter(
    (o) => o.status === 'en_cours' && o.isDelivery
  ).length;

  const allTabs: { 
    id: ActiveTab; 
    label: string; 
    icon: React.ComponentType<{ className?: string }>;
    requiredPerm?: PermissionKey | PermissionKey[];
  }[] = [
    { id: 'dashboard', label: 'Accueil', icon: LayoutDashboard },
    { id: 'catalogue', label: 'Caisse', icon: ShoppingBag, requiredPerm: 'sales.create' },
    { id: 'commandes', label: 'Ventes', icon: Package, requiredPerm: 'sales.read' },
    { id: 'inventaire', label: 'Stocks', icon: Layers, requiredPerm: 'inventory.read' },
    { id: 'clients', label: 'Clients', icon: Users, requiredPerm: 'customers.read' },
    { id: 'livraisons', label: 'Livreurs', icon: Bike, requiredPerm: 'sales.read' },
    { id: 'comptabilite', label: 'Finances', icon: BarChart3, requiredPerm: ['expenses.read', 'reports.financial'] },
  ];

  const allowedTabs = allTabs.filter((tab) => {
    if (!tab.requiredPerm) return true;
    if (Array.isArray(tab.requiredPerm)) {
      return tab.requiredPerm.some((p) => hasPermission(p));
    }
    return hasPermission(tab.requiredPerm);
  });

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-1 py-1 shadow-sm">
      <div 
        className="grid items-center max-w-lg mx-auto h-14"
        style={{ gridTemplateColumns: `repeat(${allowedTabs.length}, minmax(0, 1fr))` }}
      >
        {allowedTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {tab.id === 'livraisons' && pendingDeliveriesCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center tabular-nums">
                    {pendingDeliveriesCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
