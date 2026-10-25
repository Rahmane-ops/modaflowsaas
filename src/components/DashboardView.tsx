import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  Plus, 
  FileText, 
  AlertTriangle, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  BarChart3,
  CreditCard,
  ArrowUpRight,
  Sparkles,
  Layers,
  FileDown,
  FileSpreadsheet
} from 'lucide-react';
import { downloadDailySalesReportPDF } from '../services/pdfService';

import { Order } from '../types';

interface DashboardViewProps {
  onOpenNewOrder: () => void;
  onOpenNewProduct: () => void;
  onViewInvoice: (order: Order) => void;
  onOpenExportModal?: (initialTab?: 'monthly' | 'sales' | 'accounting') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewOrder,
  onOpenNewProduct,
  onViewInvoice,
  onOpenExportModal,
}) => {
  const { 
    orders, 
    clothes, 
    currentUser, 
    setActiveTab,
    currentBoutique,
    hasPermission,
    transactions
  } = useStore();

  const [dateRange, setDateRange] = useState<'7j' | '14j' | 'tout'>('7j');

  const [pdfSuccess, setPdfSuccess] = useState<string | null>(null);

  const handleDownloadTodayReport = () => {
    try {
      const todayStr = new Date().toISOString().substring(0, 10);
      const fileName = downloadDailySalesReportPDF(
        todayStr,
        currentBoutique,
        orders,
        transactions,
        currentUser
      );
      setPdfSuccess(`Rapport de ventes du jour (${fileName}) téléchargé.`);
      setTimeout(() => setPdfSuccess(null), 5000);
    } catch {
      setPdfSuccess('Erreur lors du téléchargement du rapport.');
    }
  };

  const formatFCFA = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const todayStr = '2026-10-16'; // current applet reference date
    
    const paidOrders = orders.filter((o) => o.status === 'livre_paye' || o.paymentStatus === 'solde');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayStr));
    const todayPaidOrders = todayOrders.filter((o) => o.status === 'livre_paye' || o.paymentStatus === 'solde');
    const todayRevenue = todayPaidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingDeliveries = orders.filter((o) => o.status === 'en_cours' && o.isDelivery);

    let waveTotal = 0;
    let omTotal = 0;
    let cashTotal = 0;

    paidOrders.forEach((o) => {
      if (o.paymentMethod === 'wave') waveTotal += o.totalAmount;
      else if (o.paymentMethod === 'orange_money') omTotal += o.totalAmount;
      else if (o.paymentMethod === 'cash') cashTotal += o.totalAmount;
    });

    const lowStockItems = clothes.filter((c) => c.stock <= c.minStockAlert);
    const totalItemsInStock = clothes.reduce((sum, c) => sum + c.stock, 0);

    return {
      totalRevenue,
      todayRevenue,
      todayOrdersCount: todayOrders.length,
      paidOrdersCount: paidOrders.length,
      pendingDeliveriesCount: pendingDeliveries.length,
      waveTotal,
      omTotal,
      cashTotal,
      lowStockItems,
      lowStockCount: lowStockItems.length,
      totalItemsInStock
    };
  }, [orders, clothes]);



  // Top products
  const topProducts = useMemo(() => {
    const itemMap = new Map<string, { name: string; category: string; unitsSold: number; totalRevenue: number; stock: number }>();

    orders.forEach((order) => {
      if (order.status === 'livre_paye' || order.paymentStatus === 'solde') {
        order.items.forEach((item) => {
          const existing = itemMap.get(item.clothingId);
          if (existing) {
            existing.unitsSold += item.quantity;
            existing.totalRevenue += item.subtotal;
          } else {
            const cloth = clothes.find((c) => c.id === item.clothingId);
            itemMap.set(item.clothingId, {
              name: item.clothingName,
              category: item.category,
              unitsSold: item.quantity,
              totalRevenue: item.subtotal,
              stock: cloth ? cloth.stock : 0
            });
          }
        });
      }
    });

    const list = Array.from(itemMap.values());
    list.sort((a, b) => b.unitsSold - a.unitsSold);
    return list.slice(0, 5);
  }, [orders, clothes]);

  return (
    <div className="space-y-6">
      
      {/* 1. Header Section: Title, Active Shop, Period & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Vue d'ensemble
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {currentBoutique.name}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Activité en temps réel · Mise à jour automatique des ventes et des stocks
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Period selector */}
          <div className="inline-flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-xs font-medium">
            <button
              onClick={() => setDateRange('7j')}
              className={`px-2.5 py-1 rounded transition-colors ${
                dateRange === '7j'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 jours
            </button>
            <button
              onClick={() => setDateRange('14j')}
              className={`px-2.5 py-1 rounded transition-colors ${
                dateRange === '14j'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              14 jours
            </button>
          </div>

          {/* Action: Reporting Mensuel & Exports */}
          {onOpenExportModal && hasPermission('reports.export') && (
            <button
              onClick={() => onOpenExportModal('monthly')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold shadow-2xs transition-all active:scale-98 cursor-pointer"
              title="Ouvrir le centre d'exportation pour générer le bilan mensuel et les exports CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Reporting Mensuel</span>
            </button>
          )}

          {/* Action: Télécharger le rapport de ventes du jour en PDF */}
          {hasPermission('reports.export') && (
            <button
              onClick={handleDownloadTodayReport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-all active:scale-98 cursor-pointer"
              title="Télécharger le rapport journalier officiel des ventes en PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Rapport du jour (PDF)</span>
            </button>
          )}

          {/* Primary Action Button: Electric Blue */}
          {hasPermission('sales.create') && (
            <button
              onClick={onOpenNewOrder}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle vente</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Notice / Feedback */}
      {pdfSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{pdfSuccess}</span>
          </div>
          <button onClick={() => setPdfSuccess(null)} className="text-slate-400 hover:text-slate-700 font-bold px-1">
            ×
          </button>
        </div>
      )}

      {/* 2. Essential KPI Cards (Consistent, sober, clear hierarchy) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Chiffre d'Affaires */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">
              Chiffre d'affaires
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            {hasPermission('reports.financial') ? (
              <>
                <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
                  {formatFCFA(stats.totalRevenue)}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-700 font-medium">
                  <span>Aujourd'hui :</span>
                  <strong className="text-slate-900">{formatFCFA(stats.todayRevenue)}</strong>
                </div>
              </>
            ) : (
              <div className="py-1">
                <div className="text-base font-semibold text-slate-400">••••••••••</div>
                <p className="text-[10px] text-slate-400 mt-1">Donnée confidentielle (rôle restreint)</p>
              </div>
            )}
          </div>
        </div>

        {/* KPI 2: Nombre de Ventes */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">
              Ventes encaissées
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
              {stats.paidOrdersCount}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-600">
              <span>{stats.todayOrdersCount} commande(s) aujourd'hui</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Encaissements par Mode */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">
              Modes de paiement
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 space-y-1">
            {hasPermission('reports.financial') ? (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Wave</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{formatFCFA(stats.waveTotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Orange Money</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{formatFCFA(stats.omTotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Espèces</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{formatFCFA(stats.cashTotal)}</span>
                </div>
              </>
            ) : (
              <div className="py-2 text-[11px] text-slate-400 italic">
                Détail réservé aux comptables et gérants
              </div>
            )}
          </div>
        </div>

        {/* KPI 4: Alertes Stock */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">
              Stocks & Alertes
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums flex items-baseline gap-2">
              <span>{stats.totalItemsInStock}</span>
              <span className="text-xs font-normal text-slate-600">articles</span>
            </div>
            <div className="mt-1">
              {stats.lowStockCount > 0 ? (
                <button
                  onClick={() => setActiveTab('inventaire')}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:underline"
                >
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  <span>{stats.lowStockCount} modèle(s) en stock faible</span>
                </button>
              ) : (
                <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Tous les stocks sont optimaux
                </span>
              )}
            </div>
          </div>
        </div>

      </div>


      {/* 4. Two Clean Tables: Dernières Ventes & Meilleures Ventes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Table: Dernières Ventes */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Dernières ventes
              </h3>
              <p className="text-xs text-slate-600">
                Commandes récentes enregistrées en caisse
              </p>
            </div>
            <button
              onClick={() => setActiveTab('commandes')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
            >
              <span>Voir tout</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {orders.slice(0, 5).map((order) => {
              const isPaid = order.status === 'livre_paye' || order.paymentStatus === 'solde';
              return (
                <div 
                  key={order.id} 
                  className="px-4 sm:px-5 py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/60 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 truncate">
                        {order.clientName}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase ${
                        isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {isPaid ? 'Soldé' : 'En cours'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-600 mt-0.5">
                      <span>{order.invoiceNumber}</span>
                      <span>·</span>
                      <span className="capitalize">{order.paymentMethod === 'orange_money' ? 'Orange Money' : order.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-slate-900 tabular-nums">
                      {formatFCFA(order.totalAmount)}
                    </span>
                    <button
                      onClick={() => onViewInvoice(order)}
                      className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      title="Voir le reçu / facture PDF"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Table: Produits les plus vendus */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Produits les plus vendus
              </h3>
              <p className="text-xs text-slate-600">
                Articles générant le plus de volume
              </p>
            </div>
            <button
              onClick={() => setActiveTab('inventaire')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
            >
              <span>Voir stocks</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {topProducts.map((item, idx) => (
              <div 
                key={idx} 
                className="px-4 sm:px-5 py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-600 capitalize">
                      {item.category} · Reste {item.stock} en stock
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold text-slate-900 tabular-nums">
                    {item.unitsSold} vendus
                  </div>
                  <div className="text-[11px] text-slate-600 tabular-nums">
                    {formatFCFA(item.totalRevenue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
