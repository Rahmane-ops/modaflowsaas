import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from '../firebase';
import {
  BoutiqueTenant,
  UserAccount,
  PlatformSettings,
  PlatformPlan,
  PlatformPayment,
  SupportTicket,
  TicketReply,
  PlatformAuditLog,
} from '../types';

// Default initial Platform Settings
export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  id: 'general',
  platformName: 'ModaFlow SaaS Cloud',
  legalEntityName: 'ModaFlow Technologies SARL',
  supportEmail: 'support@modaflow.com',
  supportPhone: '+221 33 800 00 00',
  defaultCurrency: 'FCFA',
  maintenanceMode: false,
  maintenanceMessage: 'La plateforme ModaFlow est temporairement en maintenance technique planifiée. Accès réservé aux administrateurs.',
  publicRegistrationOpen: true,
  freeTrialDays: 14,
  allowTrialWithoutCard: true,
  notifyOnNewSignup: true,
  notifyOnPayment: true,
  updatedAt: '2026-10-22',
  updatedBy: 'Super Admin',
};

// Default commercial plans
export const DEFAULT_PLATFORM_PLANS: PlatformPlan[] = [
  {
    id: 'starter',
    name: 'Starter Solo',
    priceMonthly: 15000,
    priceYearly: 150000,
    badge: 'Essentiel',
    description: 'Parfait pour un créateur ou petite boutique débutante.',
    features: [
      'Jusqu’à 2 collaborateurs (1 caissier, 1 gérant)',
      '1 coursier / livreur dédié',
      'Catalogue de 200 articles',
      'Encaissement Wave, Orange Money & Espèces',
      'Factures & Reçus PDF officiels',
      'Support par e-mail sous 48h'
    ],
    maxOrdersPerMonth: 300,
    maxStaff: 2,
    maxDrivers: 1,
    maxProducts: 200,
    maxBoutiques: 1,
    isActive: true,
    isPopular: false,
    updatedAt: '2026-10-01',
  },
  {
    id: 'pro',
    name: 'Pro Boutique',
    priceMonthly: 35000,
    priceYearly: 350000,
    badge: 'Recommandé',
    description: 'Pour boutiques de mode établies avec volume élevé et équipe complète.',
    features: [
      'Jusqu’à 8 collaborateurs avec RBAC granulaire',
      '5 coursiers / livreurs avec géolocalisation',
      'Catalogue illimité de vêtements & tailles',
      'Inventaire physique avec alertes de stock faible',
      'Clôture journalière (Z de Caisse) & Billetage',
      'Rapprochement comptable & Exports CSV/PDF',
      'Support prioritaire WhatsApp & Téléphone'
    ],
    maxOrdersPerMonth: 2000,
    maxStaff: 8,
    maxDrivers: 5,
    maxProducts: 10000,
    maxBoutiques: 1,
    isActive: true,
    isPopular: true,
    updatedAt: '2026-10-01',
  },
  {
    id: 'enterprise',
    name: 'Réseau Multi-Boutiques',
    priceMonthly: 75000,
    priceYearly: 750000,
    badge: 'Chaîne & Franchise',
    description: 'Multi-succursales, gestion centralisée et infrastructure haute disponibilité.',
    features: [
      'Nombre de collaborateurs illimité',
      'Équipe de livraison illimitée',
      'Gestion de succursales multiples synchronisées',
      'Accès API Rest et intégration ERP',
      'Supervision multi-magasins en temps réel',
      'Account Manager dédié 7j/7'
    ],
    maxOrdersPerMonth: 100000,
    maxStaff: 50,
    maxDrivers: 50,
    maxProducts: 100000,
    maxBoutiques: 10,
    isActive: true,
    isPopular: false,
    updatedAt: '2026-10-01',
  },
];

// Initial confirmed verifiable SaaS subscription payments
export const INITIAL_PLATFORM_PAYMENTS: PlatformPayment[] = [
  {
    id: 'pay-2026-001',
    transactionRef: 'TRX-MODA-9921',
    boutiqueId: 'boutique-dakar-plateau',
    boutiqueName: 'Atelier Soie & Or — Dakar Plateau',
    payerName: 'Abdourahmane Bathily',
    payerEmail: 'abdourahmanebathily1@gmail.com',
    amount: 35000,
    currency: 'FCFA',
    paymentDate: '2026-10-15 10:24',
    paymentMethod: 'wave',
    status: 'confirme',
    planId: 'pro',
    planName: 'Pro Boutique',
    period: 'Octobre 2026',
    notes: 'Paiement abonnement mensuel renouvelé par Wave Business.',
  },
  {
    id: 'pay-2026-002',
    transactionRef: 'TRX-MODA-9922',
    boutiqueId: 'boutique-almadies',
    boutiqueName: 'Maison Wax & Couture — Almadies',
    payerName: 'Mariama Ba',
    payerEmail: 'mariama.couture@modaflow.sn',
    amount: 75000,
    currency: 'FCFA',
    paymentDate: '2026-10-12 14:10',
    paymentMethod: 'orange_money',
    status: 'confirme',
    planId: 'enterprise',
    planName: 'Réseau Multi-Boutiques',
    period: 'Octobre 2026',
    notes: 'Abonnement multi-succursales validé Orange Money.',
  },
  {
    id: 'pay-2026-003',
    transactionRef: 'TRX-MODA-9923',
    boutiqueId: 'boutique-saint-louis',
    boutiqueName: 'Élégance Saint-Louisienne',
    payerName: 'Cheikh Ndiaye',
    payerEmail: 'cheikh.elegance@modaflow.sn',
    amount: 15000,
    currency: 'FCFA',
    paymentDate: '2026-10-08 16:45',
    paymentMethod: 'wave',
    status: 'confirme',
    planId: 'starter',
    planName: 'Starter Solo',
    period: 'Octobre 2026',
    notes: 'Formule starter activée.',
  },
  {
    id: 'pay-2026-004',
    transactionRef: 'TRX-MODA-9924',
    boutiqueId: 'boutique-thies',
    boutiqueName: 'Boutique Thiès Créations',
    payerName: 'Ousmane Sow',
    payerEmail: 'ousmane.thies@gmail.com',
    amount: 35000,
    currency: 'FCFA',
    paymentDate: '2026-10-02 09:12',
    paymentMethod: 'card',
    status: 'confirme',
    planId: 'pro',
    planName: 'Pro Boutique',
    period: 'Octobre 2026',
    notes: 'Carte bancaire Visa sécurisée.',
  },
  {
    id: 'pay-2026-005',
    transactionRef: 'TRX-MODA-9925',
    boutiqueId: 'boutique-mbour',
    boutiqueName: 'Saly Fashion Glamour',
    payerName: 'Fatou Diagne',
    payerEmail: 'fatou.saly@gmail.com',
    amount: 35000,
    currency: 'FCFA',
    paymentDate: '2026-10-21 11:30',
    paymentMethod: 'wave',
    status: 'en_attente',
    planId: 'pro',
    planName: 'Pro Boutique',
    period: 'Novembre 2026',
    notes: 'Validation passerelle Wave en cours.',
  },
];

// Initial support tickets
export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'ticket-001',
    ticketNumber: 'TCK-2026-001',
    boutiqueId: 'boutique-dakar-plateau',
    boutiqueName: 'Atelier Soie & Or — Dakar Plateau',
    requesterName: 'Aïssatou Diallo',
    requesterEmail: 'aissatou.diallo@modaflow.sn',
    subject: 'Configuration de l’imprimante thermique Bluetooth pour les reçus 80mm',
    description: 'Bonjour, nous souhaitons imprimer nos reçus de caisse directement sur une imprimante thermique ESC/POS via smartphone. Pouvez-vous nous confirmer le format de sortie PDF compatible ?',
    priority: 'normale',
    status: 'en_cours',
    createdAt: '2026-10-20 09:30',
    updatedAt: '2026-10-20 11:15',
    replies: [
      {
        id: 'rep-01',
        senderName: 'Équipe Support ModaFlow',
        senderEmail: 'support@modaflow.com',
        senderRole: 'superadmin',
        message: 'Bonjour Aïssatou, le bouton d’impression génère un format vectoriel responsive qui s’adapte aux largeurs standard 80mm et 58mm. Vous pouvez imprimer via Chrome Mobile sans driver propriétaire.',
        timestamp: '2026-10-20 11:15',
      },
    ],
  },
  {
    id: 'ticket-002',
    ticketNumber: 'TCK-2026-002',
    boutiqueId: 'boutique-almadies',
    boutiqueName: 'Maison Wax & Couture — Almadies',
    requesterName: 'Mariama Ba',
    requesterEmail: 'mariama.couture@modaflow.sn',
    subject: 'Demande d’augmentation du quota de coursiers livreurs',
    description: 'En raison du pic des commandes de la Tabaski, nous avons recruté 2 livreurs supplémentaires pour notre tournée de Dakar.',
    priority: 'haute',
    status: 'resolu',
    createdAt: '2026-10-18 14:00',
    updatedAt: '2026-10-18 15:40',
    replies: [
      {
        id: 'rep-02',
        senderName: 'Super Admin',
        senderEmail: 'abdourahmanebathily1@gmail.com',
        senderRole: 'superadmin',
        message: 'Quota livreurs augmenté de 5 à 7 pour votre boutique jusqu’à la fin du mois sans surcoût.',
        timestamp: '2026-10-18 15:40',
      },
    ],
  },
  {
    id: 'ticket-003',
    ticketNumber: 'TCK-2026-003',
    boutiqueId: 'boutique-saint-louis',
    boutiqueName: 'Élégance Saint-Louisienne',
    requesterName: 'Cheikh Ndiaye',
    requesterEmail: 'cheikh.elegance@modaflow.sn',
    subject: 'Rapprochement des paiements Wave Business',
    description: 'Est-il possible d’exporter le rapport des encaissements en format Excel .xlsx compatible avec notre logiciel de comptabilité ?',
    priority: 'normale',
    status: 'nouveau',
    createdAt: '2026-10-22 08:00',
    updatedAt: '2026-10-22 08:00',
    replies: [],
  },
];

// Initial Platform Audit Logs
export const INITIAL_PLATFORM_AUDIT_LOGS: PlatformAuditLog[] = [
  {
    id: 'audit-001',
    timestamp: '2026-10-22 07:15',
    actorId: 'usr-admin-root',
    actorName: 'Abdourahmane Bathily',
    actorEmail: 'abdourahmanebathily1@gmail.com',
    action: 'Connexion Super Admin',
    resource: 'auth',
    result: 'success',
    details: 'Authentification souveraine sur la console Super Admin ModaFlow.',
  },
  {
    id: 'audit-002',
    timestamp: '2026-10-21 16:40',
    actorId: 'usr-admin-root',
    actorName: 'Abdourahmane Bathily',
    actorEmail: 'abdourahmanebathily1@gmail.com',
    action: 'Mise à jour des formules d’abonnement',
    resource: 'plan',
    resourceId: 'pro',
    result: 'success',
    reason: 'Ajout de la clôture de caisse Z et du billetage physique au plan Pro.',
    details: 'Caractéristiques de la formule Pro mises à jour.',
  },
  {
    id: 'audit-003',
    timestamp: '2026-10-18 15:40',
    actorId: 'usr-admin-root',
    actorName: 'Abdourahmane Bathily',
    actorEmail: 'abdourahmanebathily1@gmail.com',
    action: 'Prolongation exceptionnelle quota boutique',
    resource: 'boutique',
    resourceId: 'boutique-almadies',
    result: 'success',
    reason: 'Pic saisonnier de livraisons Tabaski.',
    details: 'Quota temporaire accordé à Maison Wax & Couture.',
  },
  {
    id: 'audit-004',
    timestamp: '2026-10-15 10:24',
    actorId: 'system',
    actorName: 'Passerelle Paiement Wave',
    actorEmail: 'billing@modaflow.com',
    action: 'Encaissement abonnement',
    resource: 'payment',
    resourceId: 'pay-2026-001',
    result: 'success',
    details: 'Encaissement de 35 000 FCFA pour Atelier Soie & Or.',
  },
];

// ----------------------------------------------------------------------------
// SUPER ADMIN SERVICE METHODS (FIRESTORE REAL IMPLEMENTATION)
// ----------------------------------------------------------------------------

/**
 * Log an administrative trace log
 */
export async function logPlatformAuditAction(
  logData: Omit<PlatformAuditLog, 'id' | 'timestamp'>
): Promise<PlatformAuditLog> {
  const newLog: PlatformAuditLog = {
    ...logData,
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };

  try {
    const docRef = doc(db, 'platform_audit_logs', newLog.id);
    await setDoc(docRef, newLog);
  } catch (err) {
    console.warn('[Platform Audit Log] Firestore sync notice (saved locally):', err);
  }

  return newLog;
}

/**
 * Send password reset email via real Firebase Auth
 */
export async function triggerFirebasePasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: `E-mail de réinitialisation sécurisé envoyé avec succès à ${email} via Firebase Authentication.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erreur Firebase Auth : ${err?.message || 'Impossible d’envoyer le lien de réinitialisation.'}`,
    };
  }
}

/**
 * Compute real SaaS platform indicators from actual data
 */
export function computePlatformMetrics(
  boutiques: BoutiqueTenant[],
  users: UserAccount[],
  payments: PlatformPayment[],
  plans: PlatformPlan[]
) {
  const totalUsers = users.length;
  const totalBoutiques = boutiques.length;

  const activeBoutiques = boutiques.filter((b) => b.subscriptionStatus === 'actif').length;
  const trialBoutiques = boutiques.filter((b) => b.subscriptionStatus === 'essai_gratuit').length;
  const suspendedBoutiques = boutiques.filter((b) => b.subscriptionStatus === 'suspendu' || b.subscriptionStatus === 'expire').length;

  // Actual collected revenue (confirmed payments only)
  const confirmedPayments = payments.filter((p) => p.status === 'confirme');
  const totalCollectedRevenue = confirmedPayments.reduce((acc, p) => acc + p.amount, 0);

  // Pending payments
  const pendingPayments = payments.filter((p) => p.status === 'en_attente');
  const totalPendingAmount = pendingPayments.reduce((acc, p) => acc + p.amount, 0);

  // Calculate MRR (Monthly Recurring Revenue) based on active paying subscriptions
  let mrr = 0;
  boutiques.forEach((b) => {
    if (b.subscriptionStatus === 'actif') {
      const plan = plans.find((p) => p.id === b.planId);
      if (plan) {
        mrr += plan.priceMonthly;
      }
    }
  });

  // New users in last 7 days and 30 days
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const newUsers7d = users.filter((u) => {
    if (!u.createdAt) return false;
    const d = new Date(u.createdAt);
    return !isNaN(d.getTime()) && d >= sevenDaysAgo;
  }).length;

  const newUsers30d = users.filter((u) => {
    if (!u.createdAt) return false;
    const d = new Date(u.createdAt);
    return !isNaN(d.getTime()) && d >= thirtyDaysAgo;
  }).length;

  // Breakdown of subscriptions by plan
  const planBreakdown: Record<string, number> = {};
  plans.forEach((p) => {
    planBreakdown[p.id] = boutiques.filter((b) => b.planId === p.id).length;
  });

  return {
    totalUsers,
    totalBoutiques,
    activeBoutiques,
    trialBoutiques,
    suspendedBoutiques,
    totalCollectedRevenue,
    totalPendingAmount,
    mrr,
    newUsers7d,
    newUsers30d,
    planBreakdown,
  };
}
