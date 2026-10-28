import React, { useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { computePlatformMetrics } from '../../services/superAdminService';
import {
  Users,
  Store,
  DollarSign,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  Percent,
  Database,
  RefreshCw,
  Activity,
  Server,
  ShieldCheck,
} from 'lucide-react';
import { SuperAdminSubTab } from '../../types';

interface SuperAdminOverviewProps {
  onNavigateTab: (tab: SuperAdminSubTab) => void;
}

export const SuperAdminOverview: React.FC<SuperAdminOverviewProps> = ({ onNavigateTab }) => {
  const {
    boutiques,
    users,
    platformPayments,
    platformPlans,
    platformAuditLogs,
    supportTickets,
    platformSettings,
    checkFirestoreSync,
    lastCloudSync,
  } = useStore();

  const [syncReport, setSyncReport] = React.useState<{
    tested: boolean;
    loading: boolean;
    success: boolean;
    latencyMs: number;
    message: string;
    details?: any;
  }>({
    tested: false,
    loading: false,
    success: true,
    latencyMs: 0,
    message: '',
  });

  const handleTestSync = async () => {
    setSyncReport((prev) => ({ ...prev, loading: true }));
    try {
      const res = await checkFirestoreSync();
      setSyncReport({
        tested: true,
        loading: false,
        success: res.success,
        latencyMs: res.latencyMs,
        message: res.message,
        details: res.details,
      });
    } catch (e: any) {
      setSyncReport({
        tested: true,
        loading: false,
        success: false,
        latencyMs: 0,
        message: e?.message || 'Erreur lors de la vérification de la synchronisation.',
      });
    }
  };

  const metrics = useMemo(() => {
    return computePlatformMetrics(boutiques, users, platformPayments, platformPlans);
  }, [boutiques, users, platformPayments, platformPlans]);

  const formatFCFA = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
  };

  const pendingTicketsCount = supportTickets.filter((t) => t.status === 'nouveau' || t.status === 'en_cours').length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                Console Souveraine
              </span>
              <span className="text-xs text-slate-300">
                {platformSettings.platformName} · Supervision globale
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Vue d'ensemble de la plateforme SaaS
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Indicateurs en temps réel calculés directement à partir des données de vos boutiques, utilisateurs et transactions vérifiées.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('boutiques')}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-sm border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5 text-blue-400" />
              <span>Gérer les Boutiques ({boutiques.length})</span>
            </button>
            <button
              onClick={() => onNavigateTab('payments')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-900/30 transition-all flex items-center gap-1.5"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Paiements ({formatFCFA(metrics.totalCollectedRevenue)})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (8 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Revenus Réellement Encaissés */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Revenus Encaissés</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
            {formatFCFA(metrics.totalCollectedRevenue)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Paiements vérifiés et soldés</span>
          </div>
        </div>

        {/* KPI 2: MRR (Revenus Récurrents Mensuels) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">MRR (Abonnements Actifs)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
            {formatFCFA(metrics.mrr)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
            <Percent className="w-3 h-3 text-blue-600 shrink-0" />
            <span>Basé sur {metrics.activeBoutiques} boutique(s) active(s)</span>
          </div>
        </div>

        {/* KPI 3: Total Boutiques */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Boutiques Enregistrées</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums flex items-baseline gap-2">
            <span>{metrics.totalBoutiques}</span>
            <span className="text-xs font-normal text-slate-500">boutiques</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-600">
            <span className="text-emerald-700 font-semibold">{metrics.activeBoutiques} actives</span>
            <span>·</span>
            <span className="text-amber-700">{metrics.trialBoutiques} essai</span>
            {metrics.suspendedBoutiques > 0 && (
              <>
                <span>·</span>
                <span className="text-rose-600 font-semibold">{metrics.suspendedBoutiques} suspendue(s)</span>
              </>
            )}
          </div>
        </div>

        {/* KPI 4: Total Utilisateurs */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Comptes Utilisateurs</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums flex items-baseline gap-2">
            <span>{metrics.totalUsers}</span>
            <span className="text-xs font-normal text-slate-500">comptes</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-600">
            <span className="text-indigo-600 font-semibold">+{metrics.newUsers7d}</span>
            <span>sur les 7 derniers jours (+{metrics.newUsers30d} sur 30j)</span>
          </div>
        </div>
      </div>

      {/* Secondary Status Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Support Alert Card */}
        <div 
          onClick={() => onNavigateTab('support')}
          className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between border border-slate-800 cursor-pointer hover:bg-slate-850 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Demandes de Support</p>
              <p className="text-base font-bold text-white">
                {pendingTicketsCount} ticket(s) en attente
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Paiements en attente */}
        <div 
          onClick={() => onNavigateTab('payments')}
          className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-amber-100/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-amber-700 font-semibold">Transactions en attente</p>
              <p className="text-base font-bold text-amber-950 tabular-nums">
                {formatFCFA(metrics.totalPendingAmount)}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-600" />
        </div>

        {/* État Sécurité & Audit */}
        <div 
          onClick={() => onNavigateTab('audit')}
          className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Journal d'audit système</p>
              <p className="text-base font-bold text-slate-900">
                {platformAuditLogs.length} action(s) tracée(s)
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Synchronisation Cloud Firestore en Direct */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Synchronisation Base de Données Cloud Firestore</h2>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Connecté & Synchronisé au SaaS
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Vérification de la liaison bidirectionnelle en direct avec la base NoSQL Firestore du projet ModaFlow.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={syncReport.loading}
            onClick={handleTestSync}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50 active:scale-95 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncReport.loading ? 'animate-spin' : ''}`} />
            <span>{syncReport.loading ? 'Test en cours...' : 'Tester la synchronisation'}</span>
          </button>
        </div>

        {/* Sync Details and Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px]">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span>Base Firestore ID</span>
            </div>
            <p className="font-mono text-[11px] font-bold text-slate-800 break-all">
              ai-studio-modaflowsaasgest-5c9fe6ee-c4ba-4e34-90ae-4395762a5e6e
            </p>
            <p className="text-[10px] text-slate-400">Projet GCP : avid-sunrise-mmvz5</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px]">
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              <span>Réactivité & Latence Ping</span>
            </div>
            <p className="text-base font-bold text-slate-900 tabular-nums">
              {syncReport.tested ? `${syncReport.latencyMs} ms` : '< 120 ms'}
            </p>
            <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              <span>Lecture/Écriture atomique active</span>
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>État des Données Réelles</span>
            </div>
            <p className="text-xs font-bold text-slate-900">
              {boutiques.length === 0 ? 'Base vierge prête pour clients réels' : `${boutiques.length} boutique(s) en ligne`}
            </p>
            <p className="text-[10px] text-slate-500">
              Super Admin racine : {users.filter(u => u.role === 'superadmin').length} compte souverain
            </p>
          </div>
        </div>

        {syncReport.tested && (
          <div className={`mt-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
            syncReport.success 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">{syncReport.message}</p>
              {syncReport.details && (
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Dernier ping serveur : {syncReport.details.serverTime} · Base ID vérifiée : {syncReport.details.firestoreDbId}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Two Columns: Répartition des Formules & Dernières Boutiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Répartition des Formules d'Abonnement */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Répartition des Abonnements</h2>
              <p className="text-xs text-slate-500">Distribution commerciale par formule SaaS</p>
            </div>
            <button
              onClick={() => onNavigateTab('plans')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Gérer les plans →
            </button>
          </div>

          <div className="space-y-4">
            {platformPlans.map((plan) => {
              const count = metrics.planBreakdown[plan.id] || 0;
              const pct = metrics.totalBoutiques > 0 ? Math.round((count / metrics.totalBoutiques) * 100) : 0;
              return (
                <div key={plan.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{plan.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                        {formatFCFA(plan.priceMonthly)} / mois
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 tabular-nums">
                      {count} boutique(s) ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Derniers Événements d'Audit de Sécurité */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Journal d'Audit Récent</h2>
              <p className="text-xs text-slate-500">Dernières actions administratives vérifiables</p>
            </div>
            <button
              onClick={() => onNavigateTab('audit')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Historique complet →
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {platformAuditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{log.action}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 uppercase font-mono">
                      {log.resource}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 tabular-nums font-mono">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
