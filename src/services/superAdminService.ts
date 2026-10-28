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

// Initial confirmed verifiable SaaS subscription payments (remis à zéro pour vrais clients)
export const INITIAL_PLATFORM_PAYMENTS: PlatformPayment[] = [];

// Initial support tickets (remis à zéro pour vrais clients)
export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [];

// Initial Platform Audit Logs
export const INITIAL_PLATFORM_AUDIT_LOGS: PlatformAuditLog[] = [
  {
    id: 'audit-001',
    timestamp: new Date().toISOString().substring(0, 16).replace('T', ' '),
    actorId: 'usr-superadmin-root',
    actorName: 'Abdourahmane Bathily',
    actorEmail: 'abdourahmanebathily1@gmail.com',
    action: 'Initialisation Système SaaS & Base Propre',
    resource: 'auth',
    result: 'success',
    details: 'Console Super Admin initialisée avec synchronisation Cloud Firestore active et données factices remises à zéro.',
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
