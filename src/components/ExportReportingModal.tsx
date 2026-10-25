import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  FileDown, 
  FileSpreadsheet, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  MessageCircle, 
  Filter, 
  BarChart3, 
  Layers, 
  CreditCard,
  Building2,
  Download,
  Clock,
  Sparkles
} from 'lucide-react';
import { PaymentMethod, OrderStatus } from '../types';
import { 
  exportSalesOrdersToCSV, 
  exportAccountingLedgerToCSV, 
  exportMonthlySummaryToCSV 
} from '../services/exportService';
import { 
  downloadMonthlyAccountingReportPDF, 
  shareMonthlyAccountingReportPDFOnWhatsApp 
} from '../services/pdfService';

interface ExportReportingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'monthly' | 'sales' | 'accounting';
}

type PeriodPreset = 'current_month' | 'previous_month' | 'quarter' | 'year' | 'last_7_days' | 'custom';

export const ExportReportingModal: React.FC<ExportReportingModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'monthly',
}) => {
  const { orders, transactions, currentBoutique, currentUser } = useStore();

  const [activeTab, setActiveTab] = useState<'monthly' | 'sales' | 'accounting'>(initialTab);
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('current_month');
  
  // Custom date range bounds
  const [startDate, setStartDate] = useState<string>('2026-10-01');
  const [endDate, setEndDate] = useState<string>('2026-10-31');

  // Filters
  const [paymentFilter, setPaymentFilter] = useState<'all' | PaymentMethod>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');

  // Feedback states
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync dates when preset changes
  const computedPeriod = useMemo(() => {
    const today = new Date(); // In 2026 context
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-indexed

    if (periodPreset === 'current_month') {
      const start = '2026-10-01';
      const end = '2026-10-31';
      return { start, end, label: 'Octobre 2026' };
    } else if (periodPreset === 'previous_month') {
      const start = '2026-09-01';
      const end = '2026-09-30';
      return { start, end, label: 'Septembre 2026' };
    } else if (periodPreset === 'quarter') {
      const start = '2026-10-01';
      const end = '2026-12-31';
      return { start, end, label: '4ème Trimestre (T4 2026)' };
    } else if (periodPreset === 'year') {
      const start = '2026-01-01';
      const end = '2026-12-31';
      return { start, end, label: 'Exercice Annuel 2026' };
    } else if (periodPreset === 'last_7_days') {
      const end = '2026-10-20';
      const start = '2026-10-13';
      return { start, end, label: 'Du 13/10/2026 au 20/10/2026' };
    } else {
      return {
        start: startDate,
        end: endDate,
        label: `Du ${startDate} au ${endDate}`,
      };
    }
  }, [periodPreset, startDate, endDate]);

  // Filtered dataset for reporting
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const orderDate = o.createdAt.substring(0, 10);
      if (orderDate < computedPeriod.start || orderDate > computedPeriod.end) return false;
      if (paymentFilter !== 'all' && o.paymentMethod !== paymentFilter) return false;
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      return true;
    });
  }, [orders, computedPeriod, paymentFilter, statusFilter]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const tDate = (t.timestamp || '').substring(0, 10);
      if (tDate < computedPeriod.start || tDate > computedPeriod.end) return false;
      if (paymentFilter !== 'all' && t.paymentMethod !== paymentFilter) return false;
      return true;
    });
  }, [transactions, computedPeriod, paymentFilter]);

  // Live KPI totals
  const totalRevenue = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const waveTotal = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.paymentMethod === 'wave')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const omTotal = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.paymentMethod === 'orange_money')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const cashTotal = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.paymentMethod === 'cash')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  if (!isOpen) return null;

  // Handlers
  const handleDownloadPDF = async () => {
    setIsProcessing(true);
    try {
      const fileName = downloadMonthlyAccountingReportPDF(
        computedPeriod,
        currentBoutique,
        filteredOrders,
        filteredTransactions,
        currentUser
      );
      setStatusNotice(`Rapport PDF officiel (${fileName}) téléchargé avec succès.`);
      setTimeout(() => setStatusNotice(null), 5000);
    } catch (err) {
      setStatusNotice('Erreur lors de la génération du rapport PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShareWhatsApp = async () => {
    setIsProcessing(true);
    try {
      const res = await shareMonthlyAccountingReportPDFOnWhatsApp(
        computedPeriod,
        currentBoutique,
        filteredOrders,
        filteredTransactions,
        currentUser
      );
      if (res.method === 'native_share') {
        setStatusNotice('Rapport PDF partagé avec succès sur WhatsApp.');
      } else {
        setStatusNotice('Rapport PDF téléchargé et WhatsApp ouvert avec le message récapitulatif.');
      }
      setTimeout(() => setStatusNotice(null), 5000);
    } catch {
      setStatusNotice('Erreur lors du partage WhatsApp.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadCSV = () => {
    setIsProcessing(true);
    try {
      let fileName = '';
      if (activeTab === 'sales') {
        fileName = exportSalesOrdersToCSV(
          filteredOrders,
          computedPeriod.label,
          currentBoutique.name
        );
      } else if (activeTab === 'accounting') {
        fileName = exportAccountingLedgerToCSV(
          filteredTransactions,
          computedPeriod.label,
          currentBoutique.name
        );
      } else {
        fileName = exportMonthlySummaryToCSV(
          filteredOrders,
          filteredTransactions,
          computedPeriod.label,
          currentBoutique
        );
      }
      setStatusNotice(`Fichier CSV (${fileName}) exporté avec succès (format UTF-8 pour Excel).`);
      setTimeout(() => setStatusNotice(null), 5000);
    } catch {
      setStatusNotice("Erreur lors de l'exportation CSV.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <FileDown className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Centre d'Exportation & Reporting Administratif
              </h2>
              <p className="text-xs text-slate-300">
                Générez vos bilans comptables mensuels et exports de ventes certifiés en PDF ou CSV.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice feedback banner */}
        {statusNotice && (
          <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{statusNotice}</span>
            </div>
            <button onClick={() => setStatusNotice(null)} className="text-slate-400 hover:text-slate-700 font-bold">
              ×
            </button>
          </div>
        )}

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Tab Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('monthly')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Bilan Mensuel Officiel</span>
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'sales'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Journal des Ventes</span>
            </button>
            <button
              onClick={() => setActiveTab('accounting')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'accounting'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-4 h-4 text-amber-600" />
              <span>Grand Livre Trésorerie</span>
            </button>
          </div>

          {/* 1. Period Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Période du Reporting</span>
              </label>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
                {computedPeriod.label}
              </span>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => setPeriodPreset('current_month')}
                className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                  periodPreset === 'current_month'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Mois en cours (Octobre)
              </button>
              <button
                onClick={() => setPeriodPreset('previous_month')}
                className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                  periodPreset === 'previous_month'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Mois dernier (Septembre)
              </button>
              <button
                onClick={() => setPeriodPreset('quarter')}
                className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                  periodPreset === 'quarter'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Ce trimestre (T4 2026)
              </button>
              <button
                onClick={() => setPeriodPreset('year')}
                className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                  periodPreset === 'year'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Année 2026 (Exercice)
              </button>
              <button
                onClick={() => setPeriodPreset('last_7_days')}
                className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                  periodPreset === 'last_7_days'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                7 derniers jours
              </button>
              <button
                onClick={() => setPeriodPreset('custom')}
                className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                  periodPreset === 'custom'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Période personnalisée...
              </button>
            </div>

            {/* Custom Date Pickers */}
            {periodPreset === 'custom' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-150">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Optional Filters */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filtres Optionnels</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Mode de règlement
                </label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                >
                  <option value="all">Tous modes de paiement (Wave, OM, Espèces)</option>
                  <option value="wave">Wave Mobile Money uniquement</option>
                  <option value="orange_money">Orange Money uniquement</option>
                  <option value="cash">Espèces (Cash) uniquement</option>
                </select>
              </div>

              {activeTab === 'sales' && (
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Statut de la commande
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="livre_paye">Soldées & Livrées uniquement</option>
                    <option value="en_cours">En cours de traitement</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* 3. Live Period Data Summary Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                <span>Synthèse des Données Prêtes à l'Exportation</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {currentBoutique.name} ({currentBoutique.city})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200/70">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Recettes Totales</span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {totalRevenue.toLocaleString('fr-FR')} <span className="text-[10px] font-sans">FCFA</span>
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200/70">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Ventes / Commandes</span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {filteredOrders.length}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200/70">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Transactions</span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {filteredTransactions.length}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200/70">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Wave / OM / Cash</span>
                <span className="text-xs font-semibold text-slate-700 font-mono">
                  {waveTotal > 0 ? 'Wave ' : ''}{omTotal > 0 ? 'OM ' : ''}{cashTotal > 0 ? 'Cash' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Certifié conforme pour transmission à l'expert-comptable</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Format 1: CSV Tableur Excel */}
            <button
              onClick={handleDownloadCSV}
              disabled={isProcessing}
              className="px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-2 transition-all shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50"
              title="Télécharger les données brutes au format CSV (compatible Microsoft Excel, LibreOffice et Google Sheets)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exporter CSV (Excel)</span>
            </button>

            {/* Format 2: PDF Professionnel Certifié */}
            <button
              onClick={handleDownloadPDF}
              disabled={isProcessing}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
              title="Télécharger le rapport officiel complet au format PDF avec signatures et ventilations"
            >
              <FileDown className="w-4 h-4 text-blue-400" />
              <span>Télécharger Bilan PDF</span>
            </button>

            {/* Format 3: WhatsApp Share */}
            <button
              onClick={handleShareWhatsApp}
              disabled={isProcessing}
              className="p-2.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700 transition-colors cursor-pointer"
              title="Partager le rapport PDF sur WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
