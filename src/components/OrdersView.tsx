import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Package, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Bike, 
  Store, 
  Filter, 
  Phone,
  MessageCircle,
  RotateCcw,
  Download,
  FileDown,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { Order, OrderStatus, PaymentMethod } from '../types';
import { 
  shareInvoicePDFOnWhatsApp, 
  downloadInvoicePDF, 
  downloadDailySalesReportPDF,
  printInvoicePDF 
} from '../services/pdfService';

interface OrdersViewProps {
  onViewInvoice: (order: Order) => void;
  onEditOrder: (order: Order) => void;
  onOpenExportModal?: (initialTab?: 'monthly' | 'sales' | 'accounting') => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ 
  onViewInvoice, 
  onEditOrder,
  onOpenExportModal
}) => {
  const { 
    orders, 
    markOrderDeliveredAndPaid, 
    cancelOrder, 
    currentBoutique,
    transactions,
    currentUser,
    hasPermission
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'delivery' | 'store'>('all');
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const canReadAllSales = hasPermission('sales.read_all') || currentUser.role === 'owner' || currentUser.role === 'admin' || currentUser.role === 'accountant';
  const canCancel = hasPermission('sales.cancel');
  const canRefund = hasPermission('sales.refund');
  const canExport = hasPermission('reports.export');

  const userAllowedOrders = useMemo(() => {
    if (canReadAllSales) return orders;
    return orders.filter((o) => o.createdBySellerId === currentUser.id);
  }, [orders, canReadAllSales, currentUser.id]);

  const filteredOrders = useMemo(() => {
    return userAllowedOrders.filter((order) => {
      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;

      // Type filter
      if (typeFilter === 'delivery' && !order.isDelivery) return false;
      if (typeFilter === 'store' && order.isDelivery) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesClient = order.clientName.toLowerCase().includes(q);
        const matchesPhone = order.clientPhone.toLowerCase().includes(q);
        const matchesInvoice = order.invoiceNumber.toLowerCase().includes(q);
        const matchesDriver = (order.deliveryDriverName || '').toLowerCase().includes(q);
        const matchesItems = order.items.some((i) =>
          i.clothingName.toLowerCase().includes(q)
        );
        return matchesClient || matchesPhone || matchesInvoice || matchesDriver || matchesItems;
      }
      return true;
    });
  }, [userAllowedOrders, statusFilter, typeFilter, searchQuery]);

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
      setNoticeMessage(`Rapport journalier (${fileName}) téléchargé avec succès.`);
      setTimeout(() => setNoticeMessage(null), 5000);
    } catch (err) {
      setNoticeMessage('Erreur lors de la génération du rapport PDF.');
    }
  };

  const handleDirectWhatsAppPDF = async (order: Order) => {
    try {
      const res = await shareInvoicePDFOnWhatsApp(order, currentBoutique);
      if (res.method === 'native_share') {
        setNoticeMessage(`Facture PDF ${order.invoiceNumber} partagée sur WhatsApp !`);
      } else {
        setNoticeMessage(`Facture PDF ${order.invoiceNumber} téléchargée et WhatsApp ouvert pour ${order.clientName}.`);
      }
      setTimeout(() => setNoticeMessage(null), 5000);
    } catch {
      setNoticeMessage('Erreur lors du partage WhatsApp.');
    }
  };

  const handleDirectDownloadPDF = (order: Order) => {
    try {
      const fileName = downloadInvoicePDF(order, currentBoutique);
      setNoticeMessage(`Facture PDF (${fileName}) téléchargée.`);
      setTimeout(() => setNoticeMessage(null), 4000);
    } catch {
      setNoticeMessage('Erreur lors du téléchargement PDF.');
    }
  };

  const handleDirectPrint = (order: Order) => {
    try {
      printInvoicePDF(order, currentBoutique);
      setNoticeMessage(`Impression lancée pour la facture N° ${order.invoiceNumber}.`);
      setTimeout(() => setNoticeMessage(null), 4000);
    } catch {
      onViewInvoice(order);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'en_cours':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
            <Clock className="w-3 h-3" />
            <span>En cours</span>
          </span>
        );
      case 'livre_paye':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="w-3 h-3" />
            <span>Soldé</span>
          </span>
        );
      case 'annule':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3 h-3" />
            <span>Annulé</span>
          </span>
        );
    }
  };

  const getPaymentBadge = (method: PaymentMethod) => {
    switch (method) {
      case 'wave':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200/60">
            Wave
          </span>
        );
      case 'orange_money':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200/60">
            Orange Money
          </span>
        );
      case 'cash':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            Espèces
          </span>
        );
    }
  };

  return (
    <div className="pb-24 lg:pb-12 space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Ventes & Factures Clients
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Gérez le flux des commandes, partagez les factures PDF sur WhatsApp et téléchargez vos bilans.
          </p>
        </div>

        {canExport && (
          <div className="flex flex-wrap items-center gap-2">
            {onOpenExportModal && (
              <button
                onClick={() => onOpenExportModal('sales')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                title="Exporter les ventes et commandes en CSV ou générer le bilan PDF"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
                <span>Exporter Ventes (CSV / PDF)</span>
              </button>
            )}

            <button
              onClick={handleDownloadTodayReport}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              title="Télécharger le rapport de ventes du jour en PDF"
            >
              <FileDown className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Rapport Jour (PDF)</span>
            </button>
          </div>
        )}
      </div>

      {/* Floating Notice / Feedback */}
      {noticeMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">{noticeMessage}</span>
          </div>
          <button onClick={() => setNoticeMessage(null)} className="text-slate-400 hover:text-slate-700 font-bold px-1">
            ×
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par n° de facture (ex: FAC-2026-001), cliente, téléphone, livreur..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Status filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Toutes ({orders.length})
            </button>
            <button
              onClick={() => setStatusFilter('en_cours')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === 'en_cours'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              En cours ({orders.filter((o) => o.status === 'en_cours').length})
            </button>
            <button
              onClick={() => setStatusFilter('livre_paye')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === 'livre_paye'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Soldées ({orders.filter((o) => o.status === 'livre_paye').length})
            </button>
          </div>

          {/* Type filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                typeFilter === 'all' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tous modes
            </button>
            <button
              onClick={() => setTypeFilter('delivery')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                typeFilter === 'delivery' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Livraisons
            </button>
            <button
              onClick={() => setTypeFilter('store')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                typeFilter === 'store' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Retraits boutique
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-2xs">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">Aucune commande trouvée</p>
          <p className="text-xs text-slate-500 mt-1">
            Modifiez vos critères de recherche pour afficher les commandes.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const cleanPhone = order.clientPhone.replace(/[^0-9]/g, '');
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Info & items */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {order.invoiceNumber}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500 font-mono">
                      {order.createdAt}
                    </span>
                    <span className="text-slate-300">·</span>
                    {getStatusBadge(order.status)}
                    {getPaymentBadge(order.paymentMethod)}
                    {(order.isModified || (order.returnsHistory && order.returnsHistory.length > 0)) && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                        Retour / Modifié
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">
                      {order.clientName}
                    </p>
                    <span className="text-xs font-mono text-slate-500">
                      ({order.clientPhone})
                    </span>
                  </div>

                  {/* Order Items summary */}
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">
                      {order.items.reduce((s, i) => s + i.quantity, 0)} vêtement(s) :
                    </span>{' '}
                    {order.items
                      .map((i) => `${i.quantity}x ${i.clothingName} (${i.size})`)
                      .join(', ')}
                  </div>

                  {/* Delivery info */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      {order.isDelivery ? (
                        <>
                          <Bike className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            Livraison : <strong>{order.deliveryAddress}</strong>
                          </span>
                        </>
                      ) : (
                        <>
                          <Store className="w-3.5 h-3.5 text-slate-400" />
                          <span>Retrait boutique</span>
                        </>
                      )}
                    </span>

                    {order.deliveryDriverName && (
                      <span className="text-slate-600">
                        Livreur : <strong>{order.deliveryDriverName}</strong>
                      </span>
                    )}

                    <span className="text-slate-400">
                      Vendeur : {order.createdBySellerName}
                    </span>
                  </div>
                </div>

                {/* Right: Total & Interactive Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Total Net
                    </span>
                    <span className="text-base sm:text-lg font-bold font-mono text-slate-900 tabular-nums">
                      {order.totalAmount.toLocaleString('fr-FR')} <span className="text-xs font-sans">FCFA</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {/* Direct WhatsApp PDF Share button */}
                    <button
                      onClick={() => handleDirectWhatsAppPDF(order)}
                      className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Partager directement le PDF officiel sur WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden md:inline">WhatsApp PDF</span>
                    </button>

                    {/* Direct Download PDF button */}
                    <button
                      onClick={() => handleDirectDownloadPDF(order)}
                      className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Télécharger la facture PDF"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      <span className="hidden sm:inline">PDF</span>
                    </button>

                    {/* Direct Print Invoice button */}
                    <button
                      onClick={() => handleDirectPrint(order)}
                      className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-800 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Imprimer directement la facture ou le ticket"
                    >
                      <Printer className="w-3.5 h-3.5 text-blue-600" />
                      <span className="hidden sm:inline">Imprimer</span>
                    </button>

                    {/* View Invoice Sheet Modal */}
                    <button
                      onClick={() => onViewInvoice(order)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Voir la facture complète"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Voir</span>
                    </button>

                    {/* Modify / Return button - réservé aux utilisateurs autorisés sales.refund */}
                    {canRefund && (
                      <button
                        onClick={() => onEditOrder(order)}
                        className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-amber-200 bg-amber-50/80 hover:bg-amber-100 text-amber-900 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Gérer un retour d'article ou échanger un vêtement"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                        <span className="hidden lg:inline">Retour</span>
                      </button>
                    )}

                    {/* If in progress, allow direct settlement */}
                    {order.status === 'en_cours' && (
                      <button
                        onClick={() => markOrderDeliveredAndPaid(order.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 active:scale-95 cursor-pointer"
                        title="Marquer la commande comme livrée et encaissée"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Soldé</span>
                      </button>
                    )}

                    {/* Annulation de commande - réservé aux utilisateurs autorisés sales.cancel */}
                    {order.status === 'en_cours' && canCancel && (
                      <button
                        onClick={() => cancelOrder(order.id, 'Annulée par vendeur')}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Annuler la commande (réintègre les stocks)"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
