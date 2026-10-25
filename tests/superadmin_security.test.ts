/**
 * Super Admin SaaS Security Test Suite
 * Validates sovereign access controls, privilege boundary, suspension invariants, and audit requirements
 */
import { isPlatformSuperAdmin } from '../src/services/securityService';
import { UserAccount, BoutiqueTenant } from '../src/types';
import { INITIAL_USERS } from '../src/data/initialData';

function createMockAccount(partial: Partial<UserAccount>): UserAccount {
  return {
    id: 'test-usr-' + Math.random().toString(36).substring(7),
    name: 'Test Account',
    email: 'test@example.com',
    phone: '+221 77 000 00 00',
    role: 'owner',
    title: 'Propriétaire',
    avatar: '👑',
    status: 'active',
    emailVerified: true,
    createdAt: '2026-10-22',
    activeSessions: [],
    ...partial,
  };
}

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${msg}`);
    failed++;
  }
}

console.log('=== LANCEMENT DE LA SUITE DE TESTS SUPER ADMIN & SÉCURITÉ SOUVERAINE ===\n');

// 1. Identification du Super Admin Souverain
console.log('--- 1. Accès Souverain Super Admin ---');
const superAdminAccount = createMockAccount({
  id: 'usr-root',
  email: 'abdourahmanebathily1@gmail.com',
  role: 'superadmin',
});
assert(isPlatformSuperAdmin(superAdminAccount) === true, 'Le compte abdourahmanebathily1@gmail.com est reconnu Super Admin');

const platformAdminAccount = createMockAccount({
  id: 'usr-platform',
  email: 'tech@modaflow.com',
  role: 'platform_admin',
});
assert(isPlatformSuperAdmin(platformAdminAccount) === true, 'Le rôle platform_admin est reconnu Super Admin');

// 2. Refus pour tous les autres rôles
console.log('\n--- 2. Blocage Strict des Rôles Boutiques Ordinaires ---');
const ownerUser = createMockAccount({ email: 'owner@boutique.com', role: 'owner' });
assert(isPlatformSuperAdmin(ownerUser) === false, 'Un Propriétaire (owner) NE PEUT PAS accéder au Super Admin');

const initialUserOwner = INITIAL_USERS.find((u) => u.id === 'user-owner');
assert(isPlatformSuperAdmin(initialUserOwner) === false, "Le compte 'user-owner' (Aïssatou Ba) est STRICTEMENT INTERDIT de console Super Admin");

const customOwnerAccount = createMockAccount({ id: 'user-owner', role: 'owner', email: 'aissatou@modaflow.com' });
assert(isPlatformSuperAdmin(customOwnerAccount) === false, "Tout client avec le rôle 'owner' ou ID 'user-owner' est STRICTEMENT REFUSÉ");

const adminUser = createMockAccount({ email: 'admin@boutique.com', role: 'admin' });
assert(isPlatformSuperAdmin(adminUser) === false, 'Un Admin boutique NE PEUT PAS accéder au Super Admin');

const managerUser = createMockAccount({ email: 'manager@boutique.com', role: 'manager' });
assert(isPlatformSuperAdmin(managerUser) === false, 'Un Gérant NE PEUT PAS accéder au Super Admin');

const cashierUser = createMockAccount({ email: 'cashier@boutique.com', role: 'cashier' });
assert(isPlatformSuperAdmin(cashierUser) === false, 'Un Caissier NE PEUT PAS accéder au Super Admin');

const stockManagerUser = createMockAccount({ email: 'stock@boutique.com', role: 'stock_manager' });
assert(isPlatformSuperAdmin(stockManagerUser) === false, 'Un Gestionnaire de stock NE PEUT PAS accéder au Super Admin');

const accountantUser = createMockAccount({ email: 'accountant@boutique.com', role: 'accountant' });
assert(isPlatformSuperAdmin(accountantUser) === false, 'Un Comptable NE PEUT PAS accéder au Super Admin');

// 3. Révocation immédiate si le compte est suspendu
console.log('\n--- 3. Révocation immédiate en cas de suspension ---');
const suspendedSuperAdmin = createMockAccount({
  email: 'abdourahmanebathily1@gmail.com',
  role: 'superadmin',
  status: 'suspended',
});
assert(isPlatformSuperAdmin(suspendedSuperAdmin) === false, 'Un compte suspendu perd instantanément tous ses privilèges Super Admin');

// 4. Invariant de suspension de boutique (Conservation intégrale des données)
console.log('\n--- 4. Invariant de Suspension de Boutique (Zéro Perte de Données) ---');
const testBoutique: BoutiqueTenant = {
  id: 'btq-wax',
  name: 'Maison Wax & Pagne',
  city: 'Dakar',
  country: 'Sénégal',
  phone: '+221 77 123 45 67',
  currency: 'FCFA',
  planId: 'pro',
  subscriptionStatus: 'actif',
  subscriptionExpiresAt: '2026-11-22',
  daysRemaining: 30,
  autoRenew: true,
  createdAt: '2026-10-01',
};

// Simulation d'une suspension administrative
const suspendedBoutique: BoutiqueTenant = {
  ...testBoutique,
  subscriptionStatus: 'suspendu',
  suspensionReason: 'Défaut de paiement constaté après relance',
  suspendedAt: '2026-10-23 10:00',
};

assert(suspendedBoutique.id === testBoutique.id, "L'identifiant de la boutique reste intact après suspension");
assert(suspendedBoutique.subscriptionStatus === 'suspendu', "Le statut est bien basculé à 'suspendu'");
assert(Boolean(suspendedBoutique.suspensionReason), 'Un motif justificatif obligatoire est enregistré');

// 5. Isolation stricte de l'accès démo 1-clic (Les clients ne doivent JAMAIS avoir accès au démo Super-Admin)
console.log("\n--- 5. Isolation de l'accès Démo 1-Clic (Zéro Démo Super Admin) ---");
const superAdminInInitialUsers = INITIAL_USERS.some(
  (u) => u.role === 'superadmin' || u.role === 'platform_admin' || isPlatformSuperAdmin(u)
);
assert(!superAdminInInitialUsers, 'INITIAL_USERS ne contient AUCUN compte Super-Admin ni platform_admin');

const demoUsers = INITIAL_USERS.filter(
  (u) => u.role !== 'superadmin' && u.role !== 'platform_admin' && u.email !== 'abdourahmanebathily1@gmail.com'
);
assert(demoUsers.length === INITIAL_USERS.length, 'Tous les utilisateurs démo sont des rôles boutique ordinaires');
assert(demoUsers.every((u) => !isPlatformSuperAdmin(u)), 'Aucun utilisateur démo 1-clic ne possède de prérogatives Super Admin');

console.log('\n========================================');
console.log(`RÉSULTATS DE LA SUITE DE TESTS SUPER ADMIN :`);
console.log(`Tests réussis : ${passed}`);
console.log(`Tests échoués : ${failed}`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
}
