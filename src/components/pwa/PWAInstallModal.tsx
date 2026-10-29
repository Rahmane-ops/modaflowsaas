import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Smartphone, 
  Share2, 
  PlusSquare, 
  CheckCircle2, 
  Sparkles, 
  Monitor, 
  ChevronRight,
  Info
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  // If triggered automatically right after account registration
  isAfterRegistration?: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  isAfterRegistration = false,
}) => {
  const {
    isInstallable,
    isInstalled,
    isIOS,
    platform,
    install,
    dismissTemporarily,
  } = usePWAInstall();

  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'success'>('idle');
  const [showManualGuide, setShowManualGuide] = useState(false);

  if (!isOpen || isInstalled) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      setInstallStatus('installing');
      const res = await install();
      if (res === 'accepted') {
        setInstallStatus('success');
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setInstallStatus('idle');
      }
    } else {
      // If native event is not available (e.g. iOS or manual browser mode), show platform-specific guide
      setShowManualGuide(true);
    }
  };

  const handleDismiss = () => {
    dismissTemporarily(24); // Remember choice for 24h
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 my-auto">
        
        {/* Top Header with Brand Badge */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white text-center overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* App Icon Preview */}
          <div className="relative mx-auto w-20 h-20 rounded-2xl bg-white p-2 shadow-xl border-2 border-white/30 flex items-center justify-center mb-3">
            <img
              src="/pwa-192x192.png"
              alt="ModaFlow Icon"
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                e.currentTarget.src = '/favicon.png';
              }}
            />
            <span className="absolute -bottom-2 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500 text-white shadow-xs">
              PWA
            </span>
          </div>

          {isAfterRegistration && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-semibold mb-2 backdrop-blur-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Compte activé avec succès !</span>
            </div>
          )}

          <h3 className="text-xl font-extrabold tracking-tight text-white leading-tight">
            Emportez ModaFlow partout avec vous !
          </h3>
          <p className="text-xs text-blue-100 mt-1.5 max-w-xs mx-auto leading-relaxed">
            Installez ModaFlow sur votre écran d'accueil pour accéder rapidement à votre boutique, vos ventes et vos stocks, comme dans une application.
          </p>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-4">

          {/* Highlights */}
          <div className="grid grid-cols-3 gap-2 py-1 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-base block">⚡</span>
              <span className="text-[10px] font-bold text-slate-800 block mt-1">Accès 1-Clic</span>
              <span className="text-[9px] text-slate-500">Plein écran</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-base block">📦</span>
              <span className="text-[10px] font-bold text-slate-800 block mt-1">Caisse & Stock</span>
              <span className="text-[9px] text-slate-500">Temps réel</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-base block">🔒</span>
              <span className="text-[10px] font-bold text-slate-800 block mt-1">100% Sécurisé</span>
              <span className="text-[9px] text-slate-500">Firebase Cloud</span>
            </div>
          </div>

          {/* SUCCESS STATE */}
          {installStatus === 'success' && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center animate-in zoom-in-95">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
              <p className="font-bold text-sm">Application installée avec succès !</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                ModaFlow est maintenant disponible sur votre écran d'accueil.
              </p>
            </div>
          )}

          {/* IPHONE & IPAD GUIDE (Section 4) */}
          {(isIOS || (showManualGuide && platform === 'ios')) && installStatus !== 'success' && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <Smartphone className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Guide d'installation iPhone & iPad (Safari)</span>
              </div>
              
              <ol className="text-xs text-slate-600 space-y-2 pl-1 font-medium">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>Ouvrez <strong>ModaFlow</strong> dans le navigateur <strong>Safari</strong>.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span className="flex items-center gap-1.5 flex-wrap">
                    Appuyez sur le bouton de partage
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-bold text-slate-800">
                      <Share2 className="w-3 h-3 text-blue-600" /> Partager
                    </span>
                    en bas de Safari.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <span className="flex items-center gap-1.5 flex-wrap">
                    Faites défiler et choisissez
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-bold text-slate-800">
                      <PlusSquare className="w-3 h-3 text-blue-600" /> Sur l'écran d'accueil
                    </span>.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </span>
                  <span>Appuyez sur <strong>Ajouter</strong> en haut à droite pour confirmer.</span>
                </li>
              </ol>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-full mt-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs transition-all cursor-pointer text-center"
              >
                Compris
              </button>
            </div>
          )}

          {/* DESKTOP MANUAL GUIDE (Section 5) */}
          {showManualGuide && platform === 'desktop' && installStatus !== 'success' && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Monitor className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Installation sur Ordinateur (Chrome, Edge)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                1. Cliquez sur l'icône d'installation <strong>(⊕ Installer ModaFlow)</strong> située dans la barre d'adresse de votre navigateur en haut à droite.
              </p>
              <p className="text-slate-600 leading-relaxed">
                2. Ou ouvrez le menu <strong>⋮ (Paramètres)</strong> → <em>« Installer ModaFlow »</em> ou <em>« Créer un raccourci »</em>.
              </p>
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full mt-2 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
              >
                Compris
              </button>
            </div>
          )}

          {/* MAIN ACTIONS (when not showing iOS guide directly) */}
          {!isIOS && !showManualGuide && installStatus !== 'success' && (
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Installer ModaFlow</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
              >
                Plus tard
              </button>
            </div>
          )}

          {/* FOOTER NOTE */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 text-center pt-1">
            <Info className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Ne prend presque aucun espace de stockage · Mises à jour automatiques</span>
          </div>

        </div>

      </div>
    </div>
  );
};
