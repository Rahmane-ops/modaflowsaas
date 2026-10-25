import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Users, 
  Search, 
  Plus, 
  Crown, 
  Sparkles, 
  Phone, 
  MessageCircle, 
  MapPin, 
  ShoppingBag, 
  Award, 
  FileText,
  Calendar,
  X,
  Check,
  Edit2
} from 'lucide-react';
import { Client, Order } from '../types';

interface ClientsViewProps {
  onViewInvoice: (order: Order) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({ onViewInvoice }) => {
  const { clients, orders, addClient, updateClient } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'vip' | 'fidele' | 'nouveau'>('all');
  
  // Selected client for details modal
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newClientCategory, setNewClientCategory] = useState('Robes');
  const [newClientNotes, setNewClientNotes] = useState('');

  // Stats
  const totalClients = clients.length;
  const vipCount = clients.filter((c) => c.loyaltyTier === 'vip').length;
  const totalLoyaltySpent = clients.reduce((sum, c) => sum + c.totalSpent, 0);

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      if (tierFilter !== 'all' && c.loyaltyTier !== tierFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          (c.favoriteCategory || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [clients, tierFilter, searchQuery]);

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientPhone.trim()) return;

    addClient({
      name: newClientName.trim(),
      phone: newClientPhone.trim(),
      address: newClientAddress.trim() || 'Dakar',
      loyaltyTier: 'nouveau',
      favoriteCategory: newClientCategory,
      notes: newClientNotes.trim() || undefined,
    });

    setIsAddModalOpen(false);
    setNewClientName('');
    setNewClientPhone('');
    setNewClientAddress('');
    setNewClientNotes('');
  };

  const handleSendWhatsAppLoyalty = (client: Client) => {
    const cleanPhone = client.phone.replace(/[^0-9]/g, '');
    let greeting = `*MODAFLOW ATELIER BOUTIQUE*%0A`;
    greeting += `Chère *${encodeURIComponent(client.name)}*,%0A%0A`;
    if (client.loyaltyTier === 'vip') {
      greeting += `En tant que membre *VIP Privilège* chez ModaFlow (${client.ordersCount} commandes, ${client.loyaltyPoints} points fidélité), nous avons le plaisir de vous réserver en avant-première les nouvelles pièces de notre collection ! ✨%0A%0A`;
      greeting += `Bénéficiez également d'une retouche offerte sur votre prochaine commande.%0A`;
    } else {
      greeting += `Toute l'équipe ModaFlow vous remercie pour votre confiance ! Vous cumulez actuellement *${client.loyaltyPoints} points fidélité* sur vos achats récents.%0A%0A`;
      greeting += `Consultez nos nouveautés de la semaine : robes soyeuses, ensembles lin et coupes contemporaines.%0A`;
    }
    greeting += `À très bientôt dans notre atelier ou en livraison express !`;

    window.open(`https://wa.me/${cleanPhone}?text=${greeting}`, '_blank');
  };

  // Orders for selected client
  const clientOrders = useMemo(() => {
    if (!selectedClient) return [];
    const cleanClientPhone = selectedClient.phone.replace(/\s+/g, '');
    return orders.filter(
      (o) =>
        o.clientPhone.replace(/\s+/g, '') === cleanClientPhone ||
        o.clientName.toLowerCase() === selectedClient.name.toLowerCase()
    );
  }, [orders, selectedClient]);

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'vip':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] tracking-wide border border-amber-200">
            <Crown className="w-3 h-3 text-amber-600" />
            VIP OR
          </span>
        );
      case 'fidele':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[10px] tracking-wide border border-slate-200">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            FIDÈLE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-medium text-[10px]">
            NOUVEAU
          </span>
        );
    }
  };

  return (
    <div className="pb-24 lg:pb-12 space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Fichier Clients & Fidélisation VIP
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Suivi des habitudes d'achat, historique des factures et communications ciblées WhatsApp.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau client</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">
              Clients enregistrés
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {totalClients}
          </p>
          <p className="text-[11px] text-slate-600 mt-1">
            Base active boutique & livraisons
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">
              Membres Privilège VIP
            </span>
            <Crown className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-1 tabular-nums">
            {vipCount}
          </p>
          <p className="text-[11px] text-slate-600 mt-1">
            Achats réguliers & commandes prioritaires
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">
              Valeur cumulée des achats
            </span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {totalLoyaltySpent.toLocaleString('fr-FR')}{' '}
            <span className="text-xs font-normal text-slate-600">FCFA</span>
          </p>
          <p className="text-[11px] text-slate-600 mt-1">
            Générée par la clientèle fidélisée
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom du client, téléphone, adresse ou catégorie préférée..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setTierFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              tierFilter === 'all'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Tous les clients ({clients.length})
          </button>
          <button
            onClick={() => setTierFilter('vip')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
              tierFilter === 'vip'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <Crown className="w-3 h-3 text-amber-600" />
            <span>VIP Or ({clients.filter((c) => c.loyaltyTier === 'vip').length})</span>
          </button>
          <button
            onClick={() => setTierFilter('fidele')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              tierFilter === 'fidele'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Fidèles ({clients.filter((c) => c.loyaltyTier === 'fidele').length})
          </button>
          <button
            onClick={() => setTierFilter('nouveau')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              tierFilter === 'nouveau'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Nouveaux ({clients.filter((c) => c.loyaltyTier === 'nouveau').length})
          </button>
        </div>
      </div>

      {/* Clients Cards Grid */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <Users className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-neutral-900">Aucun client trouvé</p>
          <p className="text-xs text-neutral-500 mt-1">
            Modifiez vos filtres ou enregistrez un nouveau client.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const cleanPhone = client.phone.replace(/[^0-9]/g, '');
            return (
              <div
                key={client.id}
                className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs hover:border-neutral-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center text-sm">
                        {client.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-neutral-900 leading-tight">
                          {client.name}
                        </h3>
                        <p className="text-xs font-mono text-neutral-500 mt-0.5">
                          {client.phone}
                        </p>
                      </div>
                    </div>
                    {getTierBadge(client.loyaltyTier)}
                  </div>

                  {/* Coordinates & Preferences */}
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-start gap-1.5 text-neutral-600">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{client.address}</span>
                    </div>

                    {client.favoriteCategory && (
                      <p className="text-neutral-500 text-[11px]">
                        Préférence : <strong>{client.favoriteCategory}</strong>
                      </p>
                    )}

                    {client.notes && (
                      <p className="text-neutral-500 text-[11px] italic bg-neutral-50 p-2 rounded-lg border border-neutral-100 line-clamp-2">
                        "{client.notes}"
                      </p>
                    )}
                  </div>

                  {/* Financial & Loyalty figures */}
                  <div className="mt-4 pt-3 border-t border-neutral-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                        Total Dépensé
                      </span>
                      <span className="text-sm font-bold font-mono text-neutral-900 tabular-nums">
                        {client.totalSpent.toLocaleString('fr-FR')} F
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                        Commandes
                      </span>
                      <span className="text-sm font-bold font-mono text-neutral-900 tabular-nums">
                        {client.ordersCount} ({client.loyaltyPoints} pts)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions: WhatsApp, Call, View details */}
                <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedClient(client)}
                    className="px-3 py-2 rounded-xl border border-neutral-200 text-neutral-800 hover:bg-neutral-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Historique ({client.ordersCount})</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${cleanPhone}`}
                      className="p-2 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-100 transition-colors"
                      title="Appeler le client"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => handleSendWhatsAppLoyalty(client)}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                      title="Envoyer un message de fidélité ou offre VIP sur WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp VIP</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Client Purchase History & Full Profile */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full my-auto shadow-2xl overflow-hidden border border-neutral-200 animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center">
                  {selectedClient.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-neutral-900">
                      {selectedClient.name}
                    </h3>
                    {getTierBadge(selectedClient.loyaltyTier)}
                  </div>
                  <p className="text-xs text-neutral-500 font-mono">
                    {selectedClient.phone} · Client depuis {selectedClient.createdAt}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedClient(null)}
                className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Summary KPIs */}
              <div className="grid grid-cols-3 gap-3 bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100 text-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                    Cumul Achats
                  </span>
                  <p className="text-base font-bold font-mono text-neutral-900 mt-0.5">
                    {selectedClient.totalSpent.toLocaleString('fr-FR')} F
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                    Commandes
                  </span>
                  <p className="text-base font-bold font-mono text-neutral-900 mt-0.5">
                    {selectedClient.ordersCount}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                    Points Fidélité
                  </span>
                  <p className="text-base font-bold font-mono text-amber-600 mt-0.5">
                    {selectedClient.loyaltyPoints} pts
                  </p>
                </div>
              </div>

              {/* Delivery Address & Notes */}
              <div className="space-y-2 bg-neutral-50/50 p-3.5 rounded-2xl border border-neutral-100">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-neutral-800">Adresse de livraison par défaut :</span>
                    <p className="text-neutral-600 mt-0.5">{selectedClient.address}</p>
                  </div>
                </div>

                {selectedClient.notes && (
                  <div className="pt-2 border-t border-neutral-100">
                    <span className="font-semibold text-neutral-800">Notes & Mensurations :</span>
                    <p className="text-neutral-600 mt-0.5 italic">{selectedClient.notes}</p>
                  </div>
                )}
              </div>

              {/* Order History */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-3 flex items-center justify-between">
                  <span>Historique des Commandes & Factures ({clientOrders.length})</span>
                </h4>

                {clientOrders.length === 0 ? (
                  <p className="text-neutral-400 italic text-center py-6">
                    Aucune commande enregistrée pour ce client pour le moment.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {clientOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3.5 rounded-2xl border border-neutral-200 bg-white flex items-center justify-between gap-3 hover:border-neutral-300 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-neutral-900">
                              {ord.invoiceNumber}
                            </span>
                            <span className="text-neutral-300">·</span>
                            <span className="text-neutral-500 font-mono text-[11px]">
                              {ord.createdAt}
                            </span>
                            <span className="text-neutral-300">·</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ord.status === 'livre_paye'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {ord.status === 'livre_paye' ? 'Soldé' : 'En cours'}
                            </span>
                          </div>

                          <p className="text-neutral-600 text-[11px] mt-1">
                            {ord.items.map((i) => `${i.quantity}x ${i.clothingName} (${i.size})`).join(', ')}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-mono font-bold text-neutral-900 text-right">
                            {ord.totalAmount.toLocaleString('fr-FR')} F
                          </span>
                          <button
                            onClick={() => {
                              onViewInvoice(ord);
                              setSelectedClient(null);
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-100 text-[11px] font-semibold flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Facture PDF</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end">
              <button
                onClick={() => setSelectedClient(null)}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add New Client */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full my-auto shadow-2xl overflow-hidden border border-neutral-200 animate-in zoom-in-95 max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <h3 className="text-base font-bold text-neutral-900">
                Enregistrer un Nouveau Client
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Nom et Prénom du client *
                </label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Ex: Aïssatou Ndiaye"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Téléphone / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="Ex: +221 77 123 45 67"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Adresse de livraison / Quartier
                </label>
                <input
                  type="text"
                  value={newClientAddress}
                  onChange={(e) => setNewClientAddress(e.target.value)}
                  placeholder="Ex: Almadies, Villa 15"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Catégorie de vêtement préférée
                </label>
                <select
                  value={newClientCategory}
                  onChange={(e) => setNewClientCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                >
                  <option value="Robes">Robes & Soirées</option>
                  <option value="Ensembles">Ensembles & Tailleurs</option>
                  <option value="Hauts">Hauts & Chemisiers</option>
                  <option value="Pantalons">Pantalons & Combinaisons</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Notes (tailles, couleurs préférées, instructions)
                </label>
                <textarea
                  rows={2}
                  value={newClientNotes}
                  onChange={(e) => setNewClientNotes(e.target.value)}
                  placeholder="Ex: Porte du M, adore le vert émeraude et le satin."
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold shadow-xs"
                >
                  Créer la fiche client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
