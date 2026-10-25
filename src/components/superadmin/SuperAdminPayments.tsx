import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { PlatformPayment } from '../../types';
import {
  DollarSign,
  Search,
  Filter,
  FileDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  CreditCard,
  Building,
  Smartphone,
  Eye,
  Calendar,
  X
} from 'lucide-react';

export const SuperAdminPayments: React.FC = () => {
  const { platformPayments } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirme' | 'en_attente' | 'echoue' | 'rembourse'>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<PlatformPayment | null>(null);

  const formatFCFA = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
  };

  const filteredPayments = useMemo(() => {
    return platformPayments.filter((p) => {
      const matchSearch =
        p.transactionRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.boutiqueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.payerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.payerEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchMethod = methodFilter === 'all' || p.paymentMethod === methodFilter;

      return matchSearch && matchStatus && matchMethod;
    });
  }, [platformPayments, searchTerm, statusFilter, methodFilter]);

  // KPIs
  const totalConfirmed = useMemo(() => {
    return platformPayments
      .filter((p) => p.status === 'confirme')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [platformPayments]);

  const totalPending = useMemo(() => {
    return platformPayments
      .filter((p) => p.status === 'en_attente')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [platformPayments]);

  const totalFailed = useMemo(() => {
    return platformPayments
      .filter((p) => p.status === 'echoue')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [platformPayments]);

  const handleExportCSV = () => {
    const headers = [
      'Référence Transaction',
      'Boutique',
      'Payeur',
      'E-mail',
      'Montant',
      'Devise',
      'Date Paiement',
      'Moyen de Paiement',
      'Statut',
      'Formule SaaS',
      'Période',
      'Notes'
    ];

    const rows = filteredPayments.map((p) => [
      `"${p.transactionRef}"`,
      `"${p.boutiqueName.replace(/"/g, '""')}"`,
      `"${p.payerName.replace(/"/g, '""')}"`,
      `"${p.payerEmail}"`,
      p.amount,
      `"${p.currency}"`,
      `"${p.paymentDate}"`,
      `"${p.paymentMethod}"`,
      `"${p.status}"`,
      `"${p.planName}"`,
      `"${p.period}"`,
      `"${(p.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `modaflow_paiements_saas_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: PlatformPayment['status']) => {
    switch (status) {
      case 'confirme':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Encaissé
          </span>
        );
      case 'en_attente':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            En attente
          </span>
        );
      case 'rembourse':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <RotateCcw className="w-3 h-3 text-purple-600" />
            Remboursé
          </span>
        );
      case 'echoue':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Échoué
          </span>
        );
    }
  };

  const getMethodBadge = (m: PlatformPayment['paymentMethod']) => {
    switch (m) {
      case 'wave':
        return <span className="font-semibold text-blue-600">Wave Mobile</span>;
      case 'orange_money':
        return <span className="font-semibold text-orange-600">Orange Money</span>;
      case 'card':
        return <span className="font-semibold text-slate-700">Carte Visa/Mastercard</span>;
      case 'bank_transfer':
        return <span className="font-semibold text-indigo-700">Virement Bancaire</span>;
      case 'cash':
      default:
        return <span className="font-semibold text-emerald-700">Espèces / Guichet</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Paiements des Abonnements SaaS
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Historique comptable des règlements marchands, transactions vérifiées et exports officiels.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <FileDown className="w-4 h-4" />
          <span>Exporter en CSV</span>
        </button>
      </div>

      {/* KPI Cards: Confirmed vs Pending */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Réellement Encaissé</span>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {formatFCFA(totalConfirmed)}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Fonds confirmés et disponibles
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Total en Attente de Règlement</span>
          <div className="text-2xl font-bold text-amber-900 tabular-nums mt-1">
            {formatFCFA(totalPending)}
          </div>
          <span className="text-[11px] text-amber-700 font-medium mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Passerelles en cours de validation
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Transactions Échouées</span>
          <div className="text-2xl font-bold text-rose-700 tabular-nums mt-1">
            {formatFCFA(totalFailed)}
          </div>
          <span className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Rejets ou annulations
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par référence, boutique, payeur..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filtres :
          </span>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">Tous les statuts</option>
            <option value="confirme">Encaissé</option>
            <option value="en_attente">En attente</option>
            <option value="echoue">Échoué</option>
            <option value="rembourse">Remboursé</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">Tous les moyens</option>
            <option value="wave">Wave</option>
            <option value="orange_money">Orange Money</option>
            <option value="card">Carte Bancaire</option>
            <option value="bank_transfer">Virement</option>
          </select>
        </div>
      </div>

      {/* Transactions Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="px-4 py-3.5">Réf. Transaction</th>
                <th className="px-4 py-3.5">Boutique & Payeur</th>
                <th className="px-4 py-3.5">Montant</th>
                <th className="px-4 py-3.5">Moyen de Règlement</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Statut</th>
                <th className="px-4 py-3.5 text-right">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Aucune transaction trouvée pour cette période.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {p.transactionRef}
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900">{p.boutiqueName}</p>
                      <p className="text-[11px] text-slate-500">{p.payerName} ({p.payerEmail})</p>
                    </td>

                    <td className="px-4 py-3 font-bold text-slate-900 tabular-nums">
                      {formatFCFA(p.amount)}
                    </td>

                    <td className="px-4 py-3">
                      {getMethodBadge(p.paymentMethod)}
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-500 tabular-nums">
                      {p.paymentDate}
                    </td>

                    <td className="px-4 py-3">
                      {getStatusBadge(p.status)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        title="Voir le reçu détaillé"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRAWER: PAYMENT DETAILS */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 shadow-2xl border-l border-slate-200 overflow-y-auto animate-in slide-in-from-right flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Reçu de Transaction SaaS</h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 space-y-4 flex-1 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Référence :</span>
                  <span className="font-mono font-bold text-slate-900">{selectedPayment.transactionRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Boutique :</span>
                  <span className="font-semibold text-slate-900">{selectedPayment.boutiqueName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payeur :</span>
                  <span className="text-slate-900">{selectedPayment.payerName} ({selectedPayment.payerEmail})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Montant payé :</span>
                  <span className="font-bold text-slate-900">{formatFCFA(selectedPayment.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Moyen de paiement :</span>
                  {getMethodBadge(selectedPayment.paymentMethod)}
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Statut :</span>
                  {getStatusBadge(selectedPayment.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date et heure :</span>
                  <span className="font-mono text-slate-900">{selectedPayment.paymentDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Période couverte :</span>
                  <span className="font-semibold text-slate-900">{selectedPayment.period}</span>
                </div>
              </div>

              {selectedPayment.notes && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
                  <p className="font-bold mb-0.5">Notes administratives :</p>
                  <p className="text-[11px]">{selectedPayment.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedPayment(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
