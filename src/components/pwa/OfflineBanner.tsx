import React from 'react';
import { WifiOff, AlertCircle, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-slate-900/95 text-white p-4 rounded-2xl shadow-2xl border border-rose-500/40 backdrop-blur-md animate-in slide-in-from-bottom-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
          <WifiOff className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">Connexion Internet requise</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/30 text-rose-300">
              Hors-ligne
            </span>
          </div>
          <p className="text-slate-300 mt-1 leading-relaxed">
            ModaFlow synchronise les ventes, stocks et clients en direct avec Cloud Firestore. Une connexion Internet active est nécessaire pour enregistrer ou consulter vos données réelles.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Réessayer la connexion</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
