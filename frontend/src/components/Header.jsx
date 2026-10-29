import React, { useState, useEffect } from 'react';
import { Menu, Plus, Calendar, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';

export default function Header({
  onToggleSidebar,
  selectedMonth,
  onChangeMonth,
  onOpenAddModal
}) {
  const [backendStatus, setBackendStatus] = useState('checking'); // 'connected' | 'disconnected' | 'checking'

  const checkStatus = async () => {
    try {
      setBackendStatus('checking');
      const res = await apiService.checkHealth();
      if (res.data?.status === 'healthy') {
        setBackendStatus('connected');
      } else {
        setBackendStatus('disconnected');
      }
    } catch {
      setBackendStatus('disconnected');
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Generate selectable months (current and past 6 months)
  const monthOptions = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    monthOptions.push({ value: val, label });
  }

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-xs transition-all">
      {/* Left: Mobile hamburger & title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-hidden transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
            INR (₹)
          </span>
          <span className="text-xs text-slate-500 font-semibold tracking-tight">Financial Analytics System</span>
        </div>
      </div>

      {/* Right controls: Month selector + Add Transaction button + Backend status */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Month Picker */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 border border-slate-200/80 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 shadow-2xs hover:bg-white hover:border-slate-300 transition-all">
          <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <select
            value={selectedMonth}
            onChange={(e) => onChangeMonth(e.target.value)}
            className="bg-transparent border-none text-slate-800 font-bold focus:outline-hidden cursor-pointer"
          >
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Backend health status badge */}
        <div
          onClick={checkStatus}
          title="Click to re-check backend connection status"
          className={`cursor-pointer hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold border transition-all ${
            backendStatus === 'connected'
              ? 'bg-emerald-50/90 text-emerald-700 border-emerald-200/80 shadow-2xs hover:bg-emerald-100/80'
              : backendStatus === 'checking'
              ? 'bg-amber-50/90 text-amber-700 border-amber-200/80 hover:bg-amber-100/80'
              : 'bg-rose-50/90 text-rose-700 border-rose-200/80 hover:bg-rose-100/80'
          }`}
        >
          {backendStatus === 'connected' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span>Flask API Ready</span>
            </>
          ) : backendStatus === 'checking' ? (
            <>
              <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3 text-rose-600" />
              <span>API Disconnected</span>
            </>
          )}
        </div>

        {/* Add Transaction Button */}
        <button
          onClick={onOpenAddModal}
          className="btn-emerald-gradient flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Record Transaction</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
    </header>
  );
}
