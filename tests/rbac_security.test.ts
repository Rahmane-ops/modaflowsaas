/**
 * RBAC & Granular Security Test Suite
 * Tests all 8 security invariants, least privilege matrices, and boundary enforcement
 */
import { 
  checkUserPermission, 
  CRITICAL_SECURITY_BOUNDS 
} from '../src/services/securityService';
import { UserAccount, StoreMember, UserRole } from '../src/types';

// Simple test harness
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
    failedTests++;
  }
}

function createMockUser(
  id: string,
  email: string,
  name: string,
  role: UserRole,
  status: 'active' | 'suspended' = 'active'
): UserAccount {
  return {
    id,
    email,
    name,
    role,
    status,
    phone: '+221 77 123 45 67',
    title: 'Collaborateur',
    avatar: '👤',
    emailVerified: true,
    createdAt: '2026-10-01',
    storeIds: ['boutique_test_1'],
  };
}

function createMockMember(
  id: string,
  userId: string,
  role: UserRole,
  name: string,
  email: string,
  customPermissions: any[] = []
): StoreMember {
  return {
    id,
    userId,
    storeId: 'boutique_test_1',
    role,
    name,
    email,
    phone: '+221 77 123 45 67',
    title: 'Membre',
    avatar: '👤',
    status: 'active',
    customPermissions,
    joinedAt: '2026-10-01',
  };
}

console.log('=== LANCEMENT DE LA SUITE DE TESTS RBAC & SÉCURITÉ ===\n');

// 1. Tests Comptable (accountant)
console.log('--- 1. Rôle Comptable (accountant) ---');
const accountantUser = createMockUser('user_acc_1', 'comptable@modaflow.sn', 'Fatou Sow', 'accountant');

assert(
  !checkUserPermission(accountantUser, 'products.create'),
  'Le comptable ne peut JAMAIS créer de produit (products.create refusé)'
);
assert(
  !checkUserPermission(accountantUser, 'products.update'),
  'Le comptable ne peut pas modifier de produit (products.update refusé)'
);
assert(
  !checkUserPermission(accountantUser, 'products.delete'),
  'Le comptable ne peut pas supprimer de produit (products.delete refusé)'
);
assert(
  !checkUserPermission(accountantUser, 'sales.create'),
  'Le comptable ne peut pas enregistrer de vente en caisse (sales.create refusé)'
);
assert(
  !checkUserPermission(accountantUser, 'store.billing'),
  "Le comptable ne peut pas modifier l'abonnement du SaaS (store.billing refusé)"
);
assert(
  checkUserPermission(accountantUser, 'expenses.create'),
  'Le comptable peut enregistrer des dépenses (expenses.create accordé)'
);
assert(
  checkUserPermission(accountantUser, 'reports.financial'),
  'Le comptable peut consulter les rapports financiers (reports.financial accordé)'
);
assert(
  checkUserPermission(accountantUser, 'reports.export'),
  'Le comptable peut exporter les rapports financiers (reports.export accordé)'
);

// 2. Tests Caissier (cashier)
console.log('\n--- 2. Rôle Caissier (cashier) ---');
const cashierUser = createMockUser('user_cash_1', 'caissier@modaflow.sn', 'Moussa Diop', 'cashier');

assert(
  checkUserPermission(cashierUser, 'sales.create'),
  'Le caissier peut enregistrer une vente en caisse (sales.create accordé)'
);
assert(
  checkUserPermission(cashierUser, 'products.read'),
  'Le caissier peut consulter les produits (products.read accordé)'
);
assert(
  !checkUserPermission(cashierUser, 'products.create'),
  'Le caissier ne peut pas créer de produits (products.create refusé)'
);
assert(
  !checkUserPermission(cashierUser, 'products.update'),
  'Le caissier ne peut pas modifier les prix ou caractéristiques (products.update refusé)'
);
assert(
  !checkUserPermission(cashierUser, 'inventory.adjust'),
  'Le caissier ne peut pas modifier les stocks manuellement (inventory.adjust refusé)'
);
assert(
  !checkUserPermission(cashierUser, 'reports.financial'),
  'Le caissier ne peut pas consulter les bénéfices ni marges (reports.financial refusé)'
);
assert(
  !checkUserPermission(cashierUser, 'sales.refund'),
  'Le caissier ne peut pas effectuer de remboursement par défaut (sales.refund refusé)'
);

// 3. Tests Gestionnaire de Stock (stock_manager)
console.log('\n--- 3. Rôle Gestionnaire de Stock (stock_manager) ---');
const stockUser = createMockUser('user_stock_1', 'stock@modaflow.sn', 'Ibrahima Ba', 'stock_manager');

assert(
  checkUserPermission(stockUser, 'inventory.read'),
  'Le gestionnaire de stock peut consulter les stocks (inventory.read accordé)'
);
assert(
  checkUserPermission(stockUser, 'inventory.adjust'),
  'Le gestionnaire de stock peut ajuster les stocks (inventory.adjust accordé)'
);
assert(
  checkUserPermission(stockUser, 'inventory.receive'),
  'Le gestionnaire de stock peut réceptionner les réassorts (inventory.receive accordé)'
);
assert(
  !checkUserPermission(stockUser, 'products.create'),
  'Par défaut, le gestionnaire de stock NE PEUT PAS créer de vêtement'
);
assert(
  !checkUserPermission(stockUser, 'sales.create'),
  'Le gestionnaire de stock ne peut pas enregistrer de vente'
);
assert(
  !checkUserPermission(stockUser, 'expenses.create'),
  'Le gestionnaire de stock ne peut pas enregistrer de dépense'
);
assert(
  !checkUserPermission(stockUser, 'reports.financial'),
  'Le gestionnaire de stock ne peut pas consulter les bénéfices et marges'
);

// Cas custom permission pour stock_manager: si le propriétaire lui accorde explicitement 'products.create'
const stockMemberWithCreate = createMockMember(
  'mem_stock_1',
  'user_stock_1',
  'stock_manager',
  'Ibrahima Ba',
  'stock@modaflow.sn',
  ['products.create']
);
assert(
  checkUserPermission(stockUser, 'products.create', stockMemberWithCreate),
  'Le gestionnaire de stock PEUT créer un produit si la permission explicite products.create lui a été accordée'
);

// 4. Tests Gérant (manager)
console.log('\n--- 4. Rôle Gérant (manager) ---');
const managerUser = createMockUser('user_mgr_1', 'gerant@modaflow.sn', 'Aminata Ndiaye', 'manager');

assert(
  checkUserPermission(managerUser, 'products.read'),
  'Le gérant peut consulter les produits'
);
assert(
  checkUserPermission(managerUser, 'products.create'),
  'Le gérant peut créer des produits par défaut'
);
assert(
  checkUserPermission(managerUser, 'sales.create'),
  'Le gérant peut enregistrer des ventes'
);
assert(
  !checkUserPermission(managerUser, 'members.update_role'),
  'Le gérant ne peut pas modifier les rôles des employés par défaut'
);
assert(
  !checkUserPermission(managerUser, 'store.settings'),
  'Le gérant ne peut pas modifier les paramètres de sécurité par défaut'
);
assert(
  !checkUserPermission(managerUser, 'store.billing'),
  "Le gérant ne peut pas gérer l'abonnement SaaS"
);

// 5. Tests Administrateur de Boutique (admin)
console.log('\n--- 5. Rôle Administrateur Boutique (admin) ---');
const adminUser = createMockUser('user_adm_1', 'admin@modaflow.sn', 'Ousmane Fall', 'admin');

assert(
  checkUserPermission(adminUser, 'products.create'),
  "L'admin boutique peut créer des produits"
);
assert(
  checkUserPermission(adminUser, 'products.delete'),
  "L'admin boutique peut supprimer des produits"
);
assert(
  checkUserPermission(adminUser, 'members.invite'),
  "L'admin boutique peut inviter des membres"
);
assert(
  !checkUserPermission(adminUser, 'store.billing'),
  "L'admin boutique NE PEUT PAS gérer l'abonnement (réservé owner)"
);

// 6. Tests Propriétaire (owner)
console.log('\n--- 6. Rôle Propriétaire (owner) ---');
const ownerUser = createMockUser('user_owner_1', 'owner@modaflow.sn', 'Abdourahmane Bathily', 'owner');

assert(
  checkUserPermission(ownerUser, 'store.billing'),
  'Le propriétaire a un contrôle total sur le billing de sa boutique'
);
assert(
  checkUserPermission(ownerUser, 'products.delete'),
  'Le propriétaire peut supprimer des produits'
);
assert(
  checkUserPermission(ownerUser, 'members.remove'),
  'Le propriétaire peut retirer des employés'
);

// 7. Tests Super-Admin SaaS (platform_admin)
console.log('\n--- 7. Rôle Super-Admin SaaS (platform_admin) ---');
const platformAdminUser = createMockUser('user_super_1', 'superadmin@modaflow.sn', 'Root Platform', 'platform_admin');

assert(
  checkUserPermission(platformAdminUser, 'reports.operational'),
  'Le platform_admin peut voir les métriques techniques globales'
);
assert(
  !checkUserPermission(platformAdminUser, 'sales.create'),
  'Le platform_admin ne reçoit PAS arbitrairement le droit de vendre en boutique'
);
assert(
  !checkUserPermission(platformAdminUser, 'products.create'),
  'Le platform_admin ne crée pas de produits dans les boutiques sans privilège explicite'
);

// 8. Tests Coupure Immédiate & Utilisateur Suspendu
console.log('\n--- 8. Gestion des Suspensions & Révocations Immédiates ---');
const suspendedUser = createMockUser('user_susp_1', 'suspendu@modaflow.sn', 'Employé Suspendu', 'admin', 'suspended');

assert(
  !checkUserPermission(suspendedUser, 'products.read'),
  'Un utilisateur suspendu se voit refuser products.read immédiatement'
);
assert(
  !checkUserPermission(suspendedUser, 'sales.create'),
  'Un utilisateur suspendu se voit refuser sales.create immédiatement'
);

// 9. Tests Invariants Fondamentaux
console.log('\n--- 9. Invariants & Limites Critiques ---');
assert(
  CRITICAL_SECURITY_BOUNDS.FORBIDDEN_TARGET_ROLES.includes('owner') &&
  CRITICAL_SECURITY_BOUNDS.FORBIDDEN_TARGET_ROLES.includes('platform_admin'),
  'Les rôles owner et platform_admin sont protégés contre toute élévation ordinaire'
);

const nonExistentPerm = 'arbitrary.super.access' as any;
assert(
  !checkUserPermission(cashierUser, nonExistentPerm),
  'Default-deny : toute permission inexistante ou inconnue est strictement refusée'
);

console.log(`\n========================================`);
console.log(`RÉSULTATS DE LA SUITE DE TESTS :`);
console.log(`Tests réussis : ${passedTests}`);
console.log(`Tests échoués : ${failedTests}`);
console.log(`========================================\n`);

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('✅ TOUTES LES VÉRIFICATIONS RBAC ONT RÉUSSI AVEC SUCCÈS.');
  process.exit(0);
}
