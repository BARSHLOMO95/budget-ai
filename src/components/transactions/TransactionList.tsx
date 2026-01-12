import { Transaction, Category } from '../../types';
import { formatCurrency, formatDate } from '../../lib/calculations';
import { Card, CardHeader } from '../ui/Card';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transactionId: string) => void;
}

export function TransactionList({
  transactions,
  categories,
  onEdit,
  onDelete
}: TransactionListProps) {
  const getCategoryInfo = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId);
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader title="תנועות אחרונות" />
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">אין תנועות להצגה</p>
          <p className="text-sm mt-2">הוסף תנועה ראשונה כדי להתחיל לעקוב אחר התקציב שלך</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="תנועות אחרונות"
        subtitle={`${transactions.length} תנועות`}
      />
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                תאריך
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                קטגוריה
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                תיאור
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                סכום
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                פעולות
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => {
              const category = getCategoryInfo(transaction.categoryId);
              return (
                <tr
                  key={transaction.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <span className="text-lg">{category?.icon}</span>
                      <span className="text-gray-900">{category?.label}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>
                      {transaction.description}
                      {transaction.notes && (
                        <p className="text-xs text-gray-500 mt-1">
                          {transaction.notes}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    <span
                      className={
                        transaction.type === 'income'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(transaction)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ערוך
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => {
                            if (window.confirm('האם אתה בטוח שברצונך למחוק תנועה זו?')) {
                              onDelete(transaction.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          מחק
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
