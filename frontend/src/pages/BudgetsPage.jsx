import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  TrendingUp,
  Percent
} from 'lucide-react';
import { apiService } from '../services/api';
import { formatINR } from '../utils/formatters';
import BudgetModal from '../components/BudgetModal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function BudgetsPage({
  selectedMonth,
  categories = []
}) {
  const [budgets, setBudgets] = useState([]);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editBudget, setEditBudget] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await apiService.getBudgets(selectedMonth);
      setBudgets(res.data.budgets || []);
      setDaysRemaining(res.data.days_remaining || 0);
    } catch (err) {
      console.error('Failed to load budgets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await apiService.deleteBudget(deleteId);
      setDeleteId(null);
      fetchBudgets();
    } catch (err) {
      alert('Failed to delete budget limit');
    } finally {
      setDeleting(false);
    }
  };

  const overallBudget = budgets.find(b => b.is_overall);
  const categoryBudgets = budgets.filter(b => !b.is_overall);

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Budget Management</h2>
          <p className="text-xs text-slate-500">
            Monthly ceilings & category-level spending limits for <span className="font-semibold text-slate-700">{selectedMonth}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{daysRemaining} days left in {selectedMonth}</span>
          </div>

          <button
            onClick={() => { setEditBudget(null); setModalOpen(true); }}
            className="btn-emerald-gradient flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {/* Overall Monthly Budget Hero Card */}
      {overallBudget ? (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg border border-slate-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-700/80">
            <div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Overall Ceiling
              </span>
              <h3 className="text-xl font-black text-white mt-1">Total Monthly Budget Limit</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Maximum allowable combined expenditure across all categories
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { setEditBudget(overallBudget); setModalOpen(true); }}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Edit overall budget"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteId(overallBudget.id)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-400 transition-colors"
                title="Remove overall budget"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-6">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase">Budget Cap</span>
              <div className="text-2xl font-black text-white mt-1">{formatINR(overallBudget.amount)}</div>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase">Actual Total Spent</span>
              <div className={`text-2xl font-black mt-1 ${overallBudget.is_exceeded ? 'text-rose-400' : 'text-emerald-400'}`}>
                {formatINR(overallBudget.actual_spent)}
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase">Amount Remaining</span>
              <div className={`text-2xl font-black mt-1 ${overallBudget.remaining < 0 ? 'text-rose-400' : 'text-slate-100'}`}>
                {formatINR(overallBudget.remaining)}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-slate-300">Budget Consumption: {overallBudget.utilization_pct}%</span>
              {overallBudget.is_exceeded ? (
                <span className="text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Over budget by {formatINR(Math.abs(overallBudget.remaining))}
                </span>
              ) : overallBudget.is_warning ? (
                <span className="text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> High utilization alert (&ge;80%)
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Spending on track
                </span>
              )}
            </div>

            <div className="w-full bg-slate-700/80 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  overallBudget.is_exceeded
                    ? 'bg-rose-500'
                    : overallBudget.is_warning
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(overallBudget.utilization_pct, 100)}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-amber-900 text-sm">No Overall Budget Set for {selectedMonth}</h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Set a monthly spending limit to monitor spending thresholds and detect overruns.
              </p>
            </div>
          </div>
          <button
            onClick={() => { setEditBudget(null); setModalOpen(true); }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shrink-0"
          >
            Set Overall Budget
          </button>
        </div>
      )}

      {/* Category-Specific Budget Limits Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">Category Spending Limits</h3>
          <span className="text-xs text-slate-500 font-medium">
            {categoryBudgets.length} Category limit(s) configured
          </span>
        </div>

        {categoryBudgets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryBudgets.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: b.category_color }} />
                      <h4 className="font-bold text-sm text-slate-900">{b.category_name}</h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditBudget(b); setModalOpen(true); }}
                        className="p-1 rounded text-slate-400 hover:text-slate-700"
                        title="Edit limit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(b.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600"
                        title="Delete limit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="mt-4 flex items-baseline justify-between text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold uppercase text-[10px]">Spent</span>
                      <div className={`text-base font-bold ${b.is_exceeded ? 'text-rose-600' : 'text-slate-900'}`}>
                        {formatINR(b.actual_spent)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 font-semibold uppercase text-[10px]">Limit Cap</span>
                      <div className="text-base font-bold text-slate-700">{formatINR(b.amount)}</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                      <span className="text-slate-500">{b.utilization_pct}% used</span>
                      <span className={b.remaining < 0 ? 'text-rose-600' : 'text-slate-600'}>
                        {b.remaining < 0 ? `${formatINR(Math.abs(b.remaining))} over` : `${formatINR(b.remaining)} left`}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          b.is_exceeded ? 'bg-rose-500' : b.is_warning ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(b.utilization_pct, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Status footer pill */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {b.is_exceeded ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                      <AlertTriangle className="w-3 h-3" /> Exceeded limit
                    </span>
                  ) : b.is_warning ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                      <AlertTriangle className="w-3 h-3" /> Approaching ceiling (&ge;80%)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      <CheckCircle2 className="w-3 h-3" /> Well within budget
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center text-slate-400">
            <Wallet className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-700 text-sm">No category-specific limits for {selectedMonth}</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Setting category limits for Food, Rent, or Shopping helps you prevent overspending in high-risk categories.
            </p>
            <button
              onClick={() => { setEditBudget(null); setModalOpen(true); }}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl"
            >
              Add Category Limit
            </button>
          </div>
        )}
      </div>

      {/* Budget Modal */}
      <BudgetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchBudgets}
        budget={editBudget}
        currentMonth={selectedMonth}
        categories={categories}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Budget Limit"
        message="Are you sure you want to delete this budget ceiling? Existing transactions will not be deleted, but budget progress tracking will be removed."
        confirmLabel="Delete Limit"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
