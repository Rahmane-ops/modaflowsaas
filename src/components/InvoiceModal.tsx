import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Download, 
  MessageCircle,
  FileText,
  Receipt,
  Sparkles,
  Store
} from 'lucide-react';
import { 
  downloadInvoicePDF, 
  shareInvoicePDFOnWhatsApp, 
  getPaymentLabel,
  printInvoicePDF,
  printTicketDeCaisse,
  downloadTicketDeCaissePDF
} from '../services/pdfService';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

type PrintFormat = 'a4' | 'ticket';

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const { currentBoutique } = useStore();
  const [printFormat, setPrintFormat] = useState<PrintFormat>('a4');
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [shareNotice, setShareNotice] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  // Keyboard shortcut: Ctrl+P or Cmd+P to print
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handlePrint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [order, printFormat, currentBoutique]);

  // Robust validation: ensure order is a concrete Order object with items array
  if (!order || typeof order !== 'object' || typeof (order as any).then === 'function' || !Array.isArray(order.items)) {
    return null;
  }

  const handlePrint = () => {
    if (!order) return;
    setIsPrinting(true);
    try {
      if (printFormat === 'ticket') {
        printTicketDeCaisse(order, currentBoutique);
        setShareNotice({
          type: 'success',
          message: `Impression lancée pour le Ticket de Caisse (80mm) N° ${order.invoiceNumber}.`,
        });
      } else {
        printInvoicePDF(order, currentBoutique);
        setShareNotice({
          type: 'success',
          message: `Impression lancée pour la Facture A4 N° ${order.invoiceNumber}.`,
        });
      }
      setTimeout(() => setShareNotice(null), 5000);
    } catch (err) {
      // Fallback
      window.print();
    } finally {
      setTimeout(() => setIsPrinting(false), 1000);
    }
  };

  const handleDownloadPDF = () => {
    try {
      setIsDownloading(true);
      let fileName = '';
      if (printFormat === 'ticket') {
        fileName = downloadTicketDeCaissePDF(order, currentBoutique);
      } else {
        fileName = downloadInvoicePDF(order, currentBoutique);
      }
      setShareNotice({
        type: 'success',
        message: `Fichier (${fileName}) téléchargé avec succès sur votre appareil.`,
      });
      setTimeout(() => setShareNotice(null), 5000);
    } catch {
      setShareNotice({
        type: 'info',
        message: 'Impossible de générer le fichier PDF. Veuillez réessayer.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareWhatsAppPDF = async () => {
    try {
      setIsSharing(true);
      const result = await shareInvoicePDFOnWhatsApp(order, currentBoutique);

      if (result.method === 'native_share') {
        setShareNotice({
          type: 'success',
          message: 'Partage WhatsApp effectué ! Le fichier PDF officiel a été transmis.',
        });
      } else {
        setShareNotice({
          type: 'info',
          message: `Le fichier PDF (${result.fileName}) a été téléchargé et la conversation WhatsApp est ouverte avec ${order.clientName}. Vous pouvez joindre le fichier directement (📎).`,
        });
      }
      setTimeout(() => setShareNotice(null), 7000);
    } catch {
      setShareNotice({
        type: 'info',
        message: 'Erreur lors du partage. Le fichier PDF a été préparé en téléchargement.',
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-auto shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 flex flex-col max-h-[95vh]">
        
        {/* Top Control Bar */}
        <div className="px-4 sm:px-6 py-3 bg-slate-900 text-white flex flex-wrap items-center justify-between no-print gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 shrink-0 flex items-center gap-1.5">
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Facture & Reçu</span>
            </span>
            <span className="text-xs font-mono text-slate-400 truncate">
              {order.invoiceNumber}
            </span>
          </div>

          {/* Quick Format Selector Tabs */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setPrintFormat('a4')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-semibold cursor-pointer ${
                printFormat === 'a4'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Afficher et imprimer au format Facture Standard A4"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Facture A4</span>
            </button>
            <button
              onClick={() => setPrintFormat('ticket')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-semibold cursor-pointer ${
                printFormat === 'ticket'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Afficher et imprimer au format Ticket de Caisse Thermique 80mm"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Ticket 80mm</span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Primary Print Button in Header */}
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Lancer l'impression immédiate vers votre imprimante (Ctrl+P)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feedback / Notification banner */}
        {shareNotice && (
          <div className={`px-5 py-2.5 text-xs flex items-center gap-2 border-b no-print ${
            shareNotice.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-blue-50 text-blue-900 border-blue-200'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="flex-1 leading-snug">{shareNotice.message}</span>
            <button 
              onClick={() => setShareNotice(null)} 
              className="text-slate-400 hover:text-slate-700 text-xs font-bold px-1"
            >
              ×
            </button>
          </div>
        )}

        {/* Printable Area Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/60 flex justify-center">
          
          {/* FORMAT 1: STANDARD A4 SHEET */}
          {printFormat === 'a4' && (
            <div id="printable-invoice" className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-xl w-full text-slate-900">
              
              {/* Boutique Brand Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-serif font-bold text-lg shadow-xs">
                      M
                    </div>
                    <div>
                      <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-sans leading-tight">
                        {currentBoutique.name.toUpperCase()}
                      </h1>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Boutique de Mode & Prêt-à-porter
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {currentBoutique.city} · {currentBoutique.country}
                  </p>
                  <p className="text-xs text-slate-500">
                    Contact WhatsApp : <strong className="text-slate-700">{currentBoutique.phone}</strong>
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Système certifié ModaFlow Cloud SaaS · {currentBoutique.currency}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <div className="inline-block px-3 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200/60 font-mono font-bold text-xs mb-2">
                    FACTURE N° {order.invoiceNumber}
                  </div>
                  <p className="text-xs text-slate-500">
                    Date : <span className="font-semibold text-slate-800 font-mono">{order.createdAt}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    Vendeur : <span className="font-semibold text-slate-800">{order.createdBySellerName}</span>
                  </p>
                  {order.deliveryDriverName && (
                    <p className="text-xs text-slate-500">
                      Livreur : <span className="font-semibold text-slate-800">{order.deliveryDriverName}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Client & Delivery Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-slate-200">
                <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                    Facturé à (Cliente) :
                  </span>
                  <p className="text-sm font-bold text-slate-900">{order.clientName}</p>
                  <p className="text-xs text-slate-600 font-mono mt-0.5">{order.clientPhone}</p>
                </div>

                <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                    Mode de Réception :
                  </span>
                  <p className="text-xs font-semibold text-slate-800">
                    {order.isDelivery ? '🛵 Livraison à Domicile' : '🏪 Retrait direct en boutique'}
                  </p>
                  {order.isDelivery && (
                    <p className="text-xs text-slate-600 mt-0.5">
                      Adresse : {order.deliveryAddress}
                    </p>
                  )}
                </div>
              </div>

              {/* Articles Table */}
              <div className="py-5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-2.5">Article</th>
                      <th className="py-2.5 text-center">Taille</th>
                      <th className="py-2.5 text-center">Qté</th>
                      <th className="py-2.5 text-right">Prix Unitaire</th>
                      <th className="py-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {order.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-3">
                          <p className="font-bold text-slate-900">{item.clothingName}</p>
                          <p className="text-[10px] text-slate-500 uppercase">{item.category}</p>
                        </td>
                        <td className="py-3 text-center font-medium text-slate-700">
                          {item.size}
                        </td>
                        <td className="py-3 text-center font-mono font-bold text-slate-900">
                          {item.quantity}
                        </td>
                        <td className="py-3 text-right font-mono text-slate-600">
                          {item.unitPrice.toLocaleString('fr-FR')} F
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-slate-900">
                          {item.subtotal.toLocaleString('fr-FR')} F
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Returns & Exchanges Breakdown if applicable */}
              {order.returnsHistory && order.returnsHistory.length > 0 && (
                <div className="mb-4 p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 text-xs">
                  <span className="font-bold text-amber-900 uppercase text-[10px] tracking-wider block mb-1">
                    Articles Retournés / Avoirs Déduits
                  </span>
                  <div className="space-y-1">
                    {order.returnsHistory.map((ret, rIdx) => (
                      <div key={rIdx} className="flex justify-between text-amber-950">
                        <span>
                          • {ret.quantity}x {ret.clothingName} ({ret.size}) - Motif: {ret.reason} ({ret.actionType})
                        </span>
                        <span className="font-mono font-bold">
                          -{(ret.refundAmount || ret.quantity * ret.unitPrice).toLocaleString('fr-FR')} F
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Totals & Payment Status */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                
                {/* Payment badge & QR code */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 p-1.5 border border-slate-200 rounded-xl bg-white shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                      <path d="M0 0h30v30H0zm5 5h20v20H5zM10 10h10v10H10zM70 0h30v30H70zm5 5h20v20H75zM80 10h10v10H80zM0 70h30v30H0zm5 5h20v20H5zM10 80h10v10H10zM40 10h10v10H40zm10 10h10v10H50zm-10 20h10v10H40zm20 0h10v10H60zm10 10h10v10H70zm-20 20h10v10H50zm20 0h10v10H70zm10 10h10v10H80zm-40 10h10v10H40z" />
                    </svg>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider mb-1">
                      Statut du Règlement
                    </span>
                    {order.status === 'livre_paye' ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>PAYÉ & SOLDÉ DÉFINITIVEMENT</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>COMMANDE EN COURS (À ENCAISSER)</span>
                      </div>
                    )}
                    <p className="text-[11px] text-slate-500 mt-1">
                      Mode : <strong>{getPaymentLabel(order.paymentMethod)}</strong>
                    </p>
                    {order.deliveredAt && (
                      <p className="text-[10px] text-slate-400 font-mono">
                        Livré le : {order.deliveredAt}
                      </p>
                    )}
                  </div>
                </div>

                {/* Total Block */}
                <div className="w-full sm:w-64 bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Sous-total brut :</span>
                    <span className="font-mono">
                      {(order.subtotalAmount || (order.totalAmount + (order.discount?.amount || 0))).toLocaleString('fr-FR')} F
                    </span>
                  </div>
                  {order.discount && order.discount.amount > 0 && (
                    <div className="flex justify-between text-xs text-rose-600 font-medium">
                      <span className="truncate pr-1">Remise ({order.discount.reason}) :</span>
                      <span className="font-mono whitespace-nowrap">
                        -{order.discount.amount.toLocaleString('fr-FR')} F
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Frais de livraison :</span>
                    <span className="font-mono">{order.isDelivery ? 'Offerts' : '0 F'}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="text-xs font-bold uppercase text-slate-900">Total Net :</span>
                    <span className="text-base font-extrabold font-mono text-blue-600 tabular-nums">
                      {order.totalAmount.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>
              </div>

              {/* Legal footer */}
              <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400 space-y-0.5">
                <p>Les articles portés ou retouchés ne sont ni repris ni échangés au-delà de 48 heures.</p>
                <p>Document généré via ModaFlow Cloud SaaS · {currentBoutique.name} · Merci de votre fidélité !</p>
              </div>
            </div>
          )}

          {/* FORMAT 2: THERMAL RECEIPT 80MM (TICKET DE CAISSE POS) */}
          {printFormat === 'ticket' && (
            <div id="printable-invoice" className="bg-white rounded-2xl p-5 border border-dashed border-slate-300 shadow-sm max-w-xs w-full text-slate-900 font-mono text-xs">
              
              {/* Ticket Top Logo & Shop */}
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm mx-auto mb-1">
                  M
                </div>
                <h2 className="font-bold text-sm tracking-tight uppercase">
                  {currentBoutique.name}
                </h2>
                <p className="text-[11px] text-slate-600">
                  {currentBoutique.city} · {currentBoutique.country}
                </p>
                <p className="text-[10px] text-slate-500">
                  Tél : {currentBoutique.phone}
                </p>
              </div>

              {/* Ticket Header Meta */}
              <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-0.5">
                <div className="flex justify-between font-bold">
                  <span>TICKET FACTURE</span>
                  <span>{order.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Date :</span>
                  <span>{order.createdAt}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Cliente :</span>
                  <span className="font-semibold">{order.clientName}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Contact :</span>
                  <span>{order.clientPhone}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Vendeur :</span>
                  <span>{order.createdBySellerName}</span>
                </div>
                {order.isDelivery && (
                  <div className="text-slate-600 pt-0.5">
                    <span>Livraison : {order.deliveryAddress}</span>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="py-2.5 border-b border-dashed border-slate-300">
                <div className="flex justify-between font-bold text-[10px] uppercase text-slate-500 mb-1">
                  <span>Article</span>
                  <span>Qté x PU</span>
                  <span>Total</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-start gap-1">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{item.clothingName}</p>
                        <p className="text-[10px] text-slate-500">Taille : {item.size}</p>
                      </div>
                      <span className="text-slate-600 shrink-0 text-[10px]">
                        {item.quantity} x {item.unitPrice.toLocaleString('fr-FR')}
                      </span>
                      <span className="font-bold shrink-0">
                        {item.subtotal.toLocaleString('fr-FR')} F
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Sous-total :</span>
                  <span>{(order.subtotalAmount || order.totalAmount).toLocaleString('fr-FR')} F</span>
                </div>
                {order.discount && order.discount.amount > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>Remise ({order.discount.reason}) :</span>
                    <span>-{order.discount.amount.toLocaleString('fr-FR')} F</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Livraison :</span>
                  <span>{order.isDelivery ? 'Offert' : '0 F'}</span>
                </div>
                <div className="pt-1.5 border-t border-slate-200 flex justify-between items-baseline font-bold text-sm">
                  <span>TOTAL NET :</span>
                  <span className="text-blue-600">{order.totalAmount.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>

              {/* Payment Status */}
              <div className="py-2 text-center border-b border-dashed border-slate-300">
                <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                  order.status === 'livre_paye'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {order.status === 'livre_paye' ? '✓ RÉGLÉ & SOLDÉ' : '⏳ EN COURS (À RÉGLER)'}
                </span>
                <p className="text-[10px] text-slate-500 mt-1">
                  Règlement : {getPaymentLabel(order.paymentMethod)}
                </p>
              </div>

              {/* Barcode / Footer */}
              <div className="pt-3 text-center space-y-1 text-[10px] text-slate-500">
                <div className="flex justify-center py-1">
                  <div className="h-6 w-32 bg-[repeating-linear-gradient(90deg,#000,#000_2px,transparent_2px,transparent_4px)]" />
                </div>
                <p className="font-semibold text-slate-800">Merci pour vos achats !</p>
                <p className="text-[9px]">ModaFlow Cloud Caisse · À très bientôt</p>
              </div>

            </div>
          )}

        </div>

        {/* Footer actions on screen */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Fermer
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {/* WhatsApp PDF Button */}
            <button
              onClick={handleShareWhatsAppPDF}
              disabled={isSharing}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Envoyer la facture PDF sur WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp (PDF)</span>
            </button>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 active:scale-95 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Télécharger le fichier PDF"
            >
              <Download className="w-4 h-4" />
              <span>{printFormat === 'ticket' ? 'PDF Ticket' : 'Télécharger PDF'}</span>
            </button>

            {/* Prominent Print Button */}
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              title="Lancer l'impression directe (imprimante de bureau ou thermique)"
            >
              <Printer className="w-4 h-4" />
              <span>
                {printFormat === 'ticket' ? 'Imprimer Ticket (80mm)' : 'Imprimer Facture (A4)'}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
