import { useMemo } from 'react';
import { useTransactions } from './useTransactions';
import { useCategories } from './useCategories';
import {
  calculateMonthlySummary,
  calculateCategoryBreakdown,
  getMonthRange,
} from '../lib/calculations';
import { MonthlySummary, CategorySummary } from '../types';

export function useMonthlySummary(year: number, month: number) {
  const { start, end } = getMonthRange(year, month);
  const { transactions, loading: transactionsLoading } = useTransactions(start, end);
  const { categories, loading: categoriesLoading } = useCategories();

  const loading = transactionsLoading || categoriesLoading;

  const summary: MonthlySummary = useMemo(() => {
    if (loading || !categories.length) {
      return {
        income: 0,
        expenses: 0,
        balance: 0,
        savingsRate: 0,
        fixedExpenses: 0,
        variableExpenses: 0,
      };
    }

    return calculateMonthlySummary(transactions, categories);
  }, [transactions, categories, loading]);

  const incomeBreakdown: CategorySummary[] = useMemo(() => {
    if (loading || !categories.length) return [];
    return calculateCategoryBreakdown(transactions, categories, 'income');
  }, [transactions, categories, loading]);

  const expenseBreakdown: CategorySummary[] = useMemo(() => {
    if (loading || !categories.length) return [];
    return calculateCategoryBreakdown(transactions, categories, 'expense');
  }, [transactions, categories, loading]);

  return {
    summary,
    incomeBreakdown,
    expenseBreakdown,
    loading,
  };
}
