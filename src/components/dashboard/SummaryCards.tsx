import { MonthlySummary } from '../../types';
import { formatCurrency } from '../../lib/calculations';
import { Card } from '../ui/Card';

interface SummaryCardsProps {
  summary: MonthlySummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      label: 'הכנסות',
      value: summary.income,
      icon: '💰',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      isPercentage: false,
    },
    {
      label: 'הוצאות',
      value: summary.expenses,
      icon: '💸',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      isPercentage: false,
    },
    {
      label: 'יתרה',
      value: summary.balance,
      icon: summary.balance >= 0 ? '📈' : '📉',
      color: summary.balance >= 0 ? 'text-blue-600' : 'text-orange-600',
      bgColor: summary.balance >= 0 ? 'bg-blue-50' : 'bg-orange-50',
      isPercentage: false,
    },
    {
      label: 'אחוז חיסכון',
      value: summary.savingsRate,
      displayValue: `${summary.savingsRate.toFixed(1)}%`,
      icon: '🎯',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      isPercentage: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <Card key={card.label} padding={false}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.label}</p>
                <p className={`text-2xl font-bold mt-2 ${card.color}`}>
                  {card.isPercentage ? card.displayValue : formatCurrency(card.value)}
                </p>
              </div>
              <div className={`text-4xl ${card.bgColor} p-3 rounded-full`}>
                {card.icon}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
