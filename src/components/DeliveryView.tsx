import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Bike, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  ExternalLink,
  MessageCircle,
  FileText,
  Filter,
  Check
} from 'lucide-react';
import { Order, PaymentMethod } from '../types';

interface DeliveryViewProps {
  onViewInvoice: (order: Order) => void;
}

export const DeliveryView: React.FC<DeliveryViewProps> = ({ onViewInvoice }) => {
  const { 
    orders, 
    currentUser, 
    deliveryDrivers, 
    markOrderDeliveredAndPaid 
  } = useStore();

  const [filterDriverId, setFilterDriverId] = useState<string>(
    currentUser.role === 'delivery' ? currentUser.id : 'all'
  );
  const [activeTabSub, setActiveTabSub] = useState<'pending' | 'delivered'>('pending');
  const [confirmingOrder, setConfirmingOrder] = useState<Order | null>(null);
  const [confirmedPaymentMethod, setConfirmedPaymentMethod] = useState<PaymentMethod>('cash');

  // Filter deliveries
  const deliveryOrders = orders.filter((o) => {
    if (!o.isDelivery) return false;
    if (filterDriverId !== 'all' && o.deliveryDriverId !== filterDriverId) return false;
    return true;
  });

  const pendingDeliveries = deliveryOrders.filter((o) => o.status === 'en_cours');
  const completedDeliveries = deliveryOrders.filter((o) => o.status === 'livre_paye');

  const handleStartConfirm = (order: Order) => {
    setConfirmingOrder(order);
    setConfirmedPaymentMethod(order.paymentMethod);
  };

  const handleExecuteDeliveryConfirmation = () => {
    if (!confirmingOrder) return;
    markOrderDeliveredAndPaid(confirmingOrder.id, confirmedPaymentMethod);
    setConfirmingOrder(null);
  };

  const getPaymentBadge = (method: PaymentMethod) => {
    switch (method) {
      case 'wave':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#00A3FF]/15 text-[#0070AA] font-bold text-[10px]">
            Wave
          </span>
        );
      case 'orange_money':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FF6600]/15 text-[#D15500] font-bold text-[10px]">
            Orange Money
          </span>
        );
      case 'cash':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
            Espèces (Cash)
          </span>
        );
    }
  };

  return (
    <div className="pb-24 lg:pb-12 space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
              Espace Livraisons & Suivi Chauffeurs
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              Temps Réel
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Visualisez les colis en cours, les articles confiés à chaque livreur et validez la remise et le paiement.
          </p>
        </div>

        {/* Driver Selector Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-neutral-600 hidden sm:inline">
            Filtrer par livreur :
          </label>
          <select
            value={filterDriverId}
            onChange={(e) => setFilterDriverId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          >
            <option value="all">Tous les livreurs ({deliveryDrivers.length})</option>
            {deliveryDrivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-600">
            Courses en cours
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {pendingDeliveries.length}
          </p>
          <p className="text-[11px] text-amber-600 font-medium mt-1">
            À livrer et encaisser aujourd’hui
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-600">
            Livraisons soldées
          </span>
          <p className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">
            {completedDeliveries.length}
          </p>
          <p className="text-[11px] text-slate-600 mt-1">
            Paiements validés & enregistrés
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-600">
            Montant total encaissé
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {completedDeliveries
              .reduce((sum, o) => sum + o.totalAmount, 0)
              .toLocaleString('fr-FR')}{' '}
            <span className="text-xs font-normal text-slate-600">FCFA</span>
          </p>
          <p className="text-[11px] text-slate-600 mt-1">
            Par les livreurs sélectionnés
          </p>
        </div>
      </div>

      {/* Sub Tabs: En cours vs Historique */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
        <button
          onClick={() => setActiveTabSub('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTabSub === 'pending'
              ? 'bg-neutral-900 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Courses En Cours ({pendingDeliveries.length})</span>
        </button>

        <button
          onClick={() => setActiveTabSub('delivered')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTabSub === 'delivered'
              ? 'bg-neutral-900 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Historique Livré & Soldé ({completedDeliveries.length})</span>
        </button>
      </div>

      {/* SECTION 1: Pending Deliveries */}
      {activeTabSub === 'pending' && (
        <div className="space-y-4">
          {pendingDeliveries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
              <Bike className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-neutral-900">
                Toutes les livraisons sont à jour !
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Aucune livraison en attente pour le filtre sélectionné.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingDeliveries.map((order) => {
                const cleanPhone = order.clientPhone.replace(/[^0-9]/g, '');
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs hover:border-neutral-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header: Order ref & driver */}
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-neutral-900">
                            {order.invoiceNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                            En cours de livraison
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          {order.createdAt}
                        </span>
                      </div>

                      {/* Client Coordinates & Quick Call/WhatsApp */}
                      <div className="mt-3 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-neutral-900">
                              {order.clientName}
                            </p>
                            <p className="text-xs text-neutral-600 font-mono mt-0.5">
                              {order.clientPhone}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <a
                              href={`tel:${cleanPhone}`}
                              className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center hover:bg-neutral-800 transition-colors"
                              title="Appeler le client"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-500 transition-colors"
                              title="Envoyer message WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>

                        <div className="flex items-start gap-1.5 mt-2 text-xs text-neutral-600">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                          <span>{order.deliveryAddress}</span>
                        </div>
                      </div>

                      {/* Items details: Exactly showing which articles are being delivered! */}
                      <div className="mt-4 space-y-2">
                        <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                          Articles confiés ({order.items.reduce((s, i) => s + i.quantity, 0)}) :
                        </span>
                        <div className="divide-y divide-neutral-100">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="py-2 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={item.imageUrl}
                                  alt={item.clothingName}
                                  className="w-10 h-10 rounded-lg object-cover shrink-0 border border-neutral-200"
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-neutral-900 truncate">
                                    {item.clothingName}
                                  </p>
                                  <p className="text-[11px] text-neutral-500">
                                    Taille : <span className="font-semibold text-neutral-700">{item.size}</span> · Qté :{' '}
                                    <span className="font-mono font-bold text-neutral-900">{item.quantity}</span>
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs font-mono font-bold text-neutral-900 shrink-0">
                                {item.subtotal.toLocaleString('fr-FR')} F
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {order.notes && (
                        <div className="mt-3 p-2 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-900 text-[11px]">
                          <strong>Note :</strong> {order.notes}
                        </div>
                      )}

                      <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                        <span className="text-neutral-500">
                          Livreur en charge : <strong>{order.deliveryDriverName || 'Non assigné'}</strong>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-400 text-[11px]">À régler par :</span>
                          {getPaymentBadge(order.paymentMethod)}
                        </div>
                      </div>
                    </div>

                    {/* Bottom CTA to confirm delivery & cash collection */}
                    <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                          Montant à Encaisser
                        </span>
                        <span className="text-base font-bold font-mono text-neutral-900 tabular-nums">
                          {order.totalAmount.toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewInvoice(order)}
                          className="p-2 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors"
                          title="Voir Facture"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStartConfirm(order)}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Valider Livraison & Paiement</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: Completed / Delivered History */}
      {activeTabSub === 'delivered' && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              Historique des Livraisons Effectuées (Quel Livreur a Livré Quel Article)
            </h3>
            <span className="text-xs text-neutral-400 tabular-nums">
              {completedDeliveries.length} livraisons soldées
            </span>
          </div>

          {completedDeliveries.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500">
              Aucune livraison soldée pour le moment.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[10px] font-bold border-b border-neutral-200">
                    <th className="py-3 px-4">Réf Facture</th>
                    <th className="py-3 px-4">Date Livraison</th>
                    <th className="py-3 px-4">Livreur Ayant Livré</th>
                    <th className="py-3 px-4">Client & Adresse</th>
                    <th className="py-3 px-4">Articles Livrés</th>
                    <th className="py-3 px-4">Règlement</th>
                    <th className="py-3 px-4 text-right">Montant</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {completedDeliveries.map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-neutral-900 whitespace-nowrap">
                        {order.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-500 whitespace-nowrap">
                        {order.deliveredAt || order.createdAt}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Bike className="w-3.5 h-3.5 text-neutral-500" />
                          <span className="font-semibold text-neutral-900">
                            {order.deliveryDriverName || 'Express'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-neutral-900">{order.clientName}</p>
                        <p className="text-[11px] text-neutral-500 truncate max-w-[200px]">
                          {order.deliveryAddress}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {order.items.map((it, idx) => (
                            <p key={idx} className="text-[11px] text-neutral-700">
                              <span className="font-bold text-neutral-900">{it.quantity}x</span> {it.clothingName} ({it.size})
                            </p>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getPaymentBadge(order.paymentMethod)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900 whitespace-nowrap">
                        {order.totalAmount.toLocaleString('fr-FR')} F
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => onViewInvoice(order)}
                          className="px-2.5 py-1 rounded-lg border border-neutral-200 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
                        >
                          Facture PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog: Valider la livraison & l'encaissement */}
      {confirmingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-neutral-900">
                Confirmer la Livraison & l'Encaissement
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Commande <strong>{confirmingOrder.invoiceNumber}</strong> pour{' '}
                <strong>{confirmingOrder.clientName}</strong>
              </p>
            </div>

            <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Articles livrés :</span>
                <span className="font-semibold text-neutral-900 text-right">
                  {confirmingOrder.items.map((i) => `${i.quantity}x ${i.clothingName}`).join(', ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Montant total :</span>
                <span className="font-mono font-bold text-neutral-900">
                  {confirmingOrder.totalAmount.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            {/* Confirm Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-2">
                Confirmer le mode de paiement reçu :
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmedPaymentMethod('wave')}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                    confirmedPaymentMethod === 'wave'
                      ? 'border-[#00A3FF] bg-[#00A3FF]/15 text-[#0070AA]'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  Wave
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmedPaymentMethod('orange_money')}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                    confirmedPaymentMethod === 'orange_money'
                      ? 'border-[#FF6600] bg-[#FF6600]/15 text-[#D15500]'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  Orange M.
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmedPaymentMethod('cash')}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                    confirmedPaymentMethod === 'cash'
                      ? 'border-emerald-600 bg-emerald-100 text-emerald-800'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  Espèces
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmingOrder(null)}
                className="flex-1 py-3 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleExecuteDeliveryConfirmation}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Marquer Livré & Soldé</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
