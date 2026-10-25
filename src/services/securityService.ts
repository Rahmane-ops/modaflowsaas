import { UserRole, PermissionKey, UserAccount, StoreMember } from '../types';

/**
 * Matrice stricte des permissions par rôle (Principe du moindre privilège)
 * Toute permission non explicitement accordée est STRICTEMENT REFUSÉE par défaut.
 */
export const ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  // A. Propriétaire de la boutique — Contrôle complet de SA boutique
  owner: [
    'products.read',
    'products.create',
    'products.update',
    'products.delete',
    'categories.read',
    'categories.create',
    'categories.update',
    'categories.delete',
    'inventory.read',
    'inventory.receive',
    'inventory.adjust',
    'inventory.delete_movement',
    'sales.read',
    'sales.read_all',
    'sales.create',
    'sales.cancel',
    'sales.refund',
    'customers.read',
    'customers.create',
    'customers.update',
    'customers.delete',
    'suppliers.read',
    'suppliers.create',
    'suppliers.update',
    'suppliers.delete',
    'expenses.read',
    'expenses.create',
    'expenses.update',
    'expenses.delete',
    'reports.operational',
    'reports.financial',
    'reports.export',
    'members.read',
    'members.invite',
    'members.update_role',
    'members.suspend',
    'members.remove',
    'store.settings',
    'store.billing',
    // Compatibilité
    'view_products',
    'create_products',
    'edit_products',
    'delete_products',
    'view_stock',
    'adjust_stock',
    'create_sale',
    'refund_sale',
    'view_sales',
    'view_financials',
    'view_expenses',
    'view_clients',
    'manage_clients',
    'export_data',
    'manage_employees',
    'edit_employee_roles',
    'suspend_member',
    'edit_store_settings',
    'manage_subscription',
    'apply_discounts',
    'close_cash_register',
  ],

  // B. Administrateur de boutique — Gestion courante & équipe dans les limites
  admin: [
    'products.read',
    'products.create',
    'products.update',
    'products.delete',
    'categories.read',
    'categories.create',
    'categories.update',
    'categories.delete',
    'inventory.read',
    'inventory.receive',
    'inventory.adjust',
    'inventory.delete_movement',
    'sales.read',
    'sales.read_all',
    'sales.create',
    'sales.cancel',
    'sales.refund',
    'customers.read',
    'customers.create',
    'customers.update',
    'customers.delete',
    'suppliers.read',
    'suppliers.create',
    'suppliers.update',
    'suppliers.delete',
    'expenses.read',
    'expenses.create',
    'expenses.update',
    'expenses.delete',
    'reports.operational',
    'reports.financial',
    'reports.export',
    'members.read',
    'members.invite',
    'members.update_role',
    'members.suspend',
    'members.remove',
    'store.settings',
    // NOT store.billing (réservé owner)
    // Compatibilité
    'view_products',
    'create_products',
    'edit_products',
    'delete_products',
    'view_stock',
    'adjust_stock',
    'create_sale',
    'refund_sale',
    'view_sales',
    'view_financials',
    'view_expenses',
    'view_clients',
    'manage_clients',
    'export_data',
    'manage_employees',
    'edit_employee_roles',
    'suspend_member',
    'edit_store_settings',
    'apply_discounts',
    'close_cash_register',
  ],

  // C. Gérant — Gestion quotidienne opérationnelle
  manager: [
    'products.read',
    'products.create',
    'products.update',
    // NOT products.delete
    'categories.read',
    'categories.create',
    'categories.update',
    // NOT categories.delete
    'inventory.read',
    'inventory.receive',
    'inventory.adjust',
    'sales.read',
    'sales.read_all',
    'sales.create',
    'sales.cancel',
    // NOT sales.refund par défaut
    'customers.read',
    'customers.create',
    'customers.update',
    // NOT customers.delete
    'suppliers.read',
    'reports.operational',
    // Compatibilité
    'view_products',
    'create_products',
    'edit_products',
    'view_stock',
    'adjust_stock',
    'create_sale',
    'view_sales',
    'view_clients',
    'manage_clients',
    'apply_discounts',
    'close_cash_register',
  ],

  // D. Caissier — Opérations de caisse et POS uniquement
  cashier: [
    'products.read',
    'categories.read',
    'sales.read',
    'sales.create',
    'customers.read',
    'customers.create',
    // Compatibilité
    'view_products',
    'view_stock',
    'create_sale',
    'view_sales',
    'view_clients',
    'apply_discounts',
    'close_cash_register',
  ],

  // Vendeur (Comptoir / POS)
  seller: [
    'products.read',
    'categories.read',
    'sales.read',
    'sales.create',
    'customers.read',
    'customers.create',
    // Compatibilité
    'view_products',
    'view_stock',
    'create_sale',
    'view_sales',
    'view_clients',
  ],

  // Livreur (Tournées & Remise)
  delivery: [
    'sales.read',
    'sales.create',
    // Compatibilité
    'view_sales',
    'create_sale',
  ],

  // E. Gestionnaire de stock — Mouvements de stock (Création produit INTERDITE par défaut)
  stock_manager: [
    'products.read',
    'categories.read',
    'inventory.read',
    'inventory.receive',
    'inventory.adjust',
    'suppliers.read',
    'reports.operational',
    // Compatibilité
    'view_products',
    'view_stock',
    'adjust_stock',
  ],

  // F. Comptable — Suivi comptable et financier (Création produit STRICTEMENT INTERDITE)
  accountant: [
    'products.read',
    'categories.read',
    'sales.read',
    'sales.read_all',
    'expenses.read',
    'expenses.create',
    'expenses.update',
    'reports.operational',
    'reports.financial',
    'reports.export',
    // Compatibilité
    'view_products',
    'view_sales',
    'view_financials',
    'view_expenses',
    'export_data',
  ],

  // G. Administrateur & Propriétaire de la plateforme SaaS — Supervision & Monitoring global
  superadmin: [
    'reports.operational',
    'reports.financial',
    'reports.export',
  ],
  platform_admin: [
    'reports.operational',
    'reports.financial',
    'reports.export',
  ],
};

// Aliases bidirectionnels pour compatibilité legacy <-> granular
const PERMISSION_ALIASES: Record<string, PermissionKey[]> = {
  view_products: ['products.read'],
  create_products: ['products.create'],
  edit_products: ['products.update'],
  delete_products: ['products.delete'],
  view_stock: ['inventory.read'],
  adjust_stock: ['inventory.adjust', 'inventory.receive'],
  create_sale: ['sales.create'],
  refund_sale: ['sales.refund'],
  view_sales: ['sales.read', 'sales.read_all'],
  view_financials: ['reports.financial'],
  view_expenses: ['expenses.read'],
  view_clients: ['customers.read'],
  manage_clients: ['customers.create', 'customers.update'],
  export_data: ['reports.export'],
  manage_employees: ['members.invite', 'members.remove', 'members.suspend'],
  edit_employee_roles: ['members.update_role'],
  suspend_member: ['members.suspend'],
  edit_store_settings: ['store.settings'],
  manage_subscription: ['store.billing'],

  // Inverses
  'products.read': ['view_products'],
  'products.create': ['create_products'],
  'products.update': ['edit_products'],
  'products.delete': ['delete_products'],
  'inventory.read': ['view_stock'],
  'inventory.adjust': ['adjust_stock'],
  'inventory.receive': ['adjust_stock'],
  'sales.create': ['create_sale'],
  'sales.refund': ['refund_sale'],
  'sales.read': ['view_sales'],
  'sales.read_all': ['view_sales'],
  'reports.financial': ['view_financials'],
  'expenses.read': ['view_expenses'],
  'customers.read': ['view_clients'],
  'reports.export': ['export_data'],
  'members.invite': ['manage_employees'],
  'members.update_role': ['edit_employee_roles'],
  'members.suspend': ['suspend_member'],
  'store.settings': ['edit_store_settings'],
  'store.billing': ['manage_subscription'],
};

export const ROLE_LABELS: Record<UserRole, { label: string; badge: string; description: string; color: string }> = {
  owner: {
    label: 'Propriétaire',
    badge: '👑 Propriétaire',
    description: 'Contrôle complet de sa boutique, de l’équipe et de l’abonnement SaaS.',
    color: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  admin: {
    label: 'Administrateur Boutique',
    badge: '🛡️ Admin Boutique',
    description: 'Gestion opérationnelle : catalogue, stocks, ventes, dépenses et équipe autorisée.',
    color: 'bg-indigo-100 text-indigo-900 border-indigo-300',
  },
  manager: {
    label: 'Gérant',
    badge: '💼 Gérant',
    description: 'Gestion quotidienne des ventes, des réassorts de stock et du service client.',
    color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
  cashier: {
    label: 'Caissier',
    badge: '💳 Caissier POS',
    description: 'Caisse enregistreuse, encaissements Wave / Orange Money / Espèces et reçus.',
    color: 'bg-blue-100 text-blue-900 border-blue-300',
  },
  seller: {
    label: 'Vendeur Boutique',
    badge: '🛍️ Vendeur',
    description: 'Vente au comptoir, conseil client et création des paniers.',
    color: 'bg-teal-100 text-teal-900 border-teal-300',
  },
  delivery: {
    label: 'Livreur',
    badge: '🛵 Livreur',
    description: 'Gestion des livraisons de colis et encaissement à la livraison.',
    color: 'bg-cyan-100 text-cyan-900 border-cyan-300',
  },
  stock_manager: {
    label: 'Gestionnaire de Stock',
    badge: '📦 Gestionnaire Stock',
    description: 'Entrées, sorties, ajustements physiques, alertes de rupture et inventaire.',
    color: 'bg-orange-100 text-orange-900 border-orange-300',
  },
  accountant: {
    label: 'Comptable',
    badge: '📊 Comptable',
    description: 'Suivi des ventes, dépenses, recettes, marges et bilans financiers exportables.',
    color: 'bg-purple-100 text-purple-900 border-purple-300',
  },
  platform_admin: {
    label: 'Admin Plateforme',
    badge: '⚡ Super-Admin SaaS',
    description: 'Supervision technique globale de l’infrastructure SaaS ModaFlow.',
    color: 'bg-rose-100 text-rose-900 border-rose-300',
  },
  superadmin: {
    label: 'Super Administrateur',
    badge: '⚡ SUPER ADMIN',
    description: 'Propriétaire souverain de la plateforme SaaS, gestion des boutiques et abonnements.',
    color: 'bg-amber-100 text-amber-900 border-amber-400 font-bold',
  },
};

export const PERMISSION_LABELS: Record<PermissionKey, { name: string; category: string; description: string }> = {
  // Produits
  'products.read': { name: 'Consulter les produits', category: 'Catalogue', description: 'Accès au catalogue et fiches articles' },
  'products.create': { name: 'Créer des produits', category: 'Catalogue', description: 'Ajouter de nouvelles créations au catalogue' },
  'products.update': { name: 'Modifier les produits', category: 'Catalogue', description: 'Modifier les prix, photos et descriptions' },
  'products.delete': { name: 'Supprimer des produits', category: 'Catalogue', description: 'Retirer définitivement un produit du catalogue' },

  // Catégories
  'categories.read': { name: 'Consulter les catégories', category: 'Catalogue', description: 'Voir les familles de vêtements' },
  'categories.create': { name: 'Créer des catégories', category: 'Catalogue', description: 'Ajouter de nouvelles catégories' },
  'categories.update': { name: 'Modifier les catégories', category: 'Catalogue', description: 'Renommer ou réorganiser les catégories' },
  'categories.delete': { name: 'Supprimer des catégories', category: 'Catalogue', description: 'Supprimer une catégorie existante' },

  // Inventaire
  'inventory.read': { name: 'Consulter le stock', category: 'Inventaire', description: 'Voir les quantités disponibles et alertes' },
  'inventory.receive': { name: 'Enregistrer réassorts', category: 'Inventaire', description: 'Réceptionner des livraisons fournisseurs' },
  'inventory.adjust': { name: 'Ajuster les stocks', category: 'Inventaire', description: 'Corriger manuellement les écarts d’inventaire' },
  'inventory.delete_movement': { name: 'Supprimer mouvements', category: 'Inventaire', description: 'Annuler une écriture d’inventaire' },

  // Ventes
  'sales.read': { name: 'Consulter ses ventes', category: 'Ventes & Caisse', description: 'Voir les commandes prises' },
  'sales.read_all': { name: 'Consulter toutes les ventes', category: 'Ventes & Caisse', description: 'Accès à l’historique global de la boutique' },
  'sales.create': { name: 'Encaisser / Vendre', category: 'Ventes & Caisse', description: 'Enregistrer une vente et générer le reçu' },
  'sales.cancel': { name: 'Annuler une commande', category: 'Ventes & Caisse', description: 'Annuler une vente en cours et réintégrer le stock' },
  'sales.refund': { name: 'Effectuer un remboursement', category: 'Ventes & Caisse', description: 'Traiter les retours client et décaisser' },

  // Clients
  'customers.read': { name: 'Consulter les clients', category: 'Clients & CRM', description: 'Accéder aux fiches clients' },
  'customers.create': { name: 'Créer des clients', category: 'Clients & CRM', description: 'Enregistrer de nouveaux contacts' },
  'customers.update': { name: 'Modifier les clients', category: 'Clients & CRM', description: 'Mettre à jour les coordonnées' },
  'customers.delete': { name: 'Supprimer des clients', category: 'Clients & CRM', description: 'Supprimer un profil client' },

  // Fournisseurs
  'suppliers.read': { name: 'Consulter les fournisseurs', category: 'Fournisseurs', description: 'Voir les fiches ateliers et grossistes' },
  'suppliers.create': { name: 'Créer des fournisseurs', category: 'Fournisseurs', description: 'Ajouter un nouveau fournisseur' },
  'suppliers.update': { name: 'Modifier les fournisseurs', category: 'Fournisseurs', description: 'Mettre à jour les contacts fournisseurs' },
  'suppliers.delete': { name: 'Supprimer des fournisseurs', category: 'Fournisseurs', description: 'Supprimer un fournisseur' },

  // Dépenses
  'expenses.read': { name: 'Consulter les dépenses', category: 'Finances', description: 'Voir le journal des charges d’exploitation' },
  'expenses.create': { name: 'Enregistrer une dépense', category: 'Finances', description: 'Saisir un décaissement (loyer, factures...)' },
  'expenses.update': { name: 'Modifier une dépense', category: 'Finances', description: 'Corriger une écriture de charge' },
  'expenses.delete': { name: 'Supprimer une dépense', category: 'Finances', description: 'Annuler une écriture comptable' },

  // Rapports
  'reports.operational': { name: 'Indicateurs opérationnels', category: 'Rapports', description: 'Nombre de commandes, alertes réassort' },
  'reports.financial': { name: 'Rapports financiers & marges', category: 'Rapports', description: 'Chiffre d’affaires, bénéfices nets et marges' },
  'reports.export': { name: 'Exporter les bilans (CSV / PDF)', category: 'Rapports', description: 'Télécharger les bilans comptables et ventes' },

  // Équipe
  'members.read': { name: 'Consulter l’équipe', category: 'Équipe & Sécurité', description: 'Voir la liste des employés et leurs statuts' },
  'members.invite': { name: 'Inviter un employé', category: 'Équipe & Sécurité', description: 'Créer une invitation sécurisée pour un collaborateur' },
  'members.update_role': { name: 'Modifier rôles & droits', category: 'Équipe & Sécurité', description: 'Changer les attributions et permissions' },
  'members.suspend': { name: 'Suspendre un employé', category: 'Équipe & Sécurité', description: 'Bloquer temporairement l’accès d’un employé' },
  'members.remove': { name: 'Retirer un employé', category: 'Équipe & Sécurité', description: 'Révoquer définitivement l’accès à la boutique' },

  // Paramètres & Facturation
  'store.settings': { name: 'Paramètres boutique', category: 'Administration', description: 'Modifier coordonnées et options de la boutique' },
  'store.billing': { name: 'Gestion de l’abonnement', category: 'Administration', description: 'Changer de formule SaaS et facturation' },

  // Aliases legacy
  view_products: { name: 'Consulter les produits (alias)', category: 'Catalogue', description: 'Accès catalogue' },
  create_products: { name: 'Créer des produits (alias)', category: 'Catalogue', description: 'Ajout catalogue' },
  edit_products: { name: 'Modifier les produits (alias)', category: 'Catalogue', description: 'Modification article' },
  delete_products: { name: 'Supprimer des produits (alias)', category: 'Catalogue', description: 'Suppression article' },
  view_stock: { name: 'Consulter le stock (alias)', category: 'Inventaire', description: 'Voir le stock' },
  adjust_stock: { name: 'Ajuster les stocks (alias)', category: 'Inventaire', description: 'Modifier le stock' },
  create_sale: { name: 'Enregistrer une vente (alias)', category: 'Ventes', description: 'Vente en caisse' },
  refund_sale: { name: 'Annuler / Rembourser (alias)', category: 'Ventes', description: 'Remboursement' },
  view_sales: { name: 'Consulter les ventes (alias)', category: 'Ventes', description: 'Historique des ventes' },
  view_financials: { name: 'Consulter les finances (alias)', category: 'Finances', description: 'CA et marges' },
  view_expenses: { name: 'Consulter les dépenses (alias)', category: 'Finances', description: 'Charges' },
  view_clients: { name: 'Consulter les clients (alias)', category: 'Clients', description: 'Carnet clients' },
  manage_clients: { name: 'Gérer les clients (alias)', category: 'Clients', description: 'Gestion CRM' },
  export_data: { name: 'Exporter les données (alias)', category: 'Rapports', description: 'Export CSV / PDF' },
  manage_employees: { name: 'Gérer les employés (alias)', category: 'Équipe', description: 'Administration équipe' },
  edit_employee_roles: { name: 'Modifier les rôles (alias)', category: 'Équipe', description: 'Gestion des rôles' },
  suspend_member: { name: 'Suspendre un membre (alias)', category: 'Équipe', description: 'Suspension' },
  edit_store_settings: { name: 'Paramètres boutique (alias)', category: 'Administration', description: 'Paramètres' },
  manage_subscription: { name: 'Gérer l’abonnement (alias)', category: 'Administration', description: 'Abonnement' },
  apply_discounts: { name: 'Accorder remises (alias)', category: 'Ventes', description: 'Remises en caisse' },
  close_cash_register: { name: 'Clôture de caisse (alias)', category: 'Caisse', description: 'Z de caisse' },
};

/**
 * Restrictions fondamentales strictes qui ne peuvent JAMAIS être surmontées par des permissions personnalisées.
 */
export const CRITICAL_SECURITY_BOUNDS = {
  // Rôles qui ne peuvent jamais être assignés par des admins ordinaires
  FORBIDDEN_TARGET_ROLES: ['superadmin', 'owner', 'platform_admin'] as UserRole[],
  // Permissions réservées au propriétaire absolu
  OWNER_ONLY_PERMISSIONS: ['store.billing', 'manage_subscription'] as PermissionKey[],
};

/**
 * Vérifie si l'utilisateur est le Super Administrateur / Propriétaire autorisé de la plateforme SaaS
 * RÈGLE STRICTE : Les propriétaires de boutique (role: 'owner', id: 'user-owner') et leurs employés
 * NE SONT JAMAIS Super Admin de la plateforme. Seul abdourahmanebathily1@gmail.com ou les rôles
 * explicitement 'superadmin' / 'platform_admin' y ont accès.
 */
export function isPlatformSuperAdmin(
  user: UserAccount | { id?: string | null; email?: string | null; role?: string | null; status?: string | null } | null | undefined
): boolean {
  if (!user) return false;
  if (user.status === 'suspended') return false;

  // Rejet catégorique pour le compte boutique user-owner
  if ((user as any).id === 'user-owner') return false;

  const email = (user.email || '').trim().toLowerCase();
  const isSovereignEmail = email === 'abdourahmanebathily1@gmail.com';

  // Si c'est un propriétaire de boutique ordinaire (owner), refus strict
  if (user.role === 'owner' && !isSovereignEmail) {
    return false;
  }

  // Si c'est un employé ordinaire de boutique (admin, manager, cashier, etc.), refus strict
  if (['admin', 'manager', 'cashier', 'seller', 'stock_manager', 'accountant', 'delivery'].includes(user.role as string) && !isSovereignEmail) {
    return false;
  }

  return (
    isSovereignEmail ||
    user.role === 'superadmin' ||
    user.role === 'platform_admin'
  );
}

/**
 * Fonction centrale de vérification granulaire des permissions (Zero-Trust)
 * RÈGLE FONDAMENTALE : Refus par défaut. Toute permission non accordée est refusée.
 */
export function checkUserPermission(
  user: UserAccount | null | undefined,
  permission: PermissionKey,
  memberOverride?: StoreMember | null
): boolean {
  if (!user) return false;

  // 1. Un utilisateur inactif ou suspendu est immédiatement bloqué
  if (user.status !== 'active') return false;

  // 2. Si un StoreMember existe pour la boutique active, vérifier son statut
  if (memberOverride && memberOverride.status !== 'active') {
    return false;
  }

  // 3. Super-Admin SaaS (Accès plateforme réservé)
  if (user.role === 'superadmin' || user.role === 'platform_admin') {
    // Ne reçoit pas arbitrairement tous les droits métiers d'une boutique (Règle G)
    const platformPerms = ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.platform_admin;
    return platformPerms.includes(permission);
  }

  // 4. Propriétaire de sa boutique (Owner a tous les droits sur sa boutique)
  if (user.role === 'owner') {
    return true;
  }

  // 5. Cas des permissions supplémentaires explicites (Custom permissions)
  if (memberOverride && Array.isArray(memberOverride.customPermissions)) {
    // Si la permission est réservée au propriétaire (ex: store.billing), un employé ne peut pas l'avoir
    if (CRITICAL_SECURITY_BOUNDS.OWNER_ONLY_PERMISSIONS.includes(permission)) {
      return false;
    }

    // Vérifier si la permission exacte est accordée
    if (memberOverride.customPermissions.includes(permission)) {
      return true;
    }

    // Vérifier les alias
    const aliases = PERMISSION_ALIASES[permission] || [];
    for (const alias of aliases) {
      if (memberOverride.customPermissions.includes(alias)) {
        return true;
      }
    }
  }

  // 6. Rôle effectif (soit depuis StoreMember, soit depuis UserAccount)
  const effectiveRole: UserRole = memberOverride ? memberOverride.role : user.role;

  // Cas spécifique exigé par le cahier des charges :
  // Le gestionnaire de stock (stock_manager) ne peut PAS créer de produits par défaut !
  // Seul un customPermissions contenant 'products.create' peut l'autoriser.
  if (effectiveRole === 'stock_manager' && (permission === 'products.create' || permission === 'create_products')) {
    return false;
  }

  // Le comptable (accountant) ne peut JAMAIS créer de produit (Cas obligatoire spécifié)
  if (effectiveRole === 'accountant' && (permission === 'products.create' || permission === 'create_products' || permission === 'products.update' || permission === 'edit_products' || permission === 'products.delete' || permission === 'delete_products')) {
    return false;
  }

  // Le caissier ne peut pas modifier les prix ni créer de produits
  if (effectiveRole === 'cashier' && (permission === 'products.create' || permission === 'create_products' || permission === 'products.update' || permission === 'edit_products' || permission === 'products.delete' || permission === 'delete_products')) {
    return false;
  }

  // Récupérer les permissions par défaut du rôle
  const rolePerms = ROLE_PERMISSIONS[effectiveRole] || [];
  if (rolePerms.includes(permission)) {
    return true;
  }

  // Vérifier via alias de compatibilité
  const aliases = PERMISSION_ALIASES[permission] || [];
  for (const alias of aliases) {
    if (rolePerms.includes(alias)) {
      return true;
    }
  }

  return false;
}

/**
 * Hashing cryptographique Web Crypto API
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function generateSecureToken(byteLength = 16): string {
  const array = new Uint8Array(byteLength);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}
