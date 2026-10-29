import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Tag, AlertCircle, ArrowRightLeft } from 'lucide-react';
import { apiService } from '../services/api';
import CategoryModal from '../components/CategoryModal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function CategoriesPage({
  categories = [],
  onRefreshCategories
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

  // Deletion state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignTargetId, setReassignTargetId] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleDeleteClick = (cat) => {
    setErrorMsg(null);
    setDeleteTarget(cat);
    if (cat.transaction_count > 0) {
      // Must prompt to reassign transactions
      const otherCat = categories.find(c => c.id !== cat.id && (c.type === cat.type || c.type === 'both'));
      setReassignTargetId(otherCat ? String(otherCat.id) : '');
      setReassignModalOpen(true);
    } else {
      setReassignModalOpen(false);
    }
  };

  const handleConfirmDirectDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await apiService.deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
      onRefreshCategories();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  const handleConfirmReassignDelete = async () => {
    if (!deleteTarget || !reassignTargetId) return;
    try {
      setDeleting(true);
      await apiService.deleteCategory(deleteTarget.id, parseInt(reassignTargetId, 10));
      setDeleteTarget(null);
      setReassignModalOpen(false);
      onRefreshCategories();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to delete and reassign category');
    } finally {
      setDeleting(false);
    }
  };

  const expenseCats = categories.filter(c => c.type === 'expense' || c.type === 'both');
  const incomeCats = categories.filter(c => c.type === 'income' || c.type === 'both');

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Categories</h2>
          <p className="text-xs text-slate-500">
            Configure transaction categories, classification rules, and visual color tokens
          </p>
        </div>

        <button
          onClick={() => { setEditCategory(null); setModalOpen(true); }}
          className="btn-emerald-gradient flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shadow-md"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Category</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Expense Categories Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
            Expense Categories ({expenseCats.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {expenseCats.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: cat.color }}
                >
                  <Tag className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{cat.name}</h4>
                  <p className="text-[11px] text-slate-500">
                    {cat.transaction_count} transaction{cat.transaction_count === 1 ? '' : 's'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setEditCategory(cat); setModalOpen(true); }}
                  className="p-1 rounded text-slate-400 hover:text-slate-700"
                  title="Edit category"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteClick(cat)}
                  className="p-1 rounded text-slate-400 hover:text-rose-600"
                  title="Delete category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Income Categories Section */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
            Income Categories ({incomeCats.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {incomeCats.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: cat.color }}
                >
                  <Tag className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{cat.name}</h4>
                  <p className="text-[11px] text-slate-500">
                    {cat.transaction_count} transaction{cat.transaction_count === 1 ? '' : 's'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setEditCategory(cat); setModalOpen(true); }}
                  className="p-1 rounded text-slate-400 hover:text-slate-700"
                  title="Edit category"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteClick(cat)}
                  className="p-1 rounded text-slate-400 hover:text-rose-600"
                  title="Delete category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Modal (Add / Edit) */}
      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={onRefreshCategories}
        category={editCategory}
      />

      {/* Direct Delete Confirm Dialog (if 0 transactions linked) */}
      {!reassignModalOpen && (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          title="Delete Category"
          message={`Are you sure you want to delete category '${deleteTarget?.name}'?`}
          confirmLabel="Delete Category"
          onConfirm={handleConfirmDirectDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {/* Safe Reassign Modal (if category has linked transactions) */}
      {reassignModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <ArrowRightLeft className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">Reassign Transactions First</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Category <span className="font-bold text-slate-800">'{deleteTarget.name}'</span> is linked to{' '}
              <span className="font-bold text-slate-800">{deleteTarget.transaction_count} transaction(s)</span>.
              To maintain database integrity, select a replacement category before deletion:
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Reassign Transactions To:
              </label>
              <select
                value={reassignTargetId}
                onChange={(e) => setReassignTargetId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
              >
                {categories
                  .filter((c) => c.id !== deleteTarget.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type})
                    </option>
                  ))}
              </select>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => { setDeleteTarget(null); setReassignModalOpen(false); }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReassignDelete}
                disabled={deleting || !reassignTargetId}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl"
              >
                {deleting ? 'Reassigning...' : 'Reassign & Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
