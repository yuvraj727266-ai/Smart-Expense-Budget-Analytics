import React, { useState } from 'react';
import {
  Settings,
  Database,
  Trash2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  Server
} from 'lucide-react';
import { apiService } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';

export default function SettingsPage({ onDataMutated }) {
  const [loadingAction, setLoadingAction] = useState(null);
  const [message, setMessage] = useState(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const handleSeed = async () => {
    try {
      setLoadingAction('seed');
      setMessage(null);
      const res = await apiService.seedSampleData();
      setMessage({ type: 'success', text: res.data.message });
      onDataMutated();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to seed sample data' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleClearDemo = async () => {
    try {
      setLoadingAction('clear');
      setMessage(null);
      const res = await apiService.clearSampleData();
      setMessage({ type: 'success', text: res.data.message });
      onDataMutated();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to clear sample data' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleResetAll = async () => {
    try {
      setLoadingAction('reset');
      setMessage(null);
      const res = await apiService.resetAllData();
      setMessage({ type: 'success', text: res.data.message });
      setResetModalOpen(false);
      onDataMutated();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to reset database' });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Settings & Data Management</h2>
        <p className="text-xs text-slate-500 mt-1">
          Control sample demonstration records, database state, and examine system runtime specs
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Demonstration Records Management Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Database className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-sm text-slate-900">Academic Demonstration Records</h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          The database features an isolated demonstration flag (<code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded">is_sample=True</code>).
          This allows seeding realistic 3-month MCA student transactions and budgets for viva demonstration without overwriting or locking your database.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Seed Button */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-xs text-slate-900">Seed Demo Dataset</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Inserts 23+ realistic records spanning stipend income, hostel rent, mess food, and books.
              </p>
            </div>
            <button
              onClick={handleSeed}
              disabled={!!loadingAction}
              className="mt-4 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs disabled:opacity-50 transition-all"
            >
              {loadingAction === 'seed' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Seed Demonstration Data</span>
            </button>
          </div>

          {/* Safe Clear Button */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-xs text-slate-900">Safely Clear Only Demo Records</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Deletes only records where <code className="text-slate-700 font-mono">is_sample=True</code>. User-created records remain untouched.
              </p>
            </div>
            <button
              onClick={handleClearDemo}
              disabled={!!loadingAction}
              className="mt-4 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold bg-slate-700 hover:bg-slate-800 text-white shadow-xs disabled:opacity-50 transition-all"
            >
              {loadingAction === 'clear' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span>Clear Sample Records</span>
            </button>
          </div>
        </div>

        {/* Full Reset Card */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-xs text-slate-900">Reset All Data & Re-seed</h4>
            <p className="text-[11px] text-slate-500">Purges all records and restores clean initial demonstration state</p>
          </div>
          <button
            onClick={() => setResetModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
          >
            Reset Database
          </button>
        </div>
      </div>

      {/* System Technical Specifications */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Server className="w-5 h-5 text-slate-700" />
          <h3 className="font-bold text-sm text-slate-900">Technical Environment Specifications</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 font-medium">Backend Runtime</span>
            <div className="font-bold text-slate-900 mt-0.5">Python 3.14 + Flask</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 font-medium">Data Analytics</span>
            <div className="font-bold text-slate-900 mt-0.5">Pandas 3.0 & NumPy 2.5</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 font-medium">Visualization Engine</span>
            <div className="font-bold text-slate-900 mt-0.5">Matplotlib 3.11 & Seaborn</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 font-medium">Database</span>
            <div className="font-bold text-slate-900 mt-0.5">SQLite + SQLAlchemy ORM</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 font-medium">Frontend Framework</span>
            <div className="font-bold text-slate-900 mt-0.5">React 19 + Vite</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 font-medium">Styling & Icons</span>
            <div className="font-bold text-slate-900 mt-0.5">Tailwind CSS + Lucide</div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={resetModalOpen}
        title="Reset Entire Database"
        message="This action will delete all existing transactions and budgets and re-seed clean demonstration records. Proceed?"
        confirmLabel="Reset & Re-seed"
        onConfirm={handleResetAll}
        onCancel={() => setResetModalOpen(false)}
        loading={loadingAction === 'reset'}
      />
    </div>
  );
}
