import { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { TransactionList } from '../components/transactions/TransactionList';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { Button } from '../components/ui/Button';

export function TransactionsPage() {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const { transactions, loading, deleteTransaction, refresh } = useTransactions();
  const { categories } = useCategories();

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-gray-600">טוען תנועות...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">תנועות</h1>
            <p className="text-gray-600 mt-1">כל ההכנסות וההוצאות שלך במקום אחד</p>
          </div>
          <Button onClick={() => setShowTransactionForm(true)}>
            + תנועה חדשה
          </Button>
        </div>

        {/* Transactions List */}
        <TransactionList
          transactions={transactions}
          categories={categories}
          onDelete={deleteTransaction}
        />
      </div>

      {/* Transaction Form Modal */}
      <TransactionForm
        isOpen={showTransactionForm}
        onClose={() => setShowTransactionForm(false)}
        onSuccess={refresh}
      />
    </AppLayout>
  );
}
