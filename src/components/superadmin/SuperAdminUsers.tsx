import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { UserAccount, UserRole } from '../../types';
import { ROLE_LABELS } from '../../services/securityService';
import {
  Users,
  Search,
  Filter,
  Ban,
  RefreshCw,
  Mail,
  KeyRound,
  Shield,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Store,
  Calendar,
  X,
  Phone,
  UserCheck,
  ShieldAlert
} from 'lucide-react';

export const SuperAdminUsers: React.FC = () => {
  const {
    users = [],
    toggleUserAccountStatus,
    triggerUserPasswordReset,
    boutiques = [],
    currentUser
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [confirmResetEmail, setConfirmResetEmail] = useState<string | null>(null);
  const [confirmToggleUser, setConfirmToggleUser] = useState<UserAccount | null>(null);
  const [resetFeedback, setResetFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Safe memoized user filtering (Prevents any TypeError if properties are undefined)
  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];

    return users.filter((u) => {
      if (!u) return false;

      const term = (searchTerm || '').trim().toLowerCase();
      const uName = (u.name || '').toLowerCase();
      const uEmail = (u.email || '').toLowerCase();
      const uId = (u.id || '').toLowerCase();
      const uPhone = (u.phone || '').toLowerCase();

      const matchSearch =
        !term ||
        uName.includes(term) ||
        uEmail.includes(term) ||
        uId.includes(term) ||
        uPhone.includes(term);

      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const uStatus = u.status || 'active';
      const matchStatus = statusFilter === 'all' || uStatus === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Statistics summaries
  const stats = useMemo(() => {
    const list = Array.isArray(users) ? users : [];
    const total = list.length;
    const active = list.filter((u) => (u?.status || 'active') === 'active').length;
    const suspended = list.filter((u) => u?.status === 'suspended').length;
    const admins = list.filter((u) => u?.role === 'superadmin' || u?.role === 'platform_admin' || u?.role === 'owner').length;
    return { total, active, suspended, admins };
  }, [users]);

  // Execute Firebase Auth Password Reset without window.confirm
  const handleExecutePasswordReset = async (email: string) => {
    setIsProcessing(true);
    setResetFeedback(null);
    try {
      const res = await triggerUserPasswordReset(email);
      setResetFeedback({
        type: res.success ? 'success' : 'error',
        message: res.message,
      });
      setTimeout(() => setResetFeedback(null), 6000);
    } catch (err: any) {
      setResetFeedback({
        type: 'error',
        message: err?.message || 'Erreur lors de l’envoi de la réinitialisation.',
      });
    } finally {
      setIsProcessing(false);
      setConfirmResetEmail(null);
    }
  };

  // Execute Toggle Account Status without window.confirm
  const handleExecuteToggleStatus = async (userToToggle: UserAccount) => {
    setIsProcessing(true);
    setResetFeedback(null);
    try {
      await toggleUserAccountStatus(userToToggle.id, 'Action de modération Super Admin');
      const willBeSuspended = (userToToggle.status || 'active') === 'active';
      setResetFeedback({
        type: 'success',
        message: `Compte ${userToToggle.name || userToToggle.email} ${willBeSuspended ? 'suspendu' : 'réactivé'} avec succès.`,
      });
      setTimeout(() => setResetFeedback(null), 5000);
    } catch (err: any) {
      setResetFeedback({
        type: 'error',
        message: err?.message || 'Erreur lors de la modification du statut.',
      });
    } finally {
      setIsProcessing(false);
      setConfirmToggleUser(null);
    }
  };

  const getRoleConfig = (role?: UserRole) => {
    if (role && ROLE_LABELS[role]) {
      return ROLE_LABELS[role];
    }
    return {
      label: role || 'Utilisateur',
      badge: role || 'Utilisateur',
      color: 'bg-slate-100 text-slate-700 border-slate-200',
    };
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Gestion des Utilisateurs Plateforme ({stats.total})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Répertoire souverain des marchands, employés et administrateurs. Contrôles de suspension et réinitialisations Firebase Auth.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Total Comptes</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Inscrits sur ModaFlow</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-emerald-600">Comptes Actifs</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.active}</p>
          <p className="text-[11px] text-emerald-600/70 mt-0.5">Accès opérationnel</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-rose-600">Comptes Suspendus</p>
          <p className="text-2xl font-bold text-rose-700 mt-1">{stats.suspended}</p>
          <p className="text-[11px] text-rose-600/70 mt-0.5">Bloqués par sécurité</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-amber-600">Propriétaires & Admins</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{stats.admins}</p>
          <p className="text-[11px] text-amber-600/70 mt-0.5">Gestionnaires SaaS</p>
        </div>
      </div>

      {/* Reset Feedback Notification */}
      {resetFeedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between animate-in fade-in ${
            resetFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {resetFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{resetFeedback.message}</span>
          </div>
          <button
            onClick={() => setResetFeedback(null)}
            className="text-slate-400 hover:text-slate-700 font-bold px-2 py-1 text-sm"
          >
            ×
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher nom, e-mail, téléphone, ID..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filtres :
          </span>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">Tous les rôles</option>
            <option value="superadmin">Super Admin</option>
            <option value="owner">Propriétaire Boutique</option>
            <option value="admin">Admin Boutique</option>
            <option value="manager">Gérant</option>
            <option value="cashier">Caissier</option>
            <option value="stock_manager">Gestionnaire de Stock</option>
            <option value="accountant">Comptable</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="suspended">Suspendu</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="px-4 py-3.5">Utilisateur</th>
                <th className="px-4 py-3.5">Adresse E-mail</th>
                <th className="px-4 py-3.5">Rôle Système</th>
                <th className="px-4 py-3.5">Statut</th>
                <th className="px-4 py-3.5">Téléphone</th>
                <th className="px-4 py-3.5">Date Inscription</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Aucun utilisateur trouvé correspondant aux critères.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleCfg = getRoleConfig(u.role);
                  const isCurrent = u.id === currentUser?.id;
                  const isSovereign = (u.email || '').trim().toLowerCase() === 'abdourahmanebathily1@gmail.com';
                  const isActive = (u.status || 'active') === 'active';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-sm shrink-0">
                            {u.avatar || '👤'}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">
                                {u.name || (u.email ? u.email.split('@')[0] : 'Utilisateur')}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.2 rounded font-semibold">
                                  Vous
                                </span>
                              )}
                              {isSovereign && (
                                <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-black">
                                  ⚡ PROPRIÉTAIRE
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">{u.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {u.email || 'Non renseigné'}
                      </td>

                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${roleCfg.color}`}>
                          {roleCfg.badge}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <Ban className="w-3 h-3 text-rose-600" />
                            Suspendu
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-600 font-mono tabular-nums">
                        {u.phone || 'Non renseigné'}
                      </td>

                      <td className="px-4 py-3 text-slate-500 tabular-nums font-mono">
                        {u.createdAt || 'N/A'}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Details */}
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Voir la fiche détaillée"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Firebase Auth Password Reset */}
                          <button
                            onClick={() => setConfirmResetEmail(u.email || null)}
                            disabled={isProcessing || !u.email}
                            className="p-1.5 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-50 cursor-pointer"
                            title="Envoyer lien de réinitialisation Firebase Auth"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Suspend or Reactivate (Cannot suspend sovereign super admin) */}
                          {!isSovereign && (
                            <button
                              onClick={() => setConfirmToggleUser(u)}
                              disabled={isProcessing}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isActive
                                  ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                                  : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                              }`}
                              title={isActive ? 'Suspendre cet utilisateur' : 'Réactiver cet utilisateur'}
                            >
                              {isActive ? (
                                <Ban className="w-3.5 h-3.5" />
                              ) : (
                                <RefreshCw className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRMATION MODAL: FIREBASE PASSWORD RESET */}
      {confirmResetEmail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Réinitialiser le mot de passe
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Voulez-vous envoyer un e-mail officiel de réinitialisation sécurisé via Firebase Authentication à :
            </p>
            <p className="font-mono text-xs font-bold text-blue-600 mt-2 bg-blue-50 p-2 rounded-lg break-all">
              {confirmResetEmail}
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setConfirmResetEmail(null)}
                disabled={isProcessing}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleExecutePasswordReset(confirmResetEmail)}
                disabled={isProcessing}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
              >
                {isProcessing ? 'Envoi en cours...' : 'Envoyer le lien Firebase'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: TOGGLE STATUS (SUSPEND/REACTIVATE) */}
      {confirmToggleUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
              (confirmToggleUser.status || 'active') === 'active'
                ? 'bg-rose-50 text-rose-600'
                : 'bg-emerald-50 text-emerald-600'
            }`}>
              {(confirmToggleUser.status || 'active') === 'active' ? (
                <Ban className="w-6 h-6" />
              ) : (
                <RefreshCw className="w-6 h-6" />
              )}
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {(confirmToggleUser.status || 'active') === 'active'
                ? 'Suspendre le compte utilisateur'
                : 'Réactiver le compte utilisateur'}
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {(confirmToggleUser.status || 'active') === 'active'
                ? `L'accès à la plateforme sera immédiatement révoqué pour ${confirmToggleUser.name || confirmToggleUser.email}. Ses données de boutique resteront intactes.`
                : `L'accès à la plateforme sera immédiatement rétabli pour ${confirmToggleUser.name || confirmToggleUser.email}.`}
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setConfirmToggleUser(null)}
                disabled={isProcessing}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleExecuteToggleStatus(confirmToggleUser)}
                disabled={isProcessing}
                className={`px-4 py-2 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer ${
                  (confirmToggleUser.status || 'active') === 'active'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isProcessing
                  ? 'Traitement...'
                  : (confirmToggleUser.status || 'active') === 'active'
                  ? 'Confirmer la suspension'
                  : 'Confirmer la réactivation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER: USER DETAILED SHEET */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-lg h-full p-6 shadow-2xl border-l border-slate-200 overflow-y-auto animate-in slide-in-from-right flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl">
                  {selectedUser.avatar || '👤'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedUser.name || selectedUser.email}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedUser.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 space-y-6 flex-1">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Profil & Contact
                </h4>
                <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Adresse e-mail :</span>
                    <span className="font-semibold text-slate-900">{selectedUser.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Téléphone :</span>
                    <span className="font-semibold text-slate-900">{selectedUser.phone || 'Non renseigné'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Rôle assigné :</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getRoleConfig(selectedUser.role).color}`}>
                      {getRoleConfig(selectedUser.role).badge}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Statut du compte :</span>
                    <span className={`font-semibold ${(selectedUser.status || 'active') === 'active' ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {(selectedUser.status || 'active') === 'active' ? 'Actif' : 'Suspendu'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Inscrit le :</span>
                    <span className="font-mono text-slate-900">{selectedUser.createdAt || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">E-mail vérifié :</span>
                    <span className="font-semibold text-slate-900">
                      {selectedUser.emailVerified ? 'Oui (vérifié)' : 'En attente'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Boutiques de la Plateforme ({boutiques.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {boutiques.map((b) => (
                    <div key={b.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <Store className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="font-bold text-slate-900 truncate">{b.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono shrink-0 ml-2">
                        {b.city} · {b.planId}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Sécurité & Authentification
                </h4>
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
                  <p className="font-semibold flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-700" />
                    Protection des identifiants privés
                  </p>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Conformément aux normes de sécurité Firebase Authentication, les mots de passe ne sont jamais stockés ni affichés en clair. Seule une réinitialisation par e-mail sécurisé peut être déclenchée.
                  </p>
                  <button
                    onClick={() => {
                      if (selectedUser.email) {
                        setConfirmResetEmail(selectedUser.email);
                      }
                    }}
                    disabled={isProcessing || !selectedUser.email}
                    className="w-full mt-1 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Envoyer e-mail de réinitialisation Firebase</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 cursor-pointer"
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
