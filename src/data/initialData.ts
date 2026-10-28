import {
  ClothingItem,
  Order,
  Transaction,
  UserAccount,
  AuditLog,
  Client,
  SubscriptionPlan,
  BoutiqueTenant,
  StoreMember,
  StoreInvitation,
  CashRegisterClosing,
} from '../types';

/**
 * Super Admin Souverain de la Plateforme SaaS
 * Conservé comme unique compte administrateur initial (sans données factices de démo).
 */
export const SUPER_ADMIN_USER: UserAccount = {
  id: 'usr-superadmin-root',
  name: 'Abdourahmane Bathily',
  email: 'abdourahmanebathily1@gmail.com',
  phone: '+221 77 000 00 00',
  role: 'superadmin',
  title: 'Propriétaire & Super Administrateur SaaS',
  avatar: '⚡',
  status: 'active',
  emailVerified: true,
  createdAt: '2026-01-01',
  activeSessions: [],
};

// Répertoire des utilisateurs : uniquement le Super Admin (zéro utilisateur factice de démo)
export const INITIAL_USERS: UserAccount[] = [SUPER_ADMIN_USER];

// Données métier remises à zéro (aucun faux article, fausse commande, faux client ou fausse transaction)
// Les prochains clients enregistreront leurs données réelles dans Cloud Firestore.
export const INITIAL_CLOTHES: ClothingItem[] = [];
export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_CLIENTS: Client[] = [];
export const INITIAL_TRANSACTIONS: Transaction[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
export const INITIAL_CASH_CLOSINGS: CashRegisterClosing[] = [];
export const INITIAL_BOUTIQUES: BoutiqueTenant[] = [];
export const INITIAL_STORE_MEMBERS: StoreMember[] = [];
export const INITIAL_INVITATIONS: StoreInvitation[] = [];

/**
 * Formules Commerciales d'Abonnement du SaaS (Tarifs réels pour nouveaux marchands)
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Pack Starter Solo',
    priceMonthly: 4900,
    badge: 'Démarrage Facile',
    description: 'Idéal pour styliste indépendant ou créateur de mode qui lance son atelier.',
    features: [
      'Jusqu’à 100 commandes par mois',
      'Catalogue de 50 articles',
      'Caisse enregistreuse tactile (POS)',
      'Factures et reçus WhatsApp / PDF',
      'Gestion des stocks avec alertes',
      'Support par WhatsApp',
    ],
    maxOrdersPerMonth: 100,
    maxStaff: 2,
    maxDrivers: 1,
  },
  {
    id: 'pro',
    name: 'Pack Pro Vendeur & Livraisons',
    priceMonthly: 10900,
    badge: 'Le Plus Populaire ⭐',
    isPopular: true,
    description: 'La solution complète pour boutiques de mode avec livreurs et comptabilité temps réel.',
    features: [
      'Commandes & Catalogues illimités',
      'Cockpit Livreurs en temps réel (Appel & WhatsApp 1-clic)',
      'Comptabilité automatisée (Wave, Orange Money, Caisse Cash)',
      'Fichier Clients & Fidélisation VIP (CRM)',
      'Gestion des Retours de produits avec restockage',
      'Multi-comptes (Propriétaire, Vendeurs, Livreurs, Comptable)',
      'Synchronisation multi-écrans instantanée',
    ],
    maxOrdersPerMonth: 1500,
    maxStaff: 6,
    maxDrivers: 4,
  },
  {
    id: 'enterprise',
    name: 'Pack Multi-Boutiques & Réseaux',
    priceMonthly: 29900,
    badge: 'Grands Ateliers 👑',
    description: 'Pour chaînes de boutiques, ateliers de haute confection et franchises multi-villes.',
    features: [
      'Tout le pack Pro en illimité',
      'Multi-succursales (Dakar, Abidjan, Douala, Paris...)',
      'Livreurs et coursiers illimités',
      'Grand livre comptable certifié et export CSV expert',
      'Rapprochement bancaire et caisse multi-devises',
      'Assistance prioritaire VIP 7j/7 avec gestionnaire dédié',
    ],
    maxOrdersPerMonth: 10000,
    maxStaff: 25,
    maxDrivers: 20,
  },
];
