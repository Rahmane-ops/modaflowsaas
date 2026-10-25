import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  Trash2, 
  Bike, 
  Store, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Smartphone, 
  User, 
  MapPin, 
  FileText,
  AlertCircle,
  Tag,
  Percent,
  Sparkles
} from 'lucide-react';
import { PaymentMethod, OrderDiscount, Order } from '../types';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated,
}) => {
  const { 
    cart, 
    updateCartItemQty, 
    removeFromCart, 
    clearCart, 
    cartTotal, 
    createOrder, 
    deliveryDrivers,
    clients,
    currentUser,
  } = useStore();

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [isDelivery, setIsDelivery] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState(
    deliveryDrivers[0]?.id || ''
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Discount management state
  const [hasDiscount, setHasDiscount] = useState<boolean>(false);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [discountReason, setDiscountReason] = useState<string>('Fidélité cliente VIP');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Computed discount amount and net total
  const calculatedDiscountAmount = useMemo(() => {
    if (!hasDiscount || cartTotal <= 0) return 0;
    if (discountType === 'percentage') {
      const pct = Math.min(100, Math.max(0, Number(discountValue) || 0));
      return Math.round((cartTotal * pct) / 100);
    } else {
      const fixed = Math.max(0, Number(discountValue) || 0);
      return Math.min(cartTotal, fixed);
    }
  }, [hasDiscount, discountType, discountValue, cartTotal]);

  const finalNetTotal = Math.max(0, cartTotal - calculatedDiscountAmount);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isSubmitting) return;

    if (cart.length === 0) {
      setErrorMessage('Votre panier est vide. Veuillez sélectionner des vêtements.');
      return;
    }
    if (!clientName.trim()) {
      setErrorMessage('Veuillez renseigner le nom du client.');
      return;
    }
    if (!clientPhone.trim()) {
      setErrorMessage('Veuillez renseigner le numéro de contact du client.');
      return;
    }
    if (isDelivery && !deliveryAddress.trim()) {
      setErrorMessage('Veuillez renseigner l’adresse ou le quartier de livraison.');
      return;
    }

    // Determine initial status according to user instructions:
    // "si la commande doit etre livré il doit juste mettre commande en cour, une fois livrè et payer il poura mettre la commande dans l'état payé et soldé définitivement"
    const status = isDelivery ? 'en_cours' : 'livre_paye';

    const discountData: OrderDiscount | undefined = hasDiscount && calculatedDiscountAmount > 0 ? {
      type: discountType,
      value: Number(discountValue) || 0,
      amount: calculatedDiscountAmount,
      reason: discountReason.trim() || 'Remise commerciale',
      authorizedBy: currentUser?.name || 'Direction',
    } : undefined;

    try {
      setIsSubmitting(true);
      const createdOrder = await createOrder({
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        deliveryAddress: isDelivery
          ? deliveryAddress.trim()
          : 'Retrait direct en boutique',
        isDelivery,
        deliveryDriverId: isDelivery ? selectedDriverId : undefined,
        paymentMethod,
        status,
        notes: notes.trim() || undefined,
        discount: discountData,
      });

      if (createdOrder) {
        onOrderCreated(createdOrder);
      }
      onClose();
    } catch (err: any) {
      console.error('Erreur lors de la validation de commande:', err);
      setErrorMessage(err?.message || "Erreur lors de l'enregistrement de la commande. Veuillez vérifier vos données et réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-auto shadow-2xl overflow-hidden border border-neutral-200 animate-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-900">
              Finaliser la Commande Client
            </h2>
            <p className="text-xs text-neutral-500">
              Vérifiez les articles, renseignez le client et générez la facture instantanée.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Cart items list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Articles Sélectionnés ({cart.length})
              </h3>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Vider</span>
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-200 border-dashed">
                <p className="text-xs text-neutral-500">Aucun article dans le panier.</p>
                <p className="text-xs text-neutral-400 mt-1">
                  Ajoutez des vêtements depuis le catalogue avant de lancer une commande.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={`${item.clothingId}-${item.size}`}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-neutral-100 bg-neutral-50/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.imageUrl}
                        alt={item.clothingName}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-neutral-900 truncate">
                          {item.clothingName}
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          Taille : <span className="font-semibold text-neutral-800">{item.size}</span> · {item.unitPrice.toLocaleString('fr-FR')} F
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => updateCartItemQty(item.clothingId, item.size, -1)}
                          className="w-6 h-6 flex items-center justify-center text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold font-mono">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartItemQty(item.clothingId, item.size, 1)}
                          className="w-6 h-6 flex items-center justify-center text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-bold font-mono text-neutral-900 min-w-[70px] text-right">
                        {item.subtotal.toLocaleString('fr-FR')} F
                      </span>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.clothingId, item.size)}
                        className="text-neutral-400 hover:text-rose-600 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form id="new-order-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Client Coordinates */}
            <div className="bg-neutral-50/70 p-4 rounded-2xl border border-neutral-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-neutral-500" />
                  Informations du Client
                </h4>
                {clients.length > 0 && (
                  <span className="text-[10px] text-neutral-500">
                    Cliquez sur un client pour pré-remplir :
                  </span>
                )}
              </div>

              {/* Quick existing clients auto-fill bar */}
              {clients.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {clients.slice(0, 5).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setClientName(c.name);
                        setClientPhone(c.phone);
                        if (c.address) setDeliveryAddress(c.address);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 text-[11px] font-medium text-neutral-800 shrink-0 flex items-center gap-1 transition-colors"
                    >
                      <span className="font-semibold">{c.name}</span>
                      {c.loyaltyTier === 'vip' && <span className="text-amber-500 font-bold">👑</span>}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Nom & Prénom du Client *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: Aïda Diouf"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Numéro Téléphone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Ex: +221 77 123 45 67"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Delivery choice */}
            <div className="bg-neutral-50/70 p-4 rounded-2xl border border-neutral-200 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                <Bike className="w-3.5 h-3.5 text-neutral-500" />
                Mode de Réception & Suivi
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsDelivery(true)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isDelivery
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Bike className="w-4 h-4" />
                    <span className="text-xs font-bold">Livraison à domicile</span>
                  </div>
                  <p className={`text-[11px] ${isDelivery ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    Statut initial : <strong>En cours</strong>
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDelivery(false)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    !isDelivery
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Store className="w-4 h-4" />
                    <span className="text-xs font-bold">Retrait en boutique</span>
                  </div>
                  <p className={`text-[11px] ${!isDelivery ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    Statut initial : <strong>Payé & Soldé</strong>
                  </p>
                </button>
              </div>

              {isDelivery && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Adresse ou Quartier de livraison *
                    </label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Ex: Almadies, Villa 12 près de la Brioche Dorée"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Assigner à un livreur :
                    </label>
                    <select
                      value={selectedDriverId}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                    >
                      {deliveryDrivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name} ({driver.title})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-neutral-50/70 p-4 rounded-2xl border border-neutral-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-neutral-500" />
                Mode de Règlement
              </h4>

              <div className="grid grid-cols-3 gap-2.5">
                {/* Wave */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wave')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                    paymentMethod === 'wave'
                      ? 'border-[#00A3FF] bg-[#00A3FF]/10 text-neutral-900 ring-2 ring-[#00A3FF]'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-[#00A3FF] text-white flex items-center justify-center font-bold text-xs mb-1">
                    W
                  </div>
                  <span className="text-xs font-bold">Wave</span>
                  <span className="text-[10px] text-neutral-400">Paiement Mobile</span>
                </button>

                {/* Orange Money */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('orange_money')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                    paymentMethod === 'orange_money'
                      ? 'border-[#FF6600] bg-[#FF6600]/10 text-neutral-900 ring-2 ring-[#FF6600]'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-[#FF6600] text-white flex items-center justify-center font-bold text-xs mb-1">
                    OM
                  </div>
                  <span className="text-xs font-bold">Orange Money</span>
                  <span className="text-[10px] text-neutral-400">Paiement Mobile</span>
                </button>

                {/* Cash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-emerald-600 bg-emerald-50 text-neutral-900 ring-2 ring-emerald-600'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs mb-1">
                    💵
                  </div>
                  <span className="text-xs font-bold">Espèces</span>
                  <span className="text-[10px] text-neutral-400">Cash à livraison</span>
                </button>
              </div>
            </div>

            {/* Discount Management Block */}
            <div className="bg-neutral-50/70 p-4 rounded-2xl border border-neutral-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                    Remise Commerciale & Fidélité
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasDiscount}
                    onChange={(e) => setHasDiscount(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                  />
                  <span className="text-xs font-semibold text-neutral-700">
                    Appliquer une remise
                  </span>
                </label>
              </div>

              {hasDiscount && (
                <div className="pt-2 border-t border-neutral-200 space-y-3">
                  {/* Discount Type: Percentage vs Fixed */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDiscountType('percentage');
                        setDiscountValue(10);
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        discountType === 'percentage'
                          ? 'bg-neutral-900 text-white shadow-xs'
                          : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <Percent className="w-3.5 h-3.5" />
                      <span>Pourcentage (%)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDiscountType('fixed');
                        setDiscountValue(5000);
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        discountType === 'fixed'
                          ? 'bg-neutral-900 text-white shadow-xs'
                          : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <span>Montant Fixe (FCFA)</span>
                    </button>
                  </div>

                  {/* Value and Presets */}
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                      {discountType === 'percentage' ? 'Valeur de la remise (%)' : 'Montant de la remise (FCFA)'} :
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          min="1"
                          max={discountType === 'percentage' ? 100 : cartTotal}
                          value={discountValue || ''}
                          onChange={(e) => setDiscountValue(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-bold text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">
                          {discountType === 'percentage' ? '%' : 'FCFA'}
                        </span>
                      </div>

                      {/* Quick Presets */}
                      <div className="flex items-center gap-1">
                        {discountType === 'percentage' ? (
                          [5, 10, 15, 20].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => setDiscountValue(pct)}
                              className={`px-2.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                discountValue === pct
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                              }`}
                            >
                              {pct}%
                            </button>
                          ))
                        ) : (
                          [2000, 3000, 5000].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setDiscountValue(amt)}
                              className={`px-2 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                discountValue === amt
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                              }`}
                            >
                              {(amt / 1000)}k
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reason & Preset suggestions */}
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                      Motif ou justification de la remise :
                    </label>
                    <input
                      type="text"
                      value={discountReason}
                      onChange={(e) => setDiscountReason(e.target.value)}
                      placeholder="Ex: Fidélité cliente VIP, Promotion boutique..."
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:outline-none mb-1.5"
                    />

                    {/* Quick reason suggestions */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                      {[
                        'Fidélité cliente VIP',
                        'Promotion Boutique',
                        'Geste Commercial',
                        'Déstockage / Fin de série',
                        'Vente Privée',
                      ].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setDiscountReason(r)}
                          className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors shrink-0 cursor-pointer ${
                            discountReason === r
                              ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                              : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Calculation Preview Banner */}
                  <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80 text-xs space-y-1">
                    <div className="flex justify-between text-neutral-600">
                      <span>Sous-total articles :</span>
                      <span className="font-mono">{cartTotal.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="flex justify-between text-rose-600 font-bold">
                      <span>Déduction remise ({discountType === 'percentage' ? `${discountValue}%` : 'Montant fixe'}) :</span>
                      <span className="font-mono">-{calculatedDiscountAmount.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="pt-1 border-t border-rose-200 flex justify-between text-neutral-900 font-extrabold">
                      <span>Net à régler :</span>
                      <span className="font-mono text-emerald-700">{finalNetTotal.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Remarques ou instructions particulières (optionnel) :
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Livrer avant 18h, appeler 15 min avant."
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
              />
            </div>
          </form>
        </div>

        {/* Footer with Total and Submit */}
        <div className="p-4 sm:px-6 bg-white border-t border-neutral-100 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
              {hasDiscount && calculatedDiscountAmount > 0 ? 'Total Net à Encaisser' : 'Total à Encaisser'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-bold font-mono text-neutral-900 tabular-nums">
                {finalNetTotal.toLocaleString('fr-FR')} <span className="text-xs font-sans">FCFA</span>
              </span>
              {hasDiscount && calculatedDiscountAmount > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono text-neutral-400 line-through">
                    {cartTotal.toLocaleString('fr-FR')} F
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                    -{calculatedDiscountAmount.toLocaleString('fr-FR')} F
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="new-order-form"
              disabled={cart.length === 0 || isSubmitting}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                cart.length === 0 || isSubmitting
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Génération de la facture...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Valider & Générer Facture PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
