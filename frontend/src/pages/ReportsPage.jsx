import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { apiService } from '../services/api';
import { formatINR, formatDate } from '../utils/formatters';

export default function ReportsPage({ selectedMonth }) {
  const [statement, setStatement] = useState(null);
  const [loading, setLoading] = useState(true);

  // Custom date filters for CSV
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchStatement = async () => {
    try {
      setLoading(true);
      const res = await apiService.getFinancialStatement(selectedMonth);
      setStatement(res.data);
    } catch (err) {
      console.error('Failed to load financial statement', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatement();
  }, [selectedMonth]);

  const handleDownloadTxCsv = () => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    window.open(apiService.getTransactionsCsvUrl(params), '_blank');
  };

  const handleDownloadSummaryCsv = () => {
    window.open(apiService.getSummaryCsvUrl(), '_blank');
  };

  const handleDownloadCategoriesCsv = () => {
    window.open(apiService.getCategoriesCsvUrl(selectedMonth), '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const summary = statement?.summary || {};
  const categories = statement?.categories || [];
  const topTxs = statement?.top_transactions || [];

  return (
    <div className="space-y-6">
      {/* Title & Top Export Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Financial Reports & Exports</h2>
          <p className="text-xs text-slate-500">
            Export verified CSV data sheets and print formal academic financial statements
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Statement</span>
          </button>
        </div>
      </div>

      {/* CSV Downloads Card (Hidden during print) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs print:hidden">
        <div className="flex items-center gap-2 mb-3">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Direct CSV Downloads</h3>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Formula Injection Protected (CWE-1236)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-xs text-slate-900">Transaction History CSV</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Full itemized log of income and expense transactions.
              </p>
            </div>
            <button
              onClick={handleDownloadTxCsv}
              className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Transactions</span>
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-xs text-slate-900">Monthly Performance CSV</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Aggregated monthly summaries with savings rates and MoM changes.
              </p>
            </div>
            <button
              onClick={handleDownloadSummaryCsv}
              className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Monthly Summary</span>
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-xs text-slate-900">Category Breakdown CSV</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Category spending distributions, averages, and percentage share.
              </p>
            </div>
            <button
              onClick={handleDownloadCategoriesCsv}
              className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Category Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Statement Document */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs print:border-none print:shadow-none print:p-0">
        {/* Statement Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">FINANCIAL STATEMENT REPORT</h1>
            <p className="text-xs text-slate-500 mt-1">
              Smart Expense & Budget Analytics System · MCA Data Science Mini-Project
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 uppercase">Statement Period</span>
            <div className="text-lg font-black text-emerald-800">{selectedMonth}</div>
          </div>
        </div>

        {/* Financial Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200 mb-8">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Income</span>
            <div className="text-lg font-bold text-blue-600 mt-0.5">{formatINR(summary.monthly_income)}</div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Expenses</span>
            <div className="text-lg font-bold text-rose-600 mt-0.5">{formatINR(summary.monthly_expenses)}</div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Net Savings</span>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{formatINR(summary.monthly_savings)}</div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Savings Rate</span>
            <div className="text-lg font-bold text-emerald-600 mt-0.5">{summary.monthly_savings_rate || 0}%</div>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
            Category-Wise Expenditure Breakdown
          </h3>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-semibold">
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Transactions</th>
                <th className="py-2.5 px-3 text-right">Average (₹)</th>
                <th className="py-2.5 px-3 text-right">Total Amount (₹)</th>
                <th className="py-2.5 px-3 text-right">Share (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((c, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{c.category_name}</td>
                  <td className="py-2.5 px-3 text-right text-slate-600">{c.transaction_count}</td>
                  <td className="py-2.5 px-3 text-right text-slate-600">{formatINR(c.average_amount)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatINR(c.total_amount)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-600">{c.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Spending Transactions */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
            Top Expenditure Items in {selectedMonth}
          </h3>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-semibold">
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topTxs.map((t, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{t.description}</td>
                  <td className="py-2.5 px-3 text-slate-600">{t.category_name}</td>
                  <td className="py-2.5 px-3 text-slate-500">{formatDate(t.date)}</td>
                  <td className="py-2.5 px-3 text-right font-black text-rose-600">{formatINR(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sign-off / Academic Certification */}
        <div className="pt-6 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-700">MCA Student Project Practical Examination</p>
            <p>Generated by Smart Expense & Budget Analytics System via Python Flask & SQLite</p>
          </div>
          <div className="text-right">
            <p>Verified on: {new Date().toLocaleDateString('en-IN')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
