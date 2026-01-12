// User Types
export type SubscriptionPlan = 'free' | 'pro' | 'pro_business';

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  plan: SubscriptionPlan;
  defaultWorkspaceId: string | null;
  stripeCustomerId?: string;
  createdAt: Date;
}

// Workspace Types
export type WorkspaceType = 'personal' | 'business';
export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface Workspace {
  id: string;
  name: string;
  type: WorkspaceType;
  ownerId: string;
  currency: string;
  icon?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMember {
  uid: string;
  email: string;
  displayName: string | null;
  role: MemberRole;
  addedAt: Date;
}

// Category Types
export type TransactionType = 'income' | 'expense';
export type CategoryGroup = 'fixed' | 'variable';

export interface Category {
  id: string;
  type: TransactionType;
  group: CategoryGroup;
  label: string;
  icon: string;
  color: string;
  order: number;
  targetMonthly?: number;
  isDefault?: boolean;
}

// Transaction Types
export interface Transaction {
  id: string;
  workspaceId: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  description: string;
  date: Date;
  tags?: string[];
  notes?: string;
  isRecurring?: boolean;
  recurringId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  categoryId: string;
  description: string;
  date: Date;
  tags?: string[];
  notes?: string;
  isRecurring?: boolean;
}

// Filter Types
export interface TransactionFilters {
  type?: TransactionType;
  categoryId?: string;
  categoryGroup?: CategoryGroup;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  searchText?: string;
  tags?: string[];
}

// Dashboard Summary
export interface MonthlySummary {
  income: number;
  expenses: number;
  balance: number;
  savingsRate: number;
  fixedExpenses: number;
  variableExpenses: number;
}

export interface CategorySummary {
  categoryId: string;
  categoryLabel: string;
  categoryIcon: string;
  categoryColor: string;
  total: number;
  target?: number;
  percentage: number;
  transactionCount: number;
}

// Subscription Plan Limits
export interface PlanLimits {
  maxWorkspaces: number;
  maxMembers: number;
  canUseBusinessWorkspace: boolean;
  hasAdvancedReports: boolean;
  canExport: boolean;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  free: {
    maxWorkspaces: 1,
    maxMembers: 2,
    canUseBusinessWorkspace: false,
    hasAdvancedReports: false,
    canExport: false,
  },
  pro: {
    maxWorkspaces: 3,
    maxMembers: 5,
    canUseBusinessWorkspace: false,
    hasAdvancedReports: true,
    canExport: true,
  },
  pro_business: {
    maxWorkspaces: 10,
    maxMembers: 10,
    canUseBusinessWorkspace: true,
    hasAdvancedReports: true,
    canExport: true,
  },
};

// Auth Context Types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

// Workspace Context Types
export interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  members: WorkspaceMember[];
  loading: boolean;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  createWorkspace: (name: string, type: WorkspaceType) => Promise<string>;
  updateWorkspace: (workspaceId: string, data: Partial<Workspace>) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  addMember: (workspaceId: string, email: string, role: MemberRole) => Promise<void>;
  updateMemberRole: (workspaceId: string, uid: string, role: MemberRole) => Promise<void>;
  removeMember: (workspaceId: string, uid: string) => Promise<void>;
}
