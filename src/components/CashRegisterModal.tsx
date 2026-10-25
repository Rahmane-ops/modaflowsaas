import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  Receipt, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Coins, 
  Banknote, 
  FileDown, 
  Smartphone, 
  Info,
  Calendar,
  Lock,
  ArrowRight,
  Sparkles,
  Calculator
} from 'lucide-react';
import { CashCountBreakdown, CashRegisterClosing } from '../types';
import { downloadCashRegisterClosingPDF } from '../services/pdfService';

interface CashRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClosingSuccess?: (closing: CashRegisterClosing) => void;
}

export const CashRegisterModal: React.FC<CashRegisterModalProps> = ({
  isOpen,
  onClose,
  onClosingSuccess,
}) => {
  const { 
    currentUser, 
    currentBoutique, 
    transactions, 
    orders, 
    addCashRegisterClosing 
  } = useStore();

  const todayStr = useMemo(() => new Date().toISOString().substring(0, 10), []);

  // Filter transactions of today
  const todayTransactions = useMemo(() => {
    return transactions.filter((t) => t.timestamp && t.timestamp.startsWith(todayStr));
  }, [transactions, todayStr]);

  const effectiveTransactions = todayTransactions.length > 0 ? todayTransactions : transactions.slice(0, 8);

  // Theoretical revenues today
  const theoreticalWave = useMemo(() => {
    return effectiveTransactions
      .filter((t) => t.paymentMethod === 'wave')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [effectiveTransactions]);

  const theoreticalOrangeMoney = useMemo(() => {
    return effectiveTransactions
      .filter((t) => t.paymentMethod === 'orange_money')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [effectiveTransactions]);

  const theoreticalCashSales = useMemo(() => {
    return effectiveTransactions
      .filter((t) => t.paymentMethod === 'cash')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [effectiveTransactions]);

  const theoreticalTotalRevenue = theoreticalWave + theoreticalOrangeMoney + theoreticalCashSales;
  const ordersCountToday = effectiveTransactions.length;

  // Form states
  const [openingCashFund, setOpeningCashFund] = useState<number>(50000); // 50 000 FCFA fond initial par défaut
  const [b10000, setB10000] = useState<number>(0);
  const [b5000, setB5000] = useState<number>(0);
  const [b2000, setB2000] = useState<number>(0);
  const [b1000, setB1000] = useState<number>(0);
  const [b500, setB500] = useState<number>(0);
  const [coinsTotal, setCoinsTotal] = useState<number>(0);

  const [waveConfirmed, setWaveConfirmed] = useState<boolean>(true);
  const [orangeMoneyConfirmed, setOrangeMoneyConfirmed] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Total cash counted from physical denominations
  const actualCashTotal = useMemo(() => {
    return (
      b10000 * 10000 +
      b5000 * 5000 +
      b2000 * 2000 +
      b1000 * 1000 +
      b500 * 500 +
      coinsTotal
    );
  }, [b10000, b5000, b2000, b1000, b500, coinsTotal]);

  // Total expected cash in the drawer: Opening float + day's cash sales
  const theoreticalExpectedCash = (Number(openingCashFund) || 0) + theoreticalCashSales;

  // Cash difference: Actual counted cash minus theoretical expected cash
  const cashDifference = actualCashTotal - theoreticalExpectedCash;

  const closingStatus: 'equilibre' | 'excedent' | 'manquant' = useMemo(() => {
    if (cashDifference === 0) return 'equilibre';
    if (cashDifference > 0) return 'excedent';
    return 'manquant';
  }, [cashDifference]);

  if (!isOpen) return null;

  // Quick fill helper for convenience / testing
  const handleQuickFillExpected = () => {
    let remainder = theoreticalExpectedCash;
    const n10000 = Math.floor(remainder / 10000);
    remainder %= 10000;
    const n5000 = Math.floor(remainder / 5000);
    remainder %= 5000;
    const n2000 = Math.floor(remainder / 2000);
    remainder %= 2000;
    const n1000 = Math.floor(remainder / 1000);
    remainder %= 1000;
    const n500 = Math.floor(remainder / 500);
    remainder %= 500;

    setB10000(n10000);
    setB5000(n5000);
    setB2000(n2000);
    setB1000(n1000);
    setB500(n500);
    setCoinsTotal(remainder);
  };

  const handleClearCount = () => {
    setB10000(0);
    setB5000(0);
    setB2000(0);
    setB1000(0);
    setB500(0);
    setCoinsTotal(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (actualCashTotal === 0 && theoreticalExpectedCash > 0) {
      setErrorMessage('Veuillez procéder au comptage physique des espèces (billetage).');
      return;
    }

    if (closingStatus === 'manquant' && !notes.trim()) {
      setErrorMessage('Un manquant de caisse est constaté. Veuillez renseigner une justification obligatoire dans les remarques.');
      return;
    }

    setIsSubmitting(true);

    try {
      const breakdown: CashCountBreakdown = {
        b10000,
        b5000,
        b2000,
        b1000,
        b500,
        coinsTotal,
      };

      const newClosing = await addCashRegisterClosing({
        storeId: currentBoutique.id,
        date: todayStr,
        openingCashFund: Number(openingCashFund) || 0,
        theoreticalCash: theoreticalCashSales,
        theoreticalWave,
        theoreticalOrangeMoney,
        theoreticalTotalRevenue,
        ordersCount: ordersCountToday,
        countedCash: breakdown,
        actualCashTotal,
        waveConfirmed,
        orangeMoneyConfirmed,
        cashDifference,
        status: closingStatus,
        notes: notes.trim() || (closingStatus === 'equilibre' ? 'Clôture normale équilibrée sans écart.' : undefined),
      });

      // Automatically generate and download the Official Z Ticket PDF
      downloadCashRegisterClosingPDF(newClosing, currentBoutique);

      if (onClosingSuccess) {
        onClosingSuccess(newClosing);
      }
      onClose();
    } catch {
      setErrorMessage('Erreur lors de la validation de la clôture de caisse.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full my-auto shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  Clôture Journalière de Caisse (Z)
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white uppercase tracking-wider">
                  Ticket Z
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {currentBoutique.name} · Date : {todayStr} · Responsable : {currentUser.name}
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

        {/* Scrollable Body */}
        <form id="cash-closing-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-900">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Encaissements Théoriques Enregistrés par le Système */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                1. Encaissements Théoriques du Système (Journée en cours)
              </h3>
              <span className="text-[11px] font-semibold text-slate-500">
                {ordersCountToday} vente(s) enregistrée(s)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Fond de caisse initial */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                  Fond de caisse matin
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={openingCashFund}
                    onChange={(e) => setOpeningCashFund(Number(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-sm font-bold font-mono text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  <span className="absolute right-2 top-1.5 text-[10px] font-semibold text-slate-400">
                    F
                  </span>
                </div>
                <span className="text-[9px] text-slate-500 mt-1 block">Monnaie de départ</span>
              </div>

              {/* Ventes Espèces */}
              <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-200/80">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block mb-1">
                  Ventes Espèces
                </span>
                <p className="text-base font-extrabold font-mono text-emerald-950 tabular-nums">
                  {theoreticalCashSales.toLocaleString('fr-FR')} F
                </p>
                <span className="text-[9px] text-emerald-700 mt-1 block">Recettes cash du jour</span>
              </div>

              {/* Ventes Wave */}
              <div className="bg-sky-50/60 rounded-xl p-3 border border-sky-200/80">
                <span className="text-[10px] uppercase font-bold text-sky-800 block mb-1">
                  Ventes Wave
                </span>
                <p className="text-base font-extrabold font-mono text-sky-950 tabular-nums">
                  {theoreticalWave.toLocaleString('fr-FR')} F
                </p>
                <span className="text-[9px] text-sky-700 mt-1 block">Mobile Money marchand</span>
              </div>

              {/* Ventes Orange Money */}
              <div className="bg-orange-50/60 rounded-xl p-3 border border-orange-200/80">
                <span className="text-[10px] uppercase font-bold text-orange-800 block mb-1">
                  Ventes Orange Money
                </span>
                <p className="text-base font-extrabold font-mono text-orange-950 tabular-nums">
                  {theoreticalOrangeMoney.toLocaleString('fr-FR')} F
                </p>
                <span className="text-[9px] text-orange-700 mt-1 block">Mobile Money marchand</span>
              </div>
            </div>

            {/* Total théorique espèces attendu */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-blue-950">
                  Total théorique attendu dans le tiroir-caisse (Fond + Espèces encaissées) :
                </span>
              </div>
              <span className="font-mono font-bold text-blue-900 text-sm tabular-nums whitespace-nowrap">
                {theoreticalExpectedCash.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>

          {/* Section 2: Billetage / Comptage Physique des Espèces */}
          <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-slate-600" />
                2. Comptage Physique des Espèces (Billetage)
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleQuickFillExpected}
                  className="px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Remplir le billetage avec le montant théorique pour aller plus vite"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Remplir au montant attendu</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearCount}
                  className="px-2 py-1 rounded-lg text-slate-500 hover:text-slate-800 text-[11px] font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Effacer
                </button>
              </div>
            </div>

            {/* Denomination rows */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* 10 000 FCFA */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-800">10 000 FCFA</span>
                  <span className="font-mono text-slate-500 text-[10px]">
                    ={(b10000 * 10000).toLocaleString('fr-FR')} F
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">Qté :</span>
                  <input
                    type="number"
                    min="0"
                    value={b10000 || ''}
                    onChange={(e) => setB10000(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-2 py-1 rounded border border-slate-200 text-xs font-bold font-mono text-center focus:outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* 5 000 FCFA */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-800">5 000 FCFA</span>
                  <span className="font-mono text-slate-500 text-[10px]">
                    ={(b5000 * 5000).toLocaleString('fr-FR')} F
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">Qté :</span>
                  <input
                    type="number"
                    min="0"
                    value={b5000 || ''}
                    onChange={(e) => setB5000(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-2 py-1 rounded border border-slate-200 text-xs font-bold font-mono text-center focus:outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* 2 000 FCFA */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-800">2 000 FCFA</span>
                  <span className="font-mono text-slate-500 text-[10px]">
                    ={(b2000 * 2000).toLocaleString('fr-FR')} F
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">Qté :</span>
                  <input
                    type="number"
                    min="0"
                    value={b2000 || ''}
                    onChange={(e) => setB2000(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-2 py-1 rounded border border-slate-200 text-xs font-bold font-mono text-center focus:outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* 1 000 FCFA */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-800">1 000 FCFA</span>
                  <span className="font-mono text-slate-500 text-[10px]">
                    ={(b1000 * 1000).toLocaleString('fr-FR')} F
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">Qté :</span>
                  <input
                    type="number"
                    min="0"
                    value={b1000 || ''}
                    onChange={(e) => setB1000(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-2 py-1 rounded border border-slate-200 text-xs font-bold font-mono text-center focus:outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* 500 FCFA */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-800">500 FCFA</span>
                  <span className="font-mono text-slate-500 text-[10px]">
                    ={(b500 * 500).toLocaleString('fr-FR')} F
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">Qté :</span>
                  <input
                    type="number"
                    min="0"
                    value={b500 || ''}
                    onChange={(e) => setB500(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-2 py-1 rounded border border-slate-200 text-xs font-bold font-mono text-center focus:outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Pièces de monnaie en vrac */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    Pièces (Vrac)
                  </span>
                  <span className="font-mono text-slate-500 text-[10px]">
                    ={coinsTotal.toLocaleString('fr-FR')} F
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">Total :</span>
                  <input
                    type="number"
                    min="0"
                    step="25"
                    value={coinsTotal || ''}
                    onChange={(e) => setCoinsTotal(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-2 py-1 rounded border border-slate-200 text-xs font-bold font-mono text-center focus:outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="0 FCFA"
                  />
                </div>
              </div>
            </div>

            {/* Total Physique Compté */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-700">
                Total Espèces Physiques Compté :
              </span>
              <span className="text-base font-extrabold font-mono text-slate-900 tabular-nums">
                {actualCashTotal.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>

          {/* Section 3: Rapprochement Mobile Money */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-slate-600" />
              3. Rapprochement des Soldes Mobile Money
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={waveConfirmed}
                  onChange={(e) => setWaveConfirmed(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Solde Wave ({theoreticalWave.toLocaleString('fr-FR')} FCFA)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Vérifié et conforme sur l'application marchande Wave.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={orangeMoneyConfirmed}
                  onChange={(e) => setOrangeMoneyConfirmed(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer accent-orange-600"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Solde Orange Money ({theoreticalOrangeMoney.toLocaleString('fr-FR')} FCFA)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Vérifié et conforme sur le terminal Orange Money.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 4: Diagnostic de Caisse & Écart */}
          <div className={`p-4 rounded-2xl border transition-all ${
            closingStatus === 'equilibre'
              ? 'bg-emerald-50 border-emerald-200'
              : closingStatus === 'excedent'
              ? 'bg-amber-50 border-amber-200'
              : 'bg-rose-50 border-rose-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Diagnostic de l'Écart de Caisse
              </span>
              {closingStatus === 'equilibre' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Caisse Parfaitement Équilibrée (0 F)
                </span>
              )}
              {closingStatus === 'excedent' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-600 text-white">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Excédent : +{cashDifference.toLocaleString('fr-FR')} FCFA
                </span>
              )}
              {closingStatus === 'manquant' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-600 text-white">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Manquant de caisse : {cashDifference.toLocaleString('fr-FR')} FCFA
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white/80 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 block">Théorique Attendu</span>
                <span className="font-mono font-bold text-slate-900">
                  {theoreticalExpectedCash.toLocaleString('fr-FR')} F
                </span>
              </div>
              <div className="bg-white/80 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 block">Physique Compté</span>
                <span className="font-mono font-bold text-slate-900">
                  {actualCashTotal.toLocaleString('fr-FR')} F
                </span>
              </div>
              <div className="bg-white/80 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 block">Écart Net</span>
                <span className={`font-mono font-extrabold ${
                  closingStatus === 'equilibre' ? 'text-emerald-700' : closingStatus === 'excedent' ? 'text-amber-700' : 'text-rose-700'
                }`}>
                  {cashDifference > 0 ? '+' : ''}{cashDifference.toLocaleString('fr-FR')} F
                </span>
              </div>
            </div>
          </div>

          {/* Notes / Justification */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Observations, remarques ou justification {closingStatus === 'manquant' ? '(Obligatoire pour manquant) *' : '(optionnel) :'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={closingStatus === 'manquant' ? 'Précisez la cause du déficit constaté...' : 'Ex: Équipe du soir, aucun incident, caisse conforme.'}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                closingStatus === 'manquant' && !notes.trim()
                  ? 'border-rose-300 bg-rose-50/30 focus:ring-rose-500'
                  : 'border-slate-200 bg-white focus:ring-slate-900'
              }`}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 sm:px-6 bg-white border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            <span>Rôle : <strong>{currentUser.role.toUpperCase()}</strong></span>
            <span className="mx-2">·</span>
            <span>Génère le <strong>Ticket Z certifié en PDF</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="cash-closing-form"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 active:scale-95 text-white flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <FileDown className="w-4 h-4 text-blue-400" />
              <span>Valider la Clôture & Télécharger Z (PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
