import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Transaction, TransactionInput } from '../types';

/**
 * Create a new transaction
 */
export async function createTransaction(
  workspaceId: string,
  userId: string,
  data: TransactionInput
): Promise<string> {
  const transactionRef = doc(collection(db, 'transactions'));

  await setDoc(transactionRef, {
    workspaceId,
    type: data.type,
    amount: data.amount,
    categoryId: data.categoryId,
    description: data.description,
    date: Timestamp.fromDate(data.date),
    tags: data.tags || [],
    notes: data.notes || '',
    isRecurring: data.isRecurring || false,
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return transactionRef.id;
}

/**
 * Get transaction by ID
 */
export async function getTransaction(
  transactionId: string
): Promise<Transaction | null> {
  const transactionDoc = await getDoc(doc(db, 'transactions', transactionId));

  if (!transactionDoc.exists()) {
    return null;
  }

  const data = transactionDoc.data();
  return {
    id: transactionDoc.id,
    workspaceId: data.workspaceId,
    type: data.type,
    amount: data.amount,
    categoryId: data.categoryId,
    description: data.description,
    date: data.date?.toDate() || new Date(),
    tags: data.tags || [],
    notes: data.notes,
    isRecurring: data.isRecurring,
    recurringId: data.recurringId,
    createdBy: data.createdBy,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}

/**
 * Get transactions for a workspace
 */
export async function getTransactions(
  workspaceId: string,
  startDate?: Date,
  endDate?: Date,
  limitCount: number = 100
): Promise<Transaction[]> {
  let q = query(
    collection(db, 'transactions'),
    where('workspaceId', '==', workspaceId)
  );

  // Add date filters
  if (startDate) {
    q = query(q, where('date', '>=', Timestamp.fromDate(startDate)));
  }
  if (endDate) {
    q = query(q, where('date', '<=', Timestamp.fromDate(endDate)));
  }

  // Order by date descending
  q = query(q, orderBy('date', 'desc'), limit(limitCount));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      workspaceId: data.workspaceId,
      type: data.type,
      amount: data.amount,
      categoryId: data.categoryId,
      description: data.description,
      date: data.date?.toDate() || new Date(),
      tags: data.tags || [],
      notes: data.notes,
      isRecurring: data.isRecurring,
      recurringId: data.recurringId,
      createdBy: data.createdBy,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  });
}

/**
 * Get transactions by category
 */
export async function getTransactionsByCategory(
  workspaceId: string,
  categoryId: string,
  startDate?: Date,
  endDate?: Date
): Promise<Transaction[]> {
  let q = query(
    collection(db, 'transactions'),
    where('workspaceId', '==', workspaceId),
    where('categoryId', '==', categoryId)
  );

  if (startDate) {
    q = query(q, where('date', '>=', Timestamp.fromDate(startDate)));
  }
  if (endDate) {
    q = query(q, where('date', '<=', Timestamp.fromDate(endDate)));
  }

  q = query(q, orderBy('date', 'desc'));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      workspaceId: data.workspaceId,
      type: data.type,
      amount: data.amount,
      categoryId: data.categoryId,
      description: data.description,
      date: data.date?.toDate() || new Date(),
      tags: data.tags || [],
      notes: data.notes,
      isRecurring: data.isRecurring,
      recurringId: data.recurringId,
      createdBy: data.createdBy,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  });
}

/**
 * Update transaction
 */
export async function updateTransaction(
  transactionId: string,
  data: Partial<TransactionInput>
): Promise<void> {
  const transactionRef = doc(db, 'transactions', transactionId);
  const updateData: any = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  // Convert date to Timestamp if provided
  if (data.date) {
    updateData.date = Timestamp.fromDate(data.date);
  }

  await updateDoc(transactionRef, updateData);
}

/**
 * Delete transaction
 */
export async function deleteTransaction(transactionId: string): Promise<void> {
  const transactionRef = doc(db, 'transactions', transactionId);
  await deleteDoc(transactionRef);
}

/**
 * Delete multiple transactions
 */
export async function deleteTransactions(transactionIds: string[]): Promise<void> {
  const deletePromises = transactionIds.map((id) => deleteTransaction(id));
  await Promise.all(deletePromises);
}

/**
 * Get recent transactions
 */
export async function getRecentTransactions(
  workspaceId: string,
  limitCount: number = 10
): Promise<Transaction[]> {
  const q = query(
    collection(db, 'transactions'),
    where('workspaceId', '==', workspaceId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      workspaceId: data.workspaceId,
      type: data.type,
      amount: data.amount,
      categoryId: data.categoryId,
      description: data.description,
      date: data.date?.toDate() || new Date(),
      tags: data.tags || [],
      notes: data.notes,
      isRecurring: data.isRecurring,
      recurringId: data.recurringId,
      createdBy: data.createdBy,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  });
}

/**
 * Search transactions
 */
export async function searchTransactions(
  workspaceId: string,
  searchText: string
): Promise<Transaction[]> {
  // Note: Firestore doesn't support full-text search natively
  // This is a basic implementation - for production, consider using Algolia or similar
  const q = query(
    collection(db, 'transactions'),
    where('workspaceId', '==', workspaceId),
    orderBy('date', 'desc')
  );

  const snapshot = await getDocs(q);

  const searchLower = searchText.toLowerCase();

  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        workspaceId: data.workspaceId,
        type: data.type,
        amount: data.amount,
        categoryId: data.categoryId,
        description: data.description,
        date: data.date?.toDate() || new Date(),
        tags: data.tags || [],
        notes: data.notes,
        isRecurring: data.isRecurring,
        recurringId: data.recurringId,
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    })
    .filter(
      (tx) =>
        tx.description.toLowerCase().includes(searchLower) ||
        tx.notes?.toLowerCase().includes(searchLower)
    );
}

/**
 * Get transaction count for workspace
 */
export async function getTransactionCount(workspaceId: string): Promise<number> {
  const q = query(
    collection(db, 'transactions'),
    where('workspaceId', '==', workspaceId)
  );

  const snapshot = await getDocs(q);
  return snapshot.size;
}
