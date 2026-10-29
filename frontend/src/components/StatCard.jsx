import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'emerald', // 'emerald' | 'blue' | 'rose' | 'amber' | 'slate' | 'indigo'
  badgeText,
  badgeVariant = 'neutral',
  progress, // optional number (0 - 100)
  progressLabel,
}) {
  const variantStyles = {
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100/80',
      accent: 'text-emerald-600',
      progressFill: 'bg-emerald-500',
    },
    blue: {
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100/80',
      accent: 'text-blue-600',
      progressFill: 'bg-blue-500',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100/80',
      accent: 'text-rose-600',
      progressFill: 'bg-rose-500',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100/80',
      accent: 'text-amber-600',
      progressFill: 'bg-amber-500',
    },
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100/80',
      accent: 'text-indigo-600',
      progressFill: 'bg-indigo-500',
    },
    slate: {
      iconBg: 'bg-slate-100 text-slate-600 border-slate-200/80',
      accent: 'text-slate-700',
      progressFill: 'bg-slate-500',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.emerald;

  const badgeStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
    info: 'bg-blue-50 text-blue-700 border-blue-200/80',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200/80',
  };

  return (
    <div className="relative group bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-slate-300/80 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Top Header: Label & Icon */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase font-sans">
            {title}
          </span>
          {Icon && (
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${currentVariant.iconBg}`}>
              <Icon className="w-5 h-5 stroke-[2]" />
            </div>
          )}
        </div>

        {/* Primary Value & Badge */}
        <div className="mt-3 flex items-baseline justify-between gap-3 flex-wrap">
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
            {value}
          </div>
          {badgeText && (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border shrink-0 ${
                badgeStyles[badgeVariant] || badgeStyles.neutral
              }`}
            >
              {badgeText}
            </span>
          )}
        </div>

        {/* Optional Progress Bar */}
        {typeof progress === 'number' && (
          <div className="mt-3.5 space-y-1">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${currentVariant.progressFill}`}
                style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
              />
            </div>
            {progressLabel && (
              <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium">
                <span>{progressLabel}</span>
                <span>{progress.toFixed(1)}%</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Subtitle / Footer detail */}
      {subtitle && (
        <div className="mt-4 pt-3 border-t border-slate-100/90 text-xs font-medium text-slate-500 flex items-center justify-between">
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
}
