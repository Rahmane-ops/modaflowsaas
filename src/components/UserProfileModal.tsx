import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ROLE_LABELS, PERMISSION_LABELS, ROLE_PERMISSIONS } from '../services/securityService';
import { 
  X, 
  User, 
  Shield, 
  Key, 
  Laptop, 
  Smartphone, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  LogOut, 
  Check, 
  Mail, 
  Phone, 
  Sparkles 
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentUser, 
    updateUserProfile, 
    changePassword, 
    verifyEmailCode, 
    resendVerificationCode, 
    revokeSession,
    logoutUser,
    currentBoutique,
    isSuperAdmin,
    setIsSuperAdminViewOpen
  } = useStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'sessions' | 'permissions'>('profile');
  
  // Profile edit states
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [title, setTitle] = useState(currentUser.title || '');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password change states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Email verification states
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyMsg, setVerifyMsg] = useState('');
  const [verifyError, setVerifyError] = useState('');

  if (!isOpen) return null;

  const roleInfo = ROLE_LABELS[currentUser.role] || {
    label: currentUser.role,
    badge: currentUser.role,
    description: '',
    color: 'bg-neutral-100 text-neutral-800 border-neutral-300',
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      phone,
      title,
    });
    setProfileSuccess('Profil mis à jour avec succès.');
    setTimeout(() => setProfileSuccess(''), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (newPassword.length < 6) {
      setPassError('Le nouveau mot de passe doit comporter au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('Les deux nouveaux mots de passe ne correspondent pas.');
      return;
    }

    setIsChangingPass(true);
    const res = await changePassword(oldPassword, newPassword);
    setIsChangingPass(false);

    if (res.success) {
      setPassSuccess(res.message);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(''), 4000);
    } else {
      setPassError(res.message);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');
    setVerifyMsg('');
    const res = await verifyEmailCode(verifyCode);
    if (res.success) {
      setVerifyMsg(res.message);
      setVerifyCode('');
    } else {
      setVerifyError(res.message);
    }
  };

  const handleResendCode = async () => {
    const res = await resendVerificationCode();
    setVerifyMsg(res.message);
  };

  const userPerms = ROLE_PERMISSIONS[currentUser.role] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-neutral-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 bg-neutral-900 text-white">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentUser.avatar || '👤'}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{currentUser.name}</h2>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${roleInfo.color}`}>
                  {roleInfo.badge}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                {currentUser.email} · {currentBoutique.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSuperAdmin && (
              <button
                onClick={() => {
                  onClose();
                  setIsSuperAdminViewOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                title="Accéder à la console souveraine Super Admin"
              >
                <span>⚡</span>
                <span className="hidden sm:inline">Console Super Admin</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-neutral-900 text-neutral-900 bg-white rounded-t-lg'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <User className="w-4 h-4" />
            Informations
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'security'
                ? 'border-neutral-900 text-neutral-900 bg-white rounded-t-lg'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Key className="w-4 h-4" />
            Sécurité & Mot de passe
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'sessions'
                ? 'border-neutral-900 text-neutral-900 bg-white rounded-t-lg'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Laptop className="w-4 h-4" />
            Sessions Actives ({currentUser.activeSessions?.length || 1})
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'permissions'
                ? 'border-neutral-900 text-neutral-900 bg-white rounded-t-lg'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            Mes Droits ({userPerms.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {profileSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  {profileSuccess}
                </div>
              )}

              {/* Email verification status banner */}
              {!currentUser.emailVerified ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-amber-900">Adresse e-mail non vérifiée</h4>
                      <p className="text-xs text-amber-700 mt-1">
                        Vérifiez votre e-mail ({currentUser.email}) pour sécuriser votre compte boutique.
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Code à 6 chiffres (ex: 849201)"
                          value={verifyCode}
                          onChange={(e) => setVerifyCode(e.target.value)}
                          className="px-3 py-1.5 text-xs border border-amber-300 rounded-lg bg-white w-44"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyEmail}
                          className="px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700"
                        >
                          Valider
                        </button>
                        <button
                          type="button"
                          onClick={handleResendCode}
                          className="text-xs text-amber-800 hover:underline"
                        >
                          Renvoyer le code
                        </button>
                      </div>
                      {verifyMsg && <p className="text-xs text-emerald-700 font-semibold mt-2">{verifyMsg}</p>}
                      {verifyError && <p className="text-xs text-rose-700 font-semibold mt-2">{verifyError}</p>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-emerald-900">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Adresse e-mail <strong>{currentUser.email}</strong> vérifiée et confirmée</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold">Compte actif</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Fonction / Titre
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Téléphone professionnel
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+221 77 000 00 00"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Adresse e-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={currentUser.email}
                      disabled
                      className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 bg-neutral-100 text-neutral-500 rounded-xl cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition-colors shadow-sm"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SECURITY */}
          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-neutral-700" />
                  Politique de sécurité des mots de passe
                </h4>
                <p className="text-xs text-neutral-600 mt-1">
                  Les mots de passe sont hachés de manière sécurisée (SHA-256 + Salt cryptographique). Nous ne stockons jamais votre mot de passe en clair.
                </p>
              </div>

              {passError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  {passError}
                </div>
              )}

              {passSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  {passSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe actuel"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 caractères"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Répétez le mot de passe"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="px-5 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isChangingPass ? 'Mise à jour...' : 'Modifier mon mot de passe'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: SESSIONS */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">Appareils et sessions connectées</h4>
                  <p className="text-xs text-neutral-500">
                    Gérez vos connexions actives et révoquez l'accès à distance si nécessaire.
                  </p>
                </div>
                <button
                  onClick={() => {
                    logoutUser();
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl font-medium transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Déconnexion de cet appareil
                </button>
              </div>

              <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden bg-white">
                {(currentUser.activeSessions && currentUser.activeSessions.length > 0
                  ? currentUser.activeSessions
                  : [
                      {
                        id: 'curr-1',
                        device: 'Navigateur Web Actuel',
                        browser: 'Chrome / Safari',
                        ip: '197.234.218.42 (Dakar, Sénégal)',
                        lastActive: 'En ce moment',
                        createdAt: 'Aujourd’hui',
                        isCurrent: true,
                      },
                    ]
                ).map((sess) => (
                  <div key={sess.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-neutral-100 rounded-xl text-neutral-700">
                        {sess.device.toLowerCase().includes('iphone') || sess.device.toLowerCase().includes('android') ? (
                          <Smartphone className="w-5 h-5" />
                        ) : (
                          <Laptop className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-neutral-900">{sess.device}</p>
                          {sess.isCurrent && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Cet appareil
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          {sess.browser} · IP: {sess.ip} · Actif : {sess.lastActive}
                        </p>
                      </div>
                    </div>

                    {!sess.isCurrent && (
                      <button
                        onClick={() => revokeSession(sess.id)}
                        className="px-2.5 py-1 text-xs text-neutral-600 hover:text-rose-600 hover:bg-rose-50 border border-neutral-200 rounded-lg transition-colors"
                      >
                        Révoquer
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PERMISSIONS */}
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border ${roleInfo.color}`}>
                    {roleInfo.badge}
                  </span>
                  <span className="text-xs text-neutral-700">{roleInfo.description}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-neutral-900 mb-2">
                  Matrice des autorisations actives pour votre rôle :
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(PERMISSION_LABELS).map(([key, info]) => {
                    const isGranted = userPerms.includes(key as any);
                    return (
                      <div
                        key={key}
                        className={`p-2.5 rounded-xl border flex items-start gap-2.5 text-xs transition-colors ${
                          isGranted
                            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-400 opacity-60'
                        }`}
                      >
                        {isGranted ? (
                          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className={`font-semibold ${isGranted ? 'text-neutral-900' : 'text-neutral-500'}`}>
                            {info.name}
                          </p>
                          <p className="text-[11px] text-neutral-500">{info.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
