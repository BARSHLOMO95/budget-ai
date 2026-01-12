import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Category, TransactionType } from '../types';

/**
 * Default categories for new workspaces
 */
export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  // Income categories
  {
    type: 'income',
    group: 'fixed',
    label: 'משכורת',
    icon: '💰',
    color: '#10b981',
    order: 0,
    isDefault: true,
  },
  {
    type: 'income',
    group: 'variable',
    label: 'פרילנס',
    icon: '💼',
    color: '#3b82f6',
    order: 1,
    isDefault: true,
  },
  {
    type: 'income',
    group: 'variable',
    label: 'השקעות',
    icon: '📈',
    color: '#8b5cf6',
    order: 2,
    isDefault: true,
  },
  {
    type: 'income',
    group: 'variable',
    label: 'אחר',
    icon: '💵',
    color: '#06b6d4',
    order: 3,
    isDefault: true,
  },

  // Fixed expense categories
  {
    type: 'expense',
    group: 'fixed',
    label: 'שכר דירה',
    icon: '🏠',
    color: '#ef4444',
    order: 0,
    isDefault: true,
  },
  {
    type: 'expense',
    group: 'fixed',
    label: 'חשמל ומים',
    icon: '⚡',
    color: '#f59e0b',
    order: 1,
    isDefault: true,
  },
  {
    type: 'expense',
    group: 'fixed',
    label: 'אינטרנט וטלפון',
    icon: '📱',
    color: '#8b5cf6',
    order: 2,
    isDefault: true,
  },
  {
    type: 'expense',
    group: 'fixed',
    label: 'ביטוחים',
    icon: '🛡️',
    color: '#06b6d4',
    order: 3,
    isDefault: true,
  },
  {
    type: 'expense',
    group: 'fixed',
    label: 'הלוואות',
    icon: '🏦',
    color: '#dc2626',
    order: 4,
    isDefault: true,
  },

  // Variable expense categories
  {
    type: 'expense',
    group: 'variable',
    label: 'מזון וסופר',
    icon: '🛒',
    color: '#10b981',
    order: 5,
    isDefault: true,
  },
  {
    type: 'expense',
    group: 'variable',
    label: 'תחבורה',
    icon: '🚗',
    color: '#3b82f6',
    order: 6,
    isDefault: true,
  },
  {
    type: 'expense',
    group: 'variable',
    label: 'בילויים ואירוח',
    icon: '🎉',
    color: '#ec4899',
    order: 7,
    isDefault: true,
  },
  {
    type: 'expense',
    group: 'variable',
    label: 'בריאות',
    icon: '⚕️',
    color: '#f43f5e',
    order: 8,
    isDefault: true,
  },
  {
    type: 'expense',
    group: 'variable',
    label: 'חינוך',
    icon: '📚',
    color: '#6366f1',
    order: 9,
    isDefault: true,
  },
  {
    type: 'expense',
    group: 'variable',
    label: 'ביגוד',
    icon: '👕',
    color: '#a855f7',
    order: 10,
    isDefault: true,
  },
  {
    type: 'expense',
    group: 'variable',
    label: 'קניות',
    icon: '🛍️',
    color: '#f97316',
    order: 11,
    isDefault: true,
  },
  {
    type: 'expense',
    group: 'variable',
    label: 'שונות',
    icon: '📦',
    color: '#64748b',
    order: 12,
    isDefault: true,
  },
];

/**
 * Initialize default categories for a workspace
 */
export async function initializeDefaultCategories(
  workspaceId: string
): Promise<void> {
  const batch = writeBatch(db);

  DEFAULT_CATEGORIES.forEach((category) => {
    const categoryRef = doc(collection(db, 'categories'));
    batch.set(categoryRef, {
      ...category,
      workspaceId,
    });
  });

  await batch.commit();
}

/**
 * Get all categories for a workspace
 */
export async function getCategories(workspaceId: string): Promise<Category[]> {
  const categoriesQuery = query(
    collection(db, 'categories'),
    where('workspaceId', '==', workspaceId),
    orderBy('order', 'asc')
  );

  const snapshot = await getDocs(categoriesQuery);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      type: data.type,
      group: data.group,
      label: data.label,
      icon: data.icon,
      color: data.color,
      order: data.order,
      targetMonthly: data.targetMonthly,
      isDefault: data.isDefault,
    };
  });
}

/**
 * Get categories by type
 */
export async function getCategoriesByType(
  workspaceId: string,
  type: TransactionType
): Promise<Category[]> {
  const categoriesQuery = query(
    collection(db, 'categories'),
    where('workspaceId', '==', workspaceId),
    where('type', '==', type),
    orderBy('order', 'asc')
  );

  const snapshot = await getDocs(categoriesQuery);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      type: data.type,
      group: data.group,
      label: data.label,
      icon: data.icon,
      color: data.color,
      order: data.order,
      targetMonthly: data.targetMonthly,
      isDefault: data.isDefault,
    };
  });
}

/**
 * Create a new category
 */
export async function createCategory(
  workspaceId: string,
  category: Omit<Category, 'id'>
): Promise<string> {
  const categoryRef = doc(collection(db, 'categories'));

  await setDoc(categoryRef, {
    ...category,
    workspaceId,
  });

  return categoryRef.id;
}

/**
 * Update a category
 */
export async function updateCategory(
  categoryId: string,
  data: Partial<Category>
): Promise<void> {
  const categoryRef = doc(db, 'categories', categoryId);
  await updateDoc(categoryRef, data);
}

/**
 * Delete a category
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  const categoryRef = doc(db, 'categories', categoryId);
  await deleteDoc(categoryRef);
}

/**
 * Reorder categories
 */
export async function reorderCategories(
  categoryOrders: { id: string; order: number }[]
): Promise<void> {
  const batch = writeBatch(db);

  categoryOrders.forEach(({ id, order }) => {
    const categoryRef = doc(db, 'categories', id);
    batch.update(categoryRef, { order });
  });

  await batch.commit();
}
