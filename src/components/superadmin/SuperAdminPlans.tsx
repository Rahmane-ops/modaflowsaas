import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { PlatformPlan } from '../../types';
import {
  Crown,
  Plus,
  Check,
  Edit2,
  Users,
  Package,
  Store,
  Layers,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText
} from 'lucide-react';

export const SuperAdminPlans: React.FC = () => {
  const {
    platformPlans,
    createOrUpdatePlatformPlan,
    boutiques,
    updateBoutiqueSubscriptionPlan,
  } = useStore();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlatformPlan | null>(null);

  // Form state
  const [planName, setPlanName] = useState('');
  const [planPriceMonthly, setPlanPriceMonthly] = useState<number>(35000);
  const [planPriceYearly, setPlanPriceYearly] = useState<number>(350000);
  const [planBadge, setPlanBadge] = useState('Recommandé');
  const [planDescription, setPlanDescription] = useState('');
  const [planFeaturesInput, setPlanFeaturesInput] = useState('');
  const [maxOrders, setMaxOrders] = useState<number>(1000);
  const [maxStaff, setMaxStaff] = useState<number>(5);
  const [maxDrivers, setMaxDrivers] = useState<number>(3);
  const [maxProducts, setMaxProducts] = useState<number>(1000);
  const [maxBoutiques, setMaxBoutiques] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isPopular, setIsPopular] = useState<boolean>(false);

  // Quick assign plan modal
  const [assignBoutiqueId, setAssignBoutiqueId] = useState<string>(boutiques[0]?.id || '');
  const [assignPlanId, setAssignPlanId] = useState<'starter' | 'pro' | 'enterprise'>('pro');
  const [assignDays, setAssignDays] = useState<number>(30);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  const formatFCFA = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
  };

  const openNewPlanModal = () => {
    setEditingPlan(null);
    setPlanName('');
    setPlanPriceMonthly(25000);
    setPlanPriceYearly(250000);
    setPlanBadge('Nouveau');
    setPlanDescription('Formule commerciale personnalisée pour boutiques spécifiques.');
    setPlanFeaturesInput('Gestion catalogue, Factures PDF, Caisse Wave & OM, Support réactif');
    setMaxOrders(800);
    setMaxStaff(4);
    setMaxDrivers(2);
    setMaxProducts(500);
    setMaxBoutiques(1);
    setIsActive(true);
    setIsPopular(false);
    setIsEditModalOpen(true);
  };

  const openEditModal = (p: PlatformPlan) => {
    setEditingPlan(p);
    setPlanName(p.name);
    setPlanPriceMonthly(p.priceMonthly);
    setPlanPriceYearly(p.priceYearly || p.priceMonthly * 10);
    setPlanBadge(p.badge || '');
    setPlanDescription(p.description);
    setPlanFeaturesInput(p.features.join('\n'));
    setMaxOrders(p.maxOrdersPerMonth);
    setMaxStaff(p.maxStaff);
    setMaxDrivers(p.maxDrivers);
    setMaxProducts(p.maxProducts);
    setMaxBoutiques(p.maxBoutiques);
    setIsActive(p.isActive);
    setIsPopular(!!p.isPopular);
    setIsEditModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) return;

    const features = planFeaturesInput
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const planId = editingPlan ? editingPlan.id : `plan-${Date.now()}`;

    const newPlan: PlatformPlan = {
      id: planId,
      name: planName.trim(),
      priceMonthly: Number(planPriceMonthly),
      priceYearly: Number(planPriceYearly),
      badge: planBadge.trim() || undefined,
      description: planDescription.trim(),
      features: features.length ? features : ['Fonctionnalités standard ModaFlow SaaS'],
      maxOrdersPerMonth: Number(maxOrders),
      maxStaff: Number(maxStaff),
      maxDrivers: Number(maxDrivers),
      maxProducts: Number(maxProducts),
      maxBoutiques: Number(maxBoutiques),
      isActive,
      isPopular,
      updatedAt: new Date().toISOString().substring(0, 10),
    };

    await createOrUpdatePlatformPlan(newPlan);
    setIsEditModalOpen(false);
  };

  const handleAssignPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignBoutiqueId) return;

    await updateBoutiqueSubscriptionPlan(assignBoutiqueId, assignPlanId, Number(assignDays));
    const boutique = boutiques.find((b) => b.id === assignBoutiqueId);
    setAssignSuccess(`Formule ${assignPlanId.toUpperCase()} attribuée à ${boutique?.name} pour ${assignDays} jours.`);
    setTimeout(() => setAssignSuccess(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Abonnements, Formules & Quotas SaaS
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Définition des formules commerciales, plafonds d'utilisation et attribution manuelle aux boutiques.
          </p>
        </div>
        <button
          onClick={openNewPlanModal}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Formule</span>
        </button>
      </div>

      {assignSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{assignSuccess}</span>
        </div>
      )}

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {platformPlans.map((plan) => {
          const boutiqueCount = boutiques.filter((b) => b.planId === plan.id).length;

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl p-6 border shadow-xs flex flex-col justify-between relative transition-all ${
                plan.isPopular
                  ? 'border-blue-600 ring-2 ring-blue-600/20'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              {plan.badge && (
                <div className="absolute top-4 right-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900">{plan.name}</h3>
                </div>

                <p className="text-xs text-slate-500 mb-4 min-h-[32px]">{plan.description}</p>

                <div className="mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 tabular-nums">
                      {formatFCFA(plan.priceMonthly)}
                    </span>
                    <span className="text-xs text-slate-500">/ mois</span>
                  </div>
                  {plan.priceYearly && (
                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                      ou {formatFCFA(plan.priceYearly)} / an (2 mois offerts)
                    </p>
                  )}
                </div>

                {/* Quotas & Limits */}
                <div className="space-y-2 mb-6 text-xs">
                  <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                    Limites Appliquées (Backend) :
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-500 block">Collaborateurs :</span>
                      <strong className="text-slate-900">{plan.maxStaff} max</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Livreurs dédiés :</span>
                      <strong className="text-slate-900">{plan.maxDrivers} max</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Articles catalogue :</span>
                      <strong className="text-slate-900">{plan.maxProducts.toLocaleString('fr-FR')} max</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Commandes / mois :</span>
                      <strong className="text-slate-900">{plan.maxOrdersPerMonth.toLocaleString('fr-FR')}</strong>
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-1.5 mb-6 text-xs text-slate-600">
                  <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-2">
                    Inclus dans la formule :
                  </p>
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  {boutiqueCount} boutique(s) abonnée(s)
                </span>
                <button
                  onClick={() => openEditModal(plan)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3 text-slate-500" />
                  <span>Modifier</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Plan Assignment & Prolongation Box */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Attribution & Prolongation Exceptionnelle d'Abonnement
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-4 max-w-2xl">
          Attribuez directement une formule SaaS ou prolongez la période d'essai d'une boutique commerçante sans nécessiter de paiement immédiat par carte. L'opération est immédiatement journalisée dans l'audit.
        </p>

        <form onSubmit={handleAssignPlan} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Boutique Bénéficiaire :
            </label>
            <select
              value={assignBoutiqueId}
              onChange={(e) => setAssignBoutiqueId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
            >
              {boutiques.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city}) — Actuel: {b.planId.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Formule à Attribuer :
            </label>
            <select
              value={assignPlanId}
              onChange={(e) => setAssignPlanId(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-semibold"
            >
              <option value="starter">Starter Solo</option>
              <option value="pro">Pro Boutique</option>
              <option value="enterprise">Réseau Multi-Boutiques</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Durée accordée (jours) :
            </label>
            <input
              type="number"
              min={1}
              max={365}
              value={assignDays}
              onChange={(e) => setAssignDays(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Appliquer l'attribution
            </button>
          </div>
        </form>
      </div>

      {/* MODAL: CREATE / EDIT PLAN */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingPlan ? 'Modifier la Formule SaaS' : 'Créer une Nouvelle Formule Commerciale'}
                </h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="py-4 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nom du Forfait *</label>
                  <input
                    type="text"
                    required
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="Ex: Pro Couture Plus"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Badge marketing</label>
                  <input
                    type="text"
                    value={planBadge}
                    onChange={(e) => setPlanBadge(e.target.value)}
                    placeholder="Ex: Populaire, Essentiel"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tarif Mensuel (FCFA) *</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    required
                    value={planPriceMonthly}
                    onChange={(e) => setPlanPriceMonthly(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tarif Annuel (FCFA)</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={planPriceYearly}
                    onChange={(e) => setPlanPriceYearly(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description courte</label>
                <textarea
                  rows={2}
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  placeholder="Boutiques de prêt-à-porter avec volume élevé..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              {/* Quotas & limits */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">Plafonds d'utilisation (Quotas) :</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Max Staff</span>
                    <input
                      type="number"
                      min={1}
                      value={maxStaff}
                      onChange={(e) => setMaxStaff(Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white mt-1"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Max Livreurs</span>
                    <input
                      type="number"
                      min={0}
                      value={maxDrivers}
                      onChange={(e) => setMaxDrivers(Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white mt-1"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Max Articles</span>
                    <input
                      type="number"
                      min={10}
                      value={maxProducts}
                      onChange={(e) => setMaxProducts(Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white mt-1"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Commandes/mois</span>
                    <input
                      type="number"
                      min={10}
                      value={maxOrders}
                      onChange={(e) => setMaxOrders(Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white mt-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fonctionnalités incluses (une par ligne) :
                </label>
                <textarea
                  rows={4}
                  value={planFeaturesInput}
                  onChange={(e) => setPlanFeaturesInput(e.target.value)}
                  placeholder="Gestion complète des ventes&#10;Alertes de rupture de stock&#10;Exports comptables CSV"
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-slate-900 focus:ring-slate-900"
                  />
                  <span>Formule active pour les nouvelles souscriptions</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-600"
                  />
                  <span>Mettre en avant (Recommandé)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  {editingPlan ? 'Mettre à jour la formule' : 'Créer la formule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
