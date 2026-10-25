import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { PlatformAuditLog } from '../../types';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  FileText,
  KeyRound,
  Eye,
  X,
  RefreshCw,
  Server
} from 'lucide-react';

export const SuperAdminAudit: React.FC = () => {
  const { platformAuditLogs, boutiques, users, failedAttempts, lockedUntil } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<PlatformAuditLog | null>(null);

  const filteredLogs = useMemo(() => {
    return platformAuditLogs.filter((log) => {
      const matchSearch =
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.resourceId && log.resourceId.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchResource = resourceFilter === 'all' || log.resource === resourceFilter;
      const matchResult = resultFilter === 'all' || log.result === resultFilter;

      return matchSearch && matchResource && matchResult;
    });
  }, [platformAuditLogs, searchTerm, resourceFilter, resultFilter]);

  const getResourceBadge = (resource: PlatformAuditLog['resource']) => {
    switch (resource) {
      case 'boutique':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">Boutique</span>;
      case 'user':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">Utilisateur</span>;
      case 'payment':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Paiement</span>;
      case 'plan':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">Formule</span>;
      case 'support':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">Support</span>;
      case 'settings':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-300">Paramètres</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">Système</span>;
    }
  };

  const suspendedBoutiquesCount = boutiques.filter((b) => b.subscriptionStatus === 'suspendu').length;
  const suspendedUsersCount = users.filter((u) => u.status === 'suspended').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Audit & Sécurité de la Plateforme SaaS
            </h2>
          </div>
          <p className="text-xs text-slate-600 max-w-2xl">
            Journal immuable des actions souveraines, traçabilité des modifications administratives et surveillance de l'intégrité globale.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Règles Firestore Actives</span>
          </div>
        </div>
      </div>

      {/* Security Alerts & Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">Journal d'Audit Global</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {platformAuditLogs.length}
          </div>
          <p className="text-[11px] text-slate-600 mt-1">Événements tracés avec identité de l'acteur</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">Boutiques Suspendues</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {suspendedBoutiquesCount}
          </div>
          <p className="text-[11px] text-slate-600 mt-1">Accès boutique suspendu administrativement</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">Comptes Utilisateurs Bloqués</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {suspendedUsersCount}
          </div>
          <p className="text-[11px] text-slate-600 mt-1">Comptes révoqués sans perte de données</p>
        </div>
      </div>

      {/* Security Principles Panel */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">
            Invariants Fondamentaux de Sécurité SaaS (Règles Immuables)
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-slate-300">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <strong className="text-white block mb-1">1. Default Deny</strong>
            Toute ressource ou action non explicitement autorisée est rejetée au niveau du serveur.
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <strong className="text-white block mb-1">2. Isolation Multi-Tenant</strong>
            Aucun utilisateur d'une boutique ne peut lire ou écrire dans une boutique voisine.
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <strong className="text-white block mb-1">3. Anti-Élévation de Rôle</strong>
            Seul le Super Admin peut créer ou modifier des privilèges système souverains.
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <strong className="text-white block mb-1">4. Traçabilité Intégrale</strong>
            Toutes les opérations sensibles sont consignées dans ce journal immuable.
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par action, acteur, e-mail, identifiant de ressource..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-blue-500 transition-all text-slate-900"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden focus:border-blue-500"
          >
            <option value="all">Toutes ressources</option>
            <option value="boutique">Boutique</option>
            <option value="user">Utilisateur</option>
            <option value="payment">Paiement</option>
            <option value="plan">Formule</option>
            <option value="support">Support</option>
            <option value="settings">Paramètres</option>
          </select>

          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden focus:border-blue-500"
          >
            <option value="all">Tous résultats</option>
            <option value="success">Succès uniquement</option>
            <option value="failure">Échecs / Alertes</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900">
              Événements Consignés ({filteredLogs.length})
            </span>
            <span className="text-xs text-slate-600">· Traces classées par ordre anti-chronologique</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Date & Heure</th>
                <th className="py-3 px-4">Acteur</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Ressource</th>
                <th className="py-3 px-4">Résultat</th>
                <th className="py-3 px-4">Détails</th>
                <th className="py-3 px-4 text-right">Fiche</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-600">
                    Aucun événement d'audit ne correspond aux critères sélectionnés.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{log.actorName}</div>
                      <div className="text-[11px] text-slate-600">{log.actorEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-4">
                      {getResourceBadge(log.resource)}
                    </td>
                    <td className="py-3.5 px-4">
                      {log.result === 'success' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Succès
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-semibold text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          Échec
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600" title={log.details}>
                      {log.details}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Voir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Fiche de Trace Audit</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-600 block text-[11px]">Identifiant Événement :</span>
                <span className="font-mono font-bold text-slate-900">{selectedLog.id}</span>
              </div>
              <div>
                <span className="text-slate-600 block text-[11px]">Date & Horodatage :</span>
                <span className="font-mono text-slate-900">{selectedLog.timestamp}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-600 block text-[11px]">Acteur :</span>
                  <span className="font-semibold text-slate-900">{selectedLog.actorName}</span>
                  <div className="text-slate-600 text-[11px]">{selectedLog.actorEmail}</div>
                </div>
                <div>
                  <span className="text-slate-600 block text-[11px]">Ressource Ciblée :</span>
                  <div className="mt-0.5">{getResourceBadge(selectedLog.resource)}</div>
                  {selectedLog.resourceId && (
                    <div className="font-mono text-slate-600 text-[10px] mt-1">{selectedLog.resourceId}</div>
                  )}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-600 block text-[11px]">Action Exécutée :</span>
                <div className="p-2.5 bg-slate-50 rounded-xl font-medium text-slate-900 mt-1">
                  {selectedLog.action}
                </div>
              </div>
              {selectedLog.reason && (
                <div>
                  <span className="text-slate-600 block text-[11px]">Motif Justificatif :</span>
                  <div className="p-2.5 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 mt-1">
                    {selectedLog.reason}
                  </div>
                </div>
              )}
              <div>
                <span className="text-slate-600 block text-[11px]">Détails Complets :</span>
                <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] whitespace-pre-wrap mt-1">
                  {selectedLog.details}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
