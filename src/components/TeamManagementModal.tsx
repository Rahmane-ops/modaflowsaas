import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  ROLE_LABELS, 
  ROLE_PERMISSIONS, 
  PERMISSION_LABELS 
} from '../services/securityService';
import { UserRole, PermissionKey } from '../types';
import { 
  X, 
  UserPlus, 
  Users, 
  Shield, 
  Mail, 
  Check, 
  AlertTriangle, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  Clock, 
  Ban, 
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeamManagementModal: React.FC<TeamManagementModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentBoutique, 
    storeMembers, 
    invitations, 
    inviteEmployee, 
    updateMemberRoleAndPermissions, 
    toggleMemberStatus, 
    removeMember, 
    cancelInvitation,
    hasPermission,
    currentUser
  } = useStore();

  const [activeTab, setActiveTab] = useState<'members' | 'invite' | 'invitations'>('members');
  
  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('cashier');
  const [customPerms, setCustomPerms] = useState<PermissionKey[]>(ROLE_PERMISSIONS.cashier);
  const [inviteMsg, setInviteMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Edit member modal/state
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('cashier');
  const [editPerms, setEditPerms] = useState<PermissionKey[]>([]);

  if (!isOpen) return null;

  const canManage = hasPermission('manage_employees');
  const canEditRoles = hasPermission('edit_employee_roles');
  const canSuspend = hasPermission('suspend_member');

  const handleRoleSelectForInvite = (role: UserRole) => {
    setInviteRole(role);
    setCustomPerms(ROLE_PERMISSIONS[role] || []);
  };

  const toggleInvitePerm = (key: PermissionKey) => {
    setCustomPerms((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;
    setIsSubmitting(true);
    setInviteMsg(null);

    const res = inviteEmployee({
      email: inviteEmail,
      name: inviteName,
      role: inviteRole,
      permissions: customPerms,
    });

    setIsSubmitting(false);
    if (res && res.id) {
      setInviteMsg({ type: 'success', text: `Invitation envoyée avec succès à ${res.name} !` });
      setInviteEmail('');
      setInviteName('');
      setTimeout(() => {
        setActiveTab('invitations');
        setInviteMsg(null);
      }, 1500);
    } else {
      setInviteMsg({ type: 'error', text: "Erreur lors de la création de l'invitation" });
    }
  };

  const handleCopyLink = (token: string) => {
    const link = `${window.location.origin}?invite=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 3000);
  };

  const openEditMember = (member: any) => {
    setEditingMemberId(member.id);
    setEditRole(member.role);
    setEditPerms(member.customPermissions || ROLE_PERMISSIONS[member.role as UserRole] || []);
  };

  const saveEditMember = () => {
    if (!editingMemberId) return;
    updateMemberRoleAndPermissions(editingMemberId, editRole, editPerms);
    setEditingMemberId(null);
  };

  const toggleEditPerm = (key: PermissionKey) => {
    setEditPerms((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-neutral-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 bg-neutral-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-neutral-800 rounded-xl text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Équipe & Contrôle des Accès (RBAC)</h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
                  {currentBoutique.name}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Gestion des rôles, invitations d'employés et matrice des autorisations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'members'
                ? 'border-neutral-900 text-neutral-900 bg-white rounded-t-lg'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Membres de la boutique ({storeMembers.length})
          </button>

          {canManage && (
            <button
              onClick={() => setActiveTab('invite')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'invite'
                  ? 'border-neutral-900 text-neutral-900 bg-white rounded-t-lg'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Inviter un employé
            </button>
          )}

          <button
            onClick={() => setActiveTab('invitations')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'invitations'
                ? 'border-neutral-900 text-neutral-900 bg-white rounded-t-lg'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Mail className="w-4 h-4" />
            Invitations en attente ({invitations.filter((i) => i.status === 'pending').length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: MEMBERS */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-500">
                  Chaque membre dispose de permissions strictes pour protéger les données de votre boutique.
                </p>
                {canManage && (
                  <button
                    onClick={() => setActiveTab('invite')}
                    className="px-3 py-1.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Nouvel employé
                  </button>
                )}
              </div>

              <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-2xl overflow-hidden bg-white">
                {storeMembers.map((member) => {
                  const roleCfg = ROLE_LABELS[member.role] || {
                    badge: member.role,
                    color: 'bg-neutral-100 text-neutral-800',
                  };
                  const isCurrent = member.userId === currentUser.id;

                  return (
                    <div key={member.id} className="p-4 flex items-center justify-between hover:bg-neutral-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-2 bg-neutral-100 rounded-xl">
                          {member.avatar || '👤'}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-neutral-900">{member.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] bg-neutral-900 text-white px-1.5 py-0.2 rounded font-medium">
                                Vous
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${roleCfg.color}`}>
                              {roleCfg.badge}
                            </span>
                            {member.status === 'suspended' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-300">
                                Suspendu
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            {member.email} · {member.phone} · Membre depuis {member.joinedAt}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {canEditRoles && member.role !== 'owner' && !isCurrent && (
                          <button
                            onClick={() => openEditMember(member)}
                            className="px-2.5 py-1 text-xs text-neutral-700 hover:bg-neutral-100 border border-neutral-200 rounded-lg font-medium transition-colors"
                          >
                            Modifier rôle & droits
                          </button>
                        )}

                        {canSuspend && member.role !== 'owner' && !isCurrent && (
                          <button
                            onClick={() => toggleMemberStatus(member.id)}
                            className={`p-1.5 rounded-lg border text-xs transition-colors ${
                              member.status === 'active'
                                ? 'text-amber-600 hover:bg-amber-50 border-amber-200'
                                : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                            }`}
                            title={member.status === 'active' ? 'Suspendre' : 'Réactiver'}
                          >
                            {member.status === 'active' ? <Ban className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5" />}
                          </button>
                        )}

                        {canManage && member.role !== 'owner' && !isCurrent && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Confirmer le retrait de ${member.name} de la boutique ?`)) {
                                removeMember(member.id);
                              }
                            }}
                            className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Supprimer le membre"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: INVITE EMPLOYEE */}
          {activeTab === 'invite' && (
            <form onSubmit={handleSendInvite} className="space-y-6">
              {inviteMsg && (
                <div
                  className={`p-3 text-xs rounded-xl flex items-center gap-2 border ${
                    inviteMsg.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {inviteMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  )}
                  {inviteMsg.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Nom et prénom de l'employé *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Awa Ndiaye"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Adresse e-mail professionnelle *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="awa.couture@gmail.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Role Picker */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-2">
                  Sélectionner un rôle de base pour cet employé :
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(['admin', 'manager', 'cashier', 'stock_manager', 'accountant'] as UserRole[]).map((r) => {
                    const cfg = ROLE_LABELS[r];
                    const isSelected = inviteRole === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRoleSelectForInvite(r)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-neutral-900 bg-neutral-900 text-white shadow-md'
                            : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-800'
                        }`}
                      >
                        <p className="text-xs font-bold">{cfg.badge}</p>
                        <p className={`text-[11px] mt-1 line-clamp-2 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                          {cfg.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Granular Permission Checkboxes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-neutral-700">
                    Permissions accordées ({customPerms.length} actives) :
                  </label>
                  <span className="text-[11px] text-neutral-500">
                    Vous pouvez affiner les droits individuellement
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-2 bg-neutral-50 rounded-xl border border-neutral-200">
                  {Object.entries(PERMISSION_LABELS).map(([key, info]) => {
                    const isChecked = customPerms.includes(key as PermissionKey);
                    return (
                      <label
                        key={key}
                        className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer text-xs transition-colors ${
                          isChecked
                            ? 'bg-white border-neutral-900 text-neutral-900 shadow-xs'
                            : 'bg-neutral-100/50 border-neutral-200 text-neutral-500 hover:bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleInvitePerm(key as PermissionKey)}
                          className="mt-0.5 rounded text-neutral-900 focus:ring-neutral-900"
                        />
                        <div>
                          <p className="font-semibold text-neutral-900">{info.name}</p>
                          <p className="text-[10px] text-neutral-500">{info.category} · {info.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-neutral-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  {isSubmitting ? 'Génération...' : "Envoyer l'invitation"}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: PENDING INVITATIONS */}
          {activeTab === 'invitations' && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-500">
                Les invitations génèrent un lien sécurisé à usage unique. L'invité peut rejoindre votre boutique directement.
              </p>

              {invitations.length === 0 ? (
                <div className="p-8 text-center bg-neutral-50 border border-dashed border-neutral-300 rounded-2xl">
                  <Mail className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-neutral-700">Aucune invitation en attente</p>
                  <p className="text-xs text-neutral-500 mt-1">Invitez des collaborateurs pour agrandir votre équipe.</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-2xl overflow-hidden bg-white">
                  {invitations.map((inv) => (
                    <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-neutral-50/50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-900">{inv.name}</span>
                          <span className="text-[11px] text-neutral-500">({inv.email})</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {ROLE_LABELS[inv.role]?.label}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            En attente
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-1">
                          Invité par {inv.invitedBy} · Expire le {inv.expiresAt} · {inv.permissions.length} permissions
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyLink(inv.token)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700 flex items-center gap-1.5 transition-colors"
                        >
                          {copiedToken === inv.token ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-semibold">Lien copié</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-neutral-500" />
                              <span>Copier lien d'invitation</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => cancelInvitation(inv.id)}
                          className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Annuler l'invitation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EDIT MEMBER SUB-MODAL */}
          {editingMemberId && (
            <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <h3 className="text-sm font-bold text-neutral-900">Modifier les accès de l'employé</h3>
                  <button onClick={() => setEditingMemberId(null)} className="p-1 text-neutral-400 hover:text-neutral-900">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="py-4 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Rôle assigné
                    </label>
                    <select
                      value={editRole}
                      onChange={(e) => {
                        const newR = e.target.value as UserRole;
                        setEditRole(newR);
                        setEditPerms(ROLE_PERMISSIONS[newR] || []);
                      }}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                    >
                      <option value="admin">Administrateur Boutique</option>
                      <option value="manager">Gérant</option>
                      <option value="cashier">Caissier / Vendeur POS</option>
                      <option value="stock_manager">Gestionnaire de Stock</option>
                      <option value="accountant">Comptable</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Permissions personnalisées ({editPerms.length})
                    </label>
                    <div className="max-h-48 overflow-y-auto space-y-1 p-2 bg-neutral-50 rounded-xl border border-neutral-200">
                      {Object.entries(PERMISSION_LABELS).map(([key, info]) => (
                        <label key={key} className="flex items-center gap-2 text-xs p-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editPerms.includes(key as PermissionKey)}
                            onChange={() => toggleEditPerm(key as PermissionKey)}
                            className="rounded text-neutral-900"
                          />
                          <span>{info.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                  <button
                    onClick={() => setEditingMemberId(null)}
                    className="px-4 py-2 text-xs text-neutral-600 hover:bg-neutral-100 rounded-xl"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={saveEditMember}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800"
                  >
                    Enregistrer les droits
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
