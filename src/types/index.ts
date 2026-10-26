export type UserRole = 
  | 'superadmin'      // Propriétaire & Super Administrateur de la plateforme SaaS
  | 'owner'           // Propriétaire de la boutique (Accès complet, transfert, abonnement)
  | 'admin'           // Administrateur boutique (Gestion opérationnelle, produits, ventes, employés)
  | 'manager'         // Gérant (Ventes, stocks, clients, indicateurs opérationnels)
  | 'cashier'         // Caissier (POS, encaissements, recherche produits, impression reçus)
  | 'seller'          // Vendeur (POS, catalogue, ventes)
  | 'stock_manager'   // Gestionnaire de stock (Mouvements, entrées/sorties, inventaire, réassort)
  | 'delivery'        // Livreur (Tournées, encaissement livraison, statut)
  | 'accountant'      // Comptable (Ventes, dépenses, recettes, rapports financiers, export)
  | 'platform_admin'; // Alias pour Administrateur de la plateforme SaaS

export type PermissionKey =
  // Catalogue & Produits
  | 'products.read'
  | 'products.create'
  | 'products.update'
  | 'products.delete'
  // Catégories
  | 'categories.read'
  | 'categories.create'
  | 'categories.update'
  | 'categories.delete'
  // Inventaire & Mouvements de stock
  | 'inventory.read'
  | 'inventory.receive'
  | 'inventory.adjust'
  | 'inventory.delete_movement'
  // Ventes & Encaissements
  | 'sales.read'
  | 'sales.read_all'
  | 'sales.create'
  | 'sales.cancel'
  | 'sales.refund'
  // Clients & CRM
  | 'customers.read'
  | 'customers.create'
  | 'customers.update'
  | 'customers.delete'
  // Fournisseurs
  | 'suppliers.read'
  | 'suppliers.create'
  | 'suppliers.update'
  | 'suppliers.delete'
  // Dépenses & Trésorerie
  | 'expenses.read'
  | 'expenses.create'
  | 'expenses.update'
  | 'expenses.delete'
  // Rapports & Indicateurs
  | 'reports.operational'
  | 'reports.financial'
  | 'reports.export'
  // Équipe & Membres (RBAC)
  | 'members.read'
  | 'members.invite'
  | 'members.update_role'
  | 'members.suspend'
  | 'members.remove'
  // Paramètres & Facturation Boutique
  | 'store.settings'
  | 'store.billing'
  // Alias de compatibilité ascendante
  | 'view_products'
  | 'create_products'
  | 'edit_products'
  | 'delete_products'
  | 'view_stock'
  | 'adjust_stock'
  | 'create_sale'
  | 'refund_sale'
  | 'view_sales'
  | 'view_financials'
  | 'view_expenses'
  | 'view_clients'
  | 'manage_clients'
  | 'export_data'
  | 'manage_employees'
  | 'edit_employee_roles'
  | 'suspend_member'
  | 'edit_store_settings'
  | 'manage_subscription'
  | 'apply_discounts'
  | 'close_cash_register';

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  lastActive: string;
  createdAt: string;
  isCurrent: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  title: string;
  avatar: string;
  status: 'active' | 'suspended' | 'deactivated';
  emailVerified: boolean;
  verificationCode?: string;
  passwordHash?: string;
  salt?: string;
  resetToken?: string;
  resetTokenExpires?: number;
  failedAttempts?: number;
  lockedUntil?: number;
  activeSessions?: UserSession[];
  storeIds?: string[];
  boutiqueId?: string;
  createdAt: string;
}

export interface StoreMember {
  id: string;
  storeId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  title: string;
  avatar: string;
  customPermissions?: PermissionKey[];
  status: 'active' | 'suspended';
  joinedAt: string;
}

export interface StoreInvitation {
  id: string;
  storeId: string;
  storeName: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: PermissionKey[];
  token: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired';
  invitedBy: string;
  createdAt: string;
}

export type ClothingCategory = 
  | 'tous'
  | 'robes'
  | 'hauts'
  | 'ensembles'
  | 'pantalons'
  | 'combinaisons'
  | 'accessoires';

export interface ClothingItem {
  id: string;
  sku: string;
  name: string;
  category: 'robes' | 'hauts' | 'ensembles' | 'pantalons' | 'combinaisons' | 'accessoires';
  price: number; // in FCFA
  costPrice: number; // Prix de revient/achat
  stock: number;
  minStockAlert: number;
  sizes: string[];
  colors: string[];
  imageUrl: string;
  description: string;
  boutiqueId?: string;
}

export type PaymentMethod = 'wave' | 'orange_money' | 'cash';

export type OrderStatus = 'en_cours' | 'livre_paye' | 'annule';

export interface OrderItem {
  clothingId: string;
  clothingName: string;
  category: string;
  size: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  imageUrl: string;
}

export interface OrderReturn {
  id: string;
  clothingId: string;
  clothingName: string;
  size: string;
  quantity: number;
  unitPrice: number;
  reason: string;
  date: string;
  processedBy: string;
  actionType: 'remboursement' | 'echange' | 'avoir';
  refundAmount?: number;
}

export interface OrderDiscount {
  type: 'percentage' | 'fixed';
  value: number; // e.g. 10 (%) or 5000 (FCFA)
  amount: number; // calculated discount in FCFA
  reason: string; // e.g. "Cliente VIP", "Promotion Tabaski", etc.
  authorizedBy?: string; // Nom de la personne ayant autorisé la remise
}

export interface Order {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientPhone: string;
  deliveryAddress: string;
  isDelivery: boolean;
  deliveryDriverId?: string;
  deliveryDriverName?: string;
  items: OrderItem[];
  subtotalAmount?: number; // Total brut avant remise
  discount?: OrderDiscount; // Remise appliquée le cas échéant
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'en_attente' | 'solde';
  status: OrderStatus;
  createdAt: string;
  deliveredAt?: string;
  createdBySellerId: string;
  createdBySellerName: string;
  notes?: string;
  returnsHistory?: OrderReturn[];
  isModified?: boolean;
  boutiqueId?: string;
}

export interface CashCountBreakdown {
  b10000: number; // Quantité de coupures de 10 000 FCFA
  b5000: number;  // Quantité de coupures de 5 000 FCFA
  b2000: number;  // Quantité de coupures de 2 000 FCFA
  b1000: number;  // Quantité de coupures de 1 000 FCFA
  b500: number;   // Quantité de coupures de 500 FCFA
  coinsTotal: number; // Total pièces de monnaie en FCFA
}

export interface CashRegisterClosing {
  id: string;
  storeId: string;
  closingNumber: string; // ex: Z-2026-001
  date: string; // YYYY-MM-DD
  closedAt: string; // YYYY-MM-DD HH:mm
  closedByUserId: string;
  closedByUserName: string;
  closedByUserRole: UserRole;

  // Fond de caisse initial le matin
  openingCashFund?: number;

  // Montants théoriques enregistrés par le système le jour J
  theoreticalCash: number;
  theoreticalWave: number;
  theoreticalOrangeMoney: number;
  theoreticalTotalRevenue: number;
  ordersCount: number;

  // Billetage / Comptage physique
  countedCash: CashCountBreakdown;
  actualCashTotal: number;

  // Vérifications mobile money
  waveConfirmed: boolean;
  orangeMoneyConfirmed: boolean;

  // Écart de caisse (Physique - Théorique)
  cashDifference: number; // 0 = équilibré, >0 = excédent, <0 = manquant
  status: 'equilibre' | 'excedent' | 'manquant';

  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalSpent: number; // Total d'achats en FCFA
  ordersCount: number;
  loyaltyTier: 'vip' | 'fidele' | 'nouveau';
  loyaltyPoints: number;
  favoriteCategory?: string;
  notes?: string;
  createdAt: string;
  lastOrderDate?: string;
  boutiqueId?: string;
}

export interface Transaction {
  id: string;
  orderId?: string;
  invoiceNumber?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  clientName?: string;
  clientPhone?: string;
  deliveryDriverName?: string;
  sellerName?: string;
  timestamp: string;
  itemsSummary: string;
  type?: 'vente' | 'remboursement' | 'ajustement' | 'depense';
  expenseCategory?: string; // 'loyer' | 'electricite' | 'salaires' | 'emballages' | 'transport' | 'fournitures' | 'autre'
  boutiqueId?: string;
}

export interface SubscriptionPlan {
  id: 'starter' | 'pro' | 'enterprise';
  name: string;
  priceMonthly: number; // in FCFA
  badge?: string;
  description: string;
  features: string[];
  maxOrdersPerMonth: number;
  maxStaff: number;
  maxDrivers: number;
  isPopular?: boolean;
}

export interface BoutiqueTenant {
  id: string;
  name: string;
  city: string;
  country: string;
  phone: string;
  currency: string;
  planId: 'starter' | 'pro' | 'enterprise';
  subscriptionStatus: 'actif' | 'essai_gratuit' | 'expire' | 'suspendu';
  suspensionReason?: string;
  suspendedAt?: string;
  subscriptionExpiresAt: string;
  daysRemaining: number;
  autoRenew: boolean;
  createdAt: string;
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  role: UserRole;
  action: string;
  details: string;
  boutiqueId?: string;
}

export type ActiveTab = 'dashboard' | 'catalogue' | 'commandes' | 'livraisons' | 'clients' | 'comptabilite' | 'inventaire' | 'abonnement';

// ==========================================
// SUPER ADMIN SAAS PLATFORM MODELS
// ==========================================

export type SuperAdminSubTab = 
  | 'overview' 
  | 'boutiques' 
  | 'users' 
  | 'plans' 
  | 'payments' 
  | 'roles' 
  | 'support' 
  | 'audit' 
  | 'settings';

export interface PlatformSettings {
  id: string;
  platformName: string;
  legalEntityName: string;
  supportEmail: string;
  supportPhone: string;
  defaultCurrency: 'FCFA' | 'EUR' | 'USD';
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  publicRegistrationOpen: boolean;
  freeTrialDays: number;
  allowTrialWithoutCard: boolean;
  notifyOnNewSignup: boolean;
  notifyOnPayment: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface PlatformPlan {
  id: string;
  name: string;
  priceMonthly: number; // en FCFA
  priceYearly?: number; // en FCFA
  badge?: string;
  description: string;
  features: string[];
  maxOrdersPerMonth: number;
  maxStaff: number;
  maxDrivers: number;
  maxProducts: number;
  maxBoutiques: number;
  isActive: boolean;
  isPopular?: boolean;
  updatedAt: string;
}

export interface PlatformPayment {
  id: string;
  transactionRef: string;
  boutiqueId: string;
  boutiqueName: string;
  payerName: string;
  payerEmail: string;
  amount: number;
  currency: string;
  paymentDate: string;
  paymentMethod: 'wave' | 'orange_money' | 'card' | 'bank_transfer' | 'cash';
  status: 'confirme' | 'en_attente' | 'echoue' | 'rembourse';
  planId: string;
  planName: string;
  period: string; // ex: "Octobre 2026"
  notes?: string;
}

export interface TicketReply {
  id: string;
  senderName: string;
  senderEmail: string;
  senderRole: 'superadmin' | 'owner' | 'manager' | 'support';
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string; // ex: TCK-2026-001
  boutiqueId: string;
  boutiqueName: string;
  requesterName: string;
  requesterEmail: string;
  subject: string;
  description: string;
  priority: 'urgente' | 'haute' | 'normale' | 'basse';
  status: 'nouveau' | 'en_cours' | 'resolu' | 'ferme';
  createdAt: string;
  updatedAt: string;
  replies: TicketReply[];
}

export interface PlatformAuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  action: string;
  resource: 'boutique' | 'user' | 'plan' | 'payment' | 'support' | 'settings' | 'auth';
  resourceId?: string;
  result: 'success' | 'failure';
  reason?: string;
  details: string;
}

