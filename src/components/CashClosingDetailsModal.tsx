import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  Receipt, 
  FileDown, 
  Calendar, 
  User, 
  Banknote, 
  Coins, 
  CheckCircle2, 
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { CashRegisterClosing } from '../types';
import { downloadCashRegisterClosingPDF } from '../services/pdfService';

interface CashClosingDetailsModalProps {
  closing: CashRegisterClosing | null;
  onClose: () => void;
}

export const CashClosingDetailsModal: React.FC<CashClosingDetailsModalProps> = ({
  closing,
  onClose,
}) => {
  const { currentBoutique } = useStore();

  if (!closing) return null;

  const count = closing.countedCash;
  const isBalanced = closing.status === 'equilibre';
  const isSurplus = closing.status === 'excedent';

  const handleDownloadPDF = () => {
    downloadCashRegisterClosingPDF(closing, currentBoutique);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full my-auto shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                Clôture de Caisse {closing.closingNumber}
              </h2>
              <p className="text-xs text-slate-300">
                Date : {closing.date} à {closing.closedAt.substring(11)} · {closing.closedByUserName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-900 text-xs">
          {/* Status banner */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
            isBalanced
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : isSurplus
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-2">
              {isBalanced ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span className="font-bold">
                {isBalanced
                  ? 'Caisse parfaitement équilibrée (Écart nul)'
                  : isSurplus
                  ? `Excédent de caisse : +${closing.cashDifference.toLocaleString('fr-FR')} FCFA`
                  : `Manquant de caisse : ${closing.cashDifference.toLocaleString('fr-FR')} FCFA`}
              </span>
            </div>
            <span className="font-mono font-bold text-sm">
              {closing.status.toUpperCase()}
            </span>
          </div>

          {/* Theoretical vs Actual */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">
                Théorique attendu en caisse
              </span>
              <p className="text-lg font-bold font-mono text-slate-900">
                {((closing.openingCashFund || 0) + closing.theoreticalCash).toLocaleString('fr-FR')} F
              </p>
              <p className="text-[10px] text-slate-400">
                Fond initial ({(closing.openingCashFund || 0).toLocaleString('fr-FR')} F) + Ventes ({closing.theoreticalCash.toLocaleString('fr-FR')} F)
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">
                Physique compté (Billetage)
              </span>
              <p className="text-lg font-bold font-mono text-emerald-700">
                {closing.actualCashTotal.toLocaleString('fr-FR')} F
              </p>
              <p className="text-[10px] text-slate-400">
                Recettes Wave: {closing.theoreticalWave.toLocaleString('fr-FR')} F · OM: {closing.theoreticalOrangeMoney.toLocaleString('fr-FR')} F
              </p>
            </div>
          </div>

          {/* Billetage table */}
          <div>
            <h4 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider mb-2 flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5 text-slate-600" />
              Détail du Billetage (Comptage des coupures)
            </h4>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-2 px-3">Coupure</th>
                    <th className="py-2 px-3 text-center">Quantité</th>
                    <th className="py-2 px-3 text-right">Sous-Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium">10 000 FCFA</td>
                    <td className="py-2 px-3 text-center">{count.b10000 || 0}</td>
                    <td className="py-2 px-3 text-right font-bold">{((count.b10000 || 0) * 10000).toLocaleString('fr-FR')} F</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium">5 000 FCFA</td>
                    <td className="py-2 px-3 text-center">{count.b5000 || 0}</td>
                    <td className="py-2 px-3 text-right font-bold">{((count.b5000 || 0) * 5000).toLocaleString('fr-FR')} F</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium">2 000 FCFA</td>
                    <td className="py-2 px-3 text-center">{count.b2000 || 0}</td>
                    <td className="py-2 px-3 text-right font-bold">{((count.b2000 || 0) * 2000).toLocaleString('fr-FR')} F</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium">1 000 FCFA</td>
                    <td className="py-2 px-3 text-center">{count.b1000 || 0}</td>
                    <td className="py-2 px-3 text-right font-bold">{((count.b1000 || 0) * 1000).toLocaleString('fr-FR')} F</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium">500 FCFA</td>
                    <td className="py-2 px-3 text-center">{count.b500 || 0}</td>
                    <td className="py-2 px-3 text-right font-bold">{((count.b500 || 0) * 500).toLocaleString('fr-FR')} F</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium">Pièces en vrac</td>
                    <td className="py-2 px-3 text-center">—</td>
                    <td className="py-2 px-3 text-right font-bold">{(count.coinsTotal || 0).toLocaleString('fr-FR')} F</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td className="py-2 px-3 font-sans">TOTAL ESPÈCES</td>
                    <td className="py-2 px-3 text-center">—</td>
                    <td className="py-2 px-3 text-right text-blue-600">{closing.actualCashTotal.toLocaleString('fr-FR')} FCFA</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Observations */}
          {closing.notes && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Remarques du responsable :
              </span>
              <p className="text-slate-800 italic">« {closing.notes} »</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Fermer
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-100" />
            <span>Télécharger Ticket Z (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
