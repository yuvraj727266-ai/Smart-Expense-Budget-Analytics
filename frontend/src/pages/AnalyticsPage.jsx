import React, { useState, useEffect } from 'react';
import {
  LineChart as LineChartIcon,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Flame,
  Binary,
  Layers,
  Sparkles,
  Info,
  Calendar,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { apiService } from '../services/api';
import { formatINR, formatDate } from '../utils/formatters';

export default function AnalyticsPage({ selectedMonth }) {
  const [activeTab, setActiveTab] = useState('statistical'); // 'statistical' | 'matplotlib'
  const [distributionData, setDistributionData] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Matplotlib server-rendered chart state
  const [matplotlibChartType, setMatplotlibChartType] = useState('histogram');
  const [matplotlibImg, setMatplotlibImg] = useState(null);
  const [loadingMatplotlib, setLoadingMatplotlib] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [distRes, monthRes] = await Promise.all([
        apiService.getDistribution(selectedMonth),
        apiService.getMonthlyComparison(6),
      ]);
      setDistributionData(distRes.data);
      setMonthlyData(monthRes.data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatplotlib = async (chartType) => {
    try {
      setLoadingMatplotlib(true);
      const res = await apiService.getMatplotlibChart(chartType, selectedMonth);
      setMatplotlibImg(res.data.image);
    } catch (err) {
      console.error('Failed to load matplotlib chart', err);
    } finally {
      setLoadingMatplotlib(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedMonth]);

  useEffect(() => {
    if (activeTab === 'matplotlib') {
      fetchMatplotlib(matplotlibChartType);
    }
  }, [activeTab, matplotlibChartType, selectedMonth]);

  const stats = distributionData?.statistics || {};
  const outliers = distributionData?.outliers || [];

  return (
    <div className="space-y-6">
      {/* Title & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Python Data Analytics</h2>
          <p className="text-xs text-slate-500">
            Powered by <span className="font-semibold text-emerald-700">NumPy ndarrays</span> and{' '}
            <span className="font-semibold text-emerald-700">Pandas DataFrames</span>
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl shadow-2xs">
          <button
            onClick={() => setActiveTab('statistical')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'statistical'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            NumPy Statistical Models
          </button>
          <button
            onClick={() => setActiveTab('matplotlib')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'matplotlib'
                ? 'btn-emerald-gradient shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Matplotlib & Seaborn Visualizations
          </button>
        </div>
      </div>

      {activeTab === 'statistical' ? (
        <>
          {/* NumPy Statistical Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-card hover-lift">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Arithmetic Mean</span>
              <div className="text-lg font-black text-slate-900 mt-1 tabular-nums font-sans">{formatINR(stats.mean)}</div>
              <p className="text-[10px] text-emerald-600 font-mono mt-0.5">np.mean(amounts)</p>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-card hover-lift">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Median Expense</span>
              <div className="text-lg font-black text-slate-900 mt-1 tabular-nums font-sans">{formatINR(stats.median)}</div>
              <p className="text-[10px] text-emerald-600 font-mono mt-0.5">np.median(amounts)</p>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-card hover-lift">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Standard Dev (σ)</span>
              <div className="text-lg font-black text-slate-900 mt-1 tabular-nums font-sans">₹{stats.std_dev?.toFixed(2) || '0.00'}</div>
              <p className="text-[10px] text-emerald-600 font-mono mt-0.5">np.std(amounts)</p>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-card hover-lift">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Min Expense</span>
              <div className="text-lg font-black text-slate-900 mt-1 tabular-nums font-sans">{formatINR(stats.min)}</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Lowest transaction</p>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-card hover-lift">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Max Expense</span>
              <div className="text-lg font-black text-slate-900 mt-1 tabular-nums font-sans">{formatINR(stats.max)}</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Highest transaction</p>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-card hover-lift">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">IQR Threshold</span>
              <div className="text-lg font-black text-amber-600 mt-1 tabular-nums font-sans">{formatINR(stats.outlier_threshold)}</div>
              <p className="text-[10px] text-amber-600 font-mono mt-0.5">Q3 + 1.5 * IQR</p>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-card hover-lift">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Flagged Outliers</span>
              <div className="text-lg font-black text-rose-600 mt-1 tabular-nums font-sans">{stats.outliers_count || 0}</div>
              <p className="text-[10px] text-rose-600 font-medium mt-0.5">Statistical anomalies</p>
            </div>
          </div>

          {/* Forecasting & Velocity Banner */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Burn Rate & Forecast</span>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  Average Daily Spending: <span className="text-emerald-700">{formatINR(stats.average_daily_spending)}/day</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Projected End-of-Month Total: <span className="font-semibold text-slate-800">{formatINR(stats.projected_monthly_spending)}</span> ({stats.projection_assumption})
                </p>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium shrink-0">
              Sample size: {stats.count} expenses
            </div>
          </div>

          {/* Outlier Transactions Detected via IQR Rule */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  Statistical Outlier Transactions (Interquartile Range Rule)
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Threshold: &gt; {formatINR(stats.outlier_threshold)}
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              In academic statistics and exploratory data analysis (EDA), values exceeding <span className="font-mono font-bold">Q3 + 1.5 × IQR</span> are flagged as potential outliers. These transactions represent unusually large expenditures that deserve special review.
            </p>

            {outliers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold">
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3">Analytical Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {outliers.map((o, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{o.description}</td>
                        <td className="py-2.5 px-3 text-slate-600">{o.category_name}</td>
                        <td className="py-2.5 px-3 text-slate-500">{formatDate(o.date)}</td>
                        <td className="py-2.5 px-3 text-right font-black text-rose-600">{formatINR(o.amount)}</td>
                        <td className="py-2.5 px-3 text-amber-700 font-medium">{o.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50/60 border border-emerald-200/60 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>No statistical outliers detected in current transaction history. All expenses fall within normal variance.</span>
              </div>
            )}
          </div>

          {/* Monthly Comparison Area Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Savings Trend Analysis</h3>
            <p className="text-xs text-slate-500 mb-4">Net monthly savings progression over time</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month_year" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    formatter={(val) => [formatINR(val), 'Net Savings']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="savings"
                    stroke="#10b981"
                    fill="#d1fae5"
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        /* Matplotlib & Seaborn Tab */
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Python Server-Side Visualizations (Matplotlib & Seaborn)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generated in-memory via headless Agg backend and streamed to base64 PNG
                </p>
              </div>

              {/* Chart selector buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'histogram', label: 'KDE Histogram' },
                  { id: 'donut', label: 'Category Donut' },
                  { id: 'bar', label: 'Monthly Comparison' },
                  { id: 'heatmap', label: 'Correlation Matrix' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setMatplotlibChartType(c.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      matplotlibChartType === c.id
                        ? 'btn-emerald-gradient shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart display canvas */}
            <div className="mt-6 flex flex-col items-center justify-center min-h-[420px] bg-slate-50/60 rounded-xl p-4 border border-dashed border-slate-200">
              {loadingMatplotlib ? (
                <div className="flex flex-col items-center justify-center space-y-2 text-slate-500">
                  <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
                  <p className="text-xs font-semibold">Generating chart using Python Matplotlib & Seaborn...</p>
                </div>
              ) : matplotlibImg ? (
                <div className="max-w-2xl w-full flex flex-col items-center">
                  <img
                    src={matplotlibImg}
                    alt="Python Matplotlib Analytics Chart"
                    className="max-h-[460px] object-contain rounded-xl shadow-md border border-slate-200 bg-white"
                  />
                  <div className="mt-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Generated via backend/app/services/chart_service.py
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 text-xs">No chart generated</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
