import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { BoutiqueTenant } from '../../types';
import {
  Store,
  Search,
  Filter,
  Ban,
  RefreshCw,
  Eye,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Crown,
  MapPin,
  Phone,
  User,
  X,
  ShieldAlert,
  ArrowUpDown
} from 'lucide-react';

export const SuperAdminBoutiques: React.FC = () => {
  const {
    boutiques,
    toggleBoutiqueSuspension,
    updateBoutiqueSubscriptionPlan,
    platformPlans,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'actif' | 'essai_gratuit' | 'expire' | 'suspendu'>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  // Modal / Drawer states
  const [selectedBoutique, setSelectedBoutique] = useState<BoutiqueTenant | null>(null);
  const [suspendingBoutique, setSuspendingBoutique] = useState<BoutiqueTenant | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('Non-respect des conditions d’utilisation ou défaut de paiement');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extend / Change Plan Modal
  const [extendingBoutique, setExtendingBoutique] = useState<BoutiqueTenant | null>(null);
  const [newPlanId, setNewPlanId] = useState<'starter' | 'pro' | 'enterprise'>('pro');
  const [extendDays, setExtendDays] = useState<number>(30);

  const filteredBoutiques = useMemo(() => {
    return boutiques.filter((b) => {
      const matchSearch =
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.ownerName && b.ownerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.ownerEmail && b.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        b.city.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'all' || b.subscriptionStatus === statusFilter;
      const matchPlan = planFilter === 'all' || b.planId === planFilter;

      return matchSearch && matchStatus && matchPlan;
    });
  }, [boutiques, searchTerm, statusFilter, planFilter]);

  const handleConfirmSuspension = async () => {
    if (!suspendingBoutique) return;
    setIsSubmitting(true);
    try {
      await toggleBoutiqueSuspension(suspendingBoutique.id, suspensionReason);
      setSuspendingBoutique(null);
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmPlanUpdate = async () => {
    if (!extendingBoutique) return;
    setIsSubmitting(true);
    try {
      await updateBoutiqueSubscriptionPlan(extendingBoutique.id, newPlanId, Number(extendDays));
      setExtendingBoutique(null);
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: BoutiqueTenant['subscriptionStatus']) => {
    switch (status) {
      case 'actif':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Actif
          </span>
        );
      case 'essai_gratuit':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Essai gratuit
          </span>
        );
      case 'suspendu':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Ban className="w-3 h-3 text-rose-600" />
            Suspendue
          </span>
        );
      case 'expire':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Expiré
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Gestion des Boutiques ({boutiques.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Surveillance des succursales marchandes, statuts d'abonnement et contrôles d'accès.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, ville, propriétaire..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filtres :
          </span>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="essai_gratuit">Essai gratuit</option>
            <option value="suspendu">Suspendue</option>
            <option value="expire">Expiré</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">Toutes les formules</option>
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Boutiques Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="px-4 py-3.5">Boutique</th>
                <th className="px-4 py-3.5">Ville & Pays</th>
                <th className="px-4 py-3.5">Formule SaaS</th>
                <th className="px-4 py-3.5">Statut</th>
                <th className="px-4 py-3.5">Jours Restants</th>
                <th className="px-4 py-3.5">Inscription</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBoutiques.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Aucune boutique trouvée correspondant aux critères de recherche.
                  </td>
                </tr>
              ) : (
                filteredBoutiques.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
                          <Store className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{b.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{b.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{b.city}, {b.country}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-semibold uppercase">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 font-mono text-[10px]">
                        {b.planId}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {getStatusBadge(b.subscriptionStatus)}
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-700 tabular-nums">
                      {b.daysRemaining} jour(s)
                    </td>

                    <td className="px-4 py-3 text-slate-500 tabular-nums font-mono">
                      {b.createdAt}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Details Drawer */}
                        <button
                          onClick={() => setSelectedBoutique(b)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="Voir la fiche détaillée"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Plan / Extension */}
                        <button
                          onClick={() => {
                            setExtendingBoutique(b);
                            setNewPlanId(b.planId);
                            setExtendDays(30);
                          }}
                          className="p-1.5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
                          title="Attribuer formule ou prolonger l'essai"
                        >
                          <Crown className="w-3.5 h-3.5" />
                        </button>

                        {/* Suspend or Reactivate */}
                        {b.subscriptionStatus === 'suspendu' ? (
                          <button
                            onClick={() => toggleBoutiqueSuspension(b.id, 'Réactivation administrative autorisée par Super Admin')}
                            className="p-1.5 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Réactiver cette boutique"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setSuspendingBoutique(b)}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Suspendre cette boutique"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: SUSPEND BOUTIQUE WITH REASON */}
      {suspendingBoutique && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2.5 bg-rose-50 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Suspendre la Boutique</h3>
                <p className="text-xs text-slate-500">{suspendingBoutique.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              La suspension bloque immédiatement les fonctionnalités de vente et de caisse sans supprimer aucune donnée ni article. L'historique d'audit tracera l'action.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Motif obligatoire de suspension :
              </label>
              <textarea
                rows={3}
                required
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder="Ex: Défaut de paiement constaté, violation de sécurité, litige commercial..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSuspendingBoutique(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isSubmitting || !suspensionReason.trim()}
                onClick={handleConfirmSuspension}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Application...' : 'Confirmer la suspension'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN PLAN / EXTEND SUBSCRIPTION */}
      {extendingBoutique && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-blue-600 mb-3">
              <div className="p-2.5 bg-blue-50 rounded-xl">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Modifier l'Abonnement</h3>
                <p className="text-xs text-slate-500">{extendingBoutique.name}</p>
              </div>
            </div>

            <div className="space-y-4 py-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Formule SaaS :
                </label>
                <select
                  value={newPlanId}
                  onChange={(e) => setNewPlanId(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-semibold"
                >
                  <option value="starter">Starter Solo (15 000 FCFA/mois)</option>
                  <option value="pro">Pro Boutique (35 000 FCFA/mois)</option>
                  <option value="enterprise">Réseau Multi-Boutiques (75 000 FCFA/mois)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prolongation de la validité (jours) :
                </label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={extendDays}
                  onChange={(e) => setExtendDays(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setExtendingBoutique(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmPlanUpdate}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
              >
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer la formule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER: BOUTIQUE DETAILED SHEET */}
      {selectedBoutique && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-lg h-full p-6 shadow-2xl border-l border-slate-200 overflow-y-auto animate-in slide-in-from-right flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedBoutique.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedBoutique.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBoutique(null)}
                className="p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 space-y-6 flex-1">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Informations Générales
                </h4>
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ville / Pays :</span>
                    <span className="font-semibold text-slate-900">{selectedBoutique.city}, {selectedBoutique.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Téléphone boutique :</span>
                    <span className="font-semibold text-slate-900">{selectedBoutique.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Devise de facturation :</span>
                    <span className="font-semibold text-slate-900">{selectedBoutique.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date d'inscription :</span>
                    <span className="font-mono text-slate-900">{selectedBoutique.createdAt}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Statut de l'Abonnement SaaS
                </h4>
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Formule actuelle :</span>
                    <span className="font-bold text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {selectedBoutique.planId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Statut :</span>
                    {getStatusBadge(selectedBoutique.subscriptionStatus)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date d'expiration :</span>
                    <span className="font-mono text-slate-900">{selectedBoutique.subscriptionExpiresAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jours restants :</span>
                    <span className="font-bold text-slate-900">{selectedBoutique.daysRemaining} jour(s)</span>
                  </div>
                  {selectedBoutique.suspensionReason && (
                    <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700">
                      <p className="font-bold">Motif de suspension :</p>
                      <p className="mt-0.5 text-[11px]">{selectedBoutique.suspensionReason}</p>
                      {selectedBoutique.suspendedAt && (
                        <p className="text-[10px] text-rose-500 mt-1">Suspendu le {selectedBoutique.suspendedAt}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedBoutique(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
              >
                Fermer la fiche
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
