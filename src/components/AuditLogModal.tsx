import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, History, Shield, Bike, ShoppingBag, RotateCcw } from 'lucide-react';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose }) => {
  const { auditLogs, resetDemoData } = useStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-auto shadow-2xl overflow-hidden border border-neutral-200 animate-in zoom-in-95 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Journal d'Audit & Traçabilité Temps Réel
              </h2>
              <p className="text-xs text-neutral-500">
                Historique infalsifiable de qui a livré quel article et des encaissements.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-2xl border border-neutral-100 bg-neutral-50/60 space-y-1 hover:border-neutral-200 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-neutral-900">{log.action}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-200 text-neutral-700 uppercase">
                    {log.role}
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400 font-mono">
                  {log.timestamp}
                </span>
              </div>
              <p className="text-neutral-700 leading-relaxed">{log.details}</p>
              <p className="text-[10px] text-neutral-400 pt-1">
                Opérateur : <strong>{log.actorName}</strong>
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Voulez-vous réinitialiser les données de démonstration ?')) {
                resetDemoData();
                onClose();
              }
            }}
            className="text-xs text-neutral-500 hover:text-rose-600 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser les données démo</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
