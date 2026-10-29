import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Download,
  AlertCircle
} from 'lucide-react';
import { apiService } from '../services/api';
import { formatINR, formatDate } from '../utils/formatters';
import ConfirmDialog from '../components/ConfirmDialog';

export default function TransactionsPage({
  categories = [],
  onOpenAddModal,
  onOpenEditModal,
  refreshTrigger
}) {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Delete confirmation
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      if (search.trim()) params.search = search.trim();
      if (filterType) params.type = filterType;
      if (filterCategory) params.category_id = filterCategory;
      if (filterPayment) params.payment_method = filterPayment;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await apiService.getTransactions(params);
      setTransactions(res.data.items || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, perPage, sortBy, sortOrder, filterType, filterCategory, filterPayment, startDate, endDate, refreshTrigger]);

  // Handle search with debounce/submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleSortToggle = (col) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await apiService.deleteTransaction(deleteId);
      setDeleteId(null);
      fetchTransactions();
    } catch (err) {
      alert('Failed to delete transaction');
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCsv = () => {
    const params = {};
    if (filterType) params.type = filterType;
    if (filterCategory) params.category_id = filterCategory;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    window.open(apiService.getTransactionsCsvUrl(params), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Title & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Transactions</h2>
          <p className="text-xs text-slate-500">
            Total of <span className="font-bold text-slate-700">{total}</span> records in SQLite database
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="btn-emerald-gradient flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search description (e.g. rent, coffee, stipend)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Type */}
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
              className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden text-slate-700 font-medium"
            >
              <option value="">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Incomes Only</option>
            </select>

            {/* Category */}
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
              className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden text-slate-700 font-medium"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Start Date */}
            <input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
            />

            {/* End Date */}
            <input
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shrink-0"
          >
            Apply Search
          </button>
        </form>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th
                  onClick={() => handleSortToggle('date')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Payment Method</th>
                <th
                  onClick={() => handleSortToggle('amount')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Amount</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading transactions from SQLite...</span>
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>{t.description}</span>
                        {t.is_sample && (
                          <span className="px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-500 text-[9px] uppercase font-bold tracking-wider">
                            Demo
                          </span>
                        )}
                      </div>
                      {t.notes && <div className="text-[11px] text-slate-400 mt-0.5">{t.notes}</div>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 font-medium text-[11px] text-slate-800">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.category_color }} />
                        {t.category_name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-medium">{formatDate(t.date)}</td>
                    <td className="py-3 px-4 text-slate-500">{t.payment_method}</td>
                    <td className={`py-3 px-4 text-right font-black text-sm ${t.type === 'income' ? 'text-blue-600' : 'text-rose-600'}`}>
                      {t.type === 'income' ? '+' : '-'} {formatINR(t.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onOpenEditModal(t)}
                          title="Edit transaction"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(t.id)}
                          title="Delete transaction"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-500">No transactions match your filters</p>
                    <p className="text-xs mt-1">Try resetting search parameters or click New Transaction</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing Page <span className="font-bold text-slate-800">{page}</span> of <span className="font-bold text-slate-800">{pages}</span> ({total} items)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1 || loading}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold px-2">{page}</span>
            <button
              onClick={() => setPage(Math.min(pages, page + 1))}
              disabled={page >= pages || loading}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Transaction"
        message="Are you sure you want to delete this financial record? This action will permanently remove it from the database and recalculate monthly totals."
        confirmLabel="Delete Record"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
