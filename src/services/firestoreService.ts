import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot, 
  runTransaction,
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { 
  BoutiqueTenant, 
  ClothingItem, 
  Order, 
  Client, 
  Transaction, 
  CashRegisterClosing, 
  AuditLog, 
  UserAccount,
  PaymentMethod,
  OrderItem
} from '../types';

/**
 * Real-time listener for user's boutiques
 */
export const subscribeToUserBoutiques = (
  userId: string,
  userEmail: string | null | undefined,
  onUpdate: (boutiques: BoutiqueTenant[]) => void,
  onError?: (err: any) => void
): Unsubscribe => {
  if (!auth.currentUser) {
    return () => {};
  }
  const cleanEmail = (userEmail || '').trim().toLowerCase();
  const isSuper = cleanEmail === 'abdourahmanebathily1@gmail.com';

  try {
    const boutiquesCol = collection(db, 'boutiques');
    // Listen to boutiques
    const unsub = onSnapshot(
      boutiquesCol,
      (snapshot) => {
        const list: BoutiqueTenant[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as BoutiqueTenant;
          const bOwnerEmail = (data.ownerEmail || '').trim().toLowerCase();
          const bOwnerId = data.ownerId;
          // Filter: only include boutiques owned by this user or email (superadmin sees all)
          if (isSuper || bOwnerId === userId || (cleanEmail && bOwnerEmail === cleanEmail)) {
            list.push({ ...data, id: d.id });
          }
        });
        onUpdate(list);
      },
      (error) => {
        if (!auth.currentUser) return;
        console.error('Error fetching boutiques:', error);
        if (onError) onError(error);
      }
    );
    return unsub;
  } catch (err) {
    console.error('Failed to set up boutique subscription:', err);
    return () => {};
  }
};

/**
 * Find all boutiques owned by or associated with an email address or user ID
 */
export const findBoutiquesByEmailOrId = async (
  email: string,
  userId?: string
): Promise<BoutiqueTenant[]> => {
  const cleanEmail = email.trim().toLowerCase();
  const results: BoutiqueTenant[] = [];

  // Check Cloud Firestore if user is authenticated
  if (auth.currentUser) {
    try {
      const boutiquesCol = collection(db, 'boutiques');
      const snap = await getDocs(boutiquesCol);
      snap.forEach((d) => {
        const data = d.data() as BoutiqueTenant;
        const bOwnerEmail = (data.ownerEmail || '').trim().toLowerCase();
        const bOwnerId = data.ownerId;
        if (
          (bOwnerEmail && bOwnerEmail === cleanEmail) ||
          (userId && bOwnerId === userId)
        ) {
          results.push({ ...data, id: d.id });
        }
      });
    } catch (err) {
      console.warn('[findBoutiquesByEmailOrId] Notice Firestore scan:', err);
    }
  }

  // Also check local storage custom boutiques
  try {
    const localRaw = localStorage.getItem('modaflow_custom_boutiques');
    if (localRaw) {
      const localBtqs: BoutiqueTenant[] = JSON.parse(localRaw);
      for (const b of localBtqs) {
        const bEmail = (b.ownerEmail || '').trim().toLowerCase();
        if (
          ((bEmail && bEmail === cleanEmail) || (userId && b.ownerId === userId)) &&
          !results.some((r) => r.id === b.id)
        ) {
          results.push(b);
        }
      }
    }
  } catch {}

  // Initial seed demo boutique: only for seed user aissatou@modaflow.com
  if (cleanEmail === 'aissatou@modaflow.com' && !results.some((r) => r.id === 'btq-1')) {
    results.push({
      id: 'btq-1',
      name: 'ModaFlow Atelier & Prêt-à-Porter',
      city: 'Dakar',
      country: 'Sénégal',
      phone: '+221 33 821 44 00',
      currency: 'FCFA',
      planId: 'pro',
      subscriptionStatus: 'actif',
      subscriptionExpiresAt: '2026-11-16',
      daysRemaining: 30,
      autoRenew: true,
      createdAt: '2026-10-16',
      ownerEmail: 'aissatou@modaflow.com',
      ownerId: 'user-owner',
      ownerName: 'Aïssatou Ba',
    });
  }

  return results;
};

/**
 * Real-time listener for clothes in active boutique
 */
export const subscribeToBoutiqueClothes = (
  boutiqueId: string,
  onUpdate: (items: ClothingItem[]) => void,
  onError?: (err: any) => void
): Unsubscribe => {
  if (!auth.currentUser) {
    return () => {};
  }
  try {
    const clothesCol = collection(db, 'clothes');
    const q = query(clothesCol, where('boutiqueId', '==', boutiqueId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: ClothingItem[] = [];
        snapshot.forEach((d) => {
          list.push({ ...(d.data() as ClothingItem), id: d.id });
        });
        onUpdate(list);
      },
      (error) => {
        if (!auth.currentUser) return;
        console.error('Error in clothes listener:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe to clothes:', err);
    return () => {};
  }
};

/**
 * Real-time listener for orders in active boutique
 */
export const subscribeToBoutiqueOrders = (
  boutiqueId: string,
  onUpdate: (orders: Order[]) => void,
  onError?: (err: any) => void
): Unsubscribe => {
  if (!auth.currentUser) {
    return () => {};
  }
  try {
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, where('boutiqueId', '==', boutiqueId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Order[] = [];
        snapshot.forEach((d) => {
          list.push({ ...(d.data() as Order), id: d.id });
        });
        // Sort descending by createdAt or date
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onUpdate(list);
      },
      (error) => {
        if (!auth.currentUser) return;
        console.error('Error in orders listener:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe to orders:', err);
    return () => {};
  }
};

/**
 * Real-time listener for clients in active boutique
 */
export const subscribeToBoutiqueClients = (
  boutiqueId: string,
  onUpdate: (clients: Client[]) => void,
  onError?: (err: any) => void
): Unsubscribe => {
  if (!auth.currentUser) {
    return () => {};
  }
  try {
    const clientsCol = collection(db, 'clients');
    const q = query(clientsCol, where('boutiqueId', '==', boutiqueId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Client[] = [];
        snapshot.forEach((d) => {
          list.push({ ...(d.data() as Client), id: d.id });
        });
        onUpdate(list);
      },
      (error) => {
        if (!auth.currentUser) return;
        console.error('Error in clients listener:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe to clients:', err);
    return () => {};
  }
};

/**
 * Real-time listener for transactions in active boutique
 */
export const subscribeToBoutiqueTransactions = (
  boutiqueId: string,
  onUpdate: (transactions: Transaction[]) => void,
  onError?: (err: any) => void
): Unsubscribe => {
  if (!auth.currentUser) {
    return () => {};
  }
  try {
    const trxCol = collection(db, 'transactions');
    const q = query(trxCol, where('boutiqueId', '==', boutiqueId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Transaction[] = [];
        snapshot.forEach((d) => {
          list.push({ ...(d.data() as Transaction), id: d.id });
        });
        list.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
        onUpdate(list);
      },
      (error) => {
        if (!auth.currentUser) return;
        console.error('Error in transactions listener:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe to transactions:', err);
    return () => {};
  }
};

/**
 * Real-time listener for cash closings in active boutique
 */
export const subscribeToBoutiqueCashClosings = (
  boutiqueId: string,
  onUpdate: (closings: CashRegisterClosing[]) => void,
  onError?: (err: any) => void
): Unsubscribe => {
  if (!auth.currentUser) {
    return () => {};
  }
  try {
    const closingsCol = collection(db, 'cash_closings');
    const q = query(closingsCol, where('storeId', '==', boutiqueId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: CashRegisterClosing[] = [];
        snapshot.forEach((d) => {
          list.push({ ...(d.data() as CashRegisterClosing), id: d.id });
        });
        list.sort((a, b) => (b.closedAt || '').localeCompare(a.closedAt || ''));
        onUpdate(list);
      },
      (error) => {
        if (!auth.currentUser) return;
        console.error('Error in cash closings listener:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe to cash closings:', err);
    return () => {};
  }
};

/**
 * Real-time listener for audit logs in active boutique
 */
export const subscribeToBoutiqueAuditLogs = (
  boutiqueId: string,
  onUpdate: (logs: AuditLog[]) => void,
  onError?: (err: any) => void
): Unsubscribe => {
  if (!auth.currentUser) {
    return () => {};
  }
  try {
    const logsCol = collection(db, 'audit_logs');
    const q = query(logsCol, where('boutiqueId', '==', boutiqueId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: AuditLog[] = [];
        snapshot.forEach((d) => {
          list.push({ ...(d.data() as AuditLog), id: d.id });
        });
        list.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
        onUpdate(list);
      },
      (error) => {
        if (!auth.currentUser) return;
        console.error('Error in audit logs listener:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe to audit logs:', err);
    return () => {};
  }
};

// -------------------------------------------------------------
// FIRESTORE MUTATIONS WITH ATOMIC TRANSACTIONS
// -------------------------------------------------------------

/**
 * Strips all `undefined` fields recursively so Cloud Firestore never throws
 * "Unsupported field value: undefined"
 */
export const sanitizeForFirestore = <T>(data: T): T => {
  if (data === null || data === undefined) return null as any;
  return JSON.parse(JSON.stringify(data));
};

/**
 * Save / Create a Boutique in Firestore
 */
export const saveBoutiqueToFirestore = async (boutique: BoutiqueTenant): Promise<void> => {
  if (!auth.currentUser) return;
  try {
    const docRef = doc(db, 'boutiques', boutique.id);
    await setDoc(docRef, sanitizeForFirestore(boutique), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `boutiques/${boutique.id}`);
  }
};

/**
 * Save / Update a Clothing product in Firestore
 */
export const saveClothingItemToFirestore = async (item: ClothingItem): Promise<void> => {
  if (!auth.currentUser) return;
  try {
    const docRef = doc(db, 'clothes', item.id);
    await setDoc(docRef, sanitizeForFirestore(item), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `clothes/${item.id}`);
  }
};

/**
 * Update partial clothing item
 */
export const updateClothingItemInFirestore = async (id: string, updates: Partial<ClothingItem>): Promise<void> => {
  if (!auth.currentUser) return;
  try {
    const docRef = doc(db, 'clothes', id);
    await updateDoc(docRef, sanitizeForFirestore(updates));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `clothes/${id}`);
  }
};

/**
 * Delete clothing product from Firestore
 */
export const deleteClothingItemFromFirestore = async (id: string): Promise<void> => {
  if (!auth.currentUser) return;
  try {
    const docRef = doc(db, 'clothes', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `clothes/${id}`);
  }
};

/**
 * ATOMIC SALE EXECUTION:
 * Writes Order + Updates Client + Deducts Product Stock + Records Transaction atomically!
 */
export const executeOrderSaleTransaction = async (params: {
  order: Order;
  cartItems: OrderItem[];
  boutiqueId: string;
  transactionRecord?: Transaction;
  clientRecord?: Client;
}): Promise<void> => {
  if (!auth.currentUser) return;
  const { order, cartItems, boutiqueId, transactionRecord, clientRecord } = params;

  try {
    await runTransaction(db, async (transaction) => {
      // 1. Check stock for each cloth item before decrementing
      for (const item of cartItems) {
        const clothRef = doc(db, 'clothes', item.clothingId);
        const clothSnap = await transaction.get(clothRef);
        if (clothSnap.exists()) {
          const currentStock = clothSnap.data().stock || 0;
          const newStock = Math.max(0, currentStock - item.quantity);
          transaction.update(clothRef, { stock: newStock });
        }
      }

      // 2. Write Order (Sanitized from undefined fields)
      const orderRef = doc(db, 'orders', order.id);
      transaction.set(orderRef, sanitizeForFirestore({ ...order, boutiqueId }));

      // 3. Write Client update if provided
      if (clientRecord) {
        const clientRef = doc(db, 'clients', clientRecord.id);
        transaction.set(clientRef, sanitizeForFirestore({ ...clientRecord, boutiqueId }), { merge: true });
      }

      // 4. Write Transaction if settled directly
      if (transactionRecord) {
        const trxRef = doc(db, 'transactions', transactionRecord.id);
        transaction.set(trxRef, sanitizeForFirestore({ ...transactionRecord, boutiqueId }));
      }
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `orders/${order.id}`);
  }
};

/**
 * Mark order as delivered and paid in Firestore with transaction record
 */
export const settleOrderInFirestore = async (params: {
  orderId: string;
  deliveredAt: string;
  driverName?: string;
  paymentMethod: PaymentMethod;
  transactionRecord: Transaction;
  boutiqueId: string;
}): Promise<void> => {
  if (!auth.currentUser) return;
  const { orderId, deliveredAt, driverName, paymentMethod, transactionRecord, boutiqueId } = params;

  try {
    const batch = writeBatch(db);

    const orderRef = doc(db, 'orders', orderId);
    batch.update(
      orderRef,
      sanitizeForFirestore({
        status: 'livre_paye',
        paymentStatus: 'solde',
        paymentMethod,
        deliveredAt: deliveredAt || new Date().toISOString(),
        ...(driverName ? { deliveryDriverName: driverName } : {}),
      })
    );

    const trxRef = doc(db, 'transactions', transactionRecord.id);
    batch.set(trxRef, sanitizeForFirestore({ ...transactionRecord, boutiqueId }));

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
  }
};

/**
 * Save or update a client in Firestore
 */
export const saveClientToFirestore = async (client: Client): Promise<void> => {
  if (!auth.currentUser) return;
  try {
    const docRef = doc(db, 'clients', client.id);
    await setDoc(docRef, sanitizeForFirestore(client), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `clients/${client.id}`);
  }
};

/**
 * Delete a client from Firestore
 */
export const deleteClientFromFirestore = async (clientId: string): Promise<void> => {
  if (!auth.currentUser) return;
  try {
    const docRef = doc(db, 'clients', clientId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `clients/${clientId}`);
  }
};

/**
 * Save a Transaction / Expense to Firestore
 */
export const saveTransactionToFirestore = async (transaction: Transaction): Promise<void> => {
  if (!auth.currentUser) return;
  try {
    const docRef = doc(db, 'transactions', transaction.id);
    await setDoc(docRef, sanitizeForFirestore(transaction), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `transactions/${transaction.id}`);
  }
};

/**
 * Delete a Transaction / Expense from Firestore
 */
export const deleteTransactionFromFirestore = async (transactionId: string): Promise<void> => {
  if (!auth.currentUser) return;
  try {
    const docRef = doc(db, 'transactions', transactionId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `transactions/${transactionId}`);
  }
};

/**
 * Save Cash Register Closing to Firestore
 */
export const saveCashClosingToFirestore = async (closing: CashRegisterClosing): Promise<void> => {
  if (!auth.currentUser) return;
  try {
    const docRef = doc(db, 'cash_closings', closing.id);
    await setDoc(docRef, sanitizeForFirestore(closing), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `cash_closings/${closing.id}`);
  }
};

/**
 * Save Audit Log to Firestore
 */
export const saveAuditLogToFirestore = async (log: AuditLog): Promise<void> => {
  if (!auth.currentUser) return;
  try {
    const docRef = doc(db, 'audit_logs', log.id);
    await setDoc(docRef, sanitizeForFirestore(log), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `audit_logs/${log.id}`);
  }
};

/**
 * Save User Profile to Firestore
 */
export const saveUserProfileToFirestore = async (user: UserAccount): Promise<void> => {
  if (!auth.currentUser) return;
  try {
    const docRef = doc(db, 'users', user.id);
    await setDoc(docRef, sanitizeForFirestore(user), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.id}`);
  }
};

/**
 * Get User Profile from Firestore
 */
export const getUserProfileFromFirestore = async (userId: string): Promise<UserAccount | null> => {
  if (!auth.currentUser) return null;
  try {
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserAccount;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${userId}`);
    return null;
  }
};

/**
 * Delete User Profile from Firestore (Super Admin only)
 */
export const deleteUserProfileFromFirestore = async (userId: string): Promise<void> => {
  if (!auth.currentUser) return;
  try {
    const docRef = doc(db, 'users', userId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
  }
};
