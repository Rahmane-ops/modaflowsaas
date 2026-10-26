import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  Mail, 
  Lock, 
  Building2, 
  Sparkles, 
  Check, 
  Crown, 
  ShoppingBag, 
  Bike, 
  BarChart3, 
  LogOut, 
  ShieldCheck, 
  ArrowRight,
  Store,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Key,
  Users,
  Clock,
  Layers,
  ChevronRight,
  Shield
} from 'lucide-react';
import { UserRole, UserAccount } from '../types';
import { ROLE_LABELS } from '../services/securityService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register' | 'forgot' | 'join' | 'boutiques';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultTab = 'login' 
}) => {
  const {
    currentUser,
    users,
    loginUser,
    loginWithEmail,
    signInWithGoogle,
    logoutUser,
    isLoggedIn,
    isSuperAdmin,
    isSuperAdminViewOpen,
    setIsSuperAdminViewOpen,
    boutiques,
    currentBoutique,
    setCurrentBoutique,
    registerUser,
    requestPasswordReset,
    resetPasswordWithToken,
    acceptInvitation,
    lockedUntil,
    authModalInitialTab,
    selectedPlanForRegister,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot' | 'join' | 'boutiques'>(
    authModalInitialTab === 'register_boutique' ? 'register' : (defaultTab as any)
  );

  // Sync tab with external prop
  useEffect(() => {
    if (authModalInitialTab === 'register_boutique') {
      setActiveTab('register');
    } else if (authModalInitialTab === 'forgot') {
      setActiveTab('forgot');
    } else if (authModalInitialTab === 'join') {
      setActiveTab('join');
    }
  }, [authModalInitialTab]);

  // Login form states (Strictly empty by default so users provide their genuine credentials)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [needsBoutiquePrompt, setNeedsBoutiquePrompt] = useState<{ email: string; name?: string } | null>(null);

  // Lockout countdown state
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    if (!lockedUntil) {
      setCountdown(0);
      return;
    }
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  // Register form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('+221 77 ');
  const [regPassword, setRegPassword] = useState('');
  const [regStoreName, setRegStoreName] = useState('');
  const [regPlan, setRegPlan] = useState<'starter' | 'pro' | 'enterprise'>(selectedPlanForRegister || 'pro');
  const [isRegistering, setIsRegistering] = useState(false);
  const [regError, setRegError] = useState('');

  // Update selected plan from store context when changed
  useEffect(() => {
    if (selectedPlanForRegister) {
      setRegPlan(selectedPlanForRegister);
    }
  }, [selectedPlanForRegister]);

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetTokenInput, setResetTokenInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');
  const [forgotMsg, setForgotMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Join invitation state
  const [inviteTokenInput, setInviteTokenInput] = useState('');
  const [inviteMsg, setInviteMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');
    setNeedsBoutiquePrompt(null);
    setIsLoggingIn(true);

    const cleanInputEmail = email.trim().toLowerCase();
    console.log('⚡ [AuthModal] Tentative de connexion par e-mail:', cleanInputEmail);

    const res = await loginWithEmail(email, password, rememberMe);
    setIsLoggingIn(false);

    if (res.success) {
      console.log('⚡ [AuthModal] Succès connexion e-mail:', res);
      setLoginSuccess(res.message);
      setNeedsBoutiquePrompt(null);

      const isSuper =
        res.isSuperAdmin ||
        cleanInputEmail === 'abdourahmanebathily1@gmail.com' ||
        (currentUser?.email || '').trim().toLowerCase() === 'abdourahmanebathily1@gmail.com';

      if (isSuper) {
        console.log('⚡ [AuthModal] Rôle SUPERADMIN détecté lors de la connexion e-mail ! Déclenchement de isSuperAdminViewOpen = true');
        setIsSuperAdminViewOpen(true);
      }

      setTimeout(() => {
        onClose();
        setLoginSuccess('');
      }, 700);
    } else {
      setLoginError(res.message);
      if (res.needsBoutique) {
        setNeedsBoutiquePrompt({ email: cleanInputEmail });
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    setLoginError('');
    setNeedsBoutiquePrompt(null);
    console.log('⚡ [AuthModal] Démarrage connexion Google OAuth...');

    try {
      const res = await signInWithGoogle();
      setIsLoggingIn(false);

      if (res.success) {
        console.log('⚡ [AuthModal] Succès Google SignIn:', res);
        setLoginSuccess(res.message);

        const isSuper =
          res.isSuperAdmin ||
          (res.user?.email || '').trim().toLowerCase() === 'abdourahmanebathily1@gmail.com' ||
          (currentUser?.email || '').trim().toLowerCase() === 'abdourahmanebathily1@gmail.com';

        if (isSuper) {
          console.log('⚡ [AuthModal] Rôle SUPERADMIN détecté dans Firestore lors du Google SignIn ! Déclenchement de isSuperAdminViewOpen = true');
          setIsSuperAdminViewOpen(true);
        }

        setTimeout(() => {
          onClose();
          setLoginSuccess('');
        }, 700);
      } else {
        console.warn('⚡ [AuthModal] Erreur ou boutique manquante pour Google SignIn:', res.message);
        setLoginError(res.message);
        if (res.needsBoutique && res.email) {
          setNeedsBoutiquePrompt({ email: res.email, name: res.name });
          setRegEmail(res.email);
          if (res.name) setRegName(res.name);
          setActiveTab('register');
        }
      }
    } catch (err: any) {
      setIsLoggingIn(false);
      console.error('⚡ [AuthModal] Exception Google SignIn:', err);
      setLoginError(err?.message || 'Erreur inattendue lors de la connexion Google.');
    }
  };

  // Handle Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setIsRegistering(true);

    const res = await registerUser({
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
      storeName: regStoreName,
      planId: regPlan,
    });
    setIsRegistering(false);

    if (res.success) {
      onClose();
    } else {
      setRegError(res.message);
    }
  };

  // Handle Forgot Password
  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg(null);
    const res = await requestPasswordReset(forgotEmail);
    if (res.debugToken) {
      setResetTokenInput(res.debugToken);
    }
    setForgotMsg({ type: 'success', text: res.message });
    setForgotStep('reset');
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg(null);
    const res = await resetPasswordWithToken(resetTokenInput, newPasswordInput);
    if (res.success) {
      setForgotMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        setActiveTab('login');
        setForgotStep('request');
      }, 1800);
    } else {
      setForgotMsg({ type: 'error', text: res.message });
    }
  };

  // Handle Join Invitation
  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteMsg(null);
    const res = await acceptInvitation(inviteTokenInput);
    if (res.success) {
      setInviteMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setInviteMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-neutral-950 text-white border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 font-black text-lg">
              MF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black">Espace Connexion & Comptes SaaS</h2>
                <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                  ModaFlow
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                {isLoggedIn
                  ? `Session active : ${currentUser.name} (${currentUser.title})`
                  : 'Authentification sécurisée multi-boutiques & contrôle RBAC'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Super Admin Status Banner if logged in */}
        {isSuperAdmin && currentUser?.id !== 'user-owner' && currentUser?.role !== 'owner' && (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-amber-500/10 border-b border-amber-300 px-6 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xl shrink-0">⚡</span>
              <div className="min-w-0">
                <p className="text-xs font-black text-amber-950 truncate">
                  Compte Super Administrateur SaaS Actif ({currentUser?.email || 'abdourahmanebathily1@gmail.com'})
                </p>
                <p className="text-[11px] text-amber-800 truncate">
                  Accès débloqué aux 8 modules de supervision SaaS globale
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsSuperAdminViewOpen(true);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
            >
              <span>Console Super Admin (8 modules) ⚡</span>
            </button>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-6 gap-1 pt-2 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('login');
              setLoginError('');
              setNeedsBoutiquePrompt(null);
            }}
            className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'login'
                ? 'border-neutral-950 text-neutral-950 bg-white rounded-t-xl'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Connexion
          </button>

          <button
            onClick={() => {
              setActiveTab('register');
              setLoginError('');
              setNeedsBoutiquePrompt(null);
            }}
            className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'register'
                ? 'border-neutral-950 text-neutral-950 bg-white rounded-t-xl'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Créer ma Boutique
          </button>

          <button
            onClick={() => {
              setActiveTab('join');
              setLoginError('');
              setNeedsBoutiquePrompt(null);
            }}
            className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'join'
                ? 'border-neutral-950 text-neutral-950 bg-white rounded-t-xl'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Rejoindre avec code
          </button>

          <button
            onClick={() => {
              setActiveTab('boutiques');
              setLoginError('');
              setNeedsBoutiquePrompt(null);
            }}
            className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'boutiques'
                ? 'border-neutral-950 text-neutral-950 bg-white rounded-t-xl'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Mes Boutiques ({boutiques.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-md mx-auto">
              <div className="text-center mb-6">
                <h3 className="text-lg font-black text-neutral-900">Connexion à votre espace boutique</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Accédez à votre caisse POS, suivi des stocks et comptabilité
                </p>
              </div>

              {/* Lockout banner if brute force is triggered */}
              {countdown > 0 && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-3">
                  <Clock className="w-5 h-5 text-rose-600 flex-shrink-0 animate-spin" />
                  <div>
                    <p className="font-bold">Compte temporairement verrouillé</p>
                    <p className="text-[11px] mt-0.5">
                      Trop d'échecs consécutifs. Veuillez patienter <strong>{countdown} secondes</strong> avant de réessayer.
                    </p>
                  </div>
                </div>
              )}

              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {needsBoutiquePrompt && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2.5">
                  <div className="flex items-start gap-2.5 text-amber-900 text-xs">
                    <Store className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold">Vous n'avez pas encore créé de boutique</p>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        L'adresse <strong>{needsBoutiquePrompt.email}</strong> n'a pas encore de boutique active enregistrée.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRegEmail(needsBoutiquePrompt.email);
                      if (needsBoutiquePrompt.name) setRegName(needsBoutiquePrompt.name);
                      setActiveTab('register');
                      setLoginError('');
                      setNeedsBoutiquePrompt(null);
                    }}
                    className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Créer ma boutique avec cet e-mail (14j gratuits)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {loginSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  {loginSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="nom@modaflow.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={countdown > 0}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-none disabled:bg-neutral-100"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-neutral-700">
                    Mot de passe
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('forgot')}
                    className="text-[11px] text-amber-700 hover:text-amber-800 font-medium"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={countdown > 0}
                    className="w-full pl-9 pr-10 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-none disabled:bg-neutral-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-neutral-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-neutral-900 focus:ring-neutral-900"
                  />
                  <span>Se souvenir de moi</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn || countdown > 0}
                className="w-full py-3 bg-neutral-950 text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isLoggingIn ? 'Vérification...' : 'Se connecter'}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase">
                  <span className="bg-white px-2 text-neutral-500 font-semibold">ou avec Google</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoggingIn}
                className="w-full py-2.5 px-4 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-2xs active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continuer avec Google</span>
              </button>

              <div className="pt-4 border-t border-neutral-100 text-center">
                <p className="text-xs text-neutral-500">
                  Pas encore de compte ?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-amber-600 font-bold hover:underline"
                  >
                    Créer ma boutique (14 jours gratuits)
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER & ONBOARDING */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-black text-neutral-900">Créer votre compte & votre boutique</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  14 jours d’essai gratuit sans carte bancaire · Activation immédiate
                </p>
              </div>

              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  {regError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Votre nom complet *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Aïssatou Ba"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Nom de votre boutique de mode *
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Wax & Soie Couture Dakar"
                      value={regStoreName}
                      onChange={(e) => setRegStoreName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Adresse e-mail professionnelle *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="contact@maboutique.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Téléphone (Wave / WhatsApp)
                  </label>
                  <input
                    type="tel"
                    placeholder="+221 77 123 45 67"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Mot de passe sécurisé (min. 6 caractères) *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Choisissez un mot de passe robuste"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>

              {/* Plan selector with the requested exact prices (5 900, 10 900, 29 900 FCFA) */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-2">
                  Formule d'abonnement choisie (Essai 14 jours inclus) :
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'starter' as const, name: 'Pack Découverte', price: '5 900 FCFA', desc: 'Jusqu’à 100 commandes' },
                    { id: 'pro' as const, name: 'Pack Pro Vendeur', price: '10 900 FCFA', desc: 'Populaire · Livreurs & Illimité' },
                    { id: 'enterprise' as const, name: 'Pack Entreprise', price: '29 900 FCFA', desc: 'Grands Ateliers & Multi-sites' },
                  ].map((p) => {
                    const isSelected = regPlan === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setRegPlan(p.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-neutral-950 bg-neutral-950 text-white shadow-md'
                            : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-800'
                        }`}
                      >
                        <p className="text-xs font-bold">{p.name}</p>
                        <p className={`text-sm font-black mt-1 ${isSelected ? 'text-amber-400' : 'text-neutral-900'}`}>
                          {p.price}
                        </p>
                        <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          {p.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-2 text-xs text-amber-900">
                <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  Vous serez désigné <strong>Propriétaire (Owner)</strong> avec tous les droits de gestion et de facturation.
                </span>
              </div>

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-black rounded-xl transition-all shadow-md shadow-amber-400/20 disabled:opacity-50 cursor-pointer"
              >
                {isRegistering ? 'Création de votre boutique...' : 'Créer ma boutique & Démarrer l’essai'}
              </button>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD */}

          {/* TAB 4: FORGOT PASSWORD */}
          {activeTab === 'forgot' && (
            <div className="space-y-4 max-w-md mx-auto">
              <div className="text-center mb-4">
                <h3 className="text-lg font-black text-neutral-900">Récupération de mot de passe</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Réinitialisez votre accès grâce à un jeton temporaire sécurisé à usage unique.
                </p>
              </div>

              {forgotMsg && (
                <div
                  className={`p-3 text-xs rounded-xl flex items-center gap-2 border ${
                    forgotMsg.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {forgotMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  )}
                  {forgotMsg.text}
                </div>
              )}

              {forgotStep === 'request' ? (
                <form onSubmit={handleForgotRequest} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Votre adresse e-mail
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="nom@modaflow.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-neutral-950 text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition-colors"
                  >
                    Générer le lien & jeton de réinitialisation
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Jeton temporaire reçu (Token)
                    </label>
                    <input
                      type="text"
                      required
                      value={resetTokenInput}
                      onChange={(e) => setResetTokenInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Nouveau mot de passe (min. 6 caractères)
                    </label>
                    <input
                      type="password"
                      required
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="Nouveau mot de passe"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-neutral-950 text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition-colors"
                  >
                    Enregistrer le nouveau mot de passe
                  </button>
                </form>
              )}

              <div className="text-center pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-xs text-neutral-600 hover:text-neutral-950"
                >
                  Retour à la connexion
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: JOIN VIA INVITATION TOKEN */}
          {activeTab === 'join' && (
            <form onSubmit={handleJoinSubmit} className="space-y-4 max-w-md mx-auto">
              <div className="text-center mb-4">
                <h3 className="text-lg font-black text-neutral-900">Rejoindre une boutique existante</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Entrez le code d'invitation fourni par le propriétaire de la boutique.
                </p>
              </div>

              {inviteMsg && (
                <div
                  className={`p-3 text-xs rounded-xl flex items-center gap-2 border ${
                    inviteMsg.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  {inviteMsg.text}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Code / Token d'invitation
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: inv-tok-9872134a"
                  value={inviteTokenInput}
                  onChange={(e) => setInviteTokenInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-neutral-950 text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition-colors"
              >
                Valider l'invitation & Rejoindre l'équipe
              </button>
            </form>
          )}

          {/* TAB 6: MULTI-BOUTIQUES */}
          {activeTab === 'boutiques' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Espaces de travail multi-boutiques</h3>
                  <p className="text-xs text-neutral-500">
                    Basculez entre vos différentes succursales sans quitter votre session.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('register')}
                  className="px-3 py-1.5 bg-neutral-950 text-white text-xs font-bold rounded-xl hover:bg-neutral-800"
                >
                  + Nouvelle boutique
                </button>
              </div>

              <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-2xl overflow-hidden bg-white">
                {boutiques.map((btq) => {
                  const isCurrent = btq.id === currentBoutique.id;
                  return (
                    <div
                      key={btq.id}
                      className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${isCurrent ? 'bg-amber-400 text-neutral-950 font-bold' : 'bg-neutral-100 text-neutral-700'}`}>
                          <Store className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-neutral-900">{btq.name}</span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                Boutique Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            {btq.city}, {btq.country} · Plan {btq.planId.toUpperCase()} · Devise {btq.currency}
                          </p>
                        </div>
                      </div>

                      {!isCurrent && (
                        <button
                          onClick={() => {
                            setCurrentBoutique(btq);
                            onClose();
                          }}
                          className="px-3 py-1.5 text-xs bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg font-bold transition-colors"
                        >
                          Sélectionner
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
