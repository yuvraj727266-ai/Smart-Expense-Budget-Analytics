import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

export default function BudgetModal({
  isOpen,
  onClose,
  onSaved,
  budget = null,
  currentMonth,
  categories = []
}) {
  const [formData, setFormData] = useState({
    month_year: currentMonth || new Date().toISOString().slice(0, 7),
    category_id: '', // empty for overall
    amount: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (budget) {
      setFormData({
        month_year: budget.month_year,
        category_id: budget.category_id !== null ? String(budget.category_id) : '',
        amount: budget.amount || ''
      });
    } else {
      setFormData({
        month_year: currentMonth || new Date().toISOString().slice(0, 7),
        category_id: '',
        amount: ''
      });
    }
    setError(null);
  }, [budget, isOpen, currentMonth]);

  if (!isOpen) return null;

  // Only expense categories can have budgets
  const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'both');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid budget amount greater than zero');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        month_year: formData.month_year,
        category_id: formData.category_id ? parseInt(formData.category_id, 10) : null,
        amount: amt
      };

      if (budget?.id) {
        await apiService.updateBudget(budget.id, { amount: amt });
      } else {
        await apiService.createBudget(payload);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-md overflow-hidden modal-enter">
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight font-display">
              {budget ? 'Edit Budget Limit' : 'Set Spending Budget'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">Define maximum allowable expenditure threshold</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Target Month (YYYY-MM) <span className="text-rose-500">*</span>
            </label>
            <input
              type="month"
              required
              disabled={!!budget} // Cannot change month on existing budget
              value={formData.month_year}
              onChange={(e) => setFormData({ ...formData, month_year: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Scope</label>
            <select
              disabled={!!budget}
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer disabled:opacity-60"
            >
              <option value="">Overall Monthly Budget (All Categories)</option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  Category Limit: {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Budget Limit (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">₹</span>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                placeholder="25000.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full pl-8 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-emerald-gradient px-5 py-2 rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
            >
              {loading ? 'Saving...' : budget ? 'Update Budget' : 'Save Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
