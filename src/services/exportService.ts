import { Order, Transaction, BoutiqueTenant } from '../types';

/**
 * Clean strings for CSV formatting (handles quotes, semicolons, line breaks)
 */
const escapeCSV = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) return '""';
  const str = String(value).replace(/"/g, '""').replace(/\r?\n/g, ' ');
  return `"${str}"`;
};

/**
 * Triggers a download of CSV content with UTF-8 BOM for full Microsoft Excel compatibility
 */
export const downloadCSVFile = (content: string, filename: string): void => {
  // UTF-8 BOM ensures accents (é, è, à, etc.) render properly in Excel
  const bom = '\uFEFF';
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Exports Sales Orders to detailed CSV
 */
export const exportSalesOrdersToCSV = (
  orders: Order[],
  periodLabel: string,
  boutiqueName: string = 'ModaFlow'
): string => {
  const headers = [
    'N° Facture',
    'Date & Heure',
    'Nom Cliente',
    'Téléphone Cliente',
    'Mode Réception',
    'Adresse Livraison',
    'Livreur',
    'Statut Commande',
    'Mode Paiement',
    'Statut Paiement',
    'Nombre Articles',
    'Détail Articles',
    'Total Net (FCFA)',
    'Vendeur',
    'Notes / Historique',
  ];

  const rows = orders.map((o) => {
    const itemsCount = o.items.reduce((sum, item) => sum + item.quantity, 0);
    const itemsDetail = o.items
      .map((item) => `${item.clothingName} [Taille: ${item.size}] x${item.quantity} (${item.unitPrice.toLocaleString('fr-FR')} FCFA)`)
      .join(' | ');

    const receptionMode = o.isDelivery ? 'Livraison à domicile' : 'Retrait boutique';
    const paymentLabel = 
      o.paymentMethod === 'wave' ? 'Wave Mobile Money' :
      o.paymentMethod === 'orange_money' ? 'Orange Money' : 'Espèces (Caisse)';
    const statusLabel = 
      o.status === 'livre_paye' ? 'Livré & Soldé' :
      o.status === 'en_cours' ? 'En cours' : 'Annulé';
    const paymentStatusLabel = o.paymentStatus === 'solde' ? 'Soldé' : 'En attente';

    return [
      escapeCSV(o.invoiceNumber),
      escapeCSV(o.createdAt),
      escapeCSV(o.clientName),
      escapeCSV(o.clientPhone),
      escapeCSV(receptionMode),
      escapeCSV(o.deliveryAddress || '-'),
      escapeCSV(o.deliveryDriverName || '-'),
      escapeCSV(statusLabel),
      escapeCSV(paymentLabel),
      escapeCSV(paymentStatusLabel),
      escapeCSV(itemsCount),
      escapeCSV(itemsDetail),
      escapeCSV(o.totalAmount),
      escapeCSV(o.createdBySellerName || '-'),
      escapeCSV(o.notes || (o.isModified ? 'Commande modifiée / retour partiel' : '')),
    ].join(';');
  });

  const csvContent = [headers.join(';'), ...rows].join('\r\n');
  const filename = `${boutiqueName.replace(/\s+/g, '_')}_Ventes_${periodLabel.replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`;
  downloadCSVFile(csvContent, filename);
  return filename;
};

/**
 * Exports Accounting Transactions Ledger to CSV (Grand Livre / Journal de Caisse)
 */
export const exportAccountingLedgerToCSV = (
  transactions: Transaction[],
  periodLabel: string,
  boutiqueName: string = 'ModaFlow'
): string => {
  const headers = [
    'Réf Transaction',
    'Date & Heure',
    'N° Facture Liée',
    'Compte Financier',
    'Type Opération',
    'Nom Cliente / Tiers',
    'Téléphone Cliente',
    'Encaisseur / Livreur',
    'Montant Débit (FCFA)',
    'Montant Crédit (FCFA)',
    'Détail Articles Vendus',
    'Vendeur Responsable',
  ];

  const rows = transactions.map((t) => {
    let compteLabel = '521 - Caisse Espèces';
    if (t.paymentMethod === 'wave') {
      compteLabel = '5141 - Mobile Money Wave';
    } else if (t.paymentMethod === 'orange_money') {
      compteLabel = '5142 - Mobile Money Orange Money';
    }

    const typeOp = t.type === 'remboursement' ? 'Remboursement client' : 'Encaissement vente comptant';
    const debit = t.type === 'remboursement' ? 0 : t.amount;
    const credit = t.type === 'remboursement' ? t.amount : 0;

    return [
      escapeCSV(t.id),
      escapeCSV(t.timestamp),
      escapeCSV(t.invoiceNumber),
      escapeCSV(compteLabel),
      escapeCSV(typeOp),
      escapeCSV(t.clientName),
      escapeCSV(t.clientPhone),
      escapeCSV(t.deliveryDriverName || 'Comptoir Boutique'),
      escapeCSV(debit),
      escapeCSV(credit),
      escapeCSV(t.itemsSummary),
      escapeCSV(t.sellerName || '-'),
    ].join(';');
  });

  const csvContent = [headers.join(';'), ...rows].join('\r\n');
  const filename = `${boutiqueName.replace(/\s+/g, '_')}_Journal_Comptable_${periodLabel.replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`;
  downloadCSVFile(csvContent, filename);
  return filename;
};

/**
 * Exports Monthly Consolidated Summary to CSV
 */
export const exportMonthlySummaryToCSV = (
  orders: Order[],
  transactions: Transaction[],
  periodLabel: string,
  boutique: BoutiqueTenant
): string => {
  const totalCA = transactions.reduce((sum, t) => sum + t.amount, 0);
  const waveTotal = transactions.filter((t) => t.paymentMethod === 'wave').reduce((sum, t) => sum + t.amount, 0);
  const omTotal = transactions.filter((t) => t.paymentMethod === 'orange_money').reduce((sum, t) => sum + t.amount, 0);
  const cashTotal = transactions.filter((t) => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.amount, 0);

  const lines = [
    `RAPPORT MENSUEL DE GESTION & COMPTABILITE;${boutique.name};Période : ${periodLabel}`,
    `Date d'édition;${new Date().toLocaleString('fr-FR')}`,
    '',
    'INDICATEUR FINANCIER;VALEUR (FCFA);% DU TOTAL',
    `Chiffre d'Affaires Total;${totalCA};100%`,
    `Total Encaissé Wave;${waveTotal};${totalCA > 0 ? ((waveTotal / totalCA) * 100).toFixed(1) : 0}%`,
    `Total Encaissé Orange Money;${omTotal};${totalCA > 0 ? ((omTotal / totalCA) * 100).toFixed(1) : 0}%`,
    `Total Encaissé Espèces;${cashTotal};${totalCA > 0 ? ((cashTotal / totalCA) * 100).toFixed(1) : 0}%`,
    '',
    'VOLUMÉTRIE ACTIVITÉ;NOMBRE',
    `Nombre Total Commandes;${orders.length}`,
    `Commandes Soldées & Livrées;${orders.filter((o) => o.status === 'livre_paye').length}`,
    `Commandes En cours;${orders.filter((o) => o.status === 'en_cours').length}`,
    `Panier Moyen;${orders.length > 0 ? Math.round(totalCA / orders.length) : 0} FCFA`,
    '',
    'VENTILATION DES ENCAISSEMENTS JOURNALIERS',
    'Date;N° Facture;Cliente;Mode Paiement;Montant (FCFA)',
    ...transactions.map((t) => 
      `${escapeCSV(t.timestamp.substring(0, 10))};${escapeCSV(t.invoiceNumber)};${escapeCSV(t.clientName)};${escapeCSV(t.paymentMethod)};${t.amount}`
    ),
  ];

  const csvContent = lines.join('\r\n');
  const filename = `${boutique.name.replace(/\s+/g, '_')}_Bilan_Mensuel_${periodLabel.replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`;
  downloadCSVFile(csvContent, filename);
  return filename;
};
