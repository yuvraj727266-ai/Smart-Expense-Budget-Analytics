import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  ShieldAlert,
  Flame,
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { apiService } from '../services/api';

export default function InsightsPage({ selectedMonth }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await apiService.getInsights(selectedMonth);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load insights', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [selectedMonth]);

  const items = data?.items || [];

  const getCardStyle = (type) => {
    switch (type) {
      case 'danger':
        return {
          border: 'border-rose-200 bg-rose-50/50',
          icon: AlertOctagon,
          iconColor: 'text-rose-600 bg-rose-100',
          badge: 'bg-rose-100 text-rose-700 border-rose-200',
        };
      case 'warning':
        return {
          border: 'border-amber-200 bg-amber-50/50',
          icon: AlertTriangle,
          iconColor: 'text-amber-600 bg-amber-100',
          badge: 'bg-amber-100 text-amber-700 border-amber-200',
        };
      case 'success':
        return {
          border: 'border-emerald-200 bg-emerald-50/50',
          icon: CheckCircle2,
          iconColor: 'text-emerald-600 bg-emerald-100',
          badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        };
      default:
        return {
          border: 'border-blue-200 bg-blue-50/50',
          icon: Info,
          iconColor: 'text-blue-600 bg-blue-100',
          badge: 'bg-blue-100 text-blue-700 border-blue-200',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Smart Financial Insights</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Rule-based heuristic analysis evaluated dynamically against database records for {selectedMonth}
        </p>
      </div>

      {/* Academic Disclaimer Box */}
      <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl flex items-start gap-3 text-xs text-slate-600">
        <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800">Academic Project Disclaimer: </span>
          <span>{data?.disclaimer}</span>
        </div>
      </div>

      {/* Insights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs font-semibold">Evaluating financial heuristics...</span>
          </div>
        ) : items.length > 0 ? (
          items.map((ins, idx) => {
            const style = getCardStyle(ins.type);
            const Icon = style.icon;

            return (
              <div
                key={ins.id || idx}
                className={`p-5 rounded-2xl border ${style.border} bg-white shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl shrink-0 ${style.iconColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">{ins.title}</h3>
                    </div>

                    {ins.metric && (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border shrink-0 ${style.badge}`}>
                        {ins.metric}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-xs text-slate-600 leading-relaxed pl-1">
                    {ins.message}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>Engine: backend.app.services.insight_engine</span>
                  <span className="capitalize">{ins.type} Signal</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            No insights available for this period. Add more transactions to trigger rule conditions.
          </div>
        )}
      </div>
    </div>
  );
}
