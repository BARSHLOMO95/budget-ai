import { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { CategoryBreakdown } from '../components/dashboard/CategoryBreakdown';
import { TransactionList } from '../components/transactions/TransactionList';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { useMonthlySummary } from '../hooks/useMonthlySummary';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { getCurrentMonthYear, getMonthRange, getMonthName } from '../lib/calculations';
import { Button } from '../components/ui/Button';

export function DashboardPage() {
  const { month, year } = getCurrentMonthYear();
  const [currentMonth, setCurrentMonth] = useState(month);
  const [currentYear, setCurrentYear] = useState(year);
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  const { summary, incomeBreakdown, expenseBreakdown, loading } = useMonthlySummary(
    currentYear,
    currentMonth
  );

  const { start, end } = getMonthRange(currentYear, currentMonth);
  const { transactions, refresh, deleteTransaction } = useTransactions(start, end);
  const { categories } = useCategories();

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-gray-600">טוען נתונים...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">דאשבורד</h1>
            <p className="text-gray-600 mt-1">סקירה כללית של התקציב שלך</p>
          </div>
          <Button onClick={() => setShowTransactionForm(true)}>
            + תנועה חדשה
          </Button>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center justify-center space-x-4 space-x-reverse">
          <button
            onClick={handlePreviousMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-gray-900 min-w-[200px] text-center">
            {getMonthName(currentMonth)} {currentYear}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Summary Cards */}
        <SummaryCards summary={summary} />

        {/* Category Breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryBreakdown
            title="פירוט הכנסות"
            categories={incomeBreakdown}
            totalAmount={summary.income}
          />
          <CategoryBreakdown
            title="פירוט הוצאות"
            categories={expenseBreakdown}
            totalAmount={summary.expenses}
          />
        </div>

        {/* Recent Transactions */}
        <TransactionList
          transactions={transactions.slice(0, 10)}
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
