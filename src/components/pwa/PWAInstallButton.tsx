import React, { useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallButtonProps {
  variant?: 'header' | 'sidebar' | 'profile' | 'full';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstalled, isIOS, isInstallable } = usePWAInstall();
  const [modalOpen, setModalOpen] = useState(false);

  // If already running in standalone PWA mode, don't show the button
  if (isInstalled) {
    return null;
  }

  if (variant === 'sidebar') {
    return (
      <>
        <button
          onClick={() => setModalOpen(true)}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/80 transition-all cursor-pointer shadow-2xs group ${className}`}
          title="Installer l'application ModaFlow sur votre appareil"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <Download className="w-4 h-4" />
          </div>
          <div className="text-left flex-1">
            <p className="font-bold text-slate-900 leading-tight">Installer l'application</p>
            <p className="text-[10px] text-blue-600 font-normal">Accès mobile & bureau</p>
          </div>
        </button>

        <PWAInstallModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </>
    );
  }

  if (variant === 'profile') {
    return (
      <>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={`w-full flex items-center justify-between p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors text-left cursor-pointer ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900">Installer ModaFlow sur cet appareil</p>
              <p className="text-[11px] text-slate-500">Ajouter à l'écran d'accueil (PWA)</p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-600">Installer →</span>
        </button>

        <PWAInstallModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </>
    );
  }

  // Header button variant (compact & stylish)
  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 border border-blue-200/80 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-98 ${className}`}
        title="Installer l'application ModaFlow"
      >
        <Download className="w-3.5 h-3.5 text-blue-600" />
        <span className="hidden sm:inline">Installer l'app</span>
        <span className="sm:hidden">App</span>
      </button>

      <PWAInstallModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};
