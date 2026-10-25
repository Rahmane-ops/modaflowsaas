import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order, Transaction, BoutiqueTenant, UserAccount, CashRegisterClosing } from '../types';

/**
 * Format currency in FCFA
 */
export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('fr-FR')} FCFA`;
};

/**
 * Helper to get clean payment method label
 */
export const getPaymentLabel = (method: string): string => {
  switch (method) {
    case 'wave':
      return 'Wave Mobile Money';
    case 'orange_money':
      return 'Orange Money';
    case 'cash':
      return 'Espèces (Cash)';
    default:
      return method;
  }
};

/**
 * Generates an official Client Invoice PDF document
 */
export const generateInvoicePDFDoc = (
  order: Order,
  boutique: BoutiqueTenant
): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [15, 23, 42]; // Slate 900
  const accentColor = [37, 99, 235]; // Electric Blue 600
  const secondaryColor = [100, 116, 139]; // Slate 500
  const lightBg = [248, 250, 252]; // Slate 50

  // 1. Header background banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 28, 'F');

  // Brand Name & Logo Badge
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, 6, 16, 16, 3, 3, 'F');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('M', 19.5, 17.5);

  // Boutique Info in Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text((boutique.name || 'MODAFLOW BOUTIQUE').toUpperCase(), 35, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text(
    `${boutique.city || 'Dakar'} · ${boutique.country || 'Sénégal'} · Tél : ${boutique.phone || '+221 77 000 00 00'}`,
    35,
    19
  );

  // Invoice Title on Right Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('FACTURE CLIENT', 196, 12, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text(`N° ${order.invoiceNumber}`, 196, 18, { align: 'right' });

  // 2. Invoice Metadata & Customer Info Cards
  let y = 36;

  // Box Left: Facturé à (Client)
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 88, 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('FACTURÉ À :', 18, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(order.clientName || 'Client Comptoir', 18, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Tél : ${order.clientPhone || 'Non renseigné'}`, 18, y + 19);

  if (order.isDelivery && order.deliveryAddress) {
    doc.text(`Livraison : ${order.deliveryAddress}`, 18, y + 25, { maxWidth: 80 });
  } else {
    doc.text('Mode : Retrait direct en boutique', 18, y + 25);
  }

  // Box Right: Détails de la facture
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(108, y, 88, 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('DÉTAILS COMMANDE :', 112, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);

  doc.text(`Date & Heure : ${order.createdAt}`, 112, y + 13);
  doc.text(`Vendeur : ${order.createdBySellerName || 'Boutique'}`, 112, y + 19);
  doc.text(`Règlement : ${getPaymentLabel(order.paymentMethod)}`, 112, y + 25);

  const isPaid = order.status === 'livre_paye';
  doc.setFont('helvetica', 'bold');
  if (isPaid) {
    doc.setTextColor(16, 185, 129); // Emerald 600
    doc.text('STATUT : PAYÉ & SOLDÉ', 112, y + 31);
  } else {
    doc.setTextColor(217, 119, 6); // Amber 600
    doc.text('STATUT : EN COURS (À RÉGLER)', 112, y + 31);
  }

  // 3. Articles Table with autoTable
  y = 80;

  const tableData = order.items.map((item, index) => [
    (index + 1).toString(),
    `${item.clothingName} (${item.category || 'Mode'})`,
    item.size || 'Unique',
    item.quantity.toString(),
    `${item.unitPrice.toLocaleString('fr-FR')} F`,
    `${item.subtotal.toLocaleString('fr-FR')} F`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['#', 'Article', 'Taille', 'Qté', 'Prix Unit.', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 28, halign: 'right' },
      5: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
    },
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: 3,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  // Position after table
  const finalY = (doc as any).lastAutoTable?.finalY || y + 50;

  // Returns / Exchange adjustments if any
  let currentY = finalY + 6;
  if (order.returnsHistory && order.returnsHistory.length > 0) {
    doc.setFillColor(254, 243, 199); // Amber 100
    doc.setDrawColor(251, 191, 36);
    doc.roundedRect(14, currentY, 182, 16, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(146, 64, 14);
    doc.text('MODIFICATION / ARTICLES RETOURNÉS :', 18, currentY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    const returnsSummary = order.returnsHistory
      .map(
        (r) =>
          `• ${r.quantity}x ${r.clothingName} (${r.size}) - Motif: ${r.reason} [-${(
            r.refundAmount || 0
          ).toLocaleString('fr-FR')} F]`
      )
      .join(' | ');
    doc.text(returnsSummary, 18, currentY + 10, { maxWidth: 174 });

    currentY += 20;
  }

  // 4. Totals Block & Signoff
  const totalsY = currentY + 4;

  // Left note
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Les articles portés ou retouchés ne sont ni repris ni échangés.', 14, totalsY + 6);
  doc.text('Facture établie avec ModaFlow Caisse & Gestion.', 14, totalsY + 11);

  if (order.notes) {
    doc.setFont('helvetica', 'normal');
    doc.text(`Note : ${order.notes}`, 14, totalsY + 17, { maxWidth: 100 });
  }

  // Right Totals Box
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(120, totalsY, 76, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Total Articles :', 124, totalsY + 7);
  doc.text(`${order.totalAmount.toLocaleString('fr-FR')} F`, 192, totalsY + 7, { align: 'right' });

  doc.text('Livraison :', 124, totalsY + 13);
  doc.text(order.isDelivery ? 'Offert' : '0 F', 192, totalsY + 13, { align: 'right' });

  doc.setDrawColor(203, 213, 225);
  doc.line(124, totalsY + 16, 192, totalsY + 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('TOTAL NET :', 124, totalsY + 23);

  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text(`${order.totalAmount.toLocaleString('fr-FR')} FCFA`, 192, totalsY + 23, {
    align: 'right',
  });

  // 5. Professional Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 275, 196, 275);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Merci de votre aimable confiance !', 105, 280, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(
    `${boutique.name} · Caisse Tactile & Reçus Dématérialisés Wave / Orange Money`,
    105,
    284,
    { align: 'center' }
  );

  return doc;
};

/**
 * Downloads the client invoice directly as a PDF file
 */
export const downloadInvoicePDF = (
  order: Order,
  boutique: BoutiqueTenant
): string => {
  const doc = generateInvoicePDFDoc(order, boutique);
  const fileName = `Facture_${order.invoiceNumber}_${order.clientName.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
  return fileName;
};

/**
 * Triggers native browser print dialog with the rendered A4 invoice PDF.
 * Uses an autoPrint blob in a hidden frame with automatic fallback.
 */
export const printInvoicePDF = (
  order: Order,
  boutique: BoutiqueTenant
): boolean => {
  try {
    const doc = generateInvoicePDFDoc(order, boutique);
    doc.autoPrint();
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.src = blobUrl;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        window.print();
      }
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(blobUrl);
        } catch {}
      }, 60000);
    };
    return true;
  } catch (err) {
    console.warn('Printing fallback:', err);
    window.print();
    return true;
  }
};

/**
 * Generates an 80mm thermal receipt PDF (Ticket de caisse pour imprimante thermique de comptoir)
 */
export const generateTicketDeCaissePDFDoc = (
  order: Order,
  boutique: BoutiqueTenant
): jsPDF => {
  const itemsCount = order.items.length;
  const estimatedHeight = Math.max(160, 110 + itemsCount * 14);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, estimatedHeight],
  });

  const primaryColor = [15, 23, 42]; // Slate 900
  let y = 8;

  // Header Logo & Boutique Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text((boutique.name || 'MODAFLOW').toUpperCase(), 40, y, { align: 'center' });
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`${boutique.city || 'Dakar'} · ${boutique.country || 'Sénégal'}`, 40, y, { align: 'center' });
  y += 4;
  doc.text(`Tél : ${boutique.phone || ''}`, 40, y, { align: 'center' });
  y += 5;

  // Separator
  doc.setDrawColor(203, 213, 225);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(6, y, 74, y);
  y += 5;

  // Ticket Meta
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`TICKET FACTURE : ${order.invoiceNumber}`, 6, y);
  y += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Date : ${order.createdAt}`, 6, y);
  y += 4;
  doc.text(`Cliente : ${order.clientName} (${order.clientPhone})`, 6, y);
  y += 4;
  doc.text(`Vendeur : ${order.createdBySellerName || 'Boutique'}`, 6, y);
  if (order.deliveryDriverName) {
    y += 4;
    doc.text(`Livreur : ${order.deliveryDriverName}`, 6, y);
  }
  y += 5;

  // Separator
  doc.line(6, y, 74, y);
  y += 5;

  // Table items Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('ARTICLE', 6, y);
  doc.text('QTÉ', 48, y, { align: 'center' });
  doc.text('TOTAL', 74, y, { align: 'right' });
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  order.items.forEach((item) => {
    const name = item.clothingName.length > 20 ? item.clothingName.substring(0, 18) + '..' : item.clothingName;
    doc.text(`${name} (${item.size})`, 6, y);
    doc.text(`${item.quantity}x`, 48, y, { align: 'center' });
    doc.text(`${item.subtotal.toLocaleString('fr-FR')} F`, 74, y, { align: 'right' });
    y += 4.5;
  });

  // Separator
  y += 1;
  doc.line(6, y, 74, y);
  y += 5;

  // Totals
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Sous-total brut :', 6, y);
  doc.text(`${(order.subtotalAmount || order.totalAmount).toLocaleString('fr-FR')} F`, 74, y, { align: 'right' });
  y += 4.5;

  if (order.discount && order.discount.amount > 0) {
    doc.text(`Remise (${order.discount.reason}) :`, 6, y);
    doc.text(`-${order.discount.amount.toLocaleString('fr-FR')} F`, 74, y, { align: 'right' });
    y += 4.5;
  }

  doc.text('Frais livraison :', 6, y);
  doc.text(order.isDelivery ? 'Offert' : '0 F', 74, y, { align: 'right' });
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL NET :', 6, y);
  doc.text(`${order.totalAmount.toLocaleString('fr-FR')} FCFA`, 74, y, { align: 'right' });
  y += 6;

  // Status
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  const isPaid = order.status === 'livre_paye';
  doc.setTextColor(isPaid ? 16 : 217, isPaid ? 185 : 119, isPaid ? 129 : 6);
  doc.text(
    isPaid ? 'RÈGLEMENT : PAYÉ & SOLDÉ' : 'COMMANDE EN COURS (À RÉGLER)',
    40,
    y,
    { align: 'center' }
  );
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Mode : ${getPaymentLabel(order.paymentMethod)}`, 40, y, { align: 'center' });
  y += 6;

  // Footer
  doc.setLineDashPattern([], 0);
  doc.line(6, y, 74, y);
  y += 4;
  doc.setFontSize(6.5);
  doc.text('Merci de votre visite et à très bientôt !', 40, y, { align: 'center' });
  y += 3.5;
  doc.text('ModaFlow Caisse & Gestion SaaS · Reçu officiel', 40, y, { align: 'center' });

  return doc;
};

/**
 * Triggers native browser print dialog for 80mm thermal receipt
 */
export const printTicketDeCaisse = (
  order: Order,
  boutique: BoutiqueTenant
): boolean => {
  try {
    const doc = generateTicketDeCaissePDFDoc(order, boutique);
    doc.autoPrint();
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.src = blobUrl;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        window.print();
      }
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(blobUrl);
        } catch {}
      }, 60000);
    };
    return true;
  } catch {
    window.print();
    return true;
  }
};

/**
 * Downloads 80mm thermal ticket as PDF
 */
export const downloadTicketDeCaissePDF = (
  order: Order,
  boutique: BoutiqueTenant
): string => {
  const doc = generateTicketDeCaissePDFDoc(order, boutique);
  const fileName = `Ticket_${order.invoiceNumber}.pdf`;
  doc.save(fileName);
  return fileName;
};

/**
 * Shares client invoice on WhatsApp as a PDF document
 * If Web Share API with files is supported (mobile / Chrome Android / iOS), it directly shares the PDF file.
 * Otherwise, it downloads the PDF and opens WhatsApp with a pre-filled greeting message.
 */
export const shareInvoicePDFOnWhatsApp = async (
  order: Order,
  boutique: BoutiqueTenant
): Promise<{ method: 'native_share' | 'download_and_chat'; fileName: string }> => {
  const doc = generateInvoicePDFDoc(order, boutique);
  const cleanPhone = order.clientPhone.replace(/[^0-9]/g, '');
  const fileName = `Facture_${order.invoiceNumber}.pdf`;

  // 1. Prepare PDF Blob and File
  const pdfBlob = doc.output('blob');
  const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

  const shareText = 
    `Bonjour ${order.clientName}, voici votre facture officielle PDF (N° ${order.invoiceNumber}) pour vos achats chez ${boutique.name} d'un montant de ${order.totalAmount.toLocaleString('fr-FR')} FCFA. Merci pour votre confiance ! ✨`;

  // 2. Try Native Web Share API with files (Android, iOS, macOS Safari)
  if (
    typeof navigator !== 'undefined' &&
    navigator.canShare &&
    navigator.canShare({ files: [pdfFile] })
  ) {
    try {
      await navigator.share({
        files: [pdfFile],
        title: `Facture ${order.invoiceNumber} - ${boutique.name}`,
        text: shareText,
      });
      return { method: 'native_share', fileName };
    } catch (error: any) {
      // If user aborted/dismissed the share sheet, return silently or proceed to fallback
      if (error?.name === 'AbortError') {
        return { method: 'native_share', fileName };
      }
    }
  }

  // 3. Fallback: Automatically save PDF to device and open WhatsApp chat
  doc.save(fileName);

  const encodedMessage = encodeURIComponent(
    `*${boutique.name.toUpperCase()}*%0A` +
    `Bonjour *${order.clientName}*, voici votre facture pour la commande *${order.invoiceNumber}* :%0A%0A` +
    `• *Montant Total :* ${order.totalAmount.toLocaleString('fr-FR')} FCFA%0A` +
    `• *Règlement :* ${getPaymentLabel(order.paymentMethod)}%0A` +
    `• *Statut :* ${order.status === 'livre_paye' ? '✅ Payé & Soldé' : '🛵 En cours'}%0A%0A` +
    `📄 _Le document officiel au format PDF vous a été envoyé ci-joint._%0A` +
    `Merci de votre confiance ! ✨`
  );

  const whatsappUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`;

  window.open(whatsappUrl, '_blank');

  return { method: 'download_and_chat', fileName };
};

/**
 * Generates and downloads the Daily Sales Report PDF (Rapport Journalier des Ventes)
 */
export const downloadDailySalesReportPDF = (
  dateStr: string, // YYYY-MM-DD
  boutique: BoutiqueTenant,
  orders: Order[],
  transactions: Transaction[],
  currentUser: UserAccount
): string => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [15, 23, 42]; // Slate 900
  const accentColor = [37, 99, 235]; // Electric Blue 600
  const secondaryColor = [100, 116, 139]; // Slate 500

  // Filter orders and transactions for the specified day
  const dayOrders = orders.filter((o) => o.createdAt && o.createdAt.startsWith(dateStr));
  const dayTransactions = transactions.filter((t) => t.timestamp && t.timestamp.startsWith(dateStr));

  // If no transactions found by exact dateStr prefix, also check date in timestamp
  const effectiveTransactions = dayTransactions.length > 0 
    ? dayTransactions 
    : transactions.filter((t) => (t.timestamp || '').includes(dateStr));

  // Compute daily metrics
  const totalRevenue = effectiveTransactions.reduce((sum, t) => sum + t.amount, 0);
  const waveTotal = effectiveTransactions
    .filter((t) => t.paymentMethod === 'wave')
    .reduce((sum, t) => sum + t.amount, 0);
  const orangeMoneyTotal = effectiveTransactions
    .filter((t) => t.paymentMethod === 'orange_money')
    .reduce((sum, t) => sum + t.amount, 0);
  const cashTotal = effectiveTransactions
    .filter((t) => t.paymentMethod === 'cash')
    .reduce((sum, t) => sum + t.amount, 0);

  const settledCount = dayOrders.filter((o) => o.status === 'livre_paye').length;
  const inProgressCount = dayOrders.filter((o) => o.status === 'en_cours').length;

  // Format date readable
  let displayDate = dateStr;
  try {
    const d = new Date(dateStr);
    displayDate = d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    // Capitalize first letter
    displayDate = displayDate.charAt(0).toUpperCase() + displayDate.slice(1);
  } catch {}

  // 1. Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.roundedRect(14, 7, 18, 18, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('M', 20.5, 19.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('RAPPORT JOURNALIER DES VENTES', 38, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(
    `Boutique : ${(boutique.name || 'ModaFlow').toUpperCase()} (${boutique.city}) · Date : ${displayDate}`,
    38,
    21
  );

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Édité le ${new Date().toLocaleString('fr-FR')} par ${currentUser.name} (${currentUser.title || 'Gérant'})`,
    38,
    27
  );

  // 2. Summary KPI Cards
  const yKpi = 40;
  const cardWidth = 43;
  const cardHeight = 22;

  // Card 1: Chiffre d'Affaires Total
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, yKpi, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('CHIFFRE DU JOUR', 18, yKpi + 6);
  doc.setFontSize(10.5);
  doc.setTextColor(37, 99, 235);
  doc.text(`${totalRevenue.toLocaleString('fr-FR')} F`, 18, yKpi + 14);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`${dayOrders.length} commande(s)`, 18, yKpi + 19);

  // Card 2: Wave
  doc.setFillColor(240, 249, 255); // Sky 50
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(60, yKpi, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(3, 105, 161);
  doc.text('ENCAISSÉ WAVE', 64, yKpi + 6);
  doc.setFontSize(10.5);
  doc.setTextColor(2, 132, 199);
  doc.text(`${waveTotal.toLocaleString('fr-FR')} F`, 64, yKpi + 14);
  doc.setFontSize(7);
  doc.setTextColor(14, 116, 144);
  doc.text('Transferts directs', 64, yKpi + 19);

  // Card 3: Orange Money
  doc.setFillColor(255, 247, 237); // Orange 50
  doc.setDrawColor(254, 215, 170);
  doc.roundedRect(106, yKpi, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(194, 65, 12);
  doc.text('ORANGE MONEY', 110, yKpi + 6);
  doc.setFontSize(10.5);
  doc.setTextColor(234, 88, 12);
  doc.text(`${orangeMoneyTotal.toLocaleString('fr-FR')} F`, 110, yKpi + 14);
  doc.setFontSize(7);
  doc.setTextColor(194, 65, 12);
  doc.text('Paiements marchands', 110, yKpi + 19);

  // Card 4: Espèces Caisse
  doc.setFillColor(240, 253, 244); // Emerald 50
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(152, yKpi, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(21, 128, 61);
  doc.text('ESPÈCES (CASH)', 156, yKpi + 6);
  doc.setFontSize(10.5);
  doc.setTextColor(16, 185, 129);
  doc.text(`${cashTotal.toLocaleString('fr-FR')} F`, 156, yKpi + 14);
  doc.setFontSize(7);
  doc.setTextColor(21, 128, 61);
  doc.text('Fond de caisse physique', 156, yKpi + 19);

  // 3. Section Title
  let currentY = yKpi + cardHeight + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('DÉTAIL DES TRANSACTIONS & ENCAISSEMENTS DU JOUR', 14, currentY);

  currentY += 4;

  // 4. Transactions / Sales Table
  const tableRows = (effectiveTransactions.length > 0 ? effectiveTransactions : transactions.slice(0, 15)).map(
    (t, idx) => [
      (idx + 1).toString(),
      (t.timestamp || '').substring(11, 16) || '—',
      t.invoiceNumber || '—',
      t.clientName || 'Client Comptoir',
      getPaymentLabel(t.paymentMethod),
      (t.itemsSummary || 'Vente vêtement').substring(0, 45),
      `${t.amount >= 0 ? '+' : ''}${t.amount.toLocaleString('fr-FR')} F`,
    ]
  );

  autoTable(doc, {
    startY: currentY,
    head: [['#', 'Heure', 'Facture', 'Client', 'Paiement', 'Articles', 'Montant']],
    body: tableRows.length > 0 ? tableRows : [['-', '-', 'Aucune vente enregistrée', '-', '-', '-', '0 F']],
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 14, halign: 'center' },
      2: { cellWidth: 26, fontStyle: 'bold' },
      3: { cellWidth: 35 },
      4: { cellWidth: 28 },
      5: { cellWidth: 'auto' },
      6: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
    },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  const finalTableY = (doc as any).lastAutoTable?.finalY || currentY + 70;

  // 5. Signature & Validation Block
  let signY = Math.min(finalTableY + 12, 245);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, signY, 88, 24, 2, 2, 'FD');
  doc.roundedRect(108, signY, 88, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('CERTIFICATION DE CLÔTURE DE CAISSE', 18, signY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`Commandes soldées : ${settledCount} · En attente : ${inProgressCount}`, 18, signY + 12);
  doc.text('Trésorerie arrêtée et conforme au grand livre.', 18, signY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('VISA DU GÉRANT / CAISSIER', 112, signY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`Responsable : ${currentUser.name}`, 112, signY + 12);
  doc.text('Signature & Cachet :', 112, signY + 18);

  // Footer Line
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 280, 196, 280);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(
    `ModaFlow SaaS Cloud · Rapport Journalier automatisé · ${boutique.name} · Document officiel de gestion`,
    105,
    285,
    { align: 'center' }
  );

  const fileName = `Rapport_Ventes_${boutique.name.replace(/\s+/g, '_')}_${dateStr}.pdf`;
  doc.save(fileName);
  return fileName;
};

/**
 * Generates an official Monthly Administrative & Accounting Report PDF doc
 */
export const generateMonthlyAccountingReportPDFDoc = (
  period: { start: string; end: string; label: string },
  boutique: BoutiqueTenant,
  orders: Order[],
  transactions: Transaction[],
  currentUser: UserAccount
): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [15, 23, 42]; // Slate 900
  const accentColor = [37, 99, 235]; // Electric Blue 600
  const secondaryColor = [100, 116, 139]; // Slate 500
  const lightBg = [248, 250, 252]; // Slate 50

  // Filter orders and transactions within the period
  const periodOrders = orders.filter((o) => {
    const d = o.createdAt.substring(0, 10);
    return d >= period.start && d <= period.end;
  });

  const periodTransactions = transactions.filter((t) => {
    const d = (t.timestamp || '').substring(0, 10);
    return d >= period.start && d <= period.end;
  });

  // Calculate metrics
  const totalRevenue = periodTransactions.reduce((sum, t) => sum + t.amount, 0);
  const waveTotal = periodTransactions
    .filter((t) => t.paymentMethod === 'wave')
    .reduce((sum, t) => sum + t.amount, 0);
  const orangeMoneyTotal = periodTransactions
    .filter((t) => t.paymentMethod === 'orange_money')
    .reduce((sum, t) => sum + t.amount, 0);
  const cashTotal = periodTransactions
    .filter((t) => t.paymentMethod === 'cash')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOrders = periodOrders.length;
  const settledOrders = periodOrders.filter((o) => o.status === 'livre_paye').length;
  const inProgressOrders = periodOrders.filter((o) => o.status === 'en_cours').length;
  const deliveryOrders = periodOrders.filter((o) => o.isDelivery).length;
  const storePickupOrders = totalOrders - deliveryOrders;

  const totalItemsSold = periodOrders.reduce(
    (sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0),
    0
  );
  const averageBasket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // 1. Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 34, 'F');

  // Brand Icon
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.roundedRect(14, 8, 18, 18, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('M', 20.5, 20.5);

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('RAPPORT ADMINISTRATIF & COMPTABLE MENSUEL', 38, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(
    `Boutique : ${(boutique.name || 'ModaFlow').toUpperCase()} (${boutique.city}) · Période : ${period.label}`,
    38,
    22
  );

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Édité le ${new Date().toLocaleString('fr-FR')} par ${currentUser.name} (${currentUser.title || 'Direction'}) · Réf : RAP-ADM-${period.start.replace(/-/g, '').substring(0, 6)}`,
    38,
    28
  );

  // 2. Executive KPI Cards (Row 1)
  const yKpi = 42;
  const cardWidth = 43;
  const cardHeight = 22;

  // KPI 1: Chiffre d'Affaires
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, yKpi, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text("RECETTES TOTALES", 18, yKpi + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text(`${totalRevenue.toLocaleString('fr-FR')} F`, 18, yKpi + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`${periodTransactions.length} transaction(s)`, 18, yKpi + 19);

  // KPI 2: Commandes
  doc.roundedRect(14 + cardWidth + 3, yKpi, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text("COMMANDES", 14 + cardWidth + 7, yKpi + 6);
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`${totalOrders} Ventes`, 14 + cardWidth + 7, yKpi + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`${settledOrders} soldées · ${inProgressOrders} en cours`, 14 + cardWidth + 7, yKpi + 19);

  // KPI 3: Panier Moyen
  doc.roundedRect(14 + (cardWidth + 3) * 2, yKpi, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text("PANIER MOYEN", 14 + (cardWidth + 3) * 2 + 4, yKpi + 6);
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`${averageBasket.toLocaleString('fr-FR')} F`, 14 + (cardWidth + 3) * 2 + 4, yKpi + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`Moyenne par vente`, 14 + (cardWidth + 3) * 2 + 4, yKpi + 19);

  // KPI 4: Volume Articles
  doc.roundedRect(14 + (cardWidth + 3) * 3, yKpi, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text("ARTICLES VENDUS", 14 + (cardWidth + 3) * 3 + 4, yKpi + 6);
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`${totalItemsSold} Pièces`, 14 + (cardWidth + 3) * 3 + 4, yKpi + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`${deliveryOrders} livr. · ${storePickupOrders} boutique`, 14 + (cardWidth + 3) * 3 + 4, yKpi + 19);

  // 3. Section Trésorerie & Moyens de Paiement
  const yTreasury = 70;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('1. VENTILATION DE LA TRÉSORERIE PAR COMPTE', 14, yTreasury);

  const tCardWidth = 58;
  const tCardHeight = 20;

  // Wave
  doc.setFillColor(240, 249, 255); // light sky
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(14, yTreasury + 4, tCardWidth, tCardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(3, 105, 161);
  doc.text('Compte Wave Mobile Money', 18, yTreasury + 10);
  doc.setFontSize(11);
  doc.text(`${waveTotal.toLocaleString('fr-FR')} FCFA`, 18, yTreasury + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(14, 116, 144);
  const wavePct = totalRevenue > 0 ? ((waveTotal / totalRevenue) * 100).toFixed(1) : '0';
  doc.text(`${wavePct}% du CA total`, 52, yTreasury + 18);

  // Orange Money
  doc.setFillColor(255, 247, 237); // light orange
  doc.setDrawColor(254, 215, 170);
  doc.roundedRect(14 + tCardWidth + 4, yTreasury + 4, tCardWidth, tCardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(194, 65, 12);
  doc.text('Compte Orange Money', 14 + tCardWidth + 8, yTreasury + 10);
  doc.setFontSize(11);
  doc.text(`${orangeMoneyTotal.toLocaleString('fr-FR')} FCFA`, 14 + tCardWidth + 8, yTreasury + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(194, 65, 12);
  const omPct = totalRevenue > 0 ? ((orangeMoneyTotal / totalRevenue) * 100).toFixed(1) : '0';
  doc.text(`${omPct}% du CA total`, 14 + tCardWidth + 42, yTreasury + 18);

  // Espèces
  doc.setFillColor(240, 253, 244); // light green
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(14 + (tCardWidth + 4) * 2, yTreasury + 4, tCardWidth, tCardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(21, 128, 61);
  doc.text('Caisse Espèces (Cash)', 14 + (tCardWidth + 4) * 2 + 4, yTreasury + 10);
  doc.setFontSize(11);
  doc.text(`${cashTotal.toLocaleString('fr-FR')} FCFA`, 14 + (tCardWidth + 4) * 2 + 4, yTreasury + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(21, 128, 61);
  const cashPct = totalRevenue > 0 ? ((cashTotal / totalRevenue) * 100).toFixed(1) : '0';
  doc.text(`${cashPct}% du CA total`, 14 + (tCardWidth + 4) * 2 + 38, yTreasury + 18);

  // 4. Section Journal des Opérations / Factures
  const yTable = 100;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('2. JOURNAL DÉTAILLÉ DES VENTES & ENCAISSEMENTS', 14, yTable);

  const tableData: string[][] = periodTransactions.map((t) => [
    t.timestamp ? t.timestamp.substring(0, 16) : '-',
    t.invoiceNumber || '-',
    t.clientName || 'Client passage',
    getPaymentLabel(t.paymentMethod),
    (t.itemsSummary || '').length > 40 ? (t.itemsSummary || '').substring(0, 38) + '...' : (t.itemsSummary || '-'),
    `${t.amount.toLocaleString('fr-FR')} F`,
  ]);

  if (tableData.length === 0) {
    // If no transactions, list orders
    periodOrders.forEach((o) => {
      const summary = o.items.map((i) => `${i.clothingName} (${i.size})`).join(', ');
      tableData.push([
        o.createdAt.substring(0, 16),
        o.invoiceNumber || '-',
        o.clientName || 'Client',
        getPaymentLabel(o.paymentMethod),
        summary.length > 40 ? summary.substring(0, 38) + '...' : (summary || '-'),
        `${o.totalAmount.toLocaleString('fr-FR')} F`,
      ]);
    });
  }

  autoTable(doc, {
    startY: yTable + 4,
    head: [['Date/Heure', 'N° Facture', 'Cliente', 'Règlement', 'Articles Vêtement', 'Montant Net']],
    body: tableData.length > 0 ? tableData : [['-', '-', 'Aucune opération enregistrée sur cette période', '-', '-', '0 F']],
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 25, fontStyle: 'bold' },
      2: { cellWidth: 35 },
      3: { cellWidth: 32 },
      4: { cellWidth: 42 },
      5: { cellWidth: 20, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Add running footer on every page
      const pageNum = doc.getNumberOfPages();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(
        `ModaFlow Cloud · ${boutique.name} · Rapport Mensuel Administrateur & Comptable · Page ${pageNum}`,
        105,
        290,
        { align: 'center' }
      );
    },
  });

  // 5. Certification & Closing Box
  // We place this at the end of the table
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 8 : 220;
  
  // If near the bottom of the page, add a new page for closing certification
  let certY = finalY;
  if (certY > 240) {
    doc.addPage();
    certY = 20;
  }

  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, certY, 182, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('ATTESTATION & VISA DE CLÔTURE COMPTABLE', 18, certY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(
    `Le présent document récapitule sincèrement l'ensemble des encaissements et ventes réalisés par ${boutique.name}`,
    18,
    certY + 11
  );
  doc.text(
    `Total des écritures : ${totalRevenue.toLocaleString('fr-FR')} FCFA · ${settledOrders} commandes soldées régularisées.`,
    18,
    certY + 16
  );
  doc.text(
    `Arrêté et certifié conforme à la clôture de la période ${period.label}.`,
    18,
    certY + 21
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('POUR L\'ADMINISTRATION / EXPERT COMPTABLE', 112, certY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`Responsable : ${currentUser.name} (${currentUser.title || 'Gérant'})`, 112, certY + 11);
  doc.text('Signature & Cachet Officiel :', 112, certY + 16);

  return doc;
};

/**
 * Downloads the Monthly Accounting Report PDF
 */
export const downloadMonthlyAccountingReportPDF = (
  period: { start: string; end: string; label: string },
  boutique: BoutiqueTenant,
  orders: Order[],
  transactions: Transaction[],
  currentUser: UserAccount
): string => {
  const doc = generateMonthlyAccountingReportPDFDoc(
    period,
    boutique,
    orders,
    transactions,
    currentUser
  );
  const cleanPeriod = period.label.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Bilan_Comptable_${boutique.name.replace(/\s+/g, '_')}_${cleanPeriod}.pdf`;
  doc.save(fileName);
  return fileName;
};

/**
 * Shares the Monthly Accounting Report PDF via WhatsApp
 */
export const shareMonthlyAccountingReportPDFOnWhatsApp = async (
  period: { start: string; end: string; label: string },
  boutique: BoutiqueTenant,
  orders: Order[],
  transactions: Transaction[],
  currentUser: UserAccount
): Promise<{ success: boolean; method: string }> => {
  const doc = generateMonthlyAccountingReportPDFDoc(
    period,
    boutique,
    orders,
    transactions,
    currentUser
  );

  const cleanPeriod = period.label.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Bilan_Comptable_${boutique.name.replace(/\s+/g, '_')}_${cleanPeriod}.pdf`;
  const pdfBlob = doc.output('blob');
  const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

  // Calculate quick summary metrics for text message
  const periodTransactions = transactions.filter((t) => {
    const d = (t.timestamp || '').substring(0, 10);
    return d >= period.start && d <= period.end;
  });
  const totalRevenue = periodTransactions.reduce((sum, t) => sum + t.amount, 0);

  const messageText = 
    `📊 *BILAN COMPTABLE & RAPPORT MENSUEL - ${boutique.name.toUpperCase()}*\n` +
    `🗓️ Période : ${period.label}\n` +
    `💰 Chiffre d'Affaires Net : *${totalRevenue.toLocaleString('fr-FR')} FCFA*\n` +
    `📑 Nombre de transactions : ${periodTransactions.length}\n` +
    `👤 Édité par : ${currentUser.name}\n` +
    `\n_Veuillez trouver ci-joint le document PDF officiel certifié._`;

  if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
    try {
      await navigator.share({
        title: `Bilan Comptable - ${boutique.name}`,
        text: messageText,
        files: [pdfFile],
      });
      return { success: true, method: 'native_share' };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: false, method: 'cancelled' };
      }
    }
  }

  // Fallback: download file and open WhatsApp
  doc.save(fileName);
  const waUrl = `https://wa.me/?text=${encodeURIComponent(messageText)}`;
  window.open(waUrl, '_blank');
  return { success: true, method: 'download_and_whatsapp' };
};

/**
 * Generates and downloads the Official Ticket Z (Cash Register Closing) PDF
 */
export const downloadCashRegisterClosingPDF = (
  closing: CashRegisterClosing,
  boutique: BoutiqueTenant
): string => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 220], // Standard 80mm thermal receipt format
  });

  const primaryColor = [15, 23, 42]; // Slate 900
  const grayText = [100, 116, 139]; // Slate 500

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(boutique.name.toUpperCase(), 40, 10, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.text(`${boutique.city || ''} · ${boutique.country || ''}`, 40, 15, { align: 'center' });
  doc.text(`Tél : ${boutique.phone || 'N/A'}`, 40, 19, { align: 'center' });

  // Divider
  doc.setDrawColor(203, 213, 225);
  doc.line(5, 23, 75, 23);

  // Title: TICKET Z DE CLÔTURE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('TICKET Z - CLÔTURE DE CAISSE', 40, 29, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.text(`N° : ${closing.closingNumber}`, 40, 34, { align: 'center' });
  doc.text(`Date : ${closing.date} | Clôturé à : ${closing.closedAt || 'Heure fin de journée'}`, 40, 38, { align: 'center' });
  doc.text(`Caissier : ${closing.closedByUserName} (${closing.closedByUserRole})`, 40, 42, { align: 'center' });

  // Divider
  doc.line(5, 45, 75, 45);

  let y = 52;
  const drawRow = (label: string, val: string, isBold: boolean = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(8);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(label, 6, y);
    doc.text(val, 74, y, { align: 'right' });
    y += 5;
  };

  // Section Théorique
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('1. SITUATION THÉORIQUE DU SYSTÈME', 6, y);
  y += 6;

  if (closing.openingCashFund !== undefined) {
    drawRow('Fond de caisse initial :', `${closing.openingCashFund.toLocaleString('fr-FR')} FCFA`);
  }
  drawRow('Commandes enregistrées :', `${closing.ordersCount}`);
  drawRow('Ventes Espèces théoriques :', `${closing.theoreticalCash.toLocaleString('fr-FR')} FCFA`);
  drawRow('Ventes Wave théoriques :', `${closing.theoreticalWave.toLocaleString('fr-FR')} FCFA`);
  drawRow('Ventes Orange Money :', `${closing.theoreticalOrangeMoney.toLocaleString('fr-FR')} FCFA`);
  drawRow('TOTAL RECETTES THÉORIQUES :', `${closing.theoreticalTotalRevenue.toLocaleString('fr-FR')} FCFA`, true);

  y += 2;
  doc.line(5, y, 75, y);
  y += 6;

  // Section Billetage & Comptage Physique
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('2. BILLETAGE ESPÈCES COMPTÉ', 6, y);
  y += 6;

  const b = closing.countedCash;
  if (b) {
    if (b.b10000 > 0) drawRow(`10 000 FCFA x ${b.b10000} :`, `${(b.b10000 * 10000).toLocaleString('fr-FR')} F`);
    if (b.b5000 > 0) drawRow(`5 000 FCFA x ${b.b5000} :`, `${(b.b5000 * 5000).toLocaleString('fr-FR')} F`);
    if (b.b2000 > 0) drawRow(`2 000 FCFA x ${b.b2000} :`, `${(b.b2000 * 2000).toLocaleString('fr-FR')} F`);
    if (b.b1000 > 0) drawRow(`1 000 FCFA x ${b.b1000} :`, `${(b.b1000 * 1000).toLocaleString('fr-FR')} F`);
    if (b.b500 > 0) drawRow(`500 FCFA x ${b.b500} :`, `${(b.b500 * 500).toLocaleString('fr-FR')} F`);
    if (b.coinsTotal > 0) drawRow('Total Pièces :', `${b.coinsTotal.toLocaleString('fr-FR')} F`);
  }

  drawRow('TOTAL ESPÈCES PHYSIQUE :', `${closing.actualCashTotal.toLocaleString('fr-FR')} FCFA`, true);

  y += 2;
  doc.line(5, y, 75, y);
  y += 6;

  // Section Rapprochement & Écart
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('3. RAPPROCHEMENT & CONTRÔLE', 6, y);
  y += 6;

  drawRow('Wave vérifié sur terminal :', closing.waveConfirmed ? 'OUI (Vérifié)' : 'NON');
  drawRow('Orange Money vérifié :', closing.orangeMoneyConfirmed ? 'OUI (Vérifié)' : 'NON');

  const diffLabel = 
    closing.status === 'equilibre' 
      ? '0 FCFA (Équilibré)' 
      : closing.status === 'excedent' 
      ? `+${Math.abs(closing.cashDifference).toLocaleString('fr-FR')} F (Excédent)` 
      : `-${Math.abs(closing.cashDifference).toLocaleString('fr-FR')} F (Manquant)`;

  drawRow('ÉCART DE CAISSE :', diffLabel, true);

  if (closing.notes) {
    y += 2;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.text(`Notes : ${closing.notes}`, 6, y);
    y += 5;
  }

  y += 6;
  doc.setDrawColor(203, 213, 225);
  doc.line(5, y, 75, y);
  y += 8;

  // Signatures
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Signature Caissier :', 6, y);
  doc.text('Visa Responsable :', 48, y);
  y += 15;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.text('Document officiel certifié ModaFlow SaaS', 40, y, { align: 'center' });

  const fileName = `Ticket_Z_${closing.closingNumber}_${closing.date}.pdf`;
  doc.save(fileName);
  return fileName;
};

