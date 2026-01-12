import { useState } from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';
import { TransactionType } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TransactionForm({ isOpen, onClose, onSuccess }: TransactionFormProps) {
  const { createTransaction } = useTransactions();
  const { categories } = useCategories();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredCategories = categories.filter((cat) => cat.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!categoryId) {
      setError('יש לבחור קטגוריה');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('יש להזין סכום תקין');
      return;
    }

    setLoading(true);

    try {
      await createTransaction({
        type,
        amount: parseFloat(amount),
        categoryId,
        description,
        date: new Date(date),
        notes: notes || undefined,
      });

      // Reset form
      setAmount('');
      setCategoryId('');
      setDescription('');
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'שגיאה ביצירת תנועה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="תנועה חדשה" size="md">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selection */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              type === 'expense'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            💸 הוצאה
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              type === 'income'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            💰 הכנסה
          </button>
        </div>

        <Input
          type="number"
          label="סכום"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min="0"
          step="0.01"
        />

        <Select
          label="קטגוריה"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          <option value="">בחר קטגוריה</option>
          {filteredCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.label}
            </option>
          ))}
        </Select>

        <Input
          type="text"
          label="תיאור"
          placeholder="למה הוצאת/קיבלת את הכסף?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <Input
          type="date"
          label="תאריך"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            הערות (אופציונלי)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="הערות נוספות..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" fullWidth loading={loading}>
            הוסף תנועה
          </Button>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={onClose}
            disabled={loading}
          >
            ביטול
          </Button>
        </div>
      </form>
    </Modal>
  );
}
