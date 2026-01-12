import { useState, useEffect, useCallback } from 'react';
import { useWorkspace } from './useWorkspace';
import { useAuth } from './useAuth';
import {
  getTransactions,
  createTransaction as createTransactionService,
  updateTransaction as updateTransactionService,
  deleteTransaction as deleteTransactionService,
  deleteTransactions as deleteTransactionsService,
} from '../services/transaction.service';
import { Transaction, TransactionInput } from '../types';

export function useTransactions(startDate?: Date, endDate?: Date) {
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTransactions = useCallback(async () => {
    if (!currentWorkspace) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getTransactions(currentWorkspace.id, startDate, endDate);
      setTransactions(data);
      setError(null);
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace, startDate, endDate]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const createTransaction = async (data: TransactionInput) => {
    if (!currentWorkspace || !user) throw new Error('Not authenticated');

    const transactionId = await createTransactionService(
      currentWorkspace.id,
      user.uid,
      data
    );

    // Reload transactions
    await loadTransactions();

    return transactionId;
  };

  const updateTransaction = async (transactionId: string, data: Partial<TransactionInput>) => {
    await updateTransactionService(transactionId, data);

    // Reload transactions
    await loadTransactions();
  };

  const deleteTransaction = async (transactionId: string) => {
    await deleteTransactionService(transactionId);

    // Reload transactions
    await loadTransactions();
  };

  const deleteMultipleTransactions = async (transactionIds: string[]) => {
    await deleteTransactionsService(transactionIds);

    // Reload transactions
    await loadTransactions();
  };

  const refresh = () => {
    loadTransactions();
  };

  return {
    transactions,
    loading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    deleteMultipleTransactions,
    refresh,
  };
}
