import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Search, 
  ArrowUpRight, 
  Calendar, 
  FileText,
  CreditCard,
  Bike,
  FileDown,
  CheckCircle2,
  FileSpreadsheet,
  Receipt,
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet
} from 'lucide-react';
import { Order, PaymentMethod, Transaction } from '../types';
import { useStore } from '../context/StoreContext';
import { downloadDailySalesReportPDF } from '../services/pdfService';
import { exportAccountingLedgerToCSV } from '../services/exportService';
import { NewExpenseModal } from './NewExpenseModal';

interface AccountingViewProps {
  onViewInvoiceByNumber: (invoiceNumber: string) => void;
  onOpenExportModal?: (initialTab?: 'monthly' | 'sales' | 'accounting') => void;
}

export const AccountingView: React.FC<AccountingViewProps> = ({
  onViewInvoiceByNumber,
  onOpenExportModal,
}) => {
  const { financialStats, transactions, orders, currentBoutique, currentUser, hasPermission } = useStore();

  const [paymentFilter, setPaymentFilter] = useState<'all' | PaymentMethod>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'vente' | 'depense'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reportDate, setReportDate] = useState<string>(() => new Date().toISOString().substring(0, 10));
  const [pdfNotice, setPdfNotice] = useState<string | null>(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const canCreateExpense = hasPermission('expenses.create');
  const canExport = hasPermission('reports.export');
  const canViewFinancials = hasPermission('reports.financial');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t: Transaction) => {
      if (paymentFilter !== 'all' && t.paymentMethod !== paymentFilter) return false;
      if (typeFilter !== 'all' && (t.type || 'vente') !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesClient = (t.clientName || '').toLowerCase().includes(q);
        const matchesInvoice = (t.invoiceNumber || '').toLowerCase().includes(q);
        const matchesSummary = (t.itemsSummary || '').toLowerCase().includes(q);
        const matchesDriver = (t.deliveryDriverName || '').toLowerCase().includes(q);
        if (!matchesClient && !matchesInvoice && !matchesSummary && !matchesDriver) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, paymentFilter, typeFilter, searchQuery]);

  const handleExportCSV = () => {
    try {
      const fileName = exportAccountingLedgerToCSV(
        filteredTransactions,
        reportDate,
        currentBoutique.name
      );
      setPdfNotice(`Journal comptable (${fileName}) exporté en CSV (format Excel UTF-8).`);
      setTimeout(() => setPdfNotice(null), 5000);
    } catch {
      setPdfNotice("Erreur lors de l'exportation CSV.");
    }
  };

  const handleDownloadDailyPDF = () => {
    try {
      const fileName = downloadDailySalesReportPDF(
        reportDate,
        currentBoutique,
        orders,
        transactions,
        currentUser
      );
      setPdfNotice(`Rapport journalier (${fileName}) téléchargé avec succès.`);
      setTimeout(() => setPdfNotice(null), 5000);
    } catch {
      setPdfNotice('Erreur lors de la génération du rapport PDF.');
    }
  };

  const handlePrintSummary = () => {
    window.print();
  };

  const getPaymentBadge = (method: PaymentMethod) => {
    switch (method) {
      case 'wave':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#00A3FF]/15 text-[#0070AA] font-bold text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A3FF]" />
            Wave
          </span>
        );
      case 'orange_money':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FF6600]/15 text-[#D15500] font-bold text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6600]" />
            Orange Money
          </span>
        );
      case 'cash':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Espèces (Cash)
          </span>
        );
    }
  };

  return (
    <div className="pb-24 lg:pb-12 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Comptabilité & Trésorerie
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Enregistrement automatique des encaissements Wave, Orange Money et Espèces.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Action: Enregistrer une dépense */}
          {canCreateExpense && (
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Enregistrer un décaissement (loyer, salaires, électricité, emballages, etc.)"
            >
              <Receipt className="w-4 h-4 text-rose-100" />
              <span>+ Nouvelle Dépense</span>
            </button>
          )}

          {/* Main Action: Open Reporting Mensuel & Exports Modal */}
          {canExport && onOpenExportModal && (
            <button
              onClick={() => onOpenExportModal('monthly')}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Générer un bilan comptable mensuel certifié ou exporter en CSV / Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
              <span>Reporting Mensuel & Exports</span>
            </button>
          )}

          {/* Date Selector for Report */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              title="Choisir la date du rapport journalier"
            />
          </div>

          {/* Primary Action: Download Daily Sales Report PDF */}
          {canExport && (
            <>
              <button
                onClick={handleDownloadDailyPDF}
                className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                title="Télécharger le rapport de ventes officiel de la journée en PDF"
              >
                <FileDown className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Rapport Jour (PDF)</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                title="Exporter rapidement le journal en cours en fichier CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">CSV Rapide</span>
              </button>
            </>
          )}

          <button
            onClick={handlePrintSummary}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Imprimer</span>
          </button>
        </div>
      </div>

      {/* Floating Notice / Feedback */}
      {pdfNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{pdfNotice}</span>
          </div>
          <button onClick={() => setPdfNotice(null)} className="text-slate-400 hover:text-slate-700 font-bold px-1">
            ×
          </button>
        </div>
      )}

      {/* 4 Financial Balances Cards (Rigorous separation between CA, Dépenses, Bénéfice and Trésorerie) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue (Ventes) */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Chiffre d'Affaires Brut
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
            {financialStats.totalRevenue.toLocaleString('fr-FR')}{' '}
            <span className="text-xs font-normal text-slate-600">FCFA</span>
          </p>
          <p className="text-[11px] text-slate-600">
            {transactions.filter((t: Transaction) => t.type === 'vente' || !t.type).length} vente(s) encaissée(s)
          </p>
        </div>

        {/* Total Dépenses */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Dépenses & Charges
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600 tracking-tight tabular-nums">
            {financialStats.totalExpenses.toLocaleString('fr-FR')}{' '}
            <span className="text-xs font-normal text-slate-600">FCFA</span>
          </p>
          <p className="text-[11px] text-slate-600">
            {transactions.filter((t: Transaction) => t.type === 'depense').length} décaissement(s) d'exploitation
          </p>
        </div>

        {/* Bénéfice Net Estimé */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Bénéfice Net Estimé
            </span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${financialStats.estimatedNetProfit >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className={`text-2xl font-bold tracking-tight tabular-nums ${financialStats.estimatedNetProfit >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>
            {financialStats.estimatedNetProfit.toLocaleString('fr-FR')}{' '}
            <span className="text-xs font-normal text-slate-600">FCFA</span>
          </p>
          <p className="text-[11px] text-slate-600">
            CA Brut déduit des dépenses
          </p>
        </div>

        {/* Trésorerie Disponible (Comptes) */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Trésorerie Disponible
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
            {financialStats.totalAvailableTreasury.toLocaleString('fr-FR')}{' '}
            <span className="text-xs font-normal text-slate-600">FCFA</span>
          </p>
          <p className="text-[10px] text-slate-600 truncate font-mono">
            Wave: {financialStats.waveTotal.toLocaleString('fr-FR')} · OM: {financialStats.orangeMoneyTotal.toLocaleString('fr-FR')} · Caisse: {financialStats.cashTotal.toLocaleString('fr-FR')}
          </p>
        </div>
      </div>

      {/* Transactions History Table */}
      <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-xs">
        {/* Table Controls */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Historique Détaillé des Transactions
            </h3>
            <p className="text-xs text-neutral-500">
              Journal des encaissements en temps réel avec traçabilité vendeur & livreur.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by operation type */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg mr-1">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  typeFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tous ({transactions.length})
              </button>
              <button
                onClick={() => setTypeFilter('vente')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  typeFilter === 'vente' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ventes ({transactions.filter((t: Transaction) => t.type === 'vente' || !t.type).length})
              </button>
              <button
                onClick={() => setTypeFilter('depense')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  typeFilter === 'depense' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dépenses ({transactions.filter((t: Transaction) => t.type === 'depense').length})
              </button>
            </div>

            {/* Filter by payment method */}
            <button
              onClick={() => setPaymentFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                paymentFilter === 'all'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Tous modes
            </button>
            <button
              onClick={() => setPaymentFilter('wave')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                paymentFilter === 'wave'
                  ? 'bg-[#00A3FF] text-white font-bold'
                  : 'bg-[#00A3FF]/10 text-[#0070AA] hover:bg-[#00A3FF]/20'
              }`}
            >
              Wave
            </button>
            <button
              onClick={() => setPaymentFilter('orange_money')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                paymentFilter === 'orange_money'
                  ? 'bg-[#FF6600] text-white font-bold'
                  : 'bg-[#FF6600]/10 text-[#D15500] hover:bg-[#FF6600]/20'
              }`}
            >
              Orange Money
            </button>
            <button
              onClick={() => setPaymentFilter('cash')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                paymentFilter === 'cash'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
              }`}
            >
              Espèces
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3 bg-neutral-50/50 border-b border-neutral-100">
          <div className="relative max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrer par client, n° facture, livreur..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
        </div>

        {/* Transactions Table */}
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500 space-y-1">
            <p className="font-semibold text-neutral-700">Aucune écriture comptable pour ces critères.</p>
            <p className="text-[11px] text-neutral-400">Vos encaissements de ventes et décaissements de dépenses s'afficheront ici en direct.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-neutral-400 uppercase tracking-wider text-[10px] font-bold border-b border-neutral-200">
                  <th className="py-3 px-4">Réf / Facture</th>
                  <th className="py-3 px-4">Date & Heure</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Tiers / Client</th>
                  <th className="py-3 px-4">Détails / Motif</th>
                  <th className="py-3 px-4">Responsable</th>
                  <th className="py-3 px-4">Mode Règlement</th>
                  <th className="py-3 px-4 text-right">Montant</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-sans">
                {filteredTransactions.map((t) => {
                  const isExpense = t.type === 'depense';
                  return (
                    <tr key={t.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-900 whitespace-nowrap">
                        {t.invoiceNumber || t.id}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-500 whitespace-nowrap">
                        {t.timestamp}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isExpense ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                            Dépense
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            Vente
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-semibold text-neutral-900">{t.clientName || 'Comptoir Magasin'}</p>
                        {t.clientPhone && <p className="text-[11px] text-neutral-400 font-mono">{t.clientPhone}</p>}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-neutral-700 line-clamp-1 max-w-[240px]">
                          {t.itemsSummary}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {t.deliveryDriverName ? (
                          <div className="flex items-center gap-1.5 text-neutral-700">
                            <Bike className="w-3.5 h-3.5 text-neutral-400" />
                            <span className="font-semibold">{t.deliveryDriverName}</span>
                          </div>
                        ) : (
                          <span className="text-neutral-500">{t.sellerName || 'Comptable'}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getPaymentBadge(t.paymentMethod)}
                      </td>
                      <td className={`py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap tabular-nums ${isExpense ? 'text-rose-600' : 'text-neutral-900'}`}>
                        {isExpense ? `- ${t.amount.toLocaleString('fr-FR')} F` : `+ ${t.amount.toLocaleString('fr-FR')} F`}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {t.invoiceNumber ? (
                          <button
                            onClick={() => onViewInvoiceByNumber(t.invoiceNumber!)}
                            className="px-2.5 py-1 rounded-lg border border-neutral-200 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3 h-3 text-neutral-400" />
                            <span>Facture PDF</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-neutral-400 font-mono">Reçu Dépense</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Enregistrer une Dépense */}
      <NewExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />
    </div>
  );
};
