# Spécification de Sécurité RBAC & Firestore (Zero-Trust)
## ModaFlow SaaS - Gestion Multi-Boutiques

### 1. Invariants de Données Fondamentaux

1. **Isolation Multi-Tenant (Boutique Isolation)** : Aucun utilisateur ne peut lire, créer, modifier ou supprimer des données appartenant à un autre `boutiqueId` que celui auquel il est formellement affecté.
2. **Intégrité des Rôles (Anti-Privilege Escalation)** : Un utilisateur ne peut jamais modifier son propre document `/users/{userId}` pour changer son rôle (`role`), son statut (`status`) ou s'auto-attribuer le rôle `owner` ou `platform_admin`.
3. **Protection du Propriétaire (Last Owner Protection)** : Il est interdit de révoquer, suspendre ou supprimer le dernier propriétaire d'une boutique.
4. **Cloisonnement Comptable (Accountant Restriction)** : Un comptable (`accountant`) a un accès strict en lecture/écriture financière (`expenses`, `reports`), mais a l'interdiction formelle de créer ou modifier un produit dans le catalogue (`clothes`), même via une requête API directe.
5. **Cloisonnement Caisse (Cashier Restriction)** : Un caissier (`cashier`) peut enregistrer des ventes en caisse, mais ne peut ni modifier les prix unitaires des produits, ni altérer le stock manuellement, ni consulter les marges bénéficiaires ou bilans financiers complets, ni procéder à des annulations ou remboursements sans la permission explicite `sales.cancel` / `sales.refund`.
6. **Cloisonnement Stock (Stock Manager Restriction)** : Un gestionnaire de stock (`stock_manager`) ne peut pas créer de nouveaux produits par défaut (nécessite l'attribution explicite de `products.create`), ne peut pas modifier les prix de vente, et ne peut pas effectuer d'annulation/remboursement de vente.
7. **Révocation Instantanée (Synchronous Member Revocation)** : Dès qu'un membre est marqué `status: 'suspended'` ou retiré de la boutique, tous ses accès aux sous-ressources (`clothes`, `orders`, `transactions`, `clients`) sont immédiatement rejetés.
8. **Immutabilité des Identifiants & Horodatages** : Les champs `id`, `boutiqueId`, `createdAt`, et `ownerId` sont strictement immutables après création.

---

### 2. The "Dirty Dozen" Payloads (Attaques & Payloads Malveillants)

Ces 12 payloads simulent des tentatives de contournement de l'interface graphique et d'escalade de privilèges :

1. **Payload 1 : Escalade de Rôle Utilisateur (Self-Promotion)**
   - *Acteur* : Caissier (`user-cashier`)
   - *Cible* : `/users/user-cashier`
   - *Payload* : `{ "role": "owner" }`
   - *Attendu* : `PERMISSION_DENIED` (L'utilisateur ne peut pas modifier son propre rôle).

2. **Payload 2 : Création de Produit par le Comptable (Accountant Product Injection)**
   - *Acteur* : Comptable (`user-accountant`)
   - *Cible* : `/clothes/cloth-hacked-1`
   - *Payload* : `{ "id": "cloth-hacked-1", "name": "Robe Illégale", "category": "robes", "price": 50000, "stock": 10, "boutiqueId": "btq-principal", "sku": "HCK-01" }`
   - *Attendu* : `PERMISSION_DENIED` (Le comptable n'a pas la permission `products.create`).

3. **Payload 3 : Altération des Prix de Vente par le Caissier (Price Tampering)**
   - *Acteur* : Caissier (`user-cashier`)
   - *Cible* : `/clothes/cloth-1`
   - *Payload* : `{ "price": 100 }` (Réduction de 45 000 F à 100 F)
   - *Attendu* : `PERMISSION_DENIED` (Le caissier n'a pas `products.update`).

4. **Payload 4 : Remboursement Illégal par le Gestionnaire de Stock (Unauthorized Refund)**
   - *Acteur* : Gestionnaire de stock (`user-stock`)
   - *Cible* : `/transactions/trx-refund-rogue`
   - *Payload* : `{ "id": "trx-refund-rogue", "type": "remboursement", "amount": -35000, "paymentMethod": "cash", "timestamp": "2026-10-22", "boutiqueId": "btq-principal" }`
   - *Attendu* : `PERMISSION_DENIED` (Le gestionnaire de stock n'a pas la permission de remboursement).

5. **Payload 5 : Lecture / Espionnage Inter-Boutique (Cross-Tenant Leak)**
   - *Acteur* : Employé de la boutique B (`user-tenant-b`)
   - *Cible* : `/orders/ord-tenant-a-1` (Boutique A)
   - *Payload* : `GET /orders/ord-tenant-a-1`
   - *Attendu* : `PERMISSION_DENIED` (Isolation stricte par `boutiqueId`).

6. **Payload 6 : Injection de Champs Fantômes (Shadow Update / Ghost Field)**
   - *Acteur* : Gérant (`user-seller`)
   - *Cible* : `/users/user-seller`
   - *Payload* : `{ "isSuperAdmin": true, "vipBypass": true }`
   - *Attendu* : `PERMISSION_DENIED` (Les schémas stricts rejettent les clés inconnues via `hasOnly`).

7. **Payload 7 : Altération de l'Identifiant de Boutique (Tenant Hijacking)**
   - *Acteur* : Administrateur boutique (`user-admin`)
   - *Cible* : `/clothes/cloth-1`
   - *Payload* : `{ "boutiqueId": "btq-autre-concurrent" }`
   - *Attendu* : `PERMISSION_DENIED` (`boutiqueId` est immutable : `incoming().boutiqueId == existing().boutiqueId`).

8. **Payload 8 : Création Non Autorisée d'un Produit par le Gestionnaire de Stock**
   - *Acteur* : Gestionnaire de stock (`user-stock` sans custom permission `products.create`)
   - *Cible* : `/clothes/cloth-stock-unauth`
   - *Payload* : `{ "id": "cloth-stock-unauth", "name": "Nouveau Vêtement", "category": "hauts", "price": 20000, "stock": 5, "boutiqueId": "btq-principal", "sku": "STK-99" }`
   - *Attendu* : `PERMISSION_DENIED` (Par défaut, le gestionnaire de stock ne peut pas créer de produits).

9. **Payload 9 : Suppression d'Employé par le Caissier (Unauthorized Member Deletion)**
   - *Acteur* : Caissier (`user-cashier`)
   - *Cible* : `/users/user-admin`
   - *Payload* : `DELETE /users/user-admin`
   - *Attendu* : `PERMISSION_DENIED` (Seul le propriétaire ou admin avec permission peut gérer l'équipe).

10. **Payload 10 : Modification de l'Abonnement SaaS par un Employé (Billing Escalation)**
    - *Acteur* : Gérant ou Caissier (`user-cashier`)
    - *Cible* : `/boutiques/btq-principal`
    - *Payload* : `{ "planId": "enterprise", "subscriptionStatus": "actif", "daysRemaining": 365 }`
    - *Attendu* : `PERMISSION_DENIED` (Réservé au propriétaire de la boutique avec `store.billing`).

11. **Payload 11 : Écriture par un Utilisateur Suspendu (Suspended User Action)**
    - *Acteur* : Ancien employé suspendu (`status: 'suspended'`)
    - *Cible* : `/orders/ord-new-suspended`
    - *Payload* : `{ "id": "ord-new-suspended", "totalAmount": 15000, "boutiqueId": "btq-principal", ... }`
    - *Attendu* : `PERMISSION_DENIED` (Vérification synchrone du statut actif).

12. **Payload 12 : Usurpation d'Identité Super-Admin Plateforme (Platform Admin Spoofing)**
    - *Acteur* : N'importe quel utilisateur régulier
    - *Cible* : `/users/user-regular`
    - *Payload* : `{ "role": "platform_admin" }`
    - *Attendu* : `PERMISSION_DENIED` (Aucun utilisateur ordinaire ne peut devenir platform_admin).
