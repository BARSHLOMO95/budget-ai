import { CategorySummary } from '../../types';
import { formatCurrency } from '../../lib/calculations';
import { Card, CardHeader } from '../ui/Card';

interface CategoryBreakdownProps {
  title: string;
  categories: CategorySummary[];
  totalAmount: number;
}

export function CategoryBreakdown({ title, categories, totalAmount }: CategoryBreakdownProps) {
  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader title={title} />
        <div className="text-center py-8 text-gray-500">
          <p>אין נתונים להצגה</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title={title} subtitle={`סה"כ: ${formatCurrency(totalAmount)}`} />
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.categoryId} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 space-x-reverse">
                <span className="text-2xl">{category.categoryIcon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {category.categoryLabel}
                  </p>
                  <p className="text-xs text-gray-500">
                    {category.transactionCount} תנועות
                  </p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(category.total)}
                </p>
                <p className="text-xs text-gray-500">
                  {category.percentage.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${category.percentage}%`,
                  backgroundColor: category.categoryColor,
                }}
              />
            </div>

            {/* Budget Target (if exists) */}
            {category.target && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">תקציב:</span>
                <span className={`font-medium ${
                  category.total > category.target ? 'text-red-600' : 'text-green-600'
                }`}>
                  {formatCurrency(category.target - category.total)} {
                    category.total > category.target ? 'מעבר לתקציב' : 'נותר'
                  }
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
