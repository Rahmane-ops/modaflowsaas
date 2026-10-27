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
  Shield,
  Globe,
  Copy
} from 'lucide-react';
import { UserRole, UserAccount } from '../types';
import { ROLE_LABELS } from '../services/securityService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register' | 'forgot' | 'join';
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
    confirm2FALogin,
    send2FACode,
    signInWithGoogle,
    logoutUser,
    isLoggedIn,
    isSuperAdmin,
    isSuperAdminViewOpen,
    setIsSuperAdminViewOpen,
    registerUser,
    requestPasswordReset,
    resetPasswordWithToken,
    acceptInvitation,
    lockedUntil,
    authModalInitialTab,
    selectedPlanForRegister,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot' | 'join' | '2fa'>(
    authModalInitialTab === 'register_boutique' ? 'register' : (defaultTab || 'login')
  );

  // 2FA state management
  const [twoFactorData, setTwoFactorData] = useState<{
    email: string;
    code: string;
    user: UserAccount;
    boutiques?: any[];
    isSuperAdmin?: boolean;
    expiresAt: number;
  } | null>(null);
  const [twoFactorCodeInput, setTwoFactorCodeInput] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');
  const [twoFactorSuccess, setTwoFactorSuccess] = useState('');
  const [twoFactorAttempts, setTwoFactorAttempts] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [twoFactorTimeRemaining, setTwoFactorTimeRemaining] = useState(600);

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

  // Timer countdown for 2FA expiration
  useEffect(() => {
    if (activeTab !== '2fa' || !twoFactorData) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((twoFactorData.expiresAt - Date.now()) / 1000));
      setTwoFactorTimeRemaining(remaining);
      if (remaining <= 0) {
        setTwoFactorError('Le code de vérification a expiré. Veuillez en renvoyer un nouveau.');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTab, twoFactorData]);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

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

  // Domain authorization notice for Google OAuth
  const [domainNotice, setDomainNotice] = useState<{ domain: string; message: string } | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

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
    const res = await loginWithEmail(email, password, rememberMe, true);
    setIsLoggingIn(false);

    if (res.success && res.require2FA && res.user && res.code) {
      setTwoFactorData({
        email: cleanInputEmail,
        code: res.code,
        user: res.user,
        boutiques: res.boutiques || [],
        isSuperAdmin: !!res.isSuperAdmin,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });
      setTwoFactorCodeInput('');
      setTwoFactorError('');
      setTwoFactorSuccess('');
      setTwoFactorAttempts(0);
      setResendCooldown(45);
      setActiveTab('2fa');
      return;
    }

    if (res.success) {
      setLoginSuccess(res.message);
      setNeedsBoutiquePrompt(null);

      const isSuper =
        res.isSuperAdmin ||
        cleanInputEmail === 'abdourahmanebathily1@gmail.com' ||
        (currentUser?.email || '').trim().toLowerCase() === 'abdourahmanebathily1@gmail.com';

      if (isSuper) {
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

  // Handle 2FA verification submission
  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorError('');
    setTwoFactorSuccess('');

    if (!twoFactorData) {
      setTwoFactorError('Session 2FA expirée. Veuillez vous reconnecter.');
      return;
    }

    if (Date.now() > twoFactorData.expiresAt) {
      setTwoFactorError('Le code de vérification a expiré. Cliquez sur Renvoyer pour en générer un nouveau.');
      return;
    }

    const cleanInputCode = twoFactorCodeInput.trim().replace(/\s+/g, '');
    if (cleanInputCode !== twoFactorData.code) {
      const nextAttempts = twoFactorAttempts + 1;
      setTwoFactorAttempts(nextAttempts);

      if (nextAttempts >= 4) {
        setTwoFactorError('Nombre maximal de tentatives dépassé. Session 2FA invalidée.');
        setTimeout(() => {
          setTwoFactorData(null);
          setActiveTab('login');
          setLoginError('Vérification échouée. Veuillez saisir à nouveau vos identifiants.');
        }, 1500);
      } else {
        setTwoFactorError(`Code incorrect. Il vous reste ${4 - nextAttempts} tentative(s).`);
      }
      return;
    }

    // Code is valid: finalize 2FA authentication
    setTwoFactorSuccess('Double authentification validée avec succès !');
    confirm2FALogin(
      twoFactorData.user,
      twoFactorData.boutiques,
      rememberMe,
      twoFactorData.isSuperAdmin
    );

    setTimeout(() => {
      onClose();
      setTwoFactorData(null);
      setTwoFactorSuccess('');
      setActiveTab('login');
    }, 700);
  };

  // Handle 2FA resend code
  const handleResend2FACode = async () => {
    if (!twoFactorData || resendCooldown > 0) return;
    const res = await send2FACode(twoFactorData.email);
    if (res.success && res.code) {
      setTwoFactorData((prev) =>
        prev
          ? {
              ...prev,
              code: res.code!,
              expiresAt: Date.now() + 10 * 60 * 1000,
            }
          : null
      );
      setResendCooldown(60);
      setTwoFactorCodeInput('');
      setTwoFactorError('');
      setTwoFactorSuccess('Un nouveau code temporaire a été transmis.');
      setTimeout(() => setTwoFactorSuccess(''), 4000);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    setLoginError('');
    setNeedsBoutiquePrompt(null);
    setDomainNotice(null);

    try {
      const res = await signInWithGoogle();
      setIsLoggingIn(false);

      if (res.success) {
        setLoginSuccess(res.message);

        const isSuper =
          res.isSuperAdmin ||
          (res.user?.email || '').trim().toLowerCase() === 'abdourahmanebathily1@gmail.com' ||
          (currentUser?.email || '').trim().toLowerCase() === 'abdourahmanebathily1@gmail.com';

        if (isSuper) {
          setIsSuperAdminViewOpen(true);
        }

        setTimeout(() => {
          onClose();
          setLoginSuccess('');
        }, 700);
      } else {
        if (res.isUnauthorizedDomain) {
          setDomainNotice({
            domain: res.domain || (typeof window !== 'undefined' ? window.location.hostname : ''),
            message: res.message,
          });
        } else {
          setLoginError(res.message);
        }

        if (res.needsBoutique && res.email) {
          setNeedsBoutiquePrompt({ email: res.email, name: res.name });
          setRegEmail(res.email);
          if (res.name) setRegName(res.name);
          setActiveTab('register');
        }
      }
    } catch (err: any) {
      setIsLoggingIn(false);
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
            <img
              src="/favicon.png"
              alt="ModaFlow Logo"
              className="w-10 h-10 rounded-2xl object-cover shadow-sm shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black">Espace Connexion & Comptes SaaS</h2>
                <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                  ModaFlow
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                {isLoggedIn
                  ? `Connecté : ${currentUser.name}`
                  : 'Connexion sécurisée à votre espace de gestion ModaFlow'}
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

        {/* Tab Switcher */}
        {activeTab === '2fa' ? (
          <div className="flex items-center justify-between px-6 py-2.5 bg-blue-50/90 border-b border-blue-200 text-blue-950 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Étape 2/2 : Vérification à deux facteurs (2FA) par e-mail</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setTwoFactorData(null);
                setActiveTab('login');
                setTwoFactorError('');
              }}
              className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
            >
              ← Retour à la saisie
            </button>
          </div>
        ) : (
          <div className="flex border-b border-neutral-200 bg-neutral-50 px-6 gap-1 pt-2 overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('login');
                setLoginError('');
                setNeedsBoutiquePrompt(null);
                setDomainNotice(null);
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
                setDomainNotice(null);
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
                setDomainNotice(null);
              }}
              className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'join'
                  ? 'border-neutral-950 text-neutral-950 bg-white rounded-t-xl'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Rejoindre avec code
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 0: 2FA VERIFICATION */}
          {activeTab === '2fa' && twoFactorData && (
            <form onSubmit={handleVerify2FA} className="space-y-5 max-w-md mx-auto py-2">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-3 shadow-xs">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-neutral-900 tracking-tight">Authentification à Deux Facteurs (2FA)</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  Pour sécuriser l'accès à votre boutique, un code temporaire à 6 chiffres a été envoyé par e-mail à :
                </p>
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 rounded-full text-xs font-semibold text-neutral-800 border border-neutral-200 shadow-2xs">
                  <Mail className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{twoFactorData.email}</span>
                </div>
              </div>

              {/* In-app notification card with the 2FA code */}
              <div className="p-3.5 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 text-blue-950 rounded-2xl text-xs space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    <span className="font-bold text-blue-900">Notification E-mail Sécurisée ModaFlow</span>
                  </div>
                  <span className="text-[10px] text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200 font-mono font-semibold">
                    Exp. {Math.floor(twoFactorTimeRemaining / 60)}:{(twoFactorTimeRemaining % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white/80 backdrop-blur-xs p-2.5 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-[11px] text-neutral-700">Code temporaire :</span>
                    <strong className="font-mono text-base tracking-widest text-blue-950 bg-blue-100/60 px-2.5 py-0.5 rounded border border-blue-300">
                      {twoFactorData.code}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTwoFactorCodeInput(twoFactorData.code);
                      setTwoFactorError('');
                    }}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
                  >
                    Remplir le code
                  </button>
                </div>
              </div>

              {twoFactorError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{twoFactorError}</span>
                </div>
              )}

              {twoFactorSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{twoFactorSuccess}</span>
                </div>
              )}

              {/* 6-digit Code Input */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5 text-center">
                  Entrez votre code à 6 chiffres
                </label>
                <div className="max-w-xs mx-auto">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    required
                    maxLength={6}
                    placeholder="••••••"
                    value={twoFactorCodeInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                      setTwoFactorCodeInput(val);
                      if (twoFactorError) setTwoFactorError('');
                    }}
                    className="w-full text-center tracking-[0.4em] font-mono text-2xl py-3 border-2 border-neutral-300 rounded-2xl focus:border-neutral-950 focus:ring-2 focus:ring-neutral-900 focus:outline-none bg-neutral-50/60"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 text-center mt-1.5">
                  Code à usage unique valable 10 minutes · Ne le communiquez à personne
                </p>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={twoFactorCodeInput.length < 6 || !!twoFactorSuccess}
                className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-800 active:scale-98 text-white text-xs font-bold rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{twoFactorSuccess ? 'Validation en cours...' : 'Valider & Débloquer ma session'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Resend & Back controls */}
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <button
                  type="button"
                  disabled={resendCooldown > 0}
                  onClick={handleResend2FACode}
                  className="font-semibold text-blue-600 hover:text-blue-800 disabled:text-neutral-400 disabled:no-underline hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>{resendCooldown > 0 ? `Renvoyer le code (${resendCooldown}s)` : 'Renvoyer un nouveau code'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorData(null);
                    setActiveTab('login');
                    setTwoFactorError('');
                    setTwoFactorSuccess('');
                  }}
                  className="text-neutral-600 hover:text-neutral-950 hover:underline cursor-pointer"
                >
                  Changer de compte
                </button>
              </div>
            </form>
          )}

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

              {/* Notice explicative & Copie du domaine lorsque non autorisé */}
              {domainNotice && (
                <div className="p-3.5 bg-amber-50/95 border border-amber-300 rounded-xl text-xs space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-start gap-2.5">
                    <Globe className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-amber-950">Configuration Google OAuth requise</p>
                      <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                        Google bloque la connexion OAuth sur ce domaine tant qu'il n'est pas autorisé dans votre console Firebase.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-amber-200 flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-neutral-800 truncate select-all">
                      {domainNotice.domain}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (domainNotice.domain) {
                          navigator.clipboard.writeText(domainNotice.domain);
                          setCopiedDomain(true);
                          setTimeout(() => setCopiedDomain(false), 2000);
                        }
                      }}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-semibold text-[10px] shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copiedDomain ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copié</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-[11px] text-neutral-600 space-y-0.5">
                    <p className="font-semibold text-neutral-800">
                      💡 Pour autoriser ce domaine :
                    </p>
                    <p>
                      Dans Firebase Console → <strong>Authentication</strong> → <strong>Paramètres</strong> → <strong>Domaines autorisés</strong> → <strong>Ajouter un domaine</strong>.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-amber-200 flex items-center justify-between">
                    <span className="text-[11px] text-amber-900 font-medium">Alternative immédiate :</span>
                    <button
                      type="button"
                      onClick={() => {
                        setDomainNotice(null);
                        const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
                        if (emailInput) emailInput.focus();
                      }}
                      className="text-[11px] font-bold text-amber-700 hover:text-amber-900 underline cursor-pointer"
                    >
                      Connexion Email + 2FA (Prêt)
                    </button>
                  </div>
                </div>
              )}

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
        </div>
      </div>
    </div>
  );
};
