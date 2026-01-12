import {
  Transaction,
  TransactionFilters,
  MonthlySummary,
  CategorySummary,
  Category,
} from '../types';

/**
 * Filter transactions based on provided filters
 */
export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilters,
  categories: Category[]
): Transaction[] {
  let filtered = [...transactions];

  // Filter by type
  if (filters.type) {
    filtered = filtered.filter((tx) => tx.type === filters.type);
  }

  // Filter by category
  if (filters.categoryId) {
    filtered = filtered.filter((tx) => tx.categoryId === filters.categoryId);
  }

  // Filter by category group (fixed/variable)
  if (filters.categoryGroup) {
    const categoryIds = categories
      .filter((cat) => cat.group === filters.categoryGroup)
      .map((cat) => cat.id);
    filtered = filtered.filter((tx) => categoryIds.includes(tx.categoryId));
  }

  // Filter by date range
  if (filters.startDate) {
    filtered = filtered.filter((tx) => tx.date >= filters.startDate!);
  }
  if (filters.endDate) {
    filtered = filtered.filter((tx) => tx.date <= filters.endDate!);
  }

  // Filter by amount range
  if (filters.minAmount !== undefined) {
    filtered = filtered.filter((tx) => tx.amount >= filters.minAmount!);
  }
  if (filters.maxAmount !== undefined) {
    filtered = filtered.filter((tx) => tx.amount <= filters.maxAmount!);
  }

  // Filter by search text (case-insensitive)
  if (filters.searchText) {
    const searchLower = filters.searchText.toLowerCase();
    filtered = filtered.filter(
      (tx) =>
        tx.description.toLowerCase().includes(searchLower) ||
        tx.notes?.toLowerCase().includes(searchLower)
    );
  }

  // Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter((tx) =>
      tx.tags?.some((tag) => filters.tags!.includes(tag))
    );
  }

  return filtered;
}

/**
 * Calculate monthly summary from transactions
 */
export function calculateMonthlySummary(
  transactions: Transaction[],
  categories: Category[]
): MonthlySummary {
  const income = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const expenses = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Calculate fixed vs variable expenses
  const fixedCategoryIds = categories
    .filter((cat) => cat.type === 'expense' && cat.group === 'fixed')
    .map((cat) => cat.id);

  const fixedExpenses = transactions
    .filter((tx) => tx.type === 'expense' && fixedCategoryIds.includes(tx.categoryId))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const variableExpenses = expenses - fixedExpenses;

  const balance = income - expenses;
  const savingsRate = income > 0 ? (balance / income) * 100 : 0;

  return {
    income,
    expenses,
    balance,
    savingsRate,
    fixedExpenses,
    variableExpenses,
  };
}

/**
 * Calculate category breakdown with budget tracking
 */
export function calculateCategoryBreakdown(
  transactions: Transaction[],
  categories: Category[],
  type: 'income' | 'expense'
): CategorySummary[] {
  const relevantCategories = categories.filter((cat) => cat.type === type);
  const relevantTransactions = transactions.filter((tx) => tx.type === type);

  const totalAmount = relevantTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  const breakdown = relevantCategories.map((category) => {
    const categoryTransactions = relevantTransactions.filter(
      (tx) => tx.categoryId === category.id
    );

    const total = categoryTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const percentage = totalAmount > 0 ? (total / totalAmount) * 100 : 0;

    return {
      categoryId: category.id,
      categoryLabel: category.label,
      categoryIcon: category.icon,
      categoryColor: category.color,
      total,
      target: category.targetMonthly,
      percentage,
      transactionCount: categoryTransactions.length,
    };
  });

  // Sort by total amount descending
  return breakdown.sort((a, b) => b.total - a.total);
}

/**
 * Format currency amount in ILS
 */
export function formatCurrency(amount: number, currency = 'ILS'): string {
  if (currency === 'ILS') {
    return `₪${amount.toLocaleString('he-IL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  }

  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get month start and end dates
 */
export function getMonthRange(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

/**
 * Get current month and year
 */
export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return {
    month: now.getMonth(),
    year: now.getFullYear(),
  };
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Get month name in Hebrew
 */
export function getMonthName(month: number): string {
  const monthNames = [
    'ינואר',
    'פברואר',
    'מרץ',
    'אפריל',
    'מאי',
    'יוני',
    'יולי',
    'אוגוסט',
    'ספטמבר',
    'אוקטובר',
    'נובמבר',
    'דצמבר',
  ];
  return monthNames[month];
}

/**
 * Check if user can perform action based on role
 */
export function canPerformAction(
  userRole: string,
  action: 'view' | 'create' | 'edit' | 'delete' | 'manage_members'
): boolean {
  const permissions = {
    owner: ['view', 'create', 'edit', 'delete', 'manage_members'],
    admin: ['view', 'create', 'edit', 'delete', 'manage_members'],
    member: ['view', 'create', 'edit'],
    viewer: ['view'],
  };

  return permissions[userRole as keyof typeof permissions]?.includes(action) ?? false;
}
