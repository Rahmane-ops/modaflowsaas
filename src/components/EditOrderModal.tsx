import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  RefreshCw,
  CreditCard,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ClothingItem, Order, OrderItem, PaymentMethod } from '../types';

interface EditOrderModalProps {
  order: Order | null;
  onClose: () => void;
  onOrderUpdated: (updatedOrder: Order) => void;
}

interface ReturnItemState {
  clothingId: string;
  clothingName: string;
  size: string;
  quantity: number;
  unitPrice: number;
  reason: string;
  actionType: 'remboursement' | 'echange' | 'avoir';
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  order,
  onClose,
  onOrderUpdated,
}) => {
  const { clothes, modifyOrder } = useStore();

  // Local working copy of items
  const [items, setItems] = useState<OrderItem[]>(order?.items || []);
  const [returnsList, setReturnsList] = useState<ReturnItemState[]>([]);
  const [refundPaymentMethod, setRefundPaymentMethod] = useState<PaymentMethod>(order?.paymentMethod || 'cash');
  const [returnNotes, setReturnNotes] = useState('');
  
  // Exchange article selector
  const [isAddingExchange, setIsAddingExchange] = useState(false);
  const [selectedExchangeClothId, setSelectedExchangeClothId] = useState(clothes[0]?.id || '');
  const [selectedExchangeSize, setSelectedExchangeSize] = useState('38');
  const [selectedExchangeQty, setSelectedExchangeQty] = useState(1);

  if (!order) return null;

  // Return trigger for a specific item
  const handleInitiateReturn = (item: OrderItem, qtyToReturn: number, reason: string, actionType: 'remboursement' | 'echange' | 'avoir') => {
    // 1. Decrement or remove from items
    setItems((prev) => {
      return prev
        .map((it) => {
          if (it.clothingId === item.clothingId && it.size === item.size) {
            const nextQty = it.quantity - qtyToReturn;
            if (nextQty <= 0) return null;
            return {
              ...it,
              quantity: nextQty,
              subtotal: nextQty * it.unitPrice,
            };
          }
          return it;
        })
        .filter(Boolean) as OrderItem[];
    });

    // 2. Add to returnsList
    setReturnsList((prev) => [
      ...prev,
      {
        clothingId: item.clothingId,
        clothingName: item.clothingName,
        size: item.size,
        quantity: qtyToReturn,
        unitPrice: item.unitPrice,
        reason,
        actionType,
      },
    ]);
  };

  const handleAddExchangeArticle = () => {
    const cloth = clothes.find((c) => c.id === selectedExchangeClothId);
    if (!cloth) return;

    setItems((prev) => {
      const existing = prev.find(
        (i) => i.clothingId === cloth.id && i.size === selectedExchangeSize
      );
      if (existing) {
        return prev.map((i) => {
          if (i.clothingId === cloth.id && i.size === selectedExchangeSize) {
            const nextQty = i.quantity + selectedExchangeQty;
            return {
              ...i,
              quantity: nextQty,
              subtotal: nextQty * i.unitPrice,
            };
          }
          return i;
        });
      } else {
        const newItem: OrderItem = {
          clothingId: cloth.id,
          clothingName: cloth.name,
          category: cloth.category,
          size: selectedExchangeSize,
          quantity: selectedExchangeQty,
          unitPrice: cloth.price,
          subtotal: selectedExchangeQty * cloth.price,
          imageUrl: cloth.imageUrl,
        };
        return [...prev, newItem];
      }
    });

    setIsAddingExchange(false);
  };

  // Calculations
  const originalTotal = order.totalAmount;
  const newTotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalReturnedValue = returnsList.reduce(
    (sum, ret) => sum + ret.quantity * ret.unitPrice,
    0
  );
  const netDifference = newTotal - originalTotal; // Negative means refund, Positive means extra payment

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updated = await modifyOrder(order.id, items, {
      returnedItems: returnsList,
      refundPaymentMethod,
      notes: returnNotes.trim() || undefined,
    });

    if (updated) {
      onOrderUpdated(updated);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-auto shadow-2xl overflow-hidden border border-neutral-200 animate-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-neutral-950 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Gestion des Retours & Modification Commande
              </h2>
              <p className="text-xs text-neutral-500">
                Facture {order.invoiceNumber} · Client : {order.clientName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Real-time stock restoration notice */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Gestion automatique des stocks :</strong> Tout article retourné sera immédiatement réintégré dans le stock disponible de la boutique.
            </span>
          </div>

          {/* Current items in the order */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Articles Actuels de la Commande
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingExchange(!isAddingExchange)}
                className="text-xs font-semibold text-neutral-900 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter un article en échange</span>
              </button>
            </div>

            {items.length === 0 ? (
              <div className="p-6 text-center bg-neutral-50 rounded-2xl border border-neutral-200 text-neutral-500">
                Tous les articles ont été retournés.
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={`${item.clothingId}-${item.size}`}
                    className="p-3 rounded-2xl border border-neutral-200 bg-white flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.imageUrl}
                        alt={item.clothingName}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-neutral-100"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-neutral-900 truncate">{item.clothingName}</p>
                        <p className="text-[11px] text-neutral-500">
                          Taille : <strong>{item.size}</strong> · {item.unitPrice.toLocaleString('fr-FR')} FCFA · Qté : <strong>{item.quantity}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-neutral-900 text-xs">
                        {item.subtotal.toLocaleString('fr-FR')} F
                      </span>

                      {/* Fast return trigger */}
                      <button
                        type="button"
                        onClick={() => {
                          const reason = prompt('Motif du retour :', 'Mauvaise taille (trop grand / trop petit)') || 'Retour client';
                          handleInitiateReturn(item, 1, reason, 'remboursement');
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold flex items-center gap-1 transition-colors"
                        title="Retourner 1 pièce de cet article"
                      >
                        <RotateCcw className="w-3 h-3 text-amber-700" />
                        <span>Retourner (-1)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form to add exchange piece */}
          {isAddingExchange && (
            <div className="p-4 rounded-2xl border border-neutral-300 bg-neutral-50 space-y-3 animate-in fade-in">
              <h4 className="font-bold text-neutral-900 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-neutral-700" />
                Sélectionner la pièce de remplacement / échange :
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-neutral-500 mb-1">Vêtement du catalogue</label>
                  <select
                    value={selectedExchangeClothId}
                    onChange={(e) => setSelectedExchangeClothId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-semibold"
                  >
                    {clothes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.price.toLocaleString('fr-FR')} F · Dispo: {c.stock})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-500 mb-1">Taille</label>
                  <select
                    value={selectedExchangeSize}
                    onChange={(e) => setSelectedExchangeSize(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-semibold"
                  >
                    {(() => {
                      const sel = clothes.find((c) => c.id === selectedExchangeClothId);
                      const szList = sel?.sizes?.length ? sel.sizes : ['34', '36', '38', '40', '42', '44', '46'];
                      return szList.map((sz) => {
                        const st = sel?.sizeStock?.[sz];
                        return (
                          <option key={sz} value={sz}>
                            Taille {sz} {typeof st === 'number' ? `(${st} en stock)` : ''}
                          </option>
                        );
                      });
                    })()}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingExchange(false)}
                  className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleAddExchangeArticle}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white font-bold hover:bg-neutral-800"
                >
                  Ajouter à la commande
                </button>
              </div>
            </div>
          )}

          {/* Returned items list */}
          {returnsList.length > 0 && (
            <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/60 space-y-2">
              <h4 className="font-bold text-amber-900 flex items-center justify-between">
                <span>Articles à Réintégrer en Stock ({returnsList.length})</span>
                <span className="font-mono text-xs">
                  Valeur : -{totalReturnedValue.toLocaleString('fr-FR')} FCFA
                </span>
              </h4>

              <div className="divide-y divide-amber-100">
                {returnsList.map((ret, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-neutral-900">
                        {ret.quantity}x {ret.clothingName} ({ret.size})
                      </p>
                      <p className="text-[11px] text-amber-800">
                        Motif : {ret.reason} · Action : <strong>{ret.actionType}</strong>
                      </p>
                    </div>
                    <span className="font-mono font-bold text-amber-900">
                      -{(ret.quantity * ret.unitPrice).toLocaleString('fr-FR')} F
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Refund or Adjustment details */}
          {netDifference !== 0 && (
            <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-3">
              <h4 className="font-bold text-neutral-900">
                Régularisation Financière Comptable
              </h4>

              {netDifference < 0 ? (
                <div>
                  <div className="flex items-center justify-between text-rose-700 font-bold mb-2">
                    <span>Montant net à rembourser au client :</span>
                    <span className="font-mono text-sm">
                      {Math.abs(netDifference).toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                  <label className="block text-[11px] text-neutral-600 mb-1">
                    Canal de remboursement :
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['wave', 'orange_money', 'cash'] as PaymentMethod[]).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setRefundPaymentMethod(method)}
                        className={`py-2 rounded-xl border text-center font-bold capitalize transition-all ${
                          refundPaymentMethod === method
                            ? 'border-neutral-900 bg-neutral-900 text-white'
                            : 'border-neutral-200 bg-white text-neutral-700'
                        }`}
                      >
                        {method.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-emerald-700 font-bold">
                  <span>Complément à encaisser auprès du client :</span>
                  <span className="font-mono text-sm">
                    +{netDifference.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Note field */}
          <div>
            <label className="block font-semibold text-neutral-700 mb-1">
              Commentaire sur la modification (ex: raison de l’échange, état du vêtement rapporté) :
            </label>
            <input
              type="text"
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              placeholder="Ex: Robe rapportée en parfait état. Remplacement de taille effectué."
              className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none"
            />
          </div>
        </div>

        {/* Footer with totals and submit */}
        <div className="p-4 sm:px-6 bg-white border-t border-neutral-100 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] uppercase font-bold text-neutral-400">
                Nouveau Total :
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-neutral-900 tabular-nums">
                {newTotal.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
            {netDifference !== 0 && (
              <p className={`text-[11px] font-mono font-bold ${netDifference < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                Écart : {netDifference > 0 ? '+' : ''}{netDifference.toLocaleString('fr-FR')} FCFA
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Valider la modification</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
