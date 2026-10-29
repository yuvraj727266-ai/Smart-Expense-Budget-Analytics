import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
  Wallet,
  ShieldCheck,
  ArrowRight,
  Lightbulb,
  RefreshCw,
  FileText,
  AlertCircle,
  Calendar,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { apiService } from '../services/api';
import { formatINR, formatDate } from '../utils/formatters';

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

export default function DashboardPage({ selectedMonth, onOpenAddModal, refreshTrigger }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const res = await apiService.getDashboardSummary(selectedMonth);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect to backend analytics server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, refreshTrigger]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-center">
          <p className="text-sm font-bold text-slate-800">Computing financial metrics</p>
          <p className="text-xs text-slate-400 mt-1">Aggregating time-series data via Pandas & NumPy...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 bg-rose-50/80 border border-rose-200 rounded-3xl text-rose-800 shadow-sm">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
          <h3 className="text-base font-bold">Failed to load Dashboard data</h3>
        </div>
        <p className="mt-2 text-sm text-rose-700">{error}</p>
        <button
          onClick={() => fetchDashboardData(true)}
          className="mt-5 px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { summary, category_breakdown, monthly_comparison, daily_trends, insights, recent_transactions } = data || {};

  return (
    <div className="space-y-8 pb-12">
      {/* Defined, Clean Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Financial Dashboard
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time analytics for <span className="font-semibold text-slate-700">{selectedMonth}</span> calculated from persistent SQLite database
          </p>
        </div>

        {/* Clean Secondary Controls (no duplicate record button) */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-all disabled:opacity-60 cursor-pointer"
            title="Refresh dashboard numbers"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
          </button>

          <Link
            to="/reports"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Reports</span>
          </Link>
        </div>
      </div>

      {/* Spacious 2-Tier Metric Cards (3 columns per row for generous whitespace & zero clipping) */}
      <div className="space-y-6">
        {/* Tier 1: Cash Flow & Core Financial Pillars */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Cash Flow & Net Position
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            <StatCard
              title="Total Income"
              value={formatINR(summary?.monthly_income)}
              subtitle={`${selectedMonth} total verified credits`}
              icon={TrendingUp}
              variant="blue"
              badgeText="Inflow"
              badgeVariant="info"
            />
            <StatCard
              title="Total Expenses"
              value={formatINR(summary?.monthly_expenses)}
              subtitle={`${selectedMonth} recorded debits`}
              icon={TrendingDown}
              variant="rose"
              badgeText="Outflow"
              badgeVariant="danger"
            />
            <StatCard
              title="Net Savings"
              value={formatINR(summary?.monthly_savings)}
              subtitle="Income − Total Expenses"
              icon={PiggyBank}
              variant={summary?.monthly_savings >= 0 ? 'emerald' : 'rose'}
              badgeText={summary?.monthly_savings >= 0 ? 'Surplus' : 'Deficit'}
              badgeVariant={summary?.monthly_savings >= 0 ? 'success' : 'danger'}
            />
          </div>
        </div>

        {/* Tier 2: Budgeting & Efficiency Benchmarks */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Budget Performance & Targets
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            <StatCard
              title="Savings Rate"
              value={`${summary?.monthly_savings_rate || 0}%`}
              subtitle="Target benchmark: ≥ 20.0%"
              icon={Percent}
              variant={summary?.monthly_savings_rate >= 20 ? 'emerald' : 'amber'}
              badgeText={summary?.monthly_savings_rate >= 20 ? 'Optimal' : 'Low'}
              badgeVariant={summary?.monthly_savings_rate >= 20 ? 'success' : 'warning'}
              progress={Math.min(Math.max(summary?.monthly_savings_rate || 0, 0), 100)}
              progressLabel="Proportion of income saved"
            />
            <StatCard
              title="Monthly Budget"
              value={formatINR(summary?.monthly_budget)}
              subtitle={`${summary?.budget_utilization || 0}% of ceiling consumed`}
              icon={Wallet}
              variant={summary?.budget_utilization > 100 ? 'rose' : summary?.budget_utilization > 80 ? 'amber' : 'emerald'}
              badgeText={
                summary?.budget_utilization > 100
                  ? 'Exceeded'
                  : summary?.budget_utilization > 80
                  ? 'Caution (80%+)'
                  : 'On Track'
              }
              badgeVariant={
                summary?.budget_utilization > 100
                  ? 'danger'
                  : summary?.budget_utilization > 80
                  ? 'warning'
                  : 'success'
              }
              progress={Math.min(Math.max(summary?.budget_utilization || 0, 0), 100)}
              progressLabel="Budget ceiling utilized"
            />
            <StatCard
              title="Budget Remaining"
              value={formatINR(summary?.budget_remaining)}
              subtitle={`${summary?.days_remaining_in_month || 0} days remaining in cycle`}
              icon={ShieldCheck}
              variant={summary?.budget_remaining >= 0 ? 'emerald' : 'rose'}
              badgeText={summary?.budget_remaining >= 0 ? 'Within Ceiling' : 'Over Limit'}
              badgeVariant={summary?.budget_remaining >= 0 ? 'success' : 'danger'}
            />
          </div>
        </div>
      </div>

      {/* Refined, Spacious Data Science Insights Panel */}
      {insights && insights.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/80">
                <Lightbulb className="w-4 h-4 text-emerald-600 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Rule-Based Data Science Insights
                </h2>
                <p className="text-xs text-slate-400">
                  Algorithmic spending anomalies, velocity trends, and budget alerts
                </p>
              </div>
            </div>
            <Link
              to="/insights"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-colors group"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
            {insights.map((ins, idx) => {
              const isAlert = ins.type === 'alert' || ins.metric?.includes('left') || ins.metric?.includes('exceeded');
              const isSuccess = ins.type === 'success' || ins.title?.toLowerCase().includes('great') || ins.title?.toLowerCase().includes('discipline');

              return (
                <div
                  key={ins.id || idx}
                  className="bg-slate-50/70 hover:bg-slate-50 rounded-xl p-4 border border-slate-200/70 hover:border-emerald-200 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-slate-900 leading-snug">
                        {ins.title}
                      </span>
                      {ins.metric && (
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                          isAlert
                            ? 'bg-amber-50 text-amber-700 border-amber-200/80'
                            : isSuccess
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                            : 'bg-blue-50 text-blue-700 border-blue-200/80'
                        }`}>
                          {ins.metric}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {ins.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Charts Row: Income vs Expenses + Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Monthly Income vs Expenses Bar Chart */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Income vs. Expenses Trend
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Past 6-month financial aggregation computed with Pandas
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                Income
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Expenses
              </span>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly_comparison || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month_year" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip
                  formatter={(val) => [formatINR(val), '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)'
                  }}
                />
                <Bar dataKey="income" name="Income" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={26} />
                <Bar dataKey="expense" name="Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Category Distribution Donut Chart */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Expense Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Category share in {selectedMonth}
            </p>
          </div>

          <div className="h-80 w-full flex items-center justify-center">
            {category_breakdown && category_breakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={category_breakdown}
                    dataKey="total_amount"
                    nameKey="category_name"
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {category_breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name, item) => [`${formatINR(val)} (${item.payload.percentage}%)`, name]}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '10px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Legend
                    iconType="circle"
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: '11px', paddingTop: '16px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 text-xs py-12 flex flex-col items-center">
                <Calendar className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
                <p>No expense transactions recorded for {selectedMonth}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Row: Spending Velocity Area Chart & Top Spending Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Spending Velocity Area Chart */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Daily Spending Velocity
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Day-by-day expenditure pattern across {selectedMonth}
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            {daily_trends && daily_trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={daily_trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(str) => str.slice(8)}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip
                    formatter={(val) => [formatINR(val), 'Daily Spending']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#velocityGradient)"
                    dot={{ fill: '#10b981', r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No daily expense records for this month
              </div>
            )}
          </div>
        </div>

        {/* Top Spending Categories List */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Top Spending Categories
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Highest expenditure sectors this month
              </p>
            </div>
            <Link
              to="/categories"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Manage
            </Link>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-72 pr-1">
            {category_breakdown && category_breakdown.length > 0 ? (
              category_breakdown.slice(0, 5).map((cat) => (
                <div key={cat.category_name} className="space-y-1.5 p-2 rounded-xl hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.category_name}
                    </span>
                    <span className="font-extrabold text-slate-900 tabular-nums">
                      {formatINR(cat.total_amount)}{' '}
                      <span className="text-[11px] text-slate-400 font-semibold ml-1">({cat.percentage}%)</span>
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(cat.percentage, 100)}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 text-xs py-12">
                No expense transactions recorded yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spacious Recent Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Latest 5 financial ledger entries
            </p>
          </div>
          <Link
            to="/transactions"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>View All Transactions</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recent_transactions && recent_transactions.length > 0 ? (
                recent_transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{t.description}</span>
                        {t.is_sample && (
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold">
                            Sample
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/80 text-slate-700 font-semibold text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.category_color }} />
                        {t.category_name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">{formatDate(t.date)}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">{t.payment_method}</td>
                    <td className={`py-3.5 px-4 text-right font-extrabold tabular-nums ${
                      t.type === 'income' ? 'text-blue-600' : 'text-rose-600'
                    }`}>
                      {t.type === 'income' ? '+' : '−'} {formatINR(t.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    No transactions recorded yet. Click "Record Transaction" in the top bar to add your first entry!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
